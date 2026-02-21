import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateSchema = z.object({
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  taetigkeit_id: z.string().uuid().nullable().optional(),
  taetigkeit_freitext: z.string().trim().max(200).nullable().optional(),
  kostenstelle_id: z.string().uuid('Kostenstelle ist erforderlich'),
  dauer_stunden: z
    .number()
    .gt(0, 'Dauer muss größer als 0 sein')
    .max(24, 'Maximale Dauer beträgt 24 Stunden'),
})

// PUT /api/zeiteintraege/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { datum, taetigkeit_id, taetigkeit_freitext, kostenstelle_id, dauer_stunden } = parsed.data

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
    .update({
      datum,
      taetigkeit_id: hasTaetigkeitId ? taetigkeit_id : null,
      taetigkeit_freitext: hasFreitext ? taetigkeit_freitext!.trim() : null,
      kostenstelle_id,
      dauer_stunden,
      geaendert_am: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // RLS double-check
    .select('id')

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Bearbeiten des Zeiteintrags' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Zeiteintrag nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/zeiteintraege/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }

  const { error, count } = await supabase
    .from('zeiteintraege')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id) // RLS double-check

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Zeiteintrags' }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Zeiteintrag nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
