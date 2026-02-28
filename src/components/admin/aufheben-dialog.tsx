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

interface AufhebenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  abschlussId: string | null
  jahr: number
  monat: number
  mitarbeiterName: string
  onSuccess: () => void
}

export function AufhebenDialog({
  open,
  onOpenChange,
  abschlussId,
  jahr,
  monat,
  mitarbeiterName,
  onSuccess,
}: AufhebenDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAufheben() {
    if (!abschlussId) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/monatsabschluesse/${abschlussId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Aufheben des Abschlusses')
        return
      }

      onOpenChange(false)
      toast.success(`${monatLabel(monat)} ${jahr} wurde wieder geöffnet`)
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
          <DialogTitle>Monatsabschluss aufheben</DialogTitle>
          <DialogDescription>
            Möchten Sie den Abschluss von {monatLabel(monat)} {jahr} für{' '}
            {mitarbeiterName} wirklich aufheben?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Der Mitarbeiter kann danach Zeiteinträge und Abwesenheiten
              dieses Monats wieder bearbeiten.
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
          <Button
            variant="destructive"
            onClick={handleAufheben}
            disabled={submitting}
          >
            {submitting ? 'Wird aufgehoben...' : 'Abschluss aufheben'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
