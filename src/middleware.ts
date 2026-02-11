import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin']

// Routes only accessible by admins
const adminRoutes = ['/admin']

// Public routes (no authentication required)
const publicRoutes = ['/login', '/reset-password', '/', '/api/auth/login', '/api/auth/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get session token from cookie
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie?.value) {
    // No session - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT token
  const session = await verifyJWT(sessionCookie.value)

  if (!session) {
    // Invalid session - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('message', 'Deine Session ist abgelaufen. Bitte logge dich erneut ein.')
    return NextResponse.redirect(loginUrl)
  }

  // Check admin-only routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isAdminRoute && session.role !== 'admin') {
    // Non-admin trying to access admin route - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // User is authenticated and authorized
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
