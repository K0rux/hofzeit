'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { generatePdf } from '@/app/export/pdf-generator'
import type { UserProfile } from './types'

const MONATE = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'März' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Dezember' },
]

function getJahreOptionen(): string[] {
  const currentYear = new Date().getFullYear()
  return [String(currentYear - 1), String(currentYear), String(currentYear + 1)]
}

interface BerichtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
}

export function BerichtDialog({ open, onOpenChange, user }: BerichtDialogProps) {
  const now = new Date()
  const [monat, setMonat] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [jahr, setJahr] = useState(String(now.getFullYear()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const jahreOptionen = getJahreOptionen()

  useEffect(() => {
    if (open) setError(null)
  }, [open, user])

  async function handleDownload() {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/admin/berichte/${user.id}?monat=${parseInt(monat)}&jahr=${jahr}`
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Laden der Berichtsdaten')
        return
      }

      const data = await res.json()

      if (data.eintraege.length === 0 && data.abwesenheiten.length === 0) {
        setError('Keine Einträge für diesen Zeitraum vorhanden.')
        return
      }

      const monatLabel = MONATE.find((m) => m.value === monat)?.label ?? monat
      const zeitraum = `${monatLabel} ${jahr}`
      const nachname = user.last_name.toLowerCase()
      const filename = `hofzeit-export-${nachname}-${jahr}-${monat}.pdf`

      await generatePdf({
        userName: data.userName,
        zeitraum,
        monat,
        jahr,
        eintraege: data.eintraege,
        abwesenheiten: data.abwesenheiten,
        filename,
      })

      onOpenChange(false)
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  // Check if selected month is current month
  const isCurrentMonth =
    parseInt(monat) === now.getMonth() + 1 && parseInt(jahr) === now.getFullYear()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bericht herunterladen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Mitarbeiter</p>
            <p className="font-medium">
              {user ? `${user.first_name} ${user.last_name}` : ''}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Select value={monat} onValueChange={setMonat}>
                <SelectTrigger>
                  <SelectValue placeholder="Monat" />
                </SelectTrigger>
                <SelectContent>
                  {MONATE.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Select value={jahr} onValueChange={setJahr}>
                <SelectTrigger>
                  <SelectValue placeholder="Jahr" />
                </SelectTrigger>
                <SelectContent>
                  {jahreOptionen.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCurrentMonth && (
            <Alert>
              <AlertDescription>
                Monat noch offen – Daten können sich noch ändern.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? 'PDF wird erstellt...' : 'PDF herunterladen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
