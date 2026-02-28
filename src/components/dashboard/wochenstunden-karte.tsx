'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WochenstundenKarteProps {
  loading: boolean
  hasProfile: boolean
  istStunden: number
  sollStunden: number | null // null when no profile
}

export function WochenstundenKarte({
  loading,
  hasProfile,
  istStunden,
  sollStunden,
}: WochenstundenKarteProps) {
  function formatH(h: number): string {
    return h.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Wochenstunden</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : !hasProfile ? (
          <p className="text-sm text-muted-foreground">
            Kein Arbeitszeitprofil hinterlegt.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">
              {formatH(istStunden)}
              {sollStunden !== null && (
                <span className="text-base font-normal text-muted-foreground">
                  {' '}/ {formatH(sollStunden)} Std.
                </span>
              )}
              {sollStunden === null && (
                <span className="text-base font-normal text-muted-foreground"> Std.</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {sollStunden !== null ? 'diese Woche (Ist / Soll)' : 'Ist-Stunden diese Woche'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
