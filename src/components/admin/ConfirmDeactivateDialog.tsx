'use client'

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
import type { User } from '@/app/admin/users/page'

type ConfirmDeactivateDialogProps = {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmDeactivateDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mitarbeiter deaktivieren?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <div>
                Möchtest du <strong>{user.firstName} {user.lastName}</strong> wirklich deaktivieren?
              </div>
              <div className="text-sm">
                Der Login wird gesperrt, aber alle Daten bleiben erhalten. Der Account kann später
                wieder aktiviert werden.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Deaktivieren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
