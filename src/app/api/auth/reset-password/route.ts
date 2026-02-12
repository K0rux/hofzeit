import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { users, passwordResetTokens } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateSecureToken } from '@/lib/auth'
import { checkPasswordResetRateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/components'
import PasswordResetEmail from '@/emails/password-reset'

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = resetPasswordSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Validierungsfehler' },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Check rate limit
    const rateLimitResult = await checkPasswordResetRateLimit(email.toLowerCase())
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Zu viele Anfragen. Bitte warte 15 Minuten.',
        },
        { status: 429 }
      )
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // SECURITY: Always return success message (prevent user enumeration)
    const successMessage =
      'Falls ein Account mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt.'

    // If user doesn't exist, return success (but don't send email)
    if (!user) {
      return NextResponse.json({ message: successMessage })
    }

    // Check if account is active
    if (user.status === 'deaktiviert') {
      // Don't reveal that account is deactivated
      return NextResponse.json({ message: successMessage })
    }

    // Generate secure token
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    // Create reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password/confirm?token=${token}`

    // Send email
    try {
      const emailHtml = await render(
        PasswordResetEmail({
          resetLink,
          email: user.email,
        })
      )

      await sendEmail({
        to: user.email,
        subject: 'Passwort zurücksetzen - HofZeit',
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // SECURITY: Don't reveal email sending failure to user
      // Log error but return success message
    }

    return NextResponse.json({ message: successMessage })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
