import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

const roleSchema = z.object({
  role: z.enum(['admin', 'employee']),
})

// PUT /api/admin/users/[id]/role – Change a user's role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  // Prevent changing own role
  if (id === auth.userId) {
    return NextResponse.json(
      { error: 'Sie können Ihre eigene Rolle nicht ändern' },
      { status: 400 }
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

  const parsed = roleSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // If demoting from admin, check it's not the last admin
  if (parsed.data.role === 'employee') {
    const { data: activeAdmins } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    const isCurrentlyAdmin = activeAdmins?.some((p) => p.id === id)
    if (isCurrentlyAdmin && activeAdmins && activeAdmins.length <= 1) {
      return NextResponse.json(
        { error: 'Der letzte Administrator kann nicht zum Mitarbeiter geändert werden' },
        { status: 400 }
      )
    }
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Ändern der Rolle' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
