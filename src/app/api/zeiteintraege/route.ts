import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const createSchema = z.object({
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  taetigkeit_id: z.string().uuid().nullable().optional(),
  taetigkeit_freitext: z.string().trim().max(200).nullable().optional(),
  kostenstelle_id: z.string().uuid('Kostenstelle ist erforderlich'),
  dauer_stunden: z
    .number()
    .gt(0, 'Dauer muss größer als 0 sein')
    .max(24, 'Maximale Dauer beträgt 24 Stunden'),
  notiz: z.string().trim().max(500).nullable().optional(),
})

// GET /api/zeiteintraege?date=YYYY-MM-DD
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const von = searchParams.get('von')
  const bis = searchParams.get('bis')

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/

  // Support either single date or date range (von/bis)
  if (!date && (!von || !bis)) {
    return NextResponse.json({ error: 'Ungültiges oder fehlendes Datum' }, { status: 400 })
  }

  if (date && !dateRegex.test(date)) {
    return NextResponse.json({ error: 'Ungültiges oder fehlendes Datum' }, { status: 400 })
  }

  if (von && !dateRegex.test(von)) {
    return NextResponse.json({ error: 'Ungültiges Von-Datum' }, { status: 400 })
  }

  if (bis && !dateRegex.test(bis)) {
    return NextResponse.json({ error: 'Ungültiges Bis-Datum' }, { status: 400 })
  }

  if (von && bis && von > bis) {
    return NextResponse.json({ error: 'Von-Datum muss vor oder gleich Bis-Datum liegen' }, { status: 400 })
  }

  if (von && bis && !rateLimit(`read:zeiteintraege:${user.id}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }, { status: 429 })
  }

  let query = supabase
    .from('zeiteintraege')
    .select(
      `id, datum, taetigkeit_id, taetigkeit_freitext, kostenstelle_id, dauer_stunden, notiz, erstellt_am, geaendert_am,
       taetigkeiten (name),
       kostenstellen (name)`
    )
    .eq('user_id', user.id)

  if (date) {
    query = query.eq('datum', date)
  } else {
    query = query.gte('datum', von!).lte('datum', bis!)
  }

  const { data, error } = await query
    .order('datum', { ascending: true })
    .order('erstellt_am', { ascending: true })
    .limit(date ? 100 : 1000)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Zeiteinträge' }, { status: 500 })
  }

  // Flatten nested joins
  const result = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    datum: row.datum,
    taetigkeit_id: row.taetigkeit_id,
    taetigkeit_name: row.taetigkeiten
      ? (row.taetigkeiten as { name: string }).name
      : null,
    taetigkeit_freitext: row.taetigkeit_freitext,
    kostenstelle_id: row.kostenstelle_id,
    kostenstelle_name: row.kostenstellen
      ? (row.kostenstellen as { name: string }).name
      : '',
    dauer_stunden: row.dauer_stunden,
    notiz: row.notiz ?? null,
    erstellt_am: row.erstellt_am,
    geaendert_am: row.geaendert_am,
  }))

  return NextResponse.json(result)
}

// POST /api/zeiteintraege
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

  const { datum, taetigkeit_id, taetigkeit_freitext, kostenstelle_id, dauer_stunden, notiz } = parsed.data

  // Exactly one of taetigkeit_id or taetigkeit_freitext must be set
  const hasTaetigkeitId = !!taetigkeit_id
  const hasFreitext = !!(taetigkeit_freitext && taetigkeit_freitext.trim())
  if (!hasTaetigkeitId && !hasFreitext) {
    return NextResponse.json({ error: 'Tätigkeit ist erforderlich' }, { status: 400 })
  }
  if (hasTaetigkeitId && hasFreitext) {
    return NextResponse.json(
      { error: 'Bitte entweder Tätigkeit aus Liste oder Freitext angeben' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('zeiteintraege')
    .insert({
      user_id: user.id,
      datum,
      taetigkeit_id: hasTaetigkeitId ? taetigkeit_id : null,
      taetigkeit_freitext: hasFreitext ? taetigkeit_freitext!.trim() : null,
      kostenstelle_id,
      dauer_stunden,
      notiz: notiz?.trim() || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Anlegen des Zeiteintrags' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
