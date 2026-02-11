import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// JWT Secret (must be at least 32 characters)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-long-change-in-production'
)

// Session duration
const SESSION_DURATION = {
  DEFAULT: 7 * 24 * 60 * 60, // 7 days in seconds
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days in seconds
}

export type JWTPayload = {
  userId: string
  email: string
  role: 'mitarbeiter' | 'admin'
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12) // Cost factor 12
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Sign a JWT token
 */
export async function signJWT(
  payload: JWTPayload,
  rememberMe: boolean = false
): Promise<string> {
  const expiresIn = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(JWT_SECRET)
}

/**
 * Verify a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies()
  const maxAge = rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/',
  })
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie?.value) {
    return null
  }

  return verifyJWT(sessionCookie.value)
}

/**
 * Delete session cookie (logout)
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Generate a secure random token (for password reset)
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
