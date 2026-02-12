import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin, transformUserToFrontend, mapRoleToDatabase } from '@/lib/admin'
import { hashPassword } from '@/lib/auth'

// Validation schema for user creation
const createUserSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  role: z.enum(['admin', 'employee'], { message: 'Ungültige Rolle' }),
  vacationDays: z.number().int().min(0).max(365, 'Urlaubstage müssen zwischen 0 und 365 liegen'),
})

/**
 * GET /api/admin/users
 * Fetch all users (admin only)
 */
export async function GET() {
  try {
    // Check admin authorization
    const { error, session } = await requireAdmin()
    if (error) return error

    // Fetch all users, ordered by creation date (newest first)
    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        vacationDays: users.vacationDays,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    // Transform to frontend format (map enums)
    const transformedUsers = allUsers.map(transformUserToFrontend)

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create new user (admin only)
 */
export async function POST(request: Request) {
  try {
    // Check admin authorization
    const { error, session } = await requireAdmin()
    if (error) return error

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password, role, vacationDays } = validationResult.data

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Diese E-Mail wird bereits verwendet' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert new user (map role to database format)
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role: mapRoleToDatabase(role),
        vacationDays,
        status: 'aktiv', // Default status
      })
      .returning()

    // Transform to frontend format
    const transformedUser = transformUserToFrontend(newUser)

    return NextResponse.json(
      { success: true, user: transformedUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
