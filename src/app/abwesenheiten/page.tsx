'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Lock } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AbwesenheitFormDialog } from '@/components/abwesenheiten/abwesenheit-form-dialog'
import { AbwesenheitLoeschenDialog } from '@/components/abwesenheiten/abwesenheit-loeschen-dialog'
import type { Abwesenheit } from '@/components/abwesenheiten/types'
import {
  berechneAnzahlTage,
  formatZeitraumDE,
  typLabel,
} from '@/components/abwesenheiten/types'
import type { Monatsabschluss } from '@/components/monatsabschluss/types'

/** Check if an absence overlaps with any closed month */
function istAbwesenheitGesperrt(
  abwesenheit: Abwesenheit,
  abschluesse: Monatsabschluss[],
): boolean {
  if (abschluesse.length === 0) return false
  const [startY, startM] = abwesenheit.startdatum.split('-').map(Number)
  const [endY, endM] = abwesenheit.enddatum.split('-').map(Number)

  let y = startY
  let m = startM
  while (y < endY || (y === endY && m <= endM)) {
    if (abschluesse.some((a) => a.jahr === y && a.monat === m)) return true
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }
  return false
}

export default function AbwesenheitenPage() {
  const [abwesenheiten, setAbwesenheiten] = useState<Abwesenheit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Abwesenheit | null>(null)

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Abwesenheit | null>(null)

  // Monatsabschluesse for write protection
  const [abschluesse, setAbschluesse] = useState<Monatsabschluss[]>([])

  const fetchAbwesenheiten = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [res, abschlussRes] = await Promise.all([
        fetch('/api/abwesenheiten'),
        fetch('/api/monatsabschluesse'),
      ])

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Laden der Abwesenheiten')
        return
      }
      const data = await res.json()
      setAbwesenheiten(Array.isArray(data) ? data : [])

      if (abschlussRes.ok) {
        const abschlussData = await abschlussRes.json()
        setAbschluesse(Array.isArray(abschlussData) ? abschlussData : [])
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAbwesenheiten()
  }, [fetchAbwesenheiten])

  function openCreate() {
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(item: Abwesenheit) {
    setEditItem(item)
    setFormOpen(true)
  }

  function openDelete(item: Abwesenheit) {
    setDeleteItem(item)
    setDeleteOpen(true)
  }

  // Year summary
  const currentYear = new Date().getFullYear()
  const thisYearEntries = abwesenheiten.filter((a) => {
    const year = parseInt(a.startdatum.split('-')[0], 10)
    return year === currentYear
  })

  const urlaubsTage = thisYearEntries
    .filter((a) => a.typ === 'urlaub')
    .reduce((sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum), 0)

  const krankheitsTage = thisYearEntries
    .filter((a) => a.typ === 'krankheit')
    .reduce((sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum), 0)

  return (
    <AppLayout>
      <div className="space-y-4 pb-24">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Abwesenheiten</h2>
          <p className="text-muted-foreground">Verwalten Sie Ihre Urlaubs- und Krankheitstage.</p>
        </div>

        {/* Year Summary */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Urlaubstage {currentYear}</p>
                <p className="text-2xl font-bold text-emerald-600">{urlaubsTage}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Krankheitstage {currentYear}</p>
                <p className="text-2xl font-bold text-red-500">{krankheitsTage}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))
          ) : abwesenheiten.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Noch keine Abwesenheiten"
              description="Sie haben noch keine Urlaubs- oder Krankheitstage eingetragen."
              actionLabel="Erste Abwesenheit eintragen"
              onAction={openCreate}
            />
          ) : (
            abwesenheiten.map((item) => {
              const tage = berechneAnzahlTage(item.startdatum, item.enddatum)
              const gesperrt = istAbwesenheitGesperrt(item, abschluesse)
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={
                              item.typ === 'urlaub'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            }
                          >
                            {typLabel(item.typ)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {tage} {tage === 1 ? 'Tag' : 'Tage'}
                          </span>
                          {gesperrt && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Gesperrt
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium">
                          {formatZeitraumDE(item.startdatum, item.enddatum)}
                        </p>
                        {item.notiz && (
                          <p className="mt-1 text-sm text-muted-foreground truncate">
                            {item.notiz}
                          </p>
                        )}
                      </div>
                      {!gesperrt && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => openEdit(item)}
                            aria-label="Bearbeiten"
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                            onClick={() => openDelete(item)}
                            aria-label="Löschen"
                          >
                            Löschen
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-24 right-4 sm:right-6 md:bottom-6">
        <Button
          size="lg"
          onClick={openCreate}
          className="shadow-lg rounded-full h-14 w-14 sm:w-auto sm:rounded-md sm:px-6"
          aria-label="Neue Abwesenheit"
        >
          <span className="text-xl sm:hidden">+</span>
          <span className="hidden sm:inline">+ Neue Abwesenheit</span>
        </Button>
      </div>

      {/* Form Dialog */}
      <AbwesenheitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchAbwesenheiten}
        editItem={editItem}
        existingAbwesenheiten={abwesenheiten}
      />

      {/* Delete Dialog */}
      <AbwesenheitLoeschenDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={fetchAbwesenheiten}
        itemId={deleteItem?.id ?? null}
        itemTyp={deleteItem?.typ ?? null}
      />
    </AppLayout>
  )
}
