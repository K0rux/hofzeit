'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase'
import type { Zeiteintrag } from '@/components/zeiterfassung/types'
import type { Abwesenheit } from '@/components/abwesenheiten/types'
import { berechneAnzahlTage } from '@/components/abwesenheiten/types'
import { generatePdf } from './pdf-generator'

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
  const years: string[] = []
  for (let y = currentYear; y >= currentYear - 2; y--) {
    years.push(String(y))
  }
  return years
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function formatDauerDE(dauer: number): string {
  return (
    dauer.toLocaleString('de-DE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }) + ' Std.'
  )
}

export default function ExportPage() {
  const now = new Date()
  const [monat, setMonat] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [jahr, setJahr] = useState(String(now.getFullYear()))

  const [eintraege, setEintraege] = useState<Zeiteintrag[]>([])
  const [abwesenheiten, setAbwesenheiten] = useState<Abwesenheit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [userName, setUserName] = useState<string>('')

  // Fetch user name on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const fullName = [data?.first_name, data?.last_name].filter(Boolean).join(' ')
            setUserName(fullName || user.email || '')
          })
      }
    })
  }, [])

  const fetchData = useCallback(async (m: string, y: string) => {
    setLoading(true)
    setError(null)

    const yearNum = parseInt(y)
    const monthNum = parseInt(m)
    const lastDay = getLastDayOfMonth(yearNum, monthNum)
    const von = `${y}-${m}-01`
    const bis = `${y}-${m}-${String(lastDay).padStart(2, '0')}`

    try {
      const [zeitRes, abwRes] = await Promise.all([
        fetch(`/api/zeiteintraege?von=${von}&bis=${bis}`),
        fetch(`/api/abwesenheiten?von=${von}&bis=${bis}`),
      ])

      if (!zeitRes.ok) {
        const data = await zeitRes.json()
        setError(data.error || 'Fehler beim Laden der Zeiteinträge')
        return
      }

      const zeitData = await zeitRes.json()
      setEintraege(Array.isArray(zeitData) ? zeitData : [])

      if (abwRes.ok) {
        const abwData = await abwRes.json()
        setAbwesenheiten(Array.isArray(abwData) ? abwData : [])
      } else {
        setAbwesenheiten([])
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(monat, jahr)
  }, [monat, jahr, fetchData])

  // Computed stats
  const gesamtStunden = eintraege.reduce((sum, e) => sum + e.dauer_stunden, 0)
  const urlaubAbwesenheiten = abwesenheiten.filter((a) => a.typ === 'urlaub')
  const krankheitAbwesenheiten = abwesenheiten.filter((a) => a.typ === 'krankheit')
  const urlaubTage = urlaubAbwesenheiten.reduce(
    (sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum),
    0
  )
  const krankheitTage = krankheitAbwesenheiten.reduce(
    (sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum),
    0
  )

  const hasData = eintraege.length > 0 || abwesenheiten.length > 0

  async function handleExport() {
    setExporting(true)
    try {
      const monatLabel = MONATE.find((m) => m.value === monat)?.label ?? monat
      const zeitraum = `${monatLabel} ${jahr}`

      // Extract last name for filename
      const nameParts = userName.trim().split(/\s+/)
      const nachname = nameParts[nameParts.length - 1] || 'export'
      const filename = `hofzeit-export-${nachname.toLowerCase()}-${jahr}-${monat}.pdf`

      await generatePdf({
        userName,
        zeitraum,
        monat,
        jahr,
        eintraege,
        abwesenheiten,
        filename,
      })
    } catch {
      setError('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.')
    } finally {
      setExporting(false)
    }
  }

  const jahreOptionen = getJahreOptionen()

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">PDF-Export</h2>
          <p className="text-muted-foreground">
            Exportieren Sie Ihre Zeiterfassung als PDF-Dokument.
          </p>
        </div>

        {/* Zeitraum-Auswahl */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zeitraum auswählen</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vorschau-Karte */}
        {!loading && hasData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Zeiteinträge</p>
                  <p className="text-lg font-semibold">{eintraege.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gesamtstunden</p>
                  <p className="text-lg font-semibold">{formatDauerDE(gesamtStunden)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Urlaubstage</p>
                  <p className="text-lg font-semibold">{urlaubTage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Krankheitstage</p>
                  <p className="text-lg font-semibold">{krankheitTage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leer-Zustand */}
        {!loading && !hasData && (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Keine Einträge für diesen Zeitraum vorhanden.
            </p>
          </div>
        )}

        {/* Export Button */}
        {!loading && hasData && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'PDF wird erstellt...' : 'PDF herunterladen'}
          </Button>
        )}
      </div>
    </AppLayout>
  )
}
