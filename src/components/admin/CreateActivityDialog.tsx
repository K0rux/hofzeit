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

type CreateActivityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityCreated: () => void
}

export function CreateActivityDialog({
  open,
  onOpenChange,
  onActivityCreated,
}: CreateActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (formData.description.length > 500) {
      setError('Beschreibung darf maximal 500 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Tätigkeit')
      }

      toast.success(`Tätigkeit "${formData.name}" wurde erstellt`)

      // Reset form
      setFormData({ name: '', description: '' })
      onActivityCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Tätigkeit anlegen</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Tätigkeit für die Zeiterfassung
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

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="z.B. Straßenreinigung"
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

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (Optional)</Label>
              <Textarea
                id="description"
                placeholder="z.B. Reinigung städtischer Straßen"
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
                'Tätigkeit erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
