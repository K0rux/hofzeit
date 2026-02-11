import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory rate limiter for development/testing
class InMemoryRateLimiter {
  private cache: Map<string, { count: number; resetAt: number }> = new Map()

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    // Clean up expired entries
    if (entry && entry.resetAt < now) {
      this.cache.delete(identifier)
    }

    const currentEntry = this.cache.get(identifier)

    if (!currentEntry) {
      // First request
      this.cache.set(identifier, {
        count: 1,
        resetAt: now + window * 1000,
      })
      return { success: true, remaining: limit - 1, reset: now + window * 1000 }
    }

    if (currentEntry.count >= limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0, reset: currentEntry.resetAt }
    }

    // Increment count
    currentEntry.count++
    return {
      success: true,
      remaining: limit - currentEntry.count,
      reset: currentEntry.resetAt,
    }
  }
}

// Create rate limiter instances
let loginRateLimiter: Ratelimit | InMemoryRateLimiter
let passwordResetRateLimiter: Ratelimit | InMemoryRateLimiter

// Initialize rate limiters
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash Redis for production
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  loginRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
  })

  passwordResetRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 requests per 15 minutes
    analytics: true,
  })
} else {
  // Use in-memory cache for development
  console.warn('⚠️ Using in-memory rate limiting (not recommended for production)')
  loginRateLimiter = new InMemoryRateLimiter()
  passwordResetRateLimiter = new InMemoryRateLimiter()
}

/**
 * Check login rate limit (5 attempts per minute per IP)
 */
export async function checkLoginRateLimit(ipAddress: string) {
  if (loginRateLimiter instanceof InMemoryRateLimiter) {
    return loginRateLimiter.limit(ipAddress, 5, 60) // 5 per 60 seconds
  }
  return loginRateLimiter.limit(ipAddress)
}

/**
 * Check password reset rate limit (3 attempts per 15 minutes per email)
 */
export async function checkPasswordResetRateLimit(email: string) {
  if (passwordResetRateLimiter instanceof InMemoryRateLimiter) {
    return passwordResetRateLimiter.limit(email, 3, 15 * 60) // 3 per 15 minutes
  }
  return passwordResetRateLimiter.limit(email)
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to generic identifier
  return 'unknown'
}
