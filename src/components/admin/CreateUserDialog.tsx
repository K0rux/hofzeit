'use client'

import { useState } from 'react'
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

type CreateUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: () => void
}

export function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    vacationDays: '30',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side validation
    if (formData.password.length < 8) {
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
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vacationDays: vacationDaysNum,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen des Mitarbeiters')
      }

      toast.success(`Mitarbeiter ${formData.firstName} ${formData.lastName} wurde erfolgreich angelegt`)

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'employee',
        vacationDays: '30',
      })
      setShowPassword(false)

      onUserCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'employee',
      vacationDays: '30',
    })
    setError('')
    setShowPassword(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuer Mitarbeiter</DialogTitle>
          <DialogDescription>
            Erstelle einen neuen Mitarbeiter-Account. Alle Felder sind erforderlich.
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
                <Label htmlFor="firstName">
                  Vorname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  minLength={2}
                  disabled={isLoading}
                  placeholder="Max"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Nachname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  minLength={2}
                  disabled={isLoading}
                  placeholder="Mustermann"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                E-Mail <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                placeholder="max.mustermann@beispiel.de"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Initial-Passwort <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  disabled={isLoading}
                  placeholder="Mindestens 8 Zeichen"
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
                Das Passwort wird dem Mitarbeiter manuell übermittelt
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Rolle <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="role">
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
              <Label htmlFor="vacationDays">
                Urlaubskontingent (Tage/Jahr) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vacationDays"
                type="number"
                min="0"
                max="365"
                value={formData.vacationDays}
                onChange={(e) => setFormData({ ...formData, vacationDays: e.target.value })}
                required
                disabled={isLoading}
                placeholder="30"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
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
