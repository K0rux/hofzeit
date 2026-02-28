import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

const createSchema = z.object({
  userId: z.string().uuid(),
  jahr: z.number().int().min(2020).max(2100),
  monat: z.number().int().min(1).max(12),
})

// GET /api/admin/monatsabschluesse — Admin fetches all users' closing records
export async function GET() {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('monatsabschluesse')
    .select('id, user_id, jahr, monat, abgeschlossen_am, abgeschlossen_durch, automatisch')
    .order('jahr', { ascending: false })
    .order('monat', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Monatsabschlüsse' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST /api/admin/monatsabschluesse — Admin closes a month for an employee
export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  if (!rateLimit(`write:${auth.userId}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { userId, jahr, monat } = parsed.data

  // Validate: only past months can be closed
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  if (jahr > currentYear || (jahr === currentYear && monat >= currentMonth)) {
    return NextResponse.json(
      { error: 'Nur vergangene Monate können abgeschlossen werden' },
      { status: 400 },
    )
  }

  // Check if already closed (use user-scoped client with admin RLS policy)
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('monatsabschluesse')
    .select('id')
    .eq('user_id', userId)
    .eq('jahr', jahr)
    .eq('monat', monat)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Dieser Monat ist bereits abgeschlossen' },
      { status: 409 },
    )
  }

  // Use admin client to insert for a different user (bypasses RLS)
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('monatsabschluesse')
    .insert({
      user_id: userId,
      jahr,
      monat,
      abgeschlossen_durch: auth.userId,
      automatisch: false,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Abschließen des Monats' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
