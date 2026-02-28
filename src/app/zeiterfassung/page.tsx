'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Clock, Lock, AlertCircle } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Tagesnavigation } from '@/components/zeiterfassung/tagesnavigation'
import { ZeiteintragKarte } from '@/components/zeiterfassung/zeiteintrag-karte'
import { ZeiteintragFormDialog } from '@/components/zeiterfassung/zeiteintrag-form-dialog'
import { ZeiteintragLoeschenDialog } from '@/components/zeiterfassung/loeschen-dialog'
import { AbwesenheitBanner } from '@/components/abwesenheiten/abwesenheit-banner'
import { MonatsabschlussDialog } from '@/components/monatsabschluss/monatsabschluss-dialog'
import type { Abwesenheit } from '@/components/abwesenheiten/types'
import type { Zeiteintrag, TaetigkeitOption, KostenstelleOption } from '@/components/zeiterfassung/types'
import { getTodayStr, formatDauerDE } from '@/components/zeiterfassung/types'
import type { Monatsabschluss } from '@/components/monatsabschluss/types'
import {
  istMonatAbgeschlossen,
  istVergangenerMonat,
  getMonatFromDatum,
  monatLabel,
} from '@/components/monatsabschluss/types'

export default function ZeiterfassungPage() {
  const [datum, setDatum] = useState<string>(getTodayStr())

  // Time entries
  const [eintraege, setEintraege] = useState<Zeiteintrag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Master data
  const [taetigkeiten, setTaetigkeiten] = useState<TaetigkeitOption[]>([])
  const [kostenstellen, setKostenstellen] = useState<KostenstelleOption[]>([])
  const [masterDataLoaded, setMasterDataLoaded] = useState(false)

  // Form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Zeiteintrag | null>(null)

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Zeiteintrag | null>(null)

  // Absences for current day
  const [tagesAbwesenheiten, setTagesAbwesenheiten] = useState<Abwesenheit[]>([])

  // Arbeitszeitprofil for Stunden-Dot
  const [tagessollStunden, setTagessollStunden] = useState<number | null>(null)
  const [arbeitstageProfile, setArbeitstageProfile] = useState<string[]>([])

  // Monatsabschluss
  const [abschluesse, setAbschluesse] = useState<Monatsabschluss[]>([])
  const [abschlussDialogOpen, setAbschlussDialogOpen] = useState(false)
  const [monatsSummary, setMonatsSummary] = useState<{
    gesamtStunden: number
    anzahlEintraege: number
    anzahlAbwesenheiten: number
  } | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Fetch taetigkeiten + kostenstellen + arbeitszeitprofil + abschluesse once
  useEffect(() => {
    async function fetchMasterData() {
      const [tRes, kRes, profilRes, abschlussRes] = await Promise.all([
        fetch('/api/taetigkeiten'),
        fetch('/api/kostenstellen'),
        fetch('/api/arbeitszeitprofile/me'),
        fetch('/api/monatsabschluesse'),
      ])
      const [tData, kData] = await Promise.all([tRes.json(), kRes.json()])
      setTaetigkeiten(Array.isArray(tData) ? tData : [])
      setKostenstellen(Array.isArray(kData) ? kData : [])
      setMasterDataLoaded(true)

      if (profilRes.ok) {
        const profil = await profilRes.json()
        if (profil && Array.isArray(profil.arbeitstage) && profil.wochenstunden > 0) {
          const tageProWoche = profil.arbeitstage.length
          setTagessollStunden(tageProWoche > 0 ? profil.wochenstunden / tageProWoche : null)
          setArbeitstageProfile(profil.arbeitstage)
        }
      }

      if (abschlussRes.ok) {
        const abschlussData = await abschlussRes.json()
        setAbschluesse(Array.isArray(abschlussData) ? abschlussData : [])
      }
    }
    fetchMasterData()
  }, [])

  const fetchEintraege = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)
    try {
      const [zeitRes, abwRes] = await Promise.all([
        fetch(`/api/zeiteintraege?date=${date}`),
        fetch(`/api/abwesenheiten?datum=${date}`),
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
        setTagesAbwesenheiten(Array.isArray(abwData) ? abwData : [])
      } else {
        setTagesAbwesenheiten([])
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEintraege(datum)
  }, [datum, fetchEintraege])

  // Refresh abschluesse after closing a month
  const refreshAbschluesse = useCallback(async () => {
    const res = await fetch('/api/monatsabschluesse')
    if (res.ok) {
      const data = await res.json()
      setAbschluesse(Array.isArray(data) ? data : [])
    }
  }, [])

  function handleDatumChange(newDatum: string) {
    setDatum(newDatum)
  }

  function openCreate() {
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(eintrag: Zeiteintrag) {
    setEditItem(eintrag)
    setFormOpen(true)
  }

  function openDelete(eintrag: Zeiteintrag) {
    setDeleteItem(eintrag)
    setDeleteOpen(true)
  }

  // Monatsabschluss: derive month status from datum
  const { jahr, monat } = getMonatFromDatum(datum)
  const monatGeschlossen = istMonatAbgeschlossen(abschluesse, jahr, monat)
  const vergangenerMonat = istVergangenerMonat(jahr, monat)
  const kannAbschliessen = vergangenerMonat && !monatGeschlossen

  // Compute open past months of the current year (shown as persistent reminder)
  const offeneMonate: Array<{ jahr: number; monat: number }> = (() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const result = []
    for (let m = 1; m < currentMonth; m++) {
      if (!istMonatAbgeschlossen(abschluesse, currentYear, m)) {
        result.push({ jahr: currentYear, monat: m })
      }
    }
    return result
  })()

  async function handleMonatAbschliessen() {
    setSummaryLoading(true)
    // Fetch monthly entries + absences for summary
    const lastDay = new Date(jahr, monat, 0).getDate()
    const von = `${jahr}-${String(monat).padStart(2, '0')}-01`
    const bis = `${jahr}-${String(monat).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    try {
      const [zeitRes, abwRes] = await Promise.all([
        fetch(`/api/zeiteintraege?von=${von}&bis=${bis}`),
        fetch(`/api/abwesenheiten?von=${von}&bis=${bis}`),
      ])

      let totalStunden = 0
      let totalEintraege = 0
      if (zeitRes.ok) {
        const zeitData = await zeitRes.json()
        const entries = Array.isArray(zeitData) ? zeitData : []
        totalEintraege = entries.length
        totalStunden = entries.reduce(
          (sum: number, e: { dauer_stunden: number }) => sum + e.dauer_stunden,
          0,
        )
      }

      let totalAbwesenheiten = 0
      if (abwRes.ok) {
        const abwData = await abwRes.json()
        totalAbwesenheiten = Array.isArray(abwData) ? abwData.length : 0
      }

      setMonatsSummary({
        gesamtStunden: totalStunden,
        anzahlEintraege: totalEintraege,
        anzahlAbwesenheiten: totalAbwesenheiten,
      })
      setAbschlussDialogOpen(true)
    } catch {
      // silently fail, user can retry
    } finally {
      setSummaryLoading(false)
    }
  }

  const gesamtStunden = eintraege.reduce((sum, e) => sum + e.dauer_stunden, 0)

  const noKostenstellen = masterDataLoaded && kostenstellen.length === 0

  // Determine Stunden-Dot status for the current day
  const DAY_MAP: Record<string, number> = { Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6, So: 0 }
  function getStundenStatus(): 'erreicht' | 'teilweise' | null {
    if (tagessollStunden === null || eintraege.length === 0) return null
    // No dot on non-working days (spec: "Der Tag wird nicht als Soll-Tag gewertet")
    if (arbeitstageProfile.length > 0) {
      const wochentag = new Date(datum + 'T12:00:00').getDay()
      const arbeitstageNummern = new Set(arbeitstageProfile.map((d) => DAY_MAP[d]).filter((n) => n !== undefined))
      if (!arbeitstageNummern.has(wochentag)) return null
    }
    return gesamtStunden >= tagessollStunden ? 'erreicht' : 'teilweise'
  }

  return (
    <AppLayout>
      <div className="space-y-4 pb-24">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Zeiterfassung</h2>
          <p className="text-muted-foreground">Erfassen Sie Ihre täglichen Arbeitszeiten.</p>
        </div>

        {/* Tagesnavigation */}
        <Tagesnavigation
          datum={datum}
          onDatumChange={handleDatumChange}
          abwesenheitTyp={tagesAbwesenheiten[0]?.typ ?? null}
          stundenStatus={loading ? null : getStundenStatus()}
        />

        {/* Offene Monate Hinweis */}
        {offeneMonate.length > 0 && (
          <div className="flex items-start gap-3 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <span className="font-medium">Noch nicht abgeschlossen: </span>
              {offeneMonate.map(({ jahr: j, monat: m }, i) => (
                <span key={`${j}-${m}`}>
                  {i > 0 && ', '}
                  <button
                    className="underline underline-offset-2 hover:no-underline"
                    onClick={() => setDatum(`${j}-${String(m).padStart(2, '0')}-01`)}
                  >
                    {monatLabel(m)}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Monats-Header: Status + Abschluss-Button */}
        {vergangenerMonat && (
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {monatLabel(monat)} {jahr}
              </span>
              {monatGeschlossen ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Abgeschlossen
                </Badge>
              ) : (
                <Badge variant="destructive">Offen</Badge>
              )}
            </div>
            {kannAbschliessen && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMonatAbschliessen}
                disabled={summaryLoading}
              >
                {summaryLoading ? 'Lädt...' : 'Monat abschließen'}
              </Button>
            )}
          </div>
        )}

        {/* Abwesenheits-Banner */}
        <AbwesenheitBanner abwesenheiten={tagesAbwesenheiten} />

        {/* Error loading entries */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* No kostenstellen warning */}
        {noKostenstellen && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              Bitte zuerst{' '}
              <Link href="/stammdaten" className="font-medium underline">
                Kostenstellen anlegen
              </Link>
              {' '}bevor Sie Zeiteinträge erfassen können.
            </p>
          </div>
        )}

        {/* Daily total */}
        {!loading && eintraege.length > 0 && (
          <div className="rounded-md bg-muted px-4 py-3">
            <p className="text-sm font-medium">
              Gesamtarbeitszeit: <span className="text-foreground">{formatDauerDE(gesamtStunden)}</span>
            </p>
          </div>
        )}

        {/* Entry list */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))
          ) : eintraege.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Noch keine Einträge"
              description="Für diesen Tag wurden noch keine Arbeitszeiten erfasst."
              actionLabel={noKostenstellen || monatGeschlossen ? undefined : 'Ersten Eintrag anlegen'}
              onAction={noKostenstellen || monatGeschlossen ? undefined : openCreate}
            />
          ) : (
            eintraege.map((eintrag) => (
              <ZeiteintragKarte
                key={eintrag.id}
                eintrag={eintrag}
                onEdit={openEdit}
                onDelete={openDelete}
                readonly={monatGeschlossen}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating action button (fixed bottom on mobile) - hidden when month is closed */}
      {!noKostenstellen && !monatGeschlossen && (
        <div className="fixed bottom-24 right-4 sm:right-6 md:bottom-6">
          <Button
            size="lg"
            onClick={openCreate}
            className="shadow-lg rounded-full h-14 w-14 sm:w-auto sm:rounded-md sm:px-6"
            aria-label="Neuer Zeiteintrag"
          >
            <span className="text-xl sm:hidden">+</span>
            <span className="hidden sm:inline">+ Neuer Zeiteintrag</span>
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <ZeiteintragFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => fetchEintraege(datum)}
        editItem={editItem}
        defaultDatum={datum}
        taetigkeiten={taetigkeiten}
        kostenstellen={kostenstellen}
      />

      {/* Delete Dialog */}
      <ZeiteintragLoeschenDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => fetchEintraege(datum)}
        itemId={deleteItem?.id ?? null}
        taetigkeitLabel={
          deleteItem
            ? (deleteItem.taetigkeit_name ?? deleteItem.taetigkeit_freitext ?? 'Zeiteintrag')
            : null
        }
      />

      {/* Monatsabschluss Dialog */}
      {monatsSummary && (
        <MonatsabschlussDialog
          open={abschlussDialogOpen}
          onOpenChange={setAbschlussDialogOpen}
          jahr={jahr}
          monat={monat}
          gesamtStunden={monatsSummary.gesamtStunden}
          anzahlEintraege={monatsSummary.anzahlEintraege}
          anzahlAbwesenheiten={monatsSummary.anzahlAbwesenheiten}
          onSuccess={refreshAbschluesse}
        />
      )}
    </AppLayout>
  )
}
