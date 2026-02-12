import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { costCenters } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { getCostCenterUsageCount, transformCostCenterToFrontend, deleteCostCenter } from '@/lib/stammdaten'

const updateCostCenterSchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .optional(),
  number: z.string()
    .max(20, 'Nummer darf maximal 20 Zeichen lang sein')
    .optional(),
  description: z.string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .optional(),
})

/**
 * PATCH /api/admin/cost-centers/[id]
 * Update cost center (admin only)
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
    const validationResult = updateCostCenterSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    const [existingCostCenter] = await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.id, id))
      .limit(1)

    if (!existingCostCenter) {
      return NextResponse.json(
        { error: 'Kostenstelle nicht gefunden' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.number !== undefined) updateData.number = updates.number || null
    if (updates.description !== undefined) updateData.description = updates.description || null

    const [updatedCostCenter] = await db
      .update(costCenters)
      .set(updateData)
      .where(eq(costCenters.id, id))
      .returning()

    const usageCount = await getCostCenterUsageCount(id)
    const transformedCostCenter = transformCostCenterToFrontend(updatedCostCenter, usageCount)

    return NextResponse.json({ success: true, costCenter: transformedCostCenter })
  } catch (error) {
    console.error('PATCH /api/admin/cost-centers/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/cost-centers/[id]
 * Delete cost center (admin only)
 * Preserves history in time_entries via deleted_cost_center_name (PROJ-4)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const [existingCostCenter] = await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.id, id))
      .limit(1)

    if (!existingCostCenter) {
      return NextResponse.json(
        { error: 'Kostenstelle nicht gefunden' },
        { status: 404 }
      )
    }

    const usageCount = await getCostCenterUsageCount(id)

    await deleteCostCenter(id)

    return NextResponse.json({
      success: true,
      message: `Kostenstelle "${existingCostCenter.name}" wurde gelöscht`,
      usageCount,
    })
  } catch (error) {
    console.error('DELETE /api/admin/cost-centers/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
