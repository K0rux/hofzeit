import { NextResponse } from 'next/server'
import { db } from '@/db'
import { timeEntries, activities, costCenters } from '@/db/schema'
import { getSession } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Validation Schema for Time Entry Update
 */
const TimeEntryUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format YYYY-MM-DD sein').optional(),
  activityId: z.string().uuid('Ungültige Tätigkeits-ID').optional(),
  costCenterId: z.string().uuid('Ungültige Kostenstellen-ID').optional(),
  hours: z.number().min(0.25, 'Mindestens 0.25 Stunden erforderlich').max(24, 'Maximal 24 Stunden erlaubt').optional(),
  notes: z.string().max(500, 'Notiz darf maximal 500 Zeichen lang sein').optional().nullable(),
})

/**
 * PATCH /api/time-entries/[id]
 * Update an existing time entry
 * Requires authentication and ownership
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
      )
    }

    // Check if entry exists and belongs to user
    const [existingEntry] = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.id, id),
          eq(timeEntries.userId, session.userId)
        )
      )
      .limit(1)

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Zeiterfassung nicht gefunden' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = TimeEntryUpdateSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { date, activityId, costCenterId, hours, notes } = validation.data

    // Verify activity exists if provided
    if (activityId) {
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
    }

    // Verify cost center exists if provided
    if (costCenterId) {
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
    }

    // Build update object (only include provided fields)
    const updateData: any = {}
    if (date !== undefined) updateData.date = date
    if (activityId !== undefined) updateData.activityId = activityId
    if (costCenterId !== undefined) updateData.costCenterId = costCenterId
    if (hours !== undefined) updateData.hours = hours
    if (notes !== undefined) updateData.notes = notes

    // Update time entry
    const [updatedEntry] = await db
      .update(timeEntries)
      .set(updateData)
      .where(
        and(
          eq(timeEntries.id, id),
          eq(timeEntries.userId, session.userId)
        )
      )
      .returning()

    return NextResponse.json({
      entry: updatedEntry,
      message: 'Änderungen gespeichert',
    })
  } catch (error) {
    console.error('PATCH /api/time-entries/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/time-entries/[id]
 * Delete a time entry
 * Requires authentication and ownership
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: 'Ungültige ID' },
        { status: 400 }
      )
    }

    // Check if entry exists and belongs to user
    const [existingEntry] = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.id, id),
          eq(timeEntries.userId, session.userId)
        )
      )
      .limit(1)

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Zeiterfassung nicht gefunden' },
        { status: 404 }
      )
    }

    // Delete time entry
    await db
      .delete(timeEntries)
      .where(
        and(
          eq(timeEntries.id, id),
          eq(timeEntries.userId, session.userId)
        )
      )

    return NextResponse.json({
      message: 'Zeiterfassung gelöscht',
    })
  } catch (error) {
    console.error('DELETE /api/time-entries/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
