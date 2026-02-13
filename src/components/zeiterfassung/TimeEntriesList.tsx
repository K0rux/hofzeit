'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, Briefcase, Building2, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EditTimeEntryDialog } from './EditTimeEntryDialog'
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
  createdAt: string
  updatedAt: string
}

type Activity = {
  id: string
  name: string
}

type CostCenter = {
  id: string
  name: string
}

type TimeEntriesListProps = {
  timeEntries: TimeEntry[]
  onTimeEntryUpdated: () => void
  onTimeEntryDeleted: () => void
  activities: Activity[]
  costCenters: CostCenter[]
}

export function TimeEntriesList({
  timeEntries,
  onTimeEntryUpdated,
  onTimeEntryDeleted,
  activities,
  costCenters,
}: TimeEntriesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<TimeEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Group entries by date (newest first)
  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const date = entry.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)

  // Sort dates descending
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    return parseISO(b).getTime() - parseISO(a).getTime()
  })

  const handleDeleteClick = (entry: TimeEntry) => {
    setEntryToDelete(entry)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/time-entries/${entryToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen')
      }

      toast.success('Zeiterfassung gelöscht')
      onTimeEntryDeleted()
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (entry: TimeEntry) => {
    setEntryToEdit(entry)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setEntryToEdit(null)
    onTimeEntryUpdated()
  }

  // Calculate daily totals
  const getDailyTotal = (entries: TimeEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.hours, 0)
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const entries = groupedEntries[date]
        const dailyTotal = getDailyTotal(entries)
        const dateObj = parseISO(date)

        return (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {format(dateObj, 'EEEE, dd. MMMM yyyy', { locale: de })}
                </h3>
              </div>
              <Badge variant="secondary" className="text-base">
                {dailyTotal.toFixed(2)}h
              </Badge>
            </div>

            {/* Entries for this date */}
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Entry Details */}
                      <div className="flex-1 space-y-2">
                        {/* Activity & Cost Center */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{entry.activity.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {entry.costCenter.name}
                            </span>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-semibold text-primary">
                            {entry.hours.toFixed(2)}h
                          </span>
                        </div>

                        {/* Notes */}
                        {entry.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {entry.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(entry)}
                        >
                          <Edit className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(entry)}
                        >
                          <Trash2 className="h-4 w-4 md:mr-2 text-destructive" />
                          <span className="hidden md:inline">Löschen</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeiterfassung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Zeiterfassung vom{' '}
              {entryToDelete &&
                format(parseISO(entryToDelete.date), 'dd.MM.yyyy', { locale: de })}{' '}
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {entryToEdit && (
        <EditTimeEntryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTimeEntryUpdated={handleEditSuccess}
          entry={entryToEdit}
          activities={activities}
          costCenters={costCenters}
        />
      )}
    </div>
  )
}
