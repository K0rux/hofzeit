'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

type CreateCostCenterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCostCenterCreated: () => void
}

export function CreateCostCenterDialog({
  open,
  onOpenChange,
  onCostCenterCreated,
}: CreateCostCenterDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateField, setDuplicateField] = useState<'name' | 'number'>('name')

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent, allowDuplicate = false) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side validation
    if (formData.name.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    if (formData.name.length > 100) {
      setError('Name darf maximal 100 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    if (formData.number.length > 20) {
      setError('Nummer darf maximal 20 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    if (formData.description.length > 500) {
      setError('Beschreibung darf maximal 500 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/cost-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          number: formData.number.trim() || null,
          description: formData.description.trim() || null,
          allowDuplicate,
        }),
      })

      const data = await response.json()

      // Handle duplicate name or number (409 Conflict)
      if (response.status === 409 && data.error === 'duplicate') {
        if (data.duplicateField === 'number') {
          setDuplicateName(data.existingNumber || formData.number)
          setDuplicateField('number')
        } else {
          setDuplicateName(data.existingName || formData.name)
          setDuplicateField('name')
        }
        setShowDuplicateWarning(true)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Kostenstelle')
      }

      toast.success(`Kostenstelle "${formData.name}" wurde erstellt`)

      // Reset form
      setFormData({ name: '', number: '', description: '' })
      setShowDuplicateWarning(false)
      onCostCenterCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDuplicate = (e: React.FormEvent) => {
    setShowDuplicateWarning(false)
    handleSubmit(e, true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Kostenstelle anlegen</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Kostenstelle für die Zeiterfassung
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

            {/* Duplicate Warning */}
            {showDuplicateWarning && (
              <Alert variant="default" className="border-orange-500 bg-orange-50">
                <AlertDescription className="space-y-2">
                  <p className="font-medium text-orange-900">
                    {duplicateField === 'number'
                      ? `Eine Kostenstelle mit der Nummer "${duplicateName}" existiert bereits.`
                      : `Eine Kostenstelle mit dem Namen "${duplicateName}" existiert bereits.`
                    }
                  </p>
                  <p className="text-sm text-orange-800">
                    Möchtest du trotzdem eine weitere Kostenstelle mit {duplicateField === 'number' ? 'dieser Nummer' : 'diesem Namen'} erstellen?
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowDuplicateWarning(false)
                        setError('')
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmDuplicate}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Ja, trotzdem erstellen
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="z.B. Projekt A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/100 Zeichen
              </p>
            </div>

            {/* Number Field */}
            <div className="space-y-2">
              <Label htmlFor="number">Nummer (Optional)</Label>
              <Input
                id="number"
                placeholder="z.B. KST-001"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                maxLength={20}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.number.length}/20 Zeichen
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (Optional)</Label>
              <Textarea
                id="description"
                placeholder="z.B. Kostenstelle für Projekt A"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                disabled={isLoading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 Zeichen
              </p>
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
                  Wird erstellt...
                </>
              ) : (
                'Kostenstelle erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
