'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Clock, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/LogoutButton'

interface User {
  id: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          // Not authenticated - redirect to login
          window.location.href = '/login'
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/login'
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Willkommen zurück!
          </h2>
          <p className="text-muted-foreground">
            Angemeldet als: <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dein Profil
              </CardTitle>
              <CardDescription>Deine Account-Informationen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rolle</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Zeiterfassung Card (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Zeiterfassung
              </CardTitle>
              <CardDescription>Deine Arbeitszeiten</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feature wird noch implementiert...
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions Card (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>Häufig verwendete Funktionen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Weitere Features folgen bald...
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8">
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Dashboard</CardTitle>
              <CardDescription className="text-blue-700">
                Dies ist deine persönliche Dashboard-Seite für Mitarbeiter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Hier kannst du in Zukunft deine Arbeitszeiten erfassen, deine Historie einsehen und vieles mehr.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
        HofZeit Zeiterfassung © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
