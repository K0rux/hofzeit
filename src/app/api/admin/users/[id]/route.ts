import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin, mapRoleToDatabase, transformUserToFrontend } from '@/lib/admin'
import { hashPassword } from '@/lib/auth'

// Validation schema (all fields optional for update)
const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(), // Empty = no change
  role: z.enum(['admin', 'employee']).optional(),
  vacationDays: z.number().int().min(0).max(365).optional(),
})

/**
 * PATCH /api/admin/users/[id]
 * Update user (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const { error, session } = await requireAdmin()
    if (error) return error

    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUser) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Check if email is being changed and already exists
    if (updates.email && updates.email.toLowerCase() !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email.toLowerCase()))
        .limit(1)

      if (emailExists) {
        return NextResponse.json(
          { error: 'Diese E-Mail wird bereits verwendet' },
          { status: 400 }
        )
      }
    }

    // Prepare update object
    const updateData: any = {}

    if (updates.firstName) updateData.firstName = updates.firstName
    if (updates.lastName) updateData.lastName = updates.lastName
    if (updates.email) updateData.email = updates.email.toLowerCase()
    if (updates.role) updateData.role = mapRoleToDatabase(updates.role)
    if (updates.vacationDays !== undefined) updateData.vacationDays = updates.vacationDays

    // Hash new password if provided
    if (updates.password) {
      updateData.passwordHash = await hashPassword(updates.password)
      updateData.passwordChangedAt = new Date()
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    // Transform to frontend format
    const transformedUser = transformUserToFrontend(updatedUser)

    return NextResponse.json({ success: true, user: transformedUser })
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
