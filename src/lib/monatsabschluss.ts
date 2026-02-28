import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if a month is closed for a given user.
 * Returns the closing record if found, null otherwise.
 */
export async function getMonatsabschluss(
  supabase: SupabaseClient,
  userId: string,
  jahr: number,
  monat: number,
) {
  const { data } = await supabase
    .from('monatsabschluesse')
    .select('id')
    .eq('user_id', userId)
    .eq('jahr', jahr)
    .eq('monat', monat)
    .maybeSingle()

  return data
}

/**
 * Check if the month of a given date is closed for the user.
 * Returns true if the month is closed.
 */
export async function istMonatGeschlossen(
  supabase: SupabaseClient,
  userId: string,
  datum: string,
): Promise<boolean> {
  const [year, month] = datum.split('-').map(Number)
  const result = await getMonatsabschluss(supabase, userId, year, month)
  return result !== null
}

/**
 * Check if any month spanned by a date range overlaps with a closed month.
 * Used for absences which can span multiple months.
 */
export async function hatAbwesenheitGeschlosseneMonate(
  supabase: SupabaseClient,
  userId: string,
  startdatum: string,
  enddatum: string,
): Promise<boolean> {
  const [startY, startM] = startdatum.split('-').map(Number)
  const [endY, endM] = enddatum.split('-').map(Number)

  // Collect all year-month pairs the absence spans
  const months: Array<{ jahr: number; monat: number }> = []
  let y = startY
  let m = startM
  while (y < endY || (y === endY && m <= endM)) {
    months.push({ jahr: y, monat: m })
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  // Check each month
  for (const { jahr, monat } of months) {
    const result = await getMonatsabschluss(supabase, userId, jahr, monat)
    if (result !== null) return true
  }

  return false
}
