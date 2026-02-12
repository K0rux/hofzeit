/**
 * Stammdaten (Master Data) Helper Functions
 * PROJ-3: Activities & Cost Centers Management
 */

import { db } from '@/db'
import { activities, costCenters } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get usage count for an activity
 * PROJ-3: Returns 0 (placeholder until PROJ-4 creates time_entries table)
 */
export async function getActivityUsageCount(activityId: string): Promise<number> {
  // TODO PROJ-4: Implement actual count from time_entries table
  // const result = await db
  //   .select({ count: count() })
  //   .from(timeEntries)
  //   .where(eq(timeEntries.activityId, activityId))
  // return result[0]?.count || 0

  return 0 // Placeholder for PROJ-3
}

/**
 * Get usage count for a cost center
 * PROJ-3: Returns 0 (placeholder until PROJ-4 creates time_entries table)
 */
export async function getCostCenterUsageCount(costCenterId: string): Promise<number> {
  // TODO PROJ-4: Implement actual count from time_entries table
  return 0 // Placeholder for PROJ-3
}

/**
 * Transform activity from database format to frontend format
 */
export function transformActivityToFrontend(dbActivity: any, usageCount: number = 0) {
  return {
    id: dbActivity.id,
    name: dbActivity.name,
    description: dbActivity.description || '',
    usageCount,
    createdAt: dbActivity.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: dbActivity.updatedAt?.toISOString() || new Date().toISOString(),
  }
}

/**
 * Transform cost center from database format to frontend format
 */
export function transformCostCenterToFrontend(dbCostCenter: any, usageCount: number = 0) {
  return {
    id: dbCostCenter.id,
    name: dbCostCenter.name,
    number: dbCostCenter.number || '',
    description: dbCostCenter.description || '',
    usageCount,
    createdAt: dbCostCenter.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: dbCostCenter.updatedAt?.toISOString() || new Date().toISOString(),
  }
}

/**
 * Delete activity (PROJ-3: Simple delete)
 * PROJ-4 will add history preservation to time_entries
 */
export async function deleteActivity(activityId: string) {
  // TODO PROJ-4: Update time_entries.deleted_activity_name before deletion
  await db.delete(activities).where(eq(activities.id, activityId))
}

/**
 * Delete cost center (PROJ-3: Simple delete)
 * PROJ-4 will add history preservation to time_entries
 */
export async function deleteCostCenter(costCenterId: string) {
  // TODO PROJ-4: Update time_entries.deleted_cost_center_name before deletion
  await db.delete(costCenters).where(eq(costCenters.id, costCenterId))
}
