import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { costCenters } from '@/db/schema'
import { desc, ilike, or } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { getCostCenterUsageCount, transformCostCenterToFrontend } from '@/lib/stammdaten'

const createCostCenterSchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  number: z.string()
    .max(20, 'Nummer darf maximal 20 Zeichen lang sein')
    .optional()
    .default(''),
  description: z.string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .optional()
    .default(''),
})

/**
 * GET /api/admin/cost-centers
 * Fetch all cost centers with usage count (admin only)
 * Query params: ?search=string (optional)
 */
export async function GET(request: Request) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = db.select().from(costCenters)

    if (search && search.trim().length > 0) {
      query = query.where(
        or(
          ilike(costCenters.name, `%${search}%`),
          ilike(costCenters.number, `%${search}%`),
          ilike(costCenters.description, `%${search}%`)
        )
      ) as any
    }

    const allCostCenters = await query.orderBy(desc(costCenters.createdAt))

    const transformedCostCenters = await Promise.all(
      allCostCenters.map(async (costCenter) => {
        const usageCount = await getCostCenterUsageCount(costCenter.id)
        return transformCostCenterToFrontend(costCenter, usageCount)
      })
    )

    return NextResponse.json({ costCenters: transformedCostCenters })
  } catch (error) {
    console.error('GET /api/admin/cost-centers error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cost-centers
 * Create new cost center (admin only)
 */
export async function POST(request: Request) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const validationResult = createCostCenterSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { name, number, description } = validationResult.data

    const [newCostCenter] = await db
      .insert(costCenters)
      .values({
        name,
        number: number || null,
        description: description || null,
      })
      .returning()

    const transformedCostCenter = transformCostCenterToFrontend(newCostCenter, 0)

    return NextResponse.json(
      { success: true, costCenter: transformedCostCenter },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/admin/cost-centers error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
