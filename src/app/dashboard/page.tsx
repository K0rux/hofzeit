'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/app-layout'
import { UrlaubskontoKarte } from '@/components/dashboard/urlaubskonto-karte'
import { MonatsuebersichtKarte } from '@/components/dashboard/monatsuebersicht-karte'
import { WochenstundenKarte } from '@/components/dashboard/wochenstunden-karte'
import { AdminMonatsabschlussUebersicht } from '@/components/dashboard/admin-monatsabschluss-uebersicht'
import { berechneAnzahlTage } from '@/components/abwesenheiten/types'
import { createClient } from '@/lib/supabase'

interface Arbeitszeitprofil {
  urlaubstage_jahr: number
  arbeitstage: string[]
  wochenstunden: number
}

interface Abwesenheit {
  typ: 'urlaub' | 'krankheit'
  startdatum: string
  enddatum: string
}

// Map German day abbreviations to Date.getDay() values (0=Sun)
const DAY_MAP: Record<string, number> = {
  Mo: 1,
  Di: 2,
  Mi: 3,
  Do: 4,
  Fr: 5,
  Sa: 6,
  So: 0,
}

function berechneMonatsSollStunden(
  profil: Arbeitszeitprofil,
  jahr: number,
  monat: number // 0-indexed
): number {
  const arbeitstageNummern = new Set(
    profil.arbeitstage.map((d) => DAY_MAP[d]).filter((n) => n !== undefined)
  )
  const tageProWoche = profil.arbeitstage.length
  const stundenProTag = tageProWoche > 0 ? profil.wochenstunden / tageProWoche : 0

  const daysInMonth = new Date(jahr, monat + 1, 0).getDate()
  let sollTage = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const wochentag = new Date(jahr, monat, d).getDay()
    if (arbeitstageNummern.has(wochentag)) {
      sollTage++
    }
  }
  return sollTage * stundenProTag
}

function getMonatsname(jahr: number, monat: number): string {
  return new Date(jahr, monat, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  })
}

// Count vacation days that fall on profile working days (not calendar days)
function berechneUrlaubstageNachArbeitstagen(
  startdatum: string,
  enddatum: string,
  arbeitstage: string[]
): number {
  const arbeitstageNummern = new Set(
    arbeitstage.map((d) => DAY_MAP[d]).filter((n) => n !== undefined)
  )
  const current = new Date(startdatum + 'T12:00:00')
  const end = new Date(enddatum + 'T12:00:00')
  let count = 0
  while (current <= end) {
    if (arbeitstageNummern.has(current.getDay())) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

function getMonatsBounds(jahr: number, monat: number): { von: string; bis: string } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const daysInMonth = new Date(jahr, monat + 1, 0).getDate()
  return {
    von: `${jahr}-${pad(monat + 1)}-01`,
    bis: `${jahr}-${pad(monat + 1)}-${pad(daysInMonth)}`,
  }
}

function getWochenBounds(): { von: string; bis: string } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    von: `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`,
    bis: `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`,
  }
}

interface AdminUser {
  id: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
}

interface Monatsabschluss {
  id: string
  user_id: string
  jahr: number
  monat: number
}

export default function DashboardPage() {
  const now = new Date()
  const jahr = now.getFullYear()
  const monat = now.getMonth() // 0-indexed

  const [role, setRole] = useState<'admin' | 'employee' | null>(null)
  const [loading, setLoading] = useState(true)
  const [profil, setProfil] = useState<Arbeitszeitprofil | null>(null)
  const [urlaubGenommen, setUrlaubGenommen] = useState(0)
  const [istStunden, setIstStunden] = useState(0)
  const [wochenIstStunden, setWochenIstStunden] = useState(0)

  // Admin state
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminAbschluesse, setAdminAbschluesse] = useState<Monatsabschluss[]>([])

  // Determine the relevant month for Monatsabschluss (previous month)
  const abschlussMonat = monat === 0 ? 12 : monat // 1-indexed previous month
  const abschlussJahr = monat === 0 ? jahr - 1 : jahr

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true)
    try {
      const [usersRes, abschluesseRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/monatsabschluesse'),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setAdminUsers(usersData.users ?? [])
      }

      if (abschluesseRes.ok) {
        const abschluesseData: Monatsabschluss[] = await abschluesseRes.json()
        setAdminAbschluesse(abschluesseData)
      }
    } finally {
      setAdminLoading(false)
    }
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Determine role first
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          setRole(profile?.role ?? null)

          // Admins don't have an Arbeitszeitprofil – skip employee fetches
          if (profile?.role === 'admin') {
            loadAdminData()
            return
          }
        }

        const { von, bis } = getMonatsBounds(jahr, monat)
        const jahresStart = `${jahr}-01-01`
        const jahresEnde = `${jahr}-12-31`
        const woche = getWochenBounds()

        const [profilRes, abwRes, zeitRes, wochenZeitRes] = await Promise.all([
          fetch('/api/arbeitszeitprofile/me'),
          fetch(`/api/abwesenheiten?von=${jahresStart}&bis=${jahresEnde}`),
          fetch(`/api/zeiteintraege?von=${von}&bis=${bis}`),
          fetch(`/api/zeiteintraege?von=${woche.von}&bis=${woche.bis}`),
        ])

        const profilData = profilRes.ok ? await profilRes.json() : null
        setProfil(profilData)

        if (abwRes.ok) {
          const abwData: Abwesenheit[] = await abwRes.json()
          const urlaubsTage = abwData
            .filter((a) => a.typ === 'urlaub')
            .reduce((sum, a) => sum + (
              profilData?.arbeitstage
                ? berechneUrlaubstageNachArbeitstagen(a.startdatum, a.enddatum, profilData.arbeitstage)
                : berechneAnzahlTage(a.startdatum, a.enddatum)
            ), 0)
          setUrlaubGenommen(urlaubsTage)
        }

        if (zeitRes.ok) {
          const zeitData: { dauer_stunden: number }[] = await zeitRes.json()
          const total = zeitData.reduce((sum, z) => sum + z.dauer_stunden, 0)
          setIstStunden(total)
        }

        if (wochenZeitRes.ok) {
          const wochenData: { dauer_stunden: number }[] = await wochenZeitRes.json()
          const total = wochenData.reduce((sum, z) => sum + z.dauer_stunden, 0)
          setWochenIstStunden(total)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [jahr, monat, loadAdminData])

  const sollStunden = profil
    ? berechneMonatsSollStunden(profil, jahr, monat)
    : 0

  // Build admin Monatsabschluss list
  const mitarbeiterStatus = adminUsers
    .filter((u) => u.role === 'employee' && u.is_active)
    .map((u) => {
      const abschluss = adminAbschluesse.find(
        (a) => a.user_id === u.id && a.jahr === abschlussJahr && a.monat === abschlussMonat
      )
      return {
        userId: u.id,
        name: `${u.first_name} ${u.last_name}`.trim() || u.id,
        status: abschluss ? 'abgeschlossen' as const : 'offen' as const,
        abschlussId: abschluss?.id,
      }
    })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Übersicht</h2>
          <p className="text-muted-foreground">Ihre aktuellen Kennzahlen auf einen Blick.</p>
        </div>

        {role === 'admin' ? (
          <AdminMonatsabschlussUebersicht
            loading={adminLoading}
            mitarbeiter={mitarbeiterStatus}
            jahr={abschlussJahr}
            monat={abschlussMonat}
            onRefresh={loadAdminData}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WochenstundenKarte
              loading={loading}
              hasProfile={!!profil}
              istStunden={wochenIstStunden}
              sollStunden={profil ? profil.wochenstunden : null}
            />
            <MonatsuebersichtKarte
              loading={loading}
              hasProfile={!!profil}
              monat={getMonatsname(jahr, monat)}
              sollStunden={sollStunden}
              istStunden={istStunden}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <UrlaubskontoKarte
                loading={loading}
                hasProfile={!!profil}
                jahresanspruch={profil?.urlaubstage_jahr ?? 0}
                genommen={urlaubGenommen}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
