import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/arbeitszeitprofile/me – Load own profile
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('arbeitszeitprofile')
    .select('id, user_id, urlaubstage_jahr, arbeitstage, wochenstunden, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Fehler beim Laden des Profils' }, { status: 500 })
  }

  // Return null if no profile exists (PGRST116 = no rows)
  return NextResponse.json(data ?? null)
}
