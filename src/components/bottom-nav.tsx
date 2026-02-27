'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, CalendarDays, Download, MoreHorizontal, Database, Shield, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin: boolean
  onLogout: () => void
  loggingOut: boolean
}

const employeeTabs = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/zeiterfassung', label: 'Zeiten', icon: Clock },
  { href: '/abwesenheiten', label: 'Abwesend', icon: CalendarDays },
  { href: '/export', label: 'Export', icon: Download },
]

const adminTabs = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/abwesenheiten', label: 'Abwesend', icon: CalendarDays },
]

export function BottomNav({ isAdmin, onLogout, loggingOut }: BottomNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const tabs = isAdmin ? adminTabs : employeeTabs
  const isMoreActive = pathname === '/stammdaten' || pathname?.startsWith('/admin')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16 px-1 pb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-md transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </Link>
          )
        })}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-md transition-colors',
              isMoreActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight">Mehr</span>
          </button>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Weitere Optionen</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-4">
              <Link
                href="/stammdaten"
                onClick={() => setSheetOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors min-h-[48px]',
                  pathname === '/stammdaten'
                    ? 'bg-muted font-medium'
                    : 'hover:bg-muted/50'
                )}
              >
                <Database className="h-5 w-5" />
                Stammdaten
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors min-h-[48px]',
                    pathname?.startsWith('/admin')
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Shield className="h-5 w-5" />
                  Verwaltung
                </Link>
              )}
              <Button
                variant="ghost"
                className="justify-start gap-3 px-3 py-3 h-auto min-h-[48px] text-destructive hover:text-destructive"
                onClick={() => {
                  setSheetOpen(false)
                  onLogout()
                }}
                disabled={loggingOut}
              >
                <LogOut className="h-5 w-5" />
                {loggingOut ? 'Abmelden...' : 'Abmelden'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
