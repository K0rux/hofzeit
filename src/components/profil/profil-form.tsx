'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProfilFormProps {
  initialFirstName: string
  initialLastName: string
  initialEmail: string
}

export function ProfilForm({
  initialFirstName,
  initialLastName,
  initialEmail,
}: ProfilFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(initialEmail)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailChanged, setEmailChanged] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailChanged(false)

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
      const res = await fetch('/api/profile/me', {
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
        setError(data.error || 'Fehler beim Speichern des Profils.')
        return
      }

      const hasEmailChange = email.trim() !== initialEmail
      if (hasEmailChange) {
        setEmailChanged(true)
      }
      toast.success('Profil gespeichert')
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Vorname *</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Nachname *</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {emailChanged && (
        <Alert>
          <AlertDescription>
            Ihre E-Mail-Adresse wurde geändert. Die neue E-Mail gilt ab dem nächsten Login.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Wird gespeichert...' : 'Speichern'}
      </Button>
    </form>
  )
}
