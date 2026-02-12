import { NextResponse } from 'next/server'
import { db } from '@/db'
import { costCenters } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

/**
 * GET /api/cost-centers
 * Fetch all cost centers (alphabetically sorted) - for employee dropdowns
 * Requires authentication but not admin role
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const allCostCenters = await db
      .select({
        id: costCenters.id,
        name: costCenters.name,
        number: costCenters.number,
      })
      .from(costCenters)
      .orderBy(asc(costCenters.name))

    return NextResponse.json({ costCenters: allCostCenters })
  } catch (error) {
    console.error('GET /api/cost-centers error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
