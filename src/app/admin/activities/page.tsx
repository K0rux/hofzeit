'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Loader2, Briefcase, ArrowLeft } from 'lucide-react'
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
import { ActivitiesTable } from '@/components/admin/ActivitiesTable'
import { CreateActivityDialog } from '@/components/admin/CreateActivityDialog'

export type Activity = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  usageCount: number
}

export default function AdminActivitiesPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'usageCount'>('createdAt')
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

  // Fetch activities (only when authorized)
  useEffect(() => {
    if (isAuthorized) {
      fetchActivities()
    }
  }, [isAuthorized])

  const fetchActivities = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/activities')
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Tätigkeiten')
      }
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter, search and sort logic
  useEffect(() => {
    let filtered = activities

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((activity) =>
        activity.name.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usageCount':
          return b.usageCount - a.usageCount
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredActivities(filtered)
  }, [activities, searchQuery, sortBy])

  const handleActivityCreated = () => {
    setIsCreateDialogOpen(false)
    fetchActivities()
  }

  const handleActivityUpdated = () => {
    fetchActivities()
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
            <h1 className="text-3xl font-bold text-foreground">Tätigkeiten-Verwaltung</h1>
            <p className="text-muted-foreground mt-1">
              Verwalte Tätigkeiten für die Zeiterfassung
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Neue Tätigkeit
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Sort Section */}
        <Card>
          <CardHeader>
            <CardTitle>Suchen und Sortieren</CardTitle>
            <CardDescription>Finde schnell die gewünschte Tätigkeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Neueste zuerst</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="usageCount">Verwendungen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredActivities.length} von {activities.length} Tätigkeit{filteredActivities.length !== 1 ? 'en' : ''}
            </div>
          </CardContent>
        </Card>

        {/* Activities Table/List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activities.length === 0 ? 'Noch keine Tätigkeiten' : 'Keine Ergebnisse gefunden'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activities.length === 0
                  ? 'Lege die erste Tätigkeit an, um zu beginnen.'
                  : 'Versuche einen anderen Suchbegriff.'}
              </p>
              {activities.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Tätigkeit anlegen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <ActivitiesTable
            activities={filteredActivities}
            onActivityUpdated={handleActivityUpdated}
          />
        )}

        {/* Create Activity Dialog */}
        <CreateActivityDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onActivityCreated={handleActivityCreated}
        />
      </div>
    </div>
  )
}
