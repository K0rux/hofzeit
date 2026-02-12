import { NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin, mapStatusToFrontend } from '@/lib/admin'

/**
 * PATCH /api/admin/users/[id]/toggle-status
 * Toggle user status (active <-> inactive) - admin only
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const { error, session } = await requireAdmin()
    if (error) return error

    const { id } = await params

    // Prevent self-deactivation
    if (session!.userId === id) {
      return NextResponse.json(
        { error: 'Du kannst deinen eigenen Account nicht deaktivieren' },
        { status: 400 }
      )
    }

    // Check if user exists
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!targetUser) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Check if this is the last active admin
    if (targetUser.role === 'admin' && targetUser.status === 'aktiv') {
      const activeAdmins = await db
        .select()
        .from(users)
        .where(and(eq(users.role, 'admin'), eq(users.status, 'aktiv')))

      if (activeAdmins.length === 1) {
        return NextResponse.json(
          { error: 'Es muss mindestens ein aktiver Admin existieren' },
          { status: 400 }
        )
      }
    }

    // Toggle status
    const newStatus = targetUser.status === 'aktiv' ? 'deaktiviert' : 'aktiv'

    await db
      .update(users)
      .set({ status: newStatus })
      .where(eq(users.id, id))

    return NextResponse.json({
      success: true,
      status: mapStatusToFrontend(newStatus),
    })
  } catch (error) {
    console.error('PATCH /api/admin/users/[id]/toggle-status error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
