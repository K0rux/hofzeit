import { NextResponse } from 'next/server'
import { db } from '@/db'
import { timeEntries, activities, costCenters } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Validation Schema for Time Entry
 */
const TimeEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein'),
  activityId: z.string().uuid('Ungültige Tätigkeits-ID'),
  costCenterId: z.string().uuid('Ungültige Kostenstellen-ID'),
  hours: z.number().min(0.25, 'Mindestens 0.25 Stunden erforderlich').max(24, 'Maximal 24 Stunden erlaubt'),
  notes: z.string().max(500, 'Notiz darf maximal 500 Zeichen lang sein').optional(),
})

/**
 * GET /api/time-entries?month=2026-02
 * Fetch time entries for a specific month
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Extract month parameter from URL (format: YYYY-MM)
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Monat muss im Format YYYY-MM angegeben werden (z.B. 2026-02)' },
        { status: 400 }
      )
    }

    // Calculate start and end of month
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0) // Last day of month

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch time entries for the authenticated user within the month
    const entries = await db
      .select({
        id: timeEntries.id,
        date: timeEntries.date,
        hours: timeEntries.hours,
        notes: timeEntries.notes,
        createdAt: timeEntries.createdAt,
        updatedAt: timeEntries.updatedAt,
        activity: {
          id: activities.id,
          name: activities.name,
        },
        costCenter: {
          id: costCenters.id,
          name: costCenters.name,
          number: costCenters.number,
        },
      })
      .from(timeEntries)
      .leftJoin(activities, eq(timeEntries.activityId, activities.id))
      .leftJoin(costCenters, eq(timeEntries.costCenterId, costCenters.id))
      .where(
        and(
          eq(timeEntries.userId, session.userId),
          gte(timeEntries.date, startDateStr),
          lte(timeEntries.date, endDateStr)
        )
      )
      .orderBy(desc(timeEntries.date))

    // Calculate total hours for the month
    const totalHours = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0)

    return NextResponse.json({
      entries,
      totalHours,
      month,
    })
  } catch (error) {
    console.error('GET /api/time-entries error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/time-entries
 * Create a new time entry
 * Requires authentication
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = TimeEntrySchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { date, activityId, costCenterId, hours, notes } = validation.data

    // Verify that activity exists
    const activity = await db
      .select({ id: activities.id })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1)

    if (activity.length === 0) {
      return NextResponse.json(
        { error: 'Tätigkeit nicht gefunden' },
        { status: 404 }
      )
    }

    // Verify that cost center exists
    const costCenter = await db
      .select({ id: costCenters.id })
      .from(costCenters)
      .where(eq(costCenters.id, costCenterId))
      .limit(1)

    if (costCenter.length === 0) {
      return NextResponse.json(
        { error: 'Kostenstelle nicht gefunden' },
        { status: 404 }
      )
    }

    // Insert time entry
    const [newEntry] = await db
      .insert(timeEntries)
      .values({
        userId: session.userId,
        date,
        activityId,
        costCenterId,
        hours,
        notes: notes || null,
      })
      .returning()

    return NextResponse.json(
      { entry: newEntry, message: `Zeiterfassung für ${date} wurde gespeichert` },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/time-entries error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
