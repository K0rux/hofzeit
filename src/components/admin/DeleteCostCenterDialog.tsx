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
import type { CostCenter } from '@/app/admin/cost-centers/page'

type DeleteCostCenterDialogProps = {
  costCenter: CostCenter
  open: boolean
  onOpenChange: (open: boolean) => void
  onCostCenterDeleted: () => void
}

export function DeleteCostCenterDialog({
  costCenter,
  open,
  onOpenChange,
  onCostCenterDeleted,
}: DeleteCostCenterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/cost-centers/${costCenter.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen der Kostenstelle')
      }

      if (costCenter.usageCount > 0) {
        toast.success(
          `Kostenstelle "${costCenter.name}" wurde gelöscht. ${costCenter.usageCount} Zeiterfassung${costCenter.usageCount !== 1 ? 'en' : ''} wurde${costCenter.usageCount !== 1 ? 'n' : ''} aktualisiert.`
        )
      } else {
        toast.success(`Kostenstelle "${costCenter.name}" wurde gelöscht`)
      }

      onCostCenterDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Löschen')
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  // Check if cost center is used in time entries
  const isUsed = costCenter.usageCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isUsed ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Achtung: Kostenstelle wird verwendet!
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5" />
                Kostenstelle löschen?
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {isUsed ? (
                // Case 2: Cost center is used in time entries
                <>
                  <p className="font-medium text-foreground">
                    "{costCenter.name}" wird in {costCenter.usageCount} Zeiterfassung
                    {costCenter.usageCount !== 1 ? 'en' : ''} verwendet.
                  </p>
                  <p>
                    Wenn du diese Kostenstelle löschst, werden diese Zeiterfassungen auf "Gelöschte
                    Kostenstelle" gesetzt.
                  </p>
                  <p className="text-destructive font-medium">Trotzdem löschen?</p>
                </>
              ) : (
                // Case 1: Cost center is not used
                <>
                  <p>
                    Möchtest du die Kostenstelle{' '}
                    <span className="font-medium">"{costCenter.name}"</span> wirklich löschen?
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
