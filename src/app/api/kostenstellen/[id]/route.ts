import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  nummer: z
    .string()
    .max(50, 'Nummer darf maximal 50 Zeichen lang sein')
    .optional()
    .default(''),
})

const uuidSchema = z.string().uuid()

// PATCH /api/kostenstellen/[id] – Update a Kostenstelle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
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

  const { name, nummer } = parsed.data

  const { data, error } = await supabase
    .from('kostenstellen')
    .update({ name, nummer: nummer || null })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name, nummer, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Eine Kostenstelle mit diesem Namen existiert bereits' },
        { status: 409 }
      )
    }
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Kostenstelle nicht gefunden' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kostenstelle' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// DELETE /api/kostenstellen/[id] – Delete a Kostenstelle
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { error } = await supabase
    .from('kostenstellen')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kostenstelle' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
