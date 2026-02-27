'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wrench, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StammdatenFormDialog } from '@/components/stammdaten/stammdaten-form-dialog'
import { LoeschenDialog } from '@/components/stammdaten/loeschen-dialog'
import type { Taetigkeit, Kostenstelle } from '@/components/stammdaten/types'

export default function StammdatenPage() {
  const [isAdmin, setIsAdmin] = useState(false)

  // Tätigkeiten state
  const [taetigkeiten, setTaetigkeiten] = useState<Taetigkeit[]>([])
  const [loadingT, setLoadingT] = useState(true)
  const [errorT, setErrorT] = useState<string | null>(null)

  // Kostenstellen state
  const [kostenstellen, setKostenstellen] = useState<Kostenstelle[]>([])
  const [loadingK, setLoadingK] = useState(true)
  const [errorK, setErrorK] = useState<string | null>(null)

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formTyp, setFormTyp] = useState<'taetigkeit' | 'kostenstelle'>('taetigkeit')
  const [editItem, setEditItem] = useState<Taetigkeit | Kostenstelle | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTyp, setDeleteTyp] = useState<'taetigkeit' | 'kostenstelle'>('taetigkeit')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState<string | null>(null)

  const fetchTaetigkeiten = useCallback(async () => {
    setErrorT(null)
    try {
      const res = await fetch('/api/taetigkeiten')
      if (!res.ok) {
        const data = await res.json()
        setErrorT(data.error || 'Fehler beim Laden der Tätigkeiten')
        return
      }
      const data = await res.json()
      setTaetigkeiten(data)
    } catch {
      setErrorT('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoadingT(false)
    }
  }, [])

  const fetchKostenstellen = useCallback(async () => {
    setErrorK(null)
    try {
      const res = await fetch('/api/kostenstellen')
      if (!res.ok) {
        const data = await res.json()
        setErrorK(data.error || 'Fehler beim Laden der Kostenstellen')
        return
      }
      const data = await res.json()
      setKostenstellen(data)
    } catch {
      setErrorK('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoadingK(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.role === 'admin')
          })
      }
    })
    fetchTaetigkeiten()
    fetchKostenstellen()
  }, [fetchTaetigkeiten, fetchKostenstellen])

  function openCreate(typ: 'taetigkeit' | 'kostenstelle') {
    setFormTyp(typ)
    setEditItem(null)
    setFormOpen(true)
  }

  function openEdit(typ: 'taetigkeit' | 'kostenstelle', item: Taetigkeit | Kostenstelle) {
    setFormTyp(typ)
    setEditItem(item)
    setFormOpen(true)
  }

  function openDelete(typ: 'taetigkeit' | 'kostenstelle', id: string, name: string) {
    setDeleteTyp(typ)
    setDeleteId(id)
    setDeleteName(name)
    setDeleteOpen(true)
  }

  function handleFormSuccess() {
    if (formTyp === 'taetigkeit') fetchTaetigkeiten()
    else fetchKostenstellen()
  }

  function handleDeleteSuccess() {
    if (deleteTyp === 'taetigkeit') fetchTaetigkeiten()
    else fetchKostenstellen()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stammdaten</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Tätigkeiten und Kostenstellen.
          </p>
        </div>

        <Tabs defaultValue="taetigkeiten">
          <TabsList>
            <TabsTrigger value="taetigkeiten">Tätigkeiten</TabsTrigger>
            <TabsTrigger value="kostenstellen">Kostenstellen</TabsTrigger>
          </TabsList>

          {/* Tätigkeiten Tab */}
          <TabsContent value="taetigkeiten" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openCreate('taetigkeit')}>
                Neue Tätigkeit
              </Button>
            </div>

            {errorT && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{errorT}</p>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Beschreibung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingT ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : taetigkeiten.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <EmptyState
                          icon={Wrench}
                          title="Noch keine Tätigkeiten"
                          description="Legen Sie Tätigkeiten an, um Zeiteinträge darauf zu buchen."
                          actionLabel="Erste Tätigkeit anlegen"
                          onAction={() => openCreate('taetigkeit')}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    taetigkeiten.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {t.beschreibung || '–'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px]"
                              onClick={() => openEdit('taetigkeit', t)}
                            >
                              Bearbeiten
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] text-destructive hover:text-destructive"
                              onClick={() => openDelete('taetigkeit', t.id, t.name)}
                            >
                              Löschen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Kostenstellen Tab */}
          <TabsContent value="kostenstellen" className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => openCreate('kostenstelle')}>
                  Neue Kostenstelle
                </Button>
              </div>
            )}

            {errorK && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{errorK}</p>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Nummer / Code</TableHead>
                    {isAdmin && (
                      <TableHead className="text-right">Aktionen</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingK ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        {isAdmin && (
                          <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : kostenstellen.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 3 : 2}>
                        <EmptyState
                          icon={Building2}
                          title="Noch keine Kostenstellen"
                          description={isAdmin
                            ? "Legen Sie Kostenstellen an, um Zeiteinträge zuzuordnen."
                            : "Es wurden noch keine Kostenstellen vom Admin angelegt."
                          }
                          actionLabel={isAdmin ? "Erste Kostenstelle anlegen" : undefined}
                          onAction={isAdmin ? () => openCreate('kostenstelle') : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    kostenstellen.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium">{k.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {k.nummer || '–'}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px]"
                                onClick={() => openEdit('kostenstelle', k)}
                              >
                                Bearbeiten
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] text-destructive hover:text-destructive"
                                onClick={() => openDelete('kostenstelle', k.id, k.name)}
                              >
                                Löschen
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <StammdatenFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        typ={formTyp}
        editItem={editItem}
      />
      <LoeschenDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleDeleteSuccess}
        typ={deleteTyp}
        itemId={deleteId}
        itemName={deleteName}
      />
    </AppLayout>
  )
}
