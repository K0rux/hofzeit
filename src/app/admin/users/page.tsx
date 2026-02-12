'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Loader2, UserCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UsersTable } from '@/components/admin/UsersTable'
import { CreateUserDialog } from '@/components/admin/CreateUserDialog'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'employee'
  status: 'active' | 'inactive'
  vacationDays: number
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()

        // Check if user is admin
        if (data.user?.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Fetch users (only when authorized)
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers()
    }
  }, [isAuthorized])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Mitarbeiter')
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and search logic
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleUserCreated = () => {
    setIsCreateDialogOpen(false)
    fetchUsers()
  }

  const handleUserUpdated = () => {
    fetchUsers()
  }

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Admin-Portal
        </Button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mitarbeiter-Verwaltung</h1>
            <p className="text-muted-foreground mt-1">
              Verwalte Mitarbeiter-Accounts, Rollen und Berechtigungen
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Mitarbeiter
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Suchen und Filtern</CardTitle>
            <CardDescription>Finde schnell den gewünschten Mitarbeiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Field */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name oder E-Mail suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={(value: typeof roleFilter) => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Rollen</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredUsers.length} von {users.length} Mitarbeiter{filteredUsers.length !== 1 ? 'n' : ''}
            </div>
          </CardContent>
        </Card>

        {/* Users Table/List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <UserCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {users.length === 0 ? 'Noch keine Mitarbeiter' : 'Keine Ergebnisse gefunden'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {users.length === 0
                  ? 'Lege den ersten Mitarbeiter an, um zu beginnen.'
                  : 'Versuche einen anderen Suchbegriff oder Filter.'}
              </p>
              {users.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Mitarbeiter anlegen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <UsersTable users={filteredUsers} onUserUpdated={handleUserUpdated} />
        )}

        {/* Create User Dialog */}
        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onUserCreated={handleUserCreated}
        />
      </div>
    </div>
  )
}
