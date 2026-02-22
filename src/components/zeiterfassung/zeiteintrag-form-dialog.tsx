'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Zeiteintrag, TaetigkeitOption, KostenstelleOption } from './types'

interface ZeiteintragFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Zeiteintrag | null
  defaultDatum: string
  taetigkeiten: TaetigkeitOption[]
  kostenstellen: KostenstelleOption[]
}

type TaetigkeitModus = 'liste' | 'freitext'

export function ZeiteintragFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editItem,
  defaultDatum,
  taetigkeiten,
  kostenstellen,
}: ZeiteintragFormDialogProps) {
  const isEdit = !!editItem
  const noTaetigkeiten = taetigkeiten.length === 0

  const [datum, setDatum] = useState(defaultDatum)
  const [taetigkeitModus, setTaetigkeitModus] = useState<TaetigkeitModus>(
    noTaetigkeiten ? 'freitext' : 'liste'
  )
  const [taetigkeitId, setTaetigkeitId] = useState('')
  const [taetigkeitFreitext, setTaetigkeitFreitext] = useState('')
  const [kostenstelleId, setKostenstelleId] = useState('')
  const [dauerStunden, setDauerStunden] = useState('')
  const [notiz, setNotiz] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (open && editItem) {
      setDatum(editItem.datum)
      if (editItem.taetigkeit_id) {
        setTaetigkeitModus('liste')
        setTaetigkeitId(editItem.taetigkeit_id)
        setTaetigkeitFreitext('')
      } else {
        setTaetigkeitModus('freitext')
        setTaetigkeitId('')
        setTaetigkeitFreitext(editItem.taetigkeit_freitext ?? '')
      }
      setKostenstelleId(editItem.kostenstelle_id)
      setDauerStunden(String(editItem.dauer_stunden))
      setNotiz(editItem.notiz ?? '')
    } else if (open && !editItem) {
      setDatum(defaultDatum)
      setTaetigkeitModus(noTaetigkeiten ? 'freitext' : 'liste')
      setTaetigkeitId('')
      setTaetigkeitFreitext('')
      setKostenstelleId('')
      setDauerStunden('')
      setNotiz('')
    }
    setErrors({})
    setServerError(null)
  }, [open, editItem, defaultDatum, noTaetigkeiten])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!datum) {
      newErrors.datum = 'Datum ist erforderlich'
    }

    if (taetigkeitModus === 'liste') {
      if (!taetigkeitId) {
        newErrors.taetigkeit = 'Bitte eine Tätigkeit wählen'
      }
    } else {
      if (!taetigkeitFreitext.trim()) {
        newErrors.taetigkeit = 'Tätigkeit ist erforderlich'
      }
    }

    if (!kostenstelleId) {
      newErrors.kostenstelle = 'Bitte eine Kostenstelle wählen'
    }

    const dauer = parseFloat(dauerStunden)
    if (!dauerStunden || isNaN(dauer)) {
      newErrors.dauer = 'Dauer ist erforderlich'
    } else if (dauer <= 0) {
      newErrors.dauer = 'Dauer muss größer als 0 sein'
    } else if (dauer > 24) {
      newErrors.dauer = 'Maximale Dauer beträgt 24 Stunden'
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
        datum,
        taetigkeit_id: taetigkeitModus === 'liste' ? taetigkeitId : null,
        taetigkeit_freitext: taetigkeitModus === 'freitext' ? taetigkeitFreitext.trim() : null,
        kostenstelle_id: kostenstelleId,
        dauer_stunden: parseFloat(dauerStunden),
        notiz: notiz.trim() || null,
      }

      const url = isEdit ? `/api/zeiteintraege/${editItem!.id}` : '/api/zeiteintraege'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error || 'Fehler beim Speichern des Zeiteintrags')
        return
      }

      onOpenChange(false)
      toast.success(isEdit ? 'Zeiteintrag aktualisiert' : 'Zeiteintrag erfolgreich angelegt')
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
          <DialogTitle>{isEdit ? 'Zeiteintrag bearbeiten' : 'Neuer Zeiteintrag'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Bearbeiten Sie den Zeiteintrag.'
              : 'Erfassen Sie Ihre Arbeitszeit.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datum */}
          <div className="space-y-2">
            <Label htmlFor="ze-datum">Datum</Label>
            <Input
              id="ze-datum"
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
            {errors.datum && <p className="text-sm text-destructive">{errors.datum}</p>}
          </div>

          {/* Tätigkeit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tätigkeit</Label>
              {!noTaetigkeiten && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Aus Liste</span>
                  <Switch
                    checked={taetigkeitModus === 'freitext'}
                    onCheckedChange={(checked) => {
                      setTaetigkeitModus(checked ? 'freitext' : 'liste')
                      setTaetigkeitId('')
                      setTaetigkeitFreitext('')
                      setErrors((prev) => ({ ...prev, taetigkeit: '' }))
                    }}
                    aria-label="Einmalige Tätigkeit"
                  />
                  <span className="text-xs text-muted-foreground">Einmalig</span>
                </div>
              )}
            </div>

            {noTaetigkeiten && (
              <p className="text-xs text-muted-foreground">
                Keine Tätigkeiten in der Liste.{' '}
                <a href="/stammdaten" className="underline">
                  Tätigkeiten anlegen
                </a>
              </p>
            )}

            {taetigkeitModus === 'liste' && !noTaetigkeiten ? (
              <Select value={taetigkeitId} onValueChange={setTaetigkeitId}>
                <SelectTrigger id="ze-taetigkeit">
                  <SelectValue placeholder="Tätigkeit wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {taetigkeiten.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="ze-taetigkeit-freitext"
                placeholder="z. B. Baumschnitt Hauptstraße"
                value={taetigkeitFreitext}
                onChange={(e) => setTaetigkeitFreitext(e.target.value)}
                maxLength={200}
              />
            )}

            {errors.taetigkeit && (
              <p className="text-sm text-destructive">{errors.taetigkeit}</p>
            )}
          </div>

          {/* Kostenstelle */}
          <div className="space-y-2">
            <Label htmlFor="ze-kostenstelle">Kostenstelle</Label>
            {kostenstellen.length === 0 ? (
              <p className="text-sm text-destructive">
                Keine Kostenstellen vorhanden.{' '}
                <a href="/stammdaten" className="underline">
                  Kostenstellen anlegen
                </a>
              </p>
            ) : (
              <Select value={kostenstelleId} onValueChange={setKostenstelleId}>
                <SelectTrigger id="ze-kostenstelle">
                  <SelectValue placeholder="Kostenstelle wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {kostenstellen.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.kostenstelle && (
              <p className="text-sm text-destructive">{errors.kostenstelle}</p>
            )}
          </div>

          {/* Notiz */}
          <div className="space-y-2">
            <Label htmlFor="ze-notiz">Notiz <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="ze-notiz"
              placeholder="z. B. Baustelle Musterstraße"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {/* Dauer */}
          <div className="space-y-2">
            <Label htmlFor="ze-dauer">Dauer (Stunden)</Label>
            <Input
              id="ze-dauer"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              placeholder="z. B. 3.5"
              value={dauerStunden}
              onChange={(e) => setDauerStunden(e.target.value)}
              inputMode="decimal"
            />
            {errors.dauer && <p className="text-sm text-destructive">{errors.dauer}</p>}
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
            <Button type="submit" disabled={submitting || kostenstellen.length === 0}>
              {submitting ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
