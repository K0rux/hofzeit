'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { monatLabel } from '@/components/monatsabschluss/types'

interface MitarbeiterStatus {
  userId: string
  name: string
  status: 'offen' | 'abgeschlossen'
  abschlussId?: string
}

interface AdminMonatsabschlussUebersichtProps {
  loading: boolean
  mitarbeiter: MitarbeiterStatus[]
  jahr: number
  monat: number
  onRefresh: () => void
}

export function AdminMonatsabschlussUebersicht({
  loading,
  mitarbeiter,
  jahr,
  monat,
  onRefresh,
}: AdminMonatsabschlussUebersichtProps) {
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null)
  const [confirmName, setConfirmName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const alleAbgeschlossen = mitarbeiter.length > 0 && mitarbeiter.every((m) => m.status === 'abgeschlossen')

  // Sort: open first, then closed
  const sorted = [...mitarbeiter].sort((a, b) => {
    if (a.status === 'offen' && b.status !== 'offen') return -1
    if (a.status !== 'offen' && b.status === 'offen') return 1
    return a.name.localeCompare(b.name, 'de')
  })

  async function handleAbschliessen() {
    if (!confirmUserId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/monatsabschluesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: confirmUserId, jahr, monat }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Fehler beim Abschließen')
        return
      }
      toast.success(`Monatsabschluss für ${confirmName} erstellt`)
      setConfirmUserId(null)
      onRefresh()
    } catch {
      toast.error('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monatsabschlüsse – {monatLabel(monat)} {jahr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : mitarbeiter.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine aktiven Mitarbeiter vorhanden.
            </p>
          ) : alleAbgeschlossen ? (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-sm text-emerald-800">
                Alle Monatsabschlüsse für {monatLabel(monat)} {jahr} abgeschlossen.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((m) => (
                <div key={m.userId} className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.status === 'abgeschlossen' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Abgeschlossen
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="destructive">Offen</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setConfirmUserId(m.userId)
                            setConfirmName(m.name)
                          }}
                        >
                          Abschließen
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmUserId} onOpenChange={(open) => { if (!open) setConfirmUserId(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Monat abschließen</DialogTitle>
            <DialogDescription>
              {monatLabel(monat)} {jahr} für {confirmName} abschließen?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Nach dem Abschluss können Zeiteinträge und Abwesenheiten dieses Monats nicht mehr verändert werden.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUserId(null)} disabled={submitting}>
              Abbrechen
            </Button>
            <Button onClick={handleAbschliessen} disabled={submitting}>
              {submitting ? 'Wird abgeschlossen...' : 'Abschließen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
