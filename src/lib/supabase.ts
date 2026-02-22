import { createBrowserClient } from '@supabase/ssr'

function getRememberMe(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('hofzeit_remember_me=true')
}

export function createClient() {
  const persistSession = getRememberMe()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storage: persistSession
          ? (typeof window !== 'undefined' ? window.localStorage : undefined)
          : (typeof window !== 'undefined' ? window.sessionStorage : undefined),
      },
    }
  )
}
