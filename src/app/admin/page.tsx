'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Shield, Users, Clock, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/LogoutButton'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  role: string
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          // Not authenticated - redirect to login
          window.location.href = '/login'
          return
        }

        const data = await response.json()

        // Check if user is admin
        if (data.user?.role !== 'admin') {
          // Not authorized - redirect to dashboard
          window.location.href = '/dashboard'
          return
        }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">HofZeit Admin</h1>
                  <Badge variant="destructive" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Administrations-Portal</p>
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
            Admin-Portal
          </h2>
          <p className="text-muted-foreground">
            Angemeldet als Administrator: <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>

        {/* Admin Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Benutzerverwaltung
              </CardTitle>
              <CardDescription>Mitarbeiter und Admins verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feature wird noch implementiert...
              </p>
            </CardContent>
          </Card>

          {/* Time Tracking Management Card */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Zeiterfassung
              </CardTitle>
              <CardDescription>Übersicht aller Zeiterfassungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feature wird noch implementiert...
              </p>
            </CardContent>
          </Card>

          {/* System Settings Card */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                System-Einstellungen
              </CardTitle>
              <CardDescription>Konfiguration und Einstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feature wird noch implementiert...
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Info Section */}
        <div className="mt-8">
          <Card className="bg-purple-50/50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator-Bereich
              </CardTitle>
              <CardDescription className="text-purple-700">
                Du hast vollständigen Zugriff auf alle Funktionen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-purple-800">
                  Als Administrator hast du Zugriff auf:
                </p>
                <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  <li>Benutzerverwaltung (Anlegen, Bearbeiten, Deaktivieren von Accounts)</li>
                  <li>Zeiterfassungs-Übersicht aller Mitarbeiter</li>
                  <li>System-Einstellungen und Konfiguration</li>
                  <li>Berichte und Auswertungen</li>
                </ul>
                <p className="text-sm text-purple-700 italic mt-4">
                  Diese Features werden in zukünftigen Updates implementiert.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
              <CardDescription>Häufig verwendete Admin-Funktionen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Weitere Admin-Features folgen bald...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
        HofZeit Zeiterfassung © {new Date().getFullYear()} · Admin-Portal
      </footer>
    </div>
  )
}
