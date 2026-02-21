import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  beschreibung: z
    .string()
    .max(255, 'Beschreibung darf maximal 255 Zeichen lang sein')
    .optional()
    .default(''),
})

// GET /api/taetigkeiten – List user's Tätigkeiten (alphabetically)
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('taetigkeiten')
    .select('id, name, beschreibung, created_at, updated_at')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
    .limit(500)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Laden der Tätigkeiten' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// POST /api/taetigkeiten – Create a new Tätigkeit
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

  const { name, beschreibung } = parsed.data

  const { data, error } = await supabase
    .from('taetigkeiten')
    .insert({ user_id: user.id, name, beschreibung: beschreibung || null })
    .select('id, name, beschreibung, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Eine Tätigkeit mit diesem Namen existiert bereits' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Fehler beim Anlegen der Tätigkeit' },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}
