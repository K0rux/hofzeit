import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateSchema = z.object({
  typ: z.enum(['urlaub', 'krankheit'], {
    message: 'Typ ist erforderlich',
  }),
  startdatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Startdatum'),
  enddatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Enddatum'),
  notiz: z.string().max(500, 'Notiz darf maximal 500 Zeichen lang sein').nullable().optional(),
})

// PUT /api/abwesenheiten/[id]
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

  const { typ, startdatum, enddatum, notiz } = parsed.data

  if (enddatum < startdatum) {
    return NextResponse.json(
      { error: 'Enddatum muss gleich oder nach dem Startdatum liegen' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('abwesenheiten')
    .update({
      typ,
      startdatum,
      enddatum,
      notiz: notiz?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Bearbeiten der Abwesenheit' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Abwesenheit nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/abwesenheiten/[id]
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
    .from('abwesenheiten')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen der Abwesenheit' }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Abwesenheit nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
