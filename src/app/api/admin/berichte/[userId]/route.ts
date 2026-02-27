import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

const uuidSchema = z.string().uuid()

// GET /api/admin/berichte/[userId]?monat=X&jahr=Y
// Admin-only: returns Zeiteinträge + Abwesenheiten + user name for a specific employee
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  if (!uuidSchema.safeParse(userId).success) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
  }

  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const monat = searchParams.get('monat')
  const jahr = searchParams.get('jahr')

  if (!monat || !jahr) {
    return NextResponse.json({ error: 'Monat und Jahr sind erforderlich' }, { status: 400 })
  }

  const monatNum = parseInt(monat, 10)
  const jahrNum = parseInt(jahr, 10)

  if (isNaN(monatNum) || monatNum < 1 || monatNum > 12) {
    return NextResponse.json({ error: 'Ungültiger Monat (1-12)' }, { status: 400 })
  }

  if (isNaN(jahrNum) || jahrNum < 2020 || jahrNum > 2099) {
    return NextResponse.json({ error: 'Ungültiges Jahr' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get user profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, first_name, last_name, is_active')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
  }

  // Calculate date range for the month
  const von = `${jahrNum}-${String(monatNum).padStart(2, '0')}-01`
  const lastDay = new Date(jahrNum, monatNum, 0).getDate()
  const bis = `${jahrNum}-${String(monatNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Fetch Zeiteinträge for the user in the given month
  const { data: zeiteintraege, error: zeitError } = await adminClient
    .from('zeiteintraege')
    .select(
      `id, datum, taetigkeit_id, taetigkeit_freitext, kostenstelle_id, dauer_stunden, notiz, erstellt_am, geaendert_am,
       taetigkeiten (name),
       kostenstellen (name)`
    )
    .eq('user_id', userId)
    .gte('datum', von)
    .lte('datum', bis)
    .order('datum', { ascending: true })
    .order('erstellt_am', { ascending: true })
    .limit(1000)

  if (zeitError) {
    return NextResponse.json({ error: 'Fehler beim Laden der Zeiteinträge' }, { status: 500 })
  }

  // Flatten nested joins (same format as /api/zeiteintraege)
  const eintraege = (zeiteintraege ?? []).map((row: Record<string, unknown>) => ({
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

  // Fetch Abwesenheiten that overlap with the month
  const { data: abwesenheiten, error: abwError } = await adminClient
    .from('abwesenheiten')
    .select('id, typ, startdatum, enddatum, notiz, created_at')
    .eq('user_id', userId)
    .lte('startdatum', bis)
    .gte('enddatum', von)
    .order('startdatum', { ascending: true })
    .limit(500)

  if (abwError) {
    return NextResponse.json({ error: 'Fehler beim Laden der Abwesenheiten' }, { status: 500 })
  }

  // Determine if this is the current month (for "Monat noch offen" hint)
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === jahrNum && (now.getMonth() + 1) === monatNum

  return NextResponse.json({
    userName: `${profile.first_name} ${profile.last_name}`,
    monat: monatNum,
    jahr: jahrNum,
    zeitraum: `${String(monatNum).padStart(2, '0')}/${jahrNum}`,
    isCurrentMonth,
    eintraege,
    abwesenheiten: abwesenheiten ?? [],
  })
}
