import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

const VALID_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

const upsertSchema = z.object({
  urlaubstage_jahr: z
    .number()
    .int('Urlaubstage müssen eine Ganzzahl sein')
    .min(0, 'Urlaubstage dürfen nicht negativ sein')
    .max(365, 'Maximal 365 Urlaubstage'),
  arbeitstage: z
    .array(z.enum(VALID_DAYS, { message: 'Ungültiger Arbeitstag' }))
    .min(1, 'Mindestens ein Arbeitstag erforderlich')
    .max(7, 'Maximal 7 Arbeitstage'),
  wochenstunden: z
    .number()
    .min(0.5, 'Wochenstunden müssen mindestens 0,5 sein')
    .max(168, 'Maximal 168 Wochenstunden'),
})

// GET /api/admin/arbeitszeitprofile/[userId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { userId } = await params

  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('arbeitszeitprofile')
    .select('id, user_id, urlaubstage_jahr, arbeitstage, wochenstunden, created_at, updated_at')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Fehler beim Laden des Profils' }, { status: 500 })
  }

  return NextResponse.json(data ?? null)
}

// PUT /api/admin/arbeitszeitprofile/[userId] – Create or update profile (UPSERT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { userId } = await params

  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
  }

  if (!rateLimit(`write:${auth.userId}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { urlaubstage_jahr, arbeitstage, wochenstunden } = parsed.data

  const adminClient = createAdminClient()

  // Verify user exists
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
  }

  const { data, error } = await adminClient
    .from('arbeitszeitprofile')
    .upsert(
      {
        user_id: userId,
        urlaubstage_jahr,
        arbeitstage,
        wochenstunden,
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Speichern des Profils' }, { status: 500 })
  }

  return NextResponse.json(data)
}
