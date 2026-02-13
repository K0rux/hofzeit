import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { getActivityUsageCount, transformActivityToFrontend, deleteActivity } from '@/lib/stammdaten'

const updateActivitySchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .optional(),
  description: z.string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .nullable()
    .optional(),
})

/**
 * PATCH /api/admin/activities/[id]
 * Update activity (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const body = await request.json()
    const validationResult = updateActivitySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    const [existingActivity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1)

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Tätigkeit nicht gefunden' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description || null

    const [updatedActivity] = await db
      .update(activities)
      .set(updateData)
      .where(eq(activities.id, id))
      .returning()

    const usageCount = await getActivityUsageCount(id)
    const transformedActivity = transformActivityToFrontend(updatedActivity, usageCount)

    return NextResponse.json({ success: true, activity: transformedActivity })
  } catch (error) {
    console.error('PATCH /api/admin/activities/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/activities/[id]
 * Delete activity (admin only)
 * Preserves history in time_entries via deleted_activity_name (PROJ-4)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const [existingActivity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1)

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Tätigkeit nicht gefunden' },
        { status: 404 }
      )
    }

    const usageCount = await getActivityUsageCount(id)

    await deleteActivity(id)

    return NextResponse.json({
      success: true,
      message: `Tätigkeit "${existingActivity.name}" wurde gelöscht`,
      usageCount,
    })
  } catch (error) {
    console.error('DELETE /api/admin/activities/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
