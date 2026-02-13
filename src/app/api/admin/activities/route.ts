import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { activities } from '@/db/schema'
import { desc, ilike, or } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { getActivityUsageCount, transformActivityToFrontend } from '@/lib/stammdaten'

const createActivitySchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  description: z.string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .nullable()
    .optional(),
  allowDuplicate: z.boolean().optional().default(false),
})

/**
 * GET /api/admin/activities
 * Fetch all activities with usage count (admin only)
 * Query params: ?search=string (optional)
 */
export async function GET(request: Request) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = db.select().from(activities)

    if (search && search.trim().length > 0) {
      query = query.where(
        or(
          ilike(activities.name, `%${search}%`),
          ilike(activities.description, `%${search}%`)
        )
      ) as any
    }

    const allActivities = await query.orderBy(desc(activities.createdAt))

    const transformedActivities = await Promise.all(
      allActivities.map(async (activity) => {
        const usageCount = await getActivityUsageCount(activity.id)
        return transformActivityToFrontend(activity, usageCount)
      })
    )

    return NextResponse.json({ activities: transformedActivities })
  } catch (error) {
    console.error('GET /api/admin/activities error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/activities
 * Create new activity (admin only)
 */
export async function POST(request: Request) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const validationResult = createActivitySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { name, description, allowDuplicate } = validationResult.data

    // Check for duplicate name (unless explicitly allowed)
    if (!allowDuplicate) {
      const [existing] = await db
        .select()
        .from(activities)
        .where(ilike(activities.name, name))
        .limit(1)

      if (existing) {
        return NextResponse.json(
          {
            error: 'duplicate',
            message: `Eine Tätigkeit mit dem Namen "${name}" existiert bereits.`,
            existingName: existing.name,
          },
          { status: 409 }
        )
      }
    }

    const [newActivity] = await db
      .insert(activities)
      .values({
        name,
        description: description || null,
      })
      .returning()

    const transformedActivity = transformActivityToFrontend(newActivity, 0)

    return NextResponse.json(
      { success: true, activity: transformedActivity },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/admin/activities error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
