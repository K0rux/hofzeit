import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// DELETE /api/admin/monatsabschluesse/[id] — Admin reopens a month
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdmin()
  if ('error' in auth) return auth.error

  if (!rateLimit(`write:${auth.userId}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }, { status: 429 })
  }

  const { id } = await params

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error, count } = await supabase
    .from('monatsabschluesse')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Aufheben des Monatsabschlusses' }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: 'Monatsabschluss nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
