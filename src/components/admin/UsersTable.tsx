'use client'

import { useState } from 'react'
import { Edit, UserX, UserCheck, Mail, Calendar } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { EditUserDialog } from './EditUserDialog'
import { ConfirmDeactivateDialog } from './ConfirmDeactivateDialog'
import { toast } from 'sonner'
import type { User } from '@/app/admin/users/page'

type UsersTableProps = {
  users: User[]
  onUserUpdated: () => void
}

export function UsersTable({ users, onUserUpdated }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null)

  const handleToggleStatus = async (user: User) => {
    if (user.status === 'active') {
      // Show confirmation dialog for deactivation
      setDeactivatingUser(user)
    } else {
      // Directly activate
      await toggleUserStatus(user)
    }
  }

  const toggleUserStatus = async (user: User) => {
    setIsTogglingStatus(user.id)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Status-Wechsel')
      }

      toast.success(
        user.status === 'active'
          ? `${user.firstName} ${user.lastName} wurde deaktiviert`
          : `${user.firstName} ${user.lastName} wurde aktiviert`
      )
      onUserUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Status-Wechsel')
    } finally {
      setIsTogglingStatus(null)
      setDeactivatingUser(null)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urlaubstage</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    {/* User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Mitarbeiter'}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status === 'active' ? 'Aktiv' : 'Deaktiviert'}
                      </Badge>
                    </TableCell>

                    {/* Vacation Days */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {user.vacationDays} Tage
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isTogglingStatus === user.id}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deaktivieren
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Aktivieren
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 space-y-4">
              {/* User Header */}
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Rolle</p>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Mitarbeiter'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                    {user.status === 'active' ? 'Aktiv' : 'Deaktiviert'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Urlaubstage</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {user.vacationDays} Tage
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingUser(user)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant={user.status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleStatus(user)}
                  disabled={isTogglingStatus === user.id}
                >
                  {user.status === 'active' ? (
                    <>
                      <UserX className="h-4 w-4 mr-1" />
                      Deaktivieren
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Aktivieren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={() => {
            setEditingUser(null)
            onUserUpdated()
          }}
        />
      )}

      {/* Deactivate Confirmation Dialog */}
      {deactivatingUser && (
        <ConfirmDeactivateDialog
          user={deactivatingUser}
          open={!!deactivatingUser}
          onOpenChange={(open) => !open && setDeactivatingUser(null)}
          onConfirm={() => toggleUserStatus(deactivatingUser)}
        />
      )}
    </>
  )
}
