export interface Monatsabschluss {
  id: string
  user_id: string
  jahr: number
  monat: number
  abgeschlossen_am: string
  abgeschlossen_durch: string
  automatisch: boolean
}

export const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const

export function monatLabel(monat: number): string {
  return MONATE[monat - 1] ?? `Monat ${monat}`
}

export function istMonatAbgeschlossen(
  abschluesse: Monatsabschluss[],
  jahr: number,
  monat: number,
): boolean {
  return abschluesse.some((a) => a.jahr === jahr && a.monat === monat)
}

export function getMonatFromDatum(datumStr: string): { jahr: number; monat: number } {
  const [year, month] = datumStr.split('-').map(Number)
  return { jahr: year, monat: month }
}

export function istVergangenerMonat(jahr: number, monat: number): boolean {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  return jahr < currentYear || (jahr === currentYear && monat < currentMonth)
}
