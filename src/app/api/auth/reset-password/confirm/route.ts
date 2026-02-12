import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users, passwordResetTokens } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { hashPassword } from '@/lib/auth'

// Validation schema
const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token ist erforderlich'),
  password: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .max(100, 'Passwort ist zu lang'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['passwordConfirm'],
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = confirmResetSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    // Find token in database
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1)

    // Check if token exists
    if (!resetToken) {
      return NextResponse.json(
        {
          error: 'Ungültiger Link. Bitte fordere einen neuen Link an.',
        },
        { status: 400 }
      )
    }

    // Check if token has been used
    if (resetToken.used) {
      return NextResponse.json(
        {
          error: 'Dieser Link wurde bereits verwendet. Bitte fordere einen neuen Link an.',
        },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        {
          error: 'Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an.',
        },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash,
        passwordChangedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId))

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id))

    return NextResponse.json({
      message: 'Passwort wurde erfolgreich geändert. Du kannst dich jetzt einloggen.',
    })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify token validity (optional, for UX)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token ist erforderlich' }, { status: 400 })
    }

    // Find token in database
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1)

    // Check token validity
    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'invalid' })
    }

    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: 'used' })
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ valid: false, error: 'expired' })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
