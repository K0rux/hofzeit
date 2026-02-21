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
import type { StammdatenTyp } from './types'

interface LoeschenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  typ: StammdatenTyp
  itemId: string | null
  itemName: string | null
}

const config = {
  taetigkeit: {
    apiPath: '/api/taetigkeiten',
    label: 'Tätigkeit',
  },
  kostenstelle: {
    apiPath: '/api/kostenstellen',
    label: 'Kostenstelle',
  },
}

export function LoeschenDialog({
  open,
  onOpenChange,
  onSuccess,
  typ,
  itemId,
  itemName,
}: LoeschenDialogProps) {
  const cfg = config[typ]
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!itemId) return

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`${cfg.apiPath}/${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || `Fehler beim Löschen der ${cfg.label}`)
        return
      }

      onOpenChange(false)
      toast.success(`${cfg.label} erfolgreich gelöscht`)
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
          <DialogTitle>{cfg.label} löschen</DialogTitle>
          <DialogDescription>
            Möchten Sie die {cfg.label} &quot;{itemName}&quot; wirklich löschen?
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
