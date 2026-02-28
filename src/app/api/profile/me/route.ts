import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich').max(100, 'Vorname darf maximal 100 Zeichen lang sein'),
  last_name: z.string().min(1, 'Nachname ist erforderlich').max(100, 'Nachname darf maximal 100 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

// PATCH /api/profile/me – Update own profile
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Nicht authentifiziert' },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Ungültige Anfrage' },
      { status: 400 }
    )
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { first_name, last_name, email } = parsed.data

  // Read current profile values before updating for use in rollback (BUG-1 fix)
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const rollback = {
    first_name: currentProfile?.first_name ?? '',
    last_name: currentProfile?.last_name ?? '',
  }

  // Update profiles table via user client to respect RLS (BUG-3 fix)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ first_name, last_name })
    .eq('id', user.id)

  if (profileError) {
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Profils' },
      { status: 500 }
    )
  }

  // Update email in auth if changed
  if (email !== user.email) {
    const adminClient = createAdminClient()

    // Check if email is already in use by another user (BUG-4 fix: perPage)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    const emailTaken = existingUsers?.users?.some(
      (u) => u.email === email && u.id !== user.id
    )
    if (emailTaken) {
      // Rollback profile changes using stored pre-update values (BUG-1 fix)
      await adminClient
        .from('profiles')
        .update(rollback)
        .eq('id', user.id)

      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits vergeben.' },
        { status: 409 }
      )
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { email }
    )

    if (authError) {
      // Rollback profile changes using stored pre-update values (BUG-1 fix)
      await adminClient
        .from('profiles')
        .update(rollback)
        .eq('id', user.id)

      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der E-Mail-Adresse' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
