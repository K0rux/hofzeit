export interface Zeiteintrag {
  id: string
  datum: string // YYYY-MM-DD
  taetigkeit_id: string | null
  taetigkeit_name: string | null
  taetigkeit_freitext: string | null
  kostenstelle_id: string
  kostenstelle_name: string
  dauer_stunden: number
  notiz: string | null
  erstellt_am: string
  geaendert_am: string
}

export interface TaetigkeitOption {
  id: string
  name: string
}

export interface KostenstelleOption {
  id: string
  name: string
}

export function getTodayStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateDE(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateDECompact(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export function formatDauerDE(dauer: number): string {
  return dauer.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' Std.'
}
