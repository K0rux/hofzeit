'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { AppLayout } from '@/components/app-layout'
import { ProfilForm } from '@/components/profil/profil-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    first_name: string
    last_name: string
    email: string
  } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setError('Fehler beim Laden des Profils.')
          return
        }

        setProfileData({
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          email: user.email ?? '',
        })
      } catch {
        setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mein Profil</h2>
          <p className="text-muted-foreground">
            Bearbeiten Sie Ihre persönlichen Daten.
          </p>
        </div>

        <div className="max-w-md">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : profileData ? (
            <ProfilForm
              initialFirstName={profileData.first_name}
              initialLastName={profileData.last_name}
              initialEmail={profileData.email}
            />
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
