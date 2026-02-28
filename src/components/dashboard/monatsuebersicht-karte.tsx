'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface MonatsuebersichtKarteProps {
  loading: boolean
  hasProfile: boolean
  monat: string // e.g. "Februar 2026"
  sollStunden: number
  istStunden: number
}

export function MonatsuebersichtKarte({
  loading,
  hasProfile,
  monat,
  sollStunden,
  istStunden,
}: MonatsuebersichtKarteProps) {
  const differenz = istStunden - sollStunden
  const isNegative = differenz < 0

  function formatH(h: number): string {
    return h.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Std.'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stunden {monat}</CardTitle>
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
              <span className="text-muted-foreground">Soll</span>
              <span>{formatH(sollStunden)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ist</span>
              <span>{formatH(istStunden)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-semibold">
              <span>Differenz</span>
              <span className={cn(isNegative ? 'text-destructive' : 'text-emerald-600')}>
                {differenz >= 0 ? '+' : ''}{formatH(differenz)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
