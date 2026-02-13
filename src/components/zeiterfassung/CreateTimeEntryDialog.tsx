'use client'

import { useState } from 'react'
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Activity = {
  id: string
  name: string
}

type CostCenter = {
  id: string
  name: string
}

type CreateTimeEntryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeEntryCreated: () => void
  activities: Activity[]
  costCenters: CostCenter[]
  selectedMonth: string
}

export function CreateTimeEntryDialog({
  open,
  onOpenChange,
  onTimeEntryCreated,
  activities,
  costCenters,
  selectedMonth,
}: CreateTimeEntryDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [date, setDate] = useState<Date>(new Date())
  const [activityId, setActivityId] = useState('')
  const [costCenterId, setCostCenterId] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')

  // Warnings
  const [showHighHoursWarning, setShowHighHoursWarning] = useState(false)

  const handleHoursChange = (value: string) => {
    setHours(value)
    const hoursNum = parseFloat(value)
    if (hoursNum > 10) {
      setShowHighHoursWarning(true)
    } else {
      setShowHighHoursWarning(false)
    }
  }

  const resetForm = () => {
    setDate(new Date())
    setActivityId('')
    setCostCenterId('')
    setHours('')
    setNotes('')
    setError('')
    setShowHighHoursWarning(false)
  }

  const validateForm = () => {
    // Check required fields
    if (!date) {
      setError('Bitte wähle ein Datum aus.')
      return false
    }
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

    // Check if date is in selected month
    const monthStart = startOfMonth(parseISO(selectedMonth + '-01'))
    const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'))

    if (isBefore(date, monthStart) || isAfter(date, monthEnd)) {
      setError('Das Datum muss im ausgewählten Monat liegen.')
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
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd'),
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

      toast.success(`Zeiterfassung für ${format(date, 'dd.MM.yyyy', { locale: de })} wurde gespeichert`)
      resetForm()
      onTimeEntryCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate allowed date range (current month)
  const monthStart = startOfMonth(parseISO(selectedMonth + '-01'))
  const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Zeiterfassung</DialogTitle>
          <DialogDescription>
            Erfasse deine Arbeitszeit für einen bestimmten Tag.
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

          {/* Check if activities/cost centers are available */}
          {(activities.length === 0 || costCenters.length === 0) && (
            <Alert variant="destructive">
              <AlertDescription>
                {activities.length === 0
                  ? 'Keine Tätigkeiten verfügbar. Bitte kontaktiere den Administrator.'
                  : 'Keine Kostenstellen verfügbar. Bitte kontaktiere den Administrator.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd. MMMM yyyy', { locale: de }) : 'Datum auswählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  disabled={(date) => {
                    return isBefore(date, monthStart) || isAfter(date, monthEnd)
                  }}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Nur Tage im {format(monthStart, 'MMMM yyyy', { locale: de })} sind auswählbar
            </p>
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
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || activities.length === 0 || costCenters.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
