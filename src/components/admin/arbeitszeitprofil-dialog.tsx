'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UserProfile } from './types'

const WOCHENTAGE = [
  { value: 'Mo', label: 'Mo' },
  { value: 'Di', label: 'Di' },
  { value: 'Mi', label: 'Mi' },
  { value: 'Do', label: 'Do' },
  { value: 'Fr', label: 'Fr' },
  { value: 'Sa', label: 'Sa' },
  { value: 'So', label: 'So' },
] as const

interface ArbeitszeitprofilDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
}

export function ArbeitszeitprofilDialog({
  open,
  onOpenChange,
  user,
}: ArbeitszeitprofilDialogProps) {
  const [urlaubstageJahr, setUrlaubstageJahr] = useState('')
  const [arbeitstage, setArbeitstage] = useState<string[]>([])
  const [wochenstunden, setWochenstunden] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (!open || !user) return

    async function loadProfile() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/arbeitszeitprofile/${user!.id}`)
        if (!res.ok) {
          setError('Fehler beim Laden des Profils')
          return
        }
        const data = await res.json()
        if (data) {
          setUrlaubstageJahr(String(data.urlaubstage_jahr))
          setArbeitstage(data.arbeitstage ?? [])
          setWochenstunden(String(data.wochenstunden))
          setHasProfile(true)
        } else {
          // No profile yet – set defaults
          setUrlaubstageJahr('')
          setArbeitstage(['Mo', 'Di', 'Mi', 'Do', 'Fr'])
          setWochenstunden('')
          setHasProfile(false)
        }
      } catch {
        setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [open, user])

  function resetForm() {
    setUrlaubstageJahr('')
    setArbeitstage([])
    setWochenstunden('')
    setError(null)
    setHasProfile(false)
  }

  function toggleDay(day: string) {
    setArbeitstage((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!user) return

    const urlaubstage = parseInt(urlaubstageJahr, 10)
    if (isNaN(urlaubstage) || urlaubstage < 0) {
      setError('Bitte geben Sie eine gültige Anzahl Urlaubstage ein')
      return
    }

    if (arbeitstage.length === 0) {
      setError('Bitte wählen Sie mindestens einen Arbeitstag')
      return
    }

    const stunden = parseFloat(wochenstunden.replace(',', '.'))
    if (isNaN(stunden) || stunden <= 0) {
      setError('Bitte geben Sie gültige Wochenstunden ein')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/arbeitszeitprofile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlaubstage_jahr: urlaubstage,
          arbeitstage,
          wochenstunden: stunden,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Speichern')
        return
      }

      resetForm()
      onOpenChange(false)
      toast.success('Arbeitszeitprofil gespeichert')
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
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
          <DialogTitle>Arbeitszeitprofil</DialogTitle>
          <DialogDescription>
            Profil für {user?.first_name} {user?.last_name}
            {!loading && !hasProfile && (
              <span className="block mt-1 text-amber-600">
                Kein Profil vorhanden – wird neu angelegt.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Profil wird geladen...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urlaubstage">Urlaubstage / Jahr</Label>
              <Input
                id="urlaubstage"
                type="number"
                min="0"
                max="365"
                step="1"
                placeholder="z.B. 30"
                value={urlaubstageJahr}
                onChange={(e) => setUrlaubstageJahr(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Arbeitstage</Label>
              <div className="flex flex-wrap gap-3">
                {WOCHENTAGE.map((tag) => (
                  <label
                    key={tag.value}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Checkbox
                      checked={arbeitstage.includes(tag.value)}
                      onCheckedChange={() => toggleDay(tag.value)}
                    />
                    <span className="text-sm">{tag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wochenstunden">Wochenstunden</Label>
              <Input
                id="wochenstunden"
                type="text"
                inputMode="decimal"
                placeholder="z.B. 40,0"
                value={wochenstunden}
                onChange={(e) => setWochenstunden(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
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
        )}
      </DialogContent>
    </Dialog>
  )
}
