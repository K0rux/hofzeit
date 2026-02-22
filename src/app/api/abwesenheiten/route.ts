import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const createSchema = z.object({
  typ: z.enum(['urlaub', 'krankheit'], {
    message: 'Typ ist erforderlich',
  }),
  startdatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Startdatum'),
  enddatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Enddatum'),
  notiz: z.string().max(500, 'Notiz darf maximal 500 Zeichen lang sein').nullable().optional(),
})

// GET /api/abwesenheiten
// Without params: all absences for the user (sorted by startdatum desc)
// With ?datum=YYYY-MM-DD: absences covering that specific date
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const datum = searchParams.get('datum')

  let query = supabase
    .from('abwesenheiten')
    .select('id, typ, startdatum, enddatum, notiz, created_at')
    .eq('user_id', user.id)

  if (datum) {
    // Filter absences that cover a specific date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
      return NextResponse.json({ error: 'Ungültiges Datum' }, { status: 400 })
    }
    query = query.lte('startdatum', datum).gte('enddatum', datum)
  }

  const { data, error } = await query
    .order('startdatum', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Abwesenheiten' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST /api/abwesenheiten
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

  const { typ, startdatum, enddatum, notiz } = parsed.data

  if (enddatum < startdatum) {
    return NextResponse.json(
      { error: 'Enddatum muss gleich oder nach dem Startdatum liegen' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('abwesenheiten')
    .insert({
      user_id: user.id,
      typ,
      startdatum,
      enddatum,
      notiz: notiz?.trim() || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Anlegen der Abwesenheit' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
