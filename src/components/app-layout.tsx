'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/zeiterfassung', label: 'Zeiterfassung' },
    { href: '/abwesenheiten', label: 'Abwesenheiten' },
    { href: '/stammdaten', label: 'Stammdaten' },
    { href: '/export', label: 'Export' },
    ...(isAdmin ? [{ href: '/admin', label: 'Verwaltung' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop header with full navigation */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <Image
                src="/hofzeit_logo.png"
                alt="Hofzeit Logo"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold text-primary">Hofzeit</span>
            </Link>
            <nav className="hidden md:flex items-center gap-0.5 sm:gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/admin'
                  ? pathname?.startsWith('/admin')
                  : pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative text-sm px-2 sm:px-3 py-1.5 rounded-md transition-colors',
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                )
              })}
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
              className="hidden md:inline-flex border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            >
              {loggingOut ? '...' : 'Abmelden'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with page transition animation */}
      <main className="flex-1 p-4 pb-20 md:pb-4">
        <div key={pathname} className="max-w-4xl mx-auto animate-fade-in">
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
