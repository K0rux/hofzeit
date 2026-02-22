'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Abwesenheit } from './types'

interface AbwesenheitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Abwesenheit | null
  existingAbwesenheiten?: Abwesenheit[]
}

export function AbwesenheitFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editItem,
  existingAbwesenheiten = [],
}: AbwesenheitFormDialogProps) {
  const isEdit = !!editItem

  const [typ, setTyp] = useState<'urlaub' | 'krankheit'>('urlaub')
  const [startdatum, setStartdatum] = useState('')
  const [enddatum, setEnddatum] = useState('')
  const [notiz, setNotiz] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const hasOverlap =
    startdatum !== '' &&
    enddatum !== '' &&
    existingAbwesenheiten.some(
      (a) =>
        a.id !== editItem?.id &&
        a.startdatum <= enddatum &&
        a.enddatum >= startdatum
    )

  useEffect(() => {
    if (open && editItem) {
      setTyp(editItem.typ)
      setStartdatum(editItem.startdatum)
      setEnddatum(editItem.enddatum)
      setNotiz(editItem.notiz ?? '')
    } else if (open && !editItem) {
      setTyp('urlaub')
      setStartdatum('')
      setEnddatum('')
      setNotiz('')
    }
    setErrors({})
    setServerError(null)
  }, [open, editItem])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!startdatum) {
      newErrors.startdatum = 'Startdatum ist erforderlich'
    }

    if (!enddatum) {
      newErrors.enddatum = 'Enddatum ist erforderlich'
    }

    if (startdatum && enddatum && enddatum < startdatum) {
      newErrors.enddatum = 'Enddatum muss gleich oder nach dem Startdatum liegen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const body = {
        typ,
        startdatum,
        enddatum,
        notiz: notiz.trim() || null,
      }

      const url = isEdit ? `/api/abwesenheiten/${editItem!.id}` : '/api/abwesenheiten'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error || 'Fehler beim Speichern der Abwesenheit')
        return
      }

      onOpenChange(false)
      toast.success(isEdit ? 'Abwesenheit aktualisiert' : 'Abwesenheit erfolgreich eingetragen')
      onSuccess()
    } catch {
      setServerError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Abwesenheit bearbeiten' : 'Neue Abwesenheit'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Bearbeiten Sie die Abwesenheit.'
              : 'Tragen Sie Urlaub oder Krankheit ein.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Typ */}
          <div className="space-y-2">
            <Label>Typ</Label>
            <RadioGroup
              value={typ}
              onValueChange={(value) => setTyp(value as 'urlaub' | 'krankheit')}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="urlaub" id="typ-urlaub" />
                <Label htmlFor="typ-urlaub" className="font-normal cursor-pointer">
                  Urlaub
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="krankheit" id="typ-krankheit" />
                <Label htmlFor="typ-krankheit" className="font-normal cursor-pointer">
                  Krankheit
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Startdatum */}
          <div className="space-y-2">
            <Label htmlFor="ab-startdatum">Startdatum</Label>
            <Input
              id="ab-startdatum"
              type="date"
              value={startdatum}
              onChange={(e) => {
                setStartdatum(e.target.value)
                if (!enddatum || enddatum < e.target.value) {
                  setEnddatum(e.target.value)
                }
              }}
            />
            {errors.startdatum && <p className="text-sm text-destructive">{errors.startdatum}</p>}
          </div>

          {/* Enddatum */}
          <div className="space-y-2">
            <Label htmlFor="ab-enddatum">Enddatum</Label>
            <Input
              id="ab-enddatum"
              type="date"
              value={enddatum}
              min={startdatum || undefined}
              onChange={(e) => setEnddatum(e.target.value)}
            />
            {errors.enddatum && <p className="text-sm text-destructive">{errors.enddatum}</p>}
          </div>

          {/* Notiz */}
          <div className="space-y-2">
            <Label htmlFor="ab-notiz">Notiz (optional)</Label>
            <Textarea
              id="ab-notiz"
              placeholder="z. B. Familienurlaub, Arzttermin..."
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {/* Overlap warning (non-blocking) */}
          {hasOverlap && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                Hinweis: Dieser Zeitraum überschneidet sich mit einer bestehenden Abwesenheit.
              </p>
            </div>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
