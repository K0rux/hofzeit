'use client'

import { useState } from 'react'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'
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
import { toast } from 'sonner'
import type { Activity } from '@/app/admin/activities/page'

type DeleteActivityDialogProps = {
  activity: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityDeleted: () => void
}

export function DeleteActivityDialog({
  activity,
  open,
  onOpenChange,
  onActivityDeleted,
}: DeleteActivityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/activities/${activity.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen der Tätigkeit')
      }

      if (activity.usageCount > 0) {
        toast.success(
          `Tätigkeit "${activity.name}" wurde gelöscht. ${activity.usageCount} Zeiterfassung${activity.usageCount !== 1 ? 'en' : ''} wurde${activity.usageCount !== 1 ? 'n' : ''} aktualisiert.`
        )
      } else {
        toast.success(`Tätigkeit "${activity.name}" wurde gelöscht`)
      }

      onActivityDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Löschen')
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  // Check if activity is used in time entries
  const isUsed = activity.usageCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isUsed ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Achtung: Tätigkeit wird verwendet!
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5" />
                Tätigkeit löschen?
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {isUsed ? (
                // Case 2: Activity is used in time entries
                <>
                  <p className="font-medium text-foreground">
                    "{activity.name}" wird in {activity.usageCount} Zeiterfassung
                    {activity.usageCount !== 1 ? 'en' : ''} verwendet.
                  </p>
                  <p>
                    Wenn du diese Tätigkeit löschst, werden diese Zeiterfassungen auf "Gelöschte
                    Tätigkeit" gesetzt.
                  </p>
                  <p className="text-destructive font-medium">Trotzdem löschen?</p>
                </>
              ) : (
                // Case 1: Activity is not used
                <>
                  <p>
                    Möchtest du die Tätigkeit <span className="font-medium">"{activity.name}"</span>{' '}
                    wirklich löschen?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className={isUsed ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gelöscht...
              </>
            ) : isUsed ? (
              'Trotzdem löschen'
            ) : (
              'Löschen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
