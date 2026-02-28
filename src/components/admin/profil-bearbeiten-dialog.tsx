'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserProfile } from './types'

interface ProfilBearbeitenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  onSuccess: () => void
}

export function ProfilBearbeitenDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ProfilBearbeitenDialogProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && user) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)
      setError(null)
    }
  }, [open, user])

  function resetForm() {
    setFirstName('')
    setLastName('')
    setEmail('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!user) return

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    if (firstName.trim().length > 100 || lastName.trim().length > 100) {
      setError('Vorname und Nachname dürfen maximal 100 Zeichen lang sein.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Speichern.')
        return
      }

      resetForm()
      onOpenChange(false)
      onSuccess()
      toast.success('Profil gespeichert')
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
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>
            Profildaten von {user?.first_name} {user?.last_name} bearbeiten.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-firstName">Vorname *</Label>
            <Input
              id="admin-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-lastName">Nachname *</Label>
            <Input
              id="admin-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">E-Mail *</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
