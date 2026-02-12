import { NextResponse } from 'next/server'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

/**
 * GET /api/activities
 * Fetch all activities (alphabetically sorted) - for employee dropdowns
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

    const allActivities = await db
      .select({
        id: activities.id,
        name: activities.name,
      })
      .from(activities)
      .orderBy(asc(activities.name))

    return NextResponse.json({ activities: allActivities })
  } catch (error) {
    console.error('GET /api/activities error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
