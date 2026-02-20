'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/login'
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-bold">Hofzeit</h1>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-sm text-muted-foreground max-w-[140px] truncate">
                {userEmail}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Abmelden...' : 'Abmelden'}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  )
}
