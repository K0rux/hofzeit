'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/bottom-nav'

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
      await supabase.auth.signOut({ scope: 'global' })
      document.cookie = 'hofzeit_remember_me=; max-age=0; path=/; Secure'
      window.location.href = '/login'
    } finally {
      setLoggingOut(false)
    }
  }

  const isAdmin = userRole === 'admin'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop header with full navigation */}
      <header className="border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <h1 className="text-lg font-bold shrink-0">Hofzeit</h1>
            <nav className="hidden md:flex items-center gap-0.5 sm:gap-1">
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
                Zeiterfassung
              </Link>
              <Link
                href="/abwesenheiten"
                className={cn(
                  'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                  pathname === '/abwesenheiten'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Abwesenheiten
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
                Stammdaten
              </Link>
              <Link
                href="/export"
                className={cn(
                  'text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                  pathname === '/export'
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Export
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
                  Verwaltung
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
              className="hidden md:inline-flex"
            >
              {loggingOut ? '...' : 'Abmelden'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with bottom padding on mobile for BottomNav */}
      <main className="flex-1 p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav
        isAdmin={isAdmin}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
    </div>
  )
}
