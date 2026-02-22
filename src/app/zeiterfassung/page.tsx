'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tagesnavigation } from '@/components/zeiterfassung/tagesnavigation'
import { ZeiteintragKarte } from '@/components/zeiterfassung/zeiteintrag-karte'
import { ZeiteintragFormDialog } from '@/components/zeiterfassung/zeiteintrag-form-dialog'
import { ZeiteintragLoeschenDialog } from '@/components/zeiterfassung/loeschen-dialog'
import { AbwesenheitBanner } from '@/components/abwesenheiten/abwesenheit-banner'
import type { Abwesenheit } from '@/components/abwesenheiten/types'
import type { Zeiteintrag, TaetigkeitOption, KostenstelleOption } from '@/components/zeiterfassung/types'
import { getTodayStr, formatDauerDE } from '@/components/zeiterfassung/types'

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

  // Fetch taetigkeiten + kostenstellen once
  useEffect(() => {
    async function fetchMasterData() {
      const [tRes, kRes] = await Promise.all([
        fetch('/api/taetigkeiten'),
        fetch('/api/kostenstellen'),
      ])
      const [tData, kData] = await Promise.all([tRes.json(), kRes.json()])
      setTaetigkeiten(Array.isArray(tData) ? tData : [])
      setKostenstellen(Array.isArray(kData) ? kData : [])
      setMasterDataLoaded(true)
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

  const gesamtStunden = eintraege.reduce((sum, e) => sum + e.dauer_stunden, 0)

  const noKostenstellen = masterDataLoaded && kostenstellen.length === 0

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
        />

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
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-muted-foreground">Noch keine Einträge für diesen Tag.</p>
              {!noKostenstellen && (
                <Button variant="outline" className="mt-3" onClick={openCreate}>
                  Ersten Eintrag anlegen
                </Button>
              )}
            </div>
          ) : (
            eintraege.map((eintrag) => (
              <ZeiteintragKarte
                key={eintrag.id}
                eintrag={eintrag}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating action button (fixed bottom on mobile) */}
      {!noKostenstellen && (
        <div className="fixed bottom-6 right-4 sm:right-6">
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
    </AppLayout>
  )
}
