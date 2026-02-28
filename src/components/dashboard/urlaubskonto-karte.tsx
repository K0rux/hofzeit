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
          <div className="space-y-3">
            <div>
              <p className={cn('text-2xl font-bold tabular-nums', isOverdrawn ? 'text-destructive' : 'text-emerald-600')}>
                {verbleibend}
              </p>
              <p className="text-sm text-muted-foreground">verbleibende Tage</p>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Anspruch</span>
                <span>{jahresanspruch} Tage</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Genommen</span>
                <span>{genommen} Tage</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
