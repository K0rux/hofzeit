import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const createSchema = z.object({
  jahr: z.number().int().min(2020).max(2100),
  monat: z.number().int().min(1).max(12),
})

// GET /api/monatsabschluesse — Employee fetches own closing records
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('monatsabschluesse')
    .select('id, user_id, jahr, monat, abgeschlossen_am, abgeschlossen_durch, automatisch')
    .eq('user_id', user.id)
    .order('jahr', { ascending: false })
    .order('monat', { ascending: false })
    .limit(120)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Monatsabschlüsse' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST /api/monatsabschluesse — Employee closes a past month
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  if (!rateLimit(`write:${user.id}`, 30, 60_000)) {
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

  const { jahr, monat } = parsed.data

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

  // Check if already closed
  const { data: existing } = await supabase
    .from('monatsabschluesse')
    .select('id')
    .eq('user_id', user.id)
    .eq('jahr', jahr)
    .eq('monat', monat)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Dieser Monat ist bereits abgeschlossen' },
      { status: 409 },
    )
  }

  const { data, error } = await supabase
    .from('monatsabschluesse')
    .insert({
      user_id: user.id,
      jahr,
      monat,
      abgeschlossen_durch: user.id,
      automatisch: false,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Abschließen des Monats' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
