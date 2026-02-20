import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

/**
 * Verifies the current user is an authenticated admin.
 * Returns the user ID on success, or a NextResponse error on failure.
 */
export async function verifyAdmin(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      ),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      ),
    }
  }

  return { userId: user.id }
}
