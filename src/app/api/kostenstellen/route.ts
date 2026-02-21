import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const createSchema = z.object({
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

// GET /api/kostenstellen – List user's Kostenstellen (alphabetically)
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('kostenstellen')
    .select('id, name, nummer, created_at, updated_at')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
    .limit(500)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kostenstellen' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// POST /api/kostenstellen – Create a new Kostenstelle
export async function POST(request: Request) {
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

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { name, nummer } = parsed.data

  const { data, error } = await supabase
    .from('kostenstellen')
    .insert({ user_id: user.id, name, nummer: nummer || null })
    .select('id, name, nummer, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Eine Kostenstelle mit diesem Namen existiert bereits' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Fehler beim Anlegen der Kostenstelle' },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}
