import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users, loginAttempts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, signJWT, setSessionCookie } from '@/lib/auth'
import { checkLoginRateLimit, getClientIP } from '@/lib/rate-limit'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
  rememberMe: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ipAddress = getClientIP(request)

    // Check rate limit
    const rateLimitResult = await checkLoginRateLimit(ipAddress)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Zu viele fehlgeschlagene Versuche. Bitte versuche es in 5 Minuten erneut.',
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { email, password, rememberMe } = validationResult.data

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // Log failed attempt
    const logAttempt = async (successful: boolean) => {
      await db.insert(loginAttempts).values({
        ipAddress,
        email: email.toLowerCase(),
        successful,
      })
    }

    // Check if user exists
    if (!user) {
      await logAttempt(false)
      return NextResponse.json(
        { error: 'E-Mail oder Passwort falsch' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (user.status === 'deaktiviert') {
      await logAttempt(false)
      return NextResponse.json(
        {
          error: 'Dein Account wurde deaktiviert. Bitte kontaktiere den Administrator.',
        },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      await logAttempt(false)
      return NextResponse.json(
        { error: 'E-Mail oder Passwort falsch' },
        { status: 401 }
      )
    }

    // Log successful attempt
    await logAttempt(true)

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    // Create JWT token
    const token = await signJWT(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      rememberMe
    )

    // Set session cookie
    await setSessionCookie(token, rememberMe)

    // Return user data (without password hash)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
