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

interface LoeschenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  itemId: string | null
  taetigkeitLabel: string | null
}

export function ZeiteintragLoeschenDialog({
  open,
  onOpenChange,
  onSuccess,
  itemId,
  taetigkeitLabel,
}: LoeschenDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!itemId) return

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/zeiteintraege/${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Löschen des Zeiteintrags')
        return
      }

      onOpenChange(false)
      toast.success('Zeiteintrag erfolgreich gelöscht')
      onSuccess()
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) setError(null)
        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zeiteintrag löschen</DialogTitle>
          <DialogDescription>
            Möchten Sie den Zeiteintrag &quot;{taetigkeitLabel}&quot; wirklich löschen?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Wird gelöscht...' : 'Löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
