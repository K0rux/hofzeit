import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

// GET /api/admin/users – List all users with profile data
export async function GET() {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const adminClient = createAdminClient()

  // Get all profiles with email from auth.users
  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select('id, first_name, last_name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Laden der Benutzer' },
      { status: 500 }
    )
  }

  // Get emails from auth.users via admin API
  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 })

  if (authError) {
    return NextResponse.json(
      { error: 'Fehler beim Laden der Benutzerdaten' },
      { status: 500 }
    )
  }

  const emailMap = new Map(
    authData.users.map((u) => [u.id, u.email])
  )

  const users = profiles.map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? '',
  }))

  return NextResponse.json({ users })
}

// POST /api/admin/users – Create a new user
const createUserSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültiges E-Mail-Format'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  role: z.enum(['admin', 'employee']),
})

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Ungültige Anfrage' },
      { status: 400 }
    )
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { first_name, last_name, email, password, role } = parsed.data
  const adminClient = createAdminClient()

  // Create auth user — trigger sets role='employee' by default (BUG-2 fix)
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })

  if (createError) {
    if (createError.message?.includes('already been registered')) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits vergeben' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Fehler beim Anlegen des Benutzers' },
      { status: 500 }
    )
  }

  // If role is 'admin', update the profile explicitly (trigger always defaults to 'employee')
  if (role === 'admin' && newUser?.user) {
    const { error: roleError } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', newUser.user.id)

    if (roleError) {
      return NextResponse.json(
        { error: 'Benutzer angelegt, aber Rolle konnte nicht gesetzt werden' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
