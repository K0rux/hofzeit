'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Taetigkeit, Kostenstelle, StammdatenTyp } from './types'

interface StammdatenFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  typ: StammdatenTyp
  editItem?: Taetigkeit | Kostenstelle | null
}

const config = {
  taetigkeit: {
    apiPath: '/api/taetigkeiten',
    label: 'Tätigkeit',
    secondFieldLabel: 'Beschreibung',
    secondFieldPlaceholder: 'z. B. Rasenmähen im Gemeindegebiet',
    secondFieldKey: 'beschreibung' as const,
    maxSecondField: 255,
    isTextarea: true,
  },
  kostenstelle: {
    apiPath: '/api/kostenstellen',
    label: 'Kostenstelle',
    secondFieldLabel: 'Nummer / Code',
    secondFieldPlaceholder: 'z. B. KST-001',
    secondFieldKey: 'nummer' as const,
    maxSecondField: 50,
    isTextarea: false,
  },
}

export function StammdatenFormDialog({
  open,
  onOpenChange,
  onSuccess,
  typ,
  editItem,
}: StammdatenFormDialogProps) {
  const cfg = config[typ]
  const isEdit = !!editItem

  const [name, setName] = useState('')
  const [secondField, setSecondField] = useState('')
  const [errors, setErrors] = useState<{ name?: string; secondField?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setName(editItem.name)
      const value = cfg.secondFieldKey === 'beschreibung'
        ? (editItem as Taetigkeit).beschreibung
        : (editItem as Kostenstelle).nummer
      setSecondField(value ?? '')
    }
  }, [open, editItem, cfg.secondFieldKey])

  function resetForm() {
    setName('')
    setSecondField('')
    setErrors({})
    setServerError(null)
  }

  function validate(): boolean {
    const newErrors: { name?: string; secondField?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name ist erforderlich'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name darf maximal 100 Zeichen lang sein'
    }

    if (secondField.length > cfg.maxSecondField) {
      newErrors.secondField = `Maximal ${cfg.maxSecondField} Zeichen erlaubt`
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
      const url = isEdit ? `${cfg.apiPath}/${editItem!.id}` : cfg.apiPath
      const method = isEdit ? 'PATCH' : 'POST'

      const body: Record<string, string> = { name: name.trim() }
      body[cfg.secondFieldKey] = secondField.trim() || ''

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error || `Fehler beim Speichern der ${cfg.label}`)
        return
      }

      resetForm()
      onOpenChange(false)
      toast.success(
        isEdit
          ? `${cfg.label} erfolgreich aktualisiert`
          : `${cfg.label} erfolgreich angelegt`
      )
      onSuccess()
    } catch {
      setServerError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm()
        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `${cfg.label} bearbeiten` : `Neue ${cfg.label}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Bearbeiten Sie die ${cfg.label}.`
              : `Legen Sie eine neue ${cfg.label} an.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stammdaten-name">Name</Label>
            <Input
              id="stammdaten-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={typ === 'taetigkeit' ? 'z. B. Rasenmähen' : 'z. B. Spielplatz Nord'}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stammdaten-second">{cfg.secondFieldLabel}</Label>
            {cfg.isTextarea ? (
              <Textarea
                id="stammdaten-second"
                value={secondField}
                onChange={(e) => setSecondField(e.target.value)}
                placeholder={cfg.secondFieldPlaceholder}
                maxLength={cfg.maxSecondField}
                rows={3}
              />
            ) : (
              <Input
                id="stammdaten-second"
                value={secondField}
                onChange={(e) => setSecondField(e.target.value)}
                placeholder={cfg.secondFieldPlaceholder}
                maxLength={cfg.maxSecondField}
              />
            )}
            {errors.secondField && (
              <p className="text-sm text-destructive">{errors.secondField}</p>
            )}
          </div>
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
