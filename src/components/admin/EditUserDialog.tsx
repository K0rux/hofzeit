'use client'

import { useState, useEffect } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { User } from '@/app/admin/users/page'

type EditUserDialogProps = {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    role: user.role,
    vacationDays: user.vacationDays.toString(),
  })

  // Update form when user changes
  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      vacationDays: user.vacationDays.toString(),
    })
    setError('')
    setShowPassword(false)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side validation
    if (formData.password && formData.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein')
      setIsLoading(false)
      return
    }

    const vacationDaysNum = parseInt(formData.vacationDays)
    if (isNaN(vacationDaysNum) || vacationDaysNum < 0 || vacationDaysNum > 365) {
      setError('Urlaubstage müssen zwischen 0 und 365 liegen')
      setIsLoading(false)
      return
    }

    try {
      const updateData: Record<string, string | number> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        vacationDays: vacationDaysNum,
      }

      // Only include password if it's set
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Mitarbeiters')
      }

      toast.success('Änderungen gespeichert')
      onUserUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeite die Mitarbeiter-Daten. Passwort nur ausfüllen, wenn es geändert werden soll.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">
                  Vorname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">
                  Nachname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">
                E-Mail <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-password">Neues Passwort (optional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={8}
                  disabled={isLoading}
                  placeholder="Leer lassen = keine Änderung"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nur ausfüllen, wenn das Passwort geändert werden soll (min. 8 Zeichen)
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="edit-role">
                Rolle <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vacation Days */}
            <div className="space-y-2">
              <Label htmlFor="edit-vacationDays">
                Urlaubskontingent (Tage/Jahr) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-vacationDays"
                type="number"
                min="0"
                max="365"
                value={formData.vacationDays}
                onChange={(e) => setFormData({ ...formData, vacationDays: e.target.value })}
                required
                disabled={isLoading}
              />
              {parseInt(formData.vacationDays) !== user.vacationDays && (
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Hinweis:</strong> Änderungen am Urlaubskontingent beeinflussen bereits
                    erfasste Urlaubstage nicht automatisch. Bitte prüfe dies manuell.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
