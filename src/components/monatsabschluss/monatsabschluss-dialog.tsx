'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { monatLabel } from './types'

interface MonatsabschlussDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jahr: number
  monat: number
  gesamtStunden: number
  anzahlEintraege: number
  anzahlAbwesenheiten: number
  onSuccess: () => void
}

export function MonatsabschlussDialog({
  open,
  onOpenChange,
  jahr,
  monat,
  gesamtStunden,
  anzahlEintraege,
  anzahlAbwesenheiten,
  onSuccess,
}: MonatsabschlussDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAbschliessen() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/monatsabschluesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jahr, monat }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Abschließen des Monats')
        return
      }

      onOpenChange(false)
      toast.success(`${monatLabel(monat)} ${jahr} wurde abgeschlossen`)
      onSuccess()
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const stundenFormatted = gesamtStunden.toLocaleString('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monat abschließen</DialogTitle>
          <DialogDescription>
            {monatLabel(monat)} {jahr} endgültig abschließen?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-md border p-4 space-y-2">
            <h4 className="text-sm font-medium">Zusammenfassung</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Gesamtstunden:</span>
              <span className="font-medium">{stundenFormatted} Std.</span>
              <span className="text-muted-foreground">Zeiteinträge:</span>
              <span className="font-medium">{anzahlEintraege}</span>
              <span className="text-muted-foreground">Abwesenheiten:</span>
              <span className="font-medium">{anzahlAbwesenheiten}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Nach dem Abschluss können Zeiteinträge und Abwesenheiten dieses
              Monats nicht mehr verändert werden.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Abbrechen
          </Button>
          <Button onClick={handleAbschliessen} disabled={submitting}>
            {submitting ? 'Wird abgeschlossen...' : 'Endgültig abschließen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
