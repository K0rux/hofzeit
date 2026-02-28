'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AufhebenDialog } from './aufheben-dialog'
import { AbschliessenDialog } from './abschliessen-dialog'
import type { UserProfile } from './types'
import type { Monatsabschluss } from '@/components/monatsabschluss/types'
import { MONATE, monatLabel } from '@/components/monatsabschluss/types'

interface MonatsabschlussPanelProps {
  users: UserProfile[]
}

export function MonatsabschlussPanel({ users }: MonatsabschlussPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [abschluesse, setAbschluesse] = useState<Monatsabschluss[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Aufheben dialog
  const [aufhebenOpen, setAufhebenOpen] = useState(false)
  const [aufhebenData, setAufhebenData] = useState<{
    id: string
    jahr: number
    monat: number
    name: string
  } | null>(null)

  // Abschließen dialog
  const [abschliessenOpen, setAbschliessenOpen] = useState(false)
  const [abschliessenData, setAbschliessenData] = useState<{
    monat: number
  } | null>(null)

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i)

  const fetchAbschluesse = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/monatsabschluesse')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Laden der Monatsabschlüsse')
        return
      }
      const data = await res.json()
      setAbschluesse(Array.isArray(data) ? data : [])
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAbschluesse()
  }, [fetchAbschluesse])

  // Set default user when users arrive
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      const employees = users.filter((u) => u.role === 'employee')
      if (employees.length > 0) {
        setSelectedUserId(employees[0].id)
      } else if (users.length > 0) {
        setSelectedUserId(users[0].id)
      }
    }
  }, [users, selectedUserId])

  const selectedUser = users.find((u) => u.id === selectedUserId)
  const userAbschluesse = abschluesse.filter(
    (a) => a.user_id === selectedUserId && a.jahr === selectedYear,
  )

  function getAbschluss(monat: number): Monatsabschluss | undefined {
    return userAbschluesse.find((a) => a.monat === monat)
  }

  function openAufheben(abschluss: Monatsabschluss) {
    setAufhebenData({
      id: abschluss.id,
      jahr: abschluss.jahr,
      monat: abschluss.monat,
      name: selectedUser
        ? `${selectedUser.first_name} ${selectedUser.last_name}`
        : '',
    })
    setAufhebenOpen(true)
  }

  function openAbschliessen(monat: number) {
    setAbschliessenData({ monat })
    setAbschliessenOpen(true)
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1

  function istZukunftsMonat(monat: number): boolean {
    if (selectedYear < currentYear) return false
    if (selectedYear > currentYear) return true
    return monat > currentMonth
  }

  function kannAbgeschlossenWerden(monat: number): boolean {
    if (selectedYear < currentYear) return true
    if (selectedYear > currentYear) return false
    return monat < currentMonth
  }

  return (
    <div className="space-y-4">
      {/* User and year selection */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Mitarbeiter:</span>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Mitarbeiter wählen" />
          </SelectTrigger>
          <SelectContent>
            {users
              .filter((u) => u.role === 'employee')
              .map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <span className="text-sm font-medium">Jahr:</span>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Monthly status table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              MONATE.map((_, idx) => {
                const monat = idx + 1
                const abschluss = getAbschluss(monat)
                const istAbgeschlossen = !!abschluss
                const istZukunft = istZukunftsMonat(monat)

                return (
                  <TableRow key={monat}>
                    <TableCell className="font-medium">
                      {monatLabel(monat)}
                    </TableCell>
                    <TableCell>
                      {istZukunft ? (
                        <span className="text-sm text-muted-foreground">–</span>
                      ) : istAbgeschlossen ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Abgeschlossen
                          {abschluss.automatisch && (
                            <span className="text-xs opacity-70">(auto)</span>
                          )}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <LockOpen className="h-3 w-3" />
                          Offen
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {istAbgeschlossen ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openAufheben(abschluss)}
                        >
                          Aufheben
                        </Button>
                      ) : !istZukunft && kannAbgeschlossenWerden(monat) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openAbschliessen(monat)}
                          disabled={!selectedUserId}
                        >
                          Abschließen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Aufheben Dialog */}
      {aufhebenData && (
        <AufhebenDialog
          open={aufhebenOpen}
          onOpenChange={setAufhebenOpen}
          abschlussId={aufhebenData.id}
          jahr={aufhebenData.jahr}
          monat={aufhebenData.monat}
          mitarbeiterName={aufhebenData.name}
          onSuccess={fetchAbschluesse}
        />
      )}

      {/* Abschließen Dialog */}
      <AbschliessenDialog
        open={abschliessenOpen}
        onOpenChange={setAbschliessenOpen}
        userId={selectedUserId || null}
        jahr={selectedYear}
        monat={abschliessenData?.monat ?? 1}
        mitarbeiterName={
          selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''
        }
        onSuccess={fetchAbschluesse}
      />
    </div>
  )
}
