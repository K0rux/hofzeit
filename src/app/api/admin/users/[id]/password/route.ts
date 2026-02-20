import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const passwordSchema = z.object({
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
})

// PUT /api/admin/users/[id]/password – Reset a user's password
export async function PUT(
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

  const parsed = passwordSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validierungsfehler'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.updateUserById(id, {
    password: parsed.data.password,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Fehler beim Zurücksetzen des Passworts' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
