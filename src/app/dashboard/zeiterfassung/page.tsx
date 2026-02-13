'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Clock, Plus, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogoutButton } from '@/components/LogoutButton'
import { CreateTimeEntryDialog } from '@/components/zeiterfassung/CreateTimeEntryDialog'
import { TimeEntriesList } from '@/components/zeiterfassung/TimeEntriesList'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

export type TimeEntry = {
  id: string
  date: string
  activity: {
    id: string
    name: string
  }
  costCenter: {
    id: string
    name: string
  }
  hours: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type Activity = {
  id: string
  name: string
}

export type CostCenter = {
  id: string
  name: string
}

export default function ZeiterfassungPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Data States
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])

  // UI States
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          window.location.href = '/login'
          return
        }

        const data = await response.json()
        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/login'
      }
    }

    checkAuth()
  }, [])

  // Fetch time entries when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchTimeEntries()
    }
  }, [isAuthorized, selectedMonth])

  // Fetch activities and cost centers once
  useEffect(() => {
    if (isAuthorized) {
      fetchActivitiesAndCostCenters()
    }
  }, [isAuthorized])

  const fetchTimeEntries = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/time-entries?month=${selectedMonth}`)
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zeiterfassungen')
      }
      const data = await response.json()
      setTimeEntries(data.timeEntries || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivitiesAndCostCenters = async () => {
    try {
      const [activitiesRes, costCentersRes] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/cost-centers')
      ])

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities || [])
      }

      if (costCentersRes.ok) {
        const costCentersData = await costCentersRes.json()
        setCostCenters(costCentersData.costCenters || [])
      }
    } catch (err) {
      console.error('Failed to fetch activities/cost centers:', err)
    }
  }

  const handleTimeEntryCreated = () => {
    setIsCreateDialogOpen(false)
    fetchTimeEntries()
  }

  const handleTimeEntryUpdated = () => {
    fetchTimeEntries()
  }

  const handleTimeEntryDeleted = () => {
    fetchTimeEntries()
  }

  // Calculate total hours for selected month
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

  // Generate month options (current month + last 3 months)
  const getMonthOptions = () => {
    const options = []
    const today = new Date()

    for (let i = 0; i < 4; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = format(date, 'yyyy-MM')
      const label = format(date, 'MMMM yyyy', { locale: de })
      options.push({ value, label })
    }

    return options
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/hofzeit_logo_512x512.png"
                alt="HofZeit Logo"
                width={48}
                height={48}
                className="drop-shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">HofZeit</h1>
                <p className="text-sm text-muted-foreground">Zeiterfassung</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Zeiterfassung
          </h2>
          <p className="text-muted-foreground">
            Erfasse und verwalte deine Arbeitszeiten
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Month Selector & Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monat auswählen
                </CardTitle>
                <CardDescription>
                  Wähle den Monat für die Zeiterfassung
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Stunden</p>
                <p className="text-3xl font-bold text-primary">{totalHours.toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Einträge</p>
                <p className="text-3xl font-bold">{timeEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Zeiterfassung
          </Button>
        </div>

        {/* Time Entries List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : timeEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Noch keine Zeiterfassungen
              </h3>
              <p className="text-muted-foreground mb-4">
                Erstelle deine erste Zeiterfassung für diesen Monat.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Erste Zeiterfassung erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TimeEntriesList
            timeEntries={timeEntries}
            onTimeEntryUpdated={handleTimeEntryUpdated}
            onTimeEntryDeleted={handleTimeEntryDeleted}
            activities={activities}
            costCenters={costCenters}
          />
        )}

        {/* Create Time Entry Dialog */}
        <CreateTimeEntryDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onTimeEntryCreated={handleTimeEntryCreated}
          activities={activities}
          costCenters={costCenters}
          selectedMonth={selectedMonth}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
        HofZeit Zeiterfassung © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
