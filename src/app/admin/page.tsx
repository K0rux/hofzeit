'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/components/admin/types'
import { NeuerBenutzerDialog } from '@/components/admin/neuer-benutzer-dialog'
import { PasswortResetDialog } from '@/components/admin/passwort-reset-dialog'
import { RolleAendernDialog } from '@/components/admin/rolle-aendern-dialog'
import { DeaktivierenDialog } from '@/components/admin/deaktivieren-dialog'
import { AktivierenDialog } from '@/components/admin/aktivieren-dialog'
import { BerichtDialog } from '@/components/admin/bericht-dialog'
import { ArbeitszeitprofilDialog } from '@/components/admin/arbeitszeitprofil-dialog'
import { ProfilBearbeitenDialog } from '@/components/admin/profil-bearbeiten-dialog'
import { MonatsabschlussPanel } from '@/components/admin/monatsabschluss-panel'

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Dialog state
  const [showNewUser, setShowNewUser] = useState(false)
  const [passwordResetUser, setPasswordResetUser] = useState<UserProfile | null>(null)
  const [roleChangeUser, setRoleChangeUser] = useState<UserProfile | null>(null)
  const [deactivateUser, setDeactivateUser] = useState<UserProfile | null>(null)
  const [activateUser, setActivateUser] = useState<UserProfile | null>(null)
  const [berichtUser, setBerichtUser] = useState<UserProfile | null>(null)
  const [profilUser, setProfilUser] = useState<UserProfile | null>(null)
  const [editProfileUser, setEditProfileUser] = useState<UserProfile | null>(null)

  const fetchUsers = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Laden der Benutzer')
        return
      }
      const data = await res.json()
      setUsers(data.users)
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
    fetchUsers()
  }, [fetchUsers])

  function handleSuccess() {
    fetchUsers()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Administration
          </h2>
          <p className="text-muted-foreground">
            Verwalten Sie Benutzer und Monatsabschlüsse.
          </p>
        </div>

        <Tabs defaultValue="benutzer">
          <TabsList>
            <TabsTrigger value="benutzer">Benutzerverwaltung</TabsTrigger>
            <TabsTrigger value="monatsabschluesse">Monatsabschlüsse</TabsTrigger>
          </TabsList>

          {/* Tab: Benutzerverwaltung */}
          <TabsContent value="benutzer" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowNewUser(true)}>
                Neuer Benutzer
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={Users}
                          title="Keine Benutzer vorhanden"
                          description="Legen Sie über 'Neuer Benutzer' die ersten Konten an."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Admin' : 'Mitarbeiter'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'outline' : 'destructive'}>
                            {user.is_active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                ···
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setPasswordResetUser(user)}
                              >
                                Passwort zurücksetzen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setBerichtUser(user)}
                              >
                                Bericht herunterladen
                              </DropdownMenuItem>
                              {user.role === 'employee' && (
                                <DropdownMenuItem
                                  onClick={() => setProfilUser(user)}
                                >
                                  Arbeitszeitprofil
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setEditProfileUser(user)}
                              >
                                Profil bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRoleChangeUser(user)}
                                disabled={user.id === currentUserId}
                              >
                                Rolle ändern
                              </DropdownMenuItem>
                              {user.is_active ? (
                                <DropdownMenuItem
                                  onClick={() => setDeactivateUser(user)}
                                  disabled={user.id === currentUserId}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Deaktivieren
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setActivateUser(user)}
                                >
                                  Reaktivieren
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab: Monatsabschlüsse */}
          <TabsContent value="monatsabschluesse">
            <MonatsabschlussPanel users={users} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <NeuerBenutzerDialog
        open={showNewUser}
        onOpenChange={setShowNewUser}
        onSuccess={handleSuccess}
      />
      <PasswortResetDialog
        open={!!passwordResetUser}
        onOpenChange={(open) => !open && setPasswordResetUser(null)}
        user={passwordResetUser}
        onSuccess={handleSuccess}
      />
      <RolleAendernDialog
        open={!!roleChangeUser}
        onOpenChange={(open) => !open && setRoleChangeUser(null)}
        user={roleChangeUser}
        currentUserId={currentUserId}
        onSuccess={handleSuccess}
      />
      <DeaktivierenDialog
        open={!!deactivateUser}
        onOpenChange={(open) => !open && setDeactivateUser(null)}
        user={deactivateUser}
        currentUserId={currentUserId}
        onSuccess={handleSuccess}
      />
      <AktivierenDialog
        open={!!activateUser}
        onOpenChange={(open) => !open && setActivateUser(null)}
        user={activateUser}
        onSuccess={handleSuccess}
      />
      <BerichtDialog
        open={!!berichtUser}
        onOpenChange={(open) => !open && setBerichtUser(null)}
        user={berichtUser}
      />
      <ArbeitszeitprofilDialog
        open={!!profilUser}
        onOpenChange={(open) => !open && setProfilUser(null)}
        user={profilUser}
      />
      <ProfilBearbeitenDialog
        open={!!editProfileUser}
        onOpenChange={(open) => !open && setEditProfileUser(null)}
        user={editProfileUser}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  )
}
