export interface Abwesenheit {
  id: string
  typ: 'urlaub' | 'krankheit'
  startdatum: string // YYYY-MM-DD
  enddatum: string // YYYY-MM-DD
  notiz: string | null
  created_at: string
}

export interface AbwesenheitFormData {
  typ: 'urlaub' | 'krankheit'
  startdatum: string
  enddatum: string
  notiz: string
}

export function berechneAnzahlTage(startdatum: string, enddatum: string): number {
  const start = new Date(startdatum)
  const end = new Date(enddatum)
  const diffMs = end.getTime() - start.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
}

export function formatDatumDE(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatZeitraumDE(startdatum: string, enddatum: string): string {
  if (startdatum === enddatum) {
    return formatDatumDE(startdatum)
  }
  return `${formatDatumDE(startdatum)} – ${formatDatumDE(enddatum)}`
}

export function typLabel(typ: 'urlaub' | 'krankheit'): string {
  return typ === 'urlaub' ? 'Urlaub' : 'Krankheit'
}
