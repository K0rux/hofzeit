import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

// DELETE /api/admin/users/[id] – Deactivate (soft-delete) a user
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

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
