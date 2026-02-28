import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const profileSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich').max(100, 'Vorname darf maximal 100 Zeichen lang sein'),
  last_name: z.string().min(1, 'Nachname ist erforderlich').max(100, 'Nachname darf maximal 100 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

// PATCH /api/admin/users/[id]/profile – Admin updates a user's profile
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
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
  const adminClient = createAdminClient()

  // Get current user data to check email change
  const { data: targetUser, error: userError } = await adminClient.auth.admin.getUserById(id)
  if (userError || !targetUser?.user) {
    return NextResponse.json(
      { error: 'Benutzer nicht gefunden' },
      { status: 404 }
    )
  }

  // Read current profile values before updating for use in rollback (BUG-2 fix)
  const { data: currentProfile } = await adminClient
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', id)
    .single()

  const rollback = {
    first_name: currentProfile?.first_name ?? '',
    last_name: currentProfile?.last_name ?? '',
  }

  // Update profiles table
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ first_name, last_name })
    .eq('id', id)

  if (profileError) {
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Profils' },
      { status: 500 }
    )
  }

  // Update email in auth if changed
  if (email !== targetUser.user.email) {
    // Check if email is already in use (BUG-4 fix: perPage)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    const emailTaken = existingUsers?.users?.some(
      (u) => u.email === email && u.id !== id
    )
    if (emailTaken) {
      // Rollback profile changes using stored pre-update values (BUG-2 fix)
      await adminClient
        .from('profiles')
        .update(rollback)
        .eq('id', id)

      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits vergeben.' },
        { status: 409 }
      )
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      id,
      { email }
    )

    if (authError) {
      // Rollback profile changes using stored pre-update values (BUG-2 fix)
      await adminClient
        .from('profiles')
        .update(rollback)
        .eq('id', id)

      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der E-Mail-Adresse' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
