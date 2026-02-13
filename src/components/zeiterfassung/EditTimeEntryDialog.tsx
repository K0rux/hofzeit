'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

type TimeEntry = {
  id: string
  date: string
  activity: {
    id: string
    name: string
  }
  costCenter: {
    id: string
    name: string
  }
  hours: number
  notes: string | null
}

type Activity = {
  id: string
  name: string
}

type CostCenter = {
  id: string
  name: string
}

type EditTimeEntryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeEntryUpdated: () => void
  entry: TimeEntry
  activities: Activity[]
  costCenters: CostCenter[]
}

export function EditTimeEntryDialog({
  open,
  onOpenChange,
  onTimeEntryUpdated,
  entry,
  activities,
  costCenters,
}: EditTimeEntryDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [activityId, setActivityId] = useState(entry.activity.id)
  const [costCenterId, setCostCenterId] = useState(entry.costCenter.id)
  const [hours, setHours] = useState(entry.hours.toString())
  const [notes, setNotes] = useState(entry.notes || '')

  // Warnings
  const [showHighHoursWarning, setShowHighHoursWarning] = useState(false)

  // Reset form when entry changes
  useEffect(() => {
    setActivityId(entry.activity.id)
    setCostCenterId(entry.costCenter.id)
    setHours(entry.hours.toString())
    setNotes(entry.notes || '')
    setError('')
    setShowHighHoursWarning(entry.hours > 10)
  }, [entry])

  const handleHoursChange = (value: string) => {
    setHours(value)
    const hoursNum = parseFloat(value)
    if (hoursNum > 10) {
      setShowHighHoursWarning(true)
    } else {
      setShowHighHoursWarning(false)
    }
  }

  const validateForm = () => {
    // Check required fields
    if (!activityId) {
      setError('Bitte wähle eine Tätigkeit aus.')
      return false
    }
    if (!costCenterId) {
      setError('Bitte wähle eine Kostenstelle aus.')
      return false
    }
    if (!hours || parseFloat(hours) < 0.25 || parseFloat(hours) > 24) {
      setError('Stunden müssen zwischen 0.25 und 24 liegen.')
      return false
    }

    // Check notes length
    if (notes && notes.length > 500) {
      setError('Notiz darf maximal 500 Zeichen lang sein.')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/time-entries/${entry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          costCenterId,
          hours: parseFloat(hours),
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success('Änderungen gespeichert')
      onTimeEntryUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Zeiterfassung bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeite deine Zeiterfassung vom{' '}
            {format(parseISO(entry.date), 'dd. MMMM yyyy', { locale: de })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* High Hours Warning */}
          {showHighHoursWarning && (
            <Alert>
              <AlertDescription>
                Achtung: Du erfasst mehr als 10 Stunden. Ist das korrekt?
              </AlertDescription>
            </Alert>
          )}

          {/* Date Display (read-only) */}
          <div className="space-y-2">
            <Label>Datum</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">
                {format(parseISO(entry.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Das Datum kann nicht geändert werden
              </p>
            </div>
          </div>

          {/* Activity Field */}
          <div className="space-y-2">
            <Label htmlFor="activity">Tätigkeit *</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Tätigkeit auswählen" />
              </SelectTrigger>
              <SelectContent>
                {activities
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Center Field */}
          <div className="space-y-2">
            <Label htmlFor="costCenter">Kostenstelle *</Label>
            <Select value={costCenterId} onValueChange={setCostCenterId}>
              <SelectTrigger>
                <SelectValue placeholder="Kostenstelle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {costCenters
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((costCenter) => (
                    <SelectItem key={costCenter.id} value={costCenter.id}>
                      {costCenter.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hours Field */}
          <div className="space-y-2">
            <Label htmlFor="hours">Stunden *</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              placeholder="8.5"
              value={hours}
              onChange={(e) => handleHoursChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Beispiel: 8.5 für 8 Stunden 30 Minuten (Min: 0.25, Max: 24)
            </p>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notiz (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 Zeichen
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
