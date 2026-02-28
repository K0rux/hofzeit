'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface UrlaubskontoKarteProps {
  loading: boolean
  hasProfile: boolean
  jahresanspruch: number
  genommen: number
}

export function UrlaubskontoKarte({
  loading,
  hasProfile,
  jahresanspruch,
  genommen,
}: UrlaubskontoKarteProps) {
  const verbleibend = jahresanspruch - genommen
  const isOverdrawn = verbleibend < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Urlaubskonto</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        ) : !hasProfile ? (
          <p className="text-sm text-muted-foreground">
            Kein Arbeitszeitprofil hinterlegt.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jahresanspruch</span>
              <span>{jahresanspruch} Tage</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Genommen</span>
              <span>{genommen} Tage</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-semibold">
              <span>Verbleibend</span>
              <span className={cn(isOverdrawn ? 'text-destructive' : 'text-emerald-600')}>
                {verbleibend} Tage
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
