'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
      if (user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUserRole(data?.role ?? null)
          })
      }
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

  const isAdmin = userRole === 'admin'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <h1 className="text-lg font-bold shrink-0">Hofzeit</h1>
            <nav className="flex items-center gap-0.5 sm:gap-1">
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                  pathname === '/dashboard'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/zeiterfassung"
                className={cn(
                  'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                  pathname === '/zeiterfassung'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span className="sm:hidden">Zeit</span>
                <span className="hidden sm:inline">Zeiterfassung</span>
              </Link>
              <Link
                href="/stammdaten"
                className={cn(
                  'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                  pathname === '/stammdaten'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span className="sm:hidden">Daten</span>
                <span className="hidden sm:inline">Stammdaten</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                    pathname?.startsWith('/admin')
                      ? 'bg-muted font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="sm:hidden">Admin</span>
                  <span className="hidden sm:inline">Verwaltung</span>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {userEmail && (
              <span className="text-sm text-muted-foreground max-w-[140px] truncate hidden sm:inline">
                {userEmail}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? '...' : 'Abmelden'}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
