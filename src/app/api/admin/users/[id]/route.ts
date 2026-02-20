import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// PATCH /api/admin/users/[id] – Reactivate a deactivated user
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Set is_active to true
  const { error } = await adminClient
    .from('profiles')
    .update({ is_active: true })
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Reaktivieren des Benutzers' },
      { status: 500 }
    )
  }

  // Unban the auth user so they can log in again
  const { error: unbanError } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: 'none',
  })

  if (unbanError) {
    return NextResponse.json(
      { error: 'Benutzer reaktiviert, aber Auth-Sperre konnte nicht aufgehoben werden' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/admin/users/[id] – Deactivate (soft-delete) a user
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 })
  }

  // Prevent self-deactivation
  if (id === auth.userId) {
    return NextResponse.json(
      { error: 'Sie können sich nicht selbst deaktivieren' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  // Check if this is the last active admin
  const { data: activeAdmins } = await adminClient
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .eq('is_active', true)

  const targetProfile = activeAdmins?.find((p) => p.id === id)
  if (targetProfile && activeAdmins && activeAdmins.length <= 1) {
    return NextResponse.json(
      { error: 'Der letzte aktive Administrator kann nicht deaktiviert werden' },
      { status: 400 }
    )
  }

  // Soft-delete: set is_active to false
  const { error } = await adminClient
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Deaktivieren des Benutzers' },
      { status: 500 }
    )
  }

  // Also ban the auth user so they can't log in
  const { error: banError } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: '876000h', // ~100 years
  })

  if (banError) {
    return NextResponse.json(
      { error: 'Benutzer deaktiviert, aber Auth-Sperre fehlgeschlagen' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
