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
import type { UserProfile } from './types'

interface AktivierenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  onSuccess: () => void
}

export function AktivierenDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: AktivierenDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleActivate() {
    setError(null)
    if (!user) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Reaktivieren des Benutzers')
        return
      }

      setError(null)
      onOpenChange(false)
      toast.success('Benutzer erfolgreich reaktiviert')
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
          <DialogTitle>Benutzer reaktivieren</DialogTitle>
          <DialogDescription>
            Möchten Sie {user?.first_name} {user?.last_name} wieder aktivieren?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800">
              Der Benutzer kann sich nach der Reaktivierung wieder einloggen.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
          <Button onClick={handleActivate} disabled={submitting}>
            {submitting ? 'Wird aktiviert...' : 'Reaktivieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
