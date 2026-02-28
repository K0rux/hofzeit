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
import { monatLabel } from '@/components/monatsabschluss/types'

interface AbschliessenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  jahr: number
  monat: number
  mitarbeiterName: string
  onSuccess: () => void
}

export function AbschliessenDialog({
  open,
  onOpenChange,
  userId,
  jahr,
  monat,
  mitarbeiterName,
  onSuccess,
}: AbschliessenDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAbschliessen() {
    if (!userId) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/monatsabschluesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, jahr, monat }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Abschließen des Monats')
        return
      }

      onOpenChange(false)
      toast.success(`${monatLabel(monat)} ${jahr} für ${mitarbeiterName} abgeschlossen`)
      onSuccess()
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monat abschließen</DialogTitle>
          <DialogDescription>
            {monatLabel(monat)} {jahr} für {mitarbeiterName} abschließen?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
            {submitting ? 'Wird abgeschlossen...' : 'Monat abschließen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
