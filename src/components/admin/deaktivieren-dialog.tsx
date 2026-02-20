'use client'

import { useState } from 'react'
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

interface DeaktivierenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  currentUserId: string | null
  onSuccess: () => void
}

export function DeaktivierenDialog({
  open,
  onOpenChange,
  user,
  currentUserId,
  onSuccess,
}: DeaktivierenDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSelf = user?.id === currentUserId

  async function handleDeactivate() {
    setError(null)

    if (!user) return

    if (isSelf) {
      setError('Sie können sich nicht selbst deaktivieren')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Deaktivieren des Benutzers')
        return
      }

      setError(null)
      onOpenChange(false)
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
          <DialogTitle>Benutzer deaktivieren</DialogTitle>
          <DialogDescription>
            Möchten Sie {user?.first_name} {user?.last_name} wirklich
            deaktivieren?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Der Benutzer kann sich nicht mehr einloggen. Bestehende
              Zeiteinträge bleiben erhalten.
            </p>
          </div>
          {isSelf && (
            <p className="text-sm text-destructive">
              Sie können sich nicht selbst deaktivieren.
            </p>
          )}
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
          {!isSelf && (
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={submitting}
            >
              {submitting ? 'Wird deaktiviert...' : 'Deaktivieren'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
