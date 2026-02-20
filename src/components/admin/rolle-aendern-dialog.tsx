'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserProfile } from './types'

interface RolleAendernDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  currentUserId: string | null
  onSuccess: () => void
}

export function RolleAendernDialog({
  open,
  onOpenChange,
  user,
  currentUserId,
  onSuccess,
}: RolleAendernDialogProps) {
  const [role, setRole] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Set initial role when user changes
  const effectiveRole = role || user?.role || ''
  const isSelf = user?.id === currentUserId

  function resetForm() {
    setRole('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!user) return

    if (isSelf) {
      setError('Sie können Ihre eigene Rolle nicht ändern')
      return
    }

    const newRole = role || user.role
    if (newRole === user.role) {
      setError('Bitte wählen Sie eine andere Rolle')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Ändern der Rolle')
        return
      }

      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm()
        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rolle ändern</DialogTitle>
          <DialogDescription>
            Rolle für {user?.first_name} {user?.last_name} ändern.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSelf ? (
            <p className="text-sm text-destructive">
              Sie können Ihre eigene Rolle nicht ändern.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new_role">Neue Rolle</Label>
              <Select
                value={effectiveRole}
                onValueChange={setRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Wird gespeichert...' : 'Rolle ändern'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
