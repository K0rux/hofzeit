import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * Require admin role for API route
 * Returns error response if not admin, otherwise returns session
 */
export async function requireAdmin() {
  const session = await getSession()

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 }),
      session: null,
    }
  }

  if (session.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Nur Admins haben Zugriff auf diese Funktion' },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Map database role to frontend role
 */
export function mapRoleToFrontend(dbRole: 'mitarbeiter' | 'admin'): 'employee' | 'admin' {
  return dbRole === 'mitarbeiter' ? 'employee' : 'admin'
}

/**
 * Map frontend role to database role
 */
export function mapRoleToDatabase(frontendRole: 'employee' | 'admin'): 'mitarbeiter' | 'admin' {
  return frontendRole === 'employee' ? 'mitarbeiter' : 'admin'
}

/**
 * Map database status to frontend status
 */
export function mapStatusToFrontend(dbStatus: 'aktiv' | 'deaktiviert'): 'active' | 'inactive' {
  return dbStatus === 'aktiv' ? 'active' : 'inactive'
}

/**
 * Map frontend status to database status
 */
export function mapStatusToDatabase(frontendStatus: 'active' | 'inactive'): 'aktiv' | 'deaktiviert' {
  return frontendStatus === 'active' ? 'aktiv' : 'deaktiviert'
}

/**
 * Transform database user to frontend user format
 */
export function transformUserToFrontend(dbUser: any) {
  return {
    id: dbUser.id,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
    role: mapRoleToFrontend(dbUser.role),
    status: mapStatusToFrontend(dbUser.status),
    vacationDays: dbUser.vacationDays,
    createdAt: dbUser.createdAt.toISOString(),
    updatedAt: dbUser.updatedAt.toISOString(),
  }
}
