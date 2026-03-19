import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (sufficient for single-instance dev; use Redis in prod)
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  limit: number
  windowMs: number
}

/**
 * Returns a 429 response if the IP has exceeded the rate limit.
 * Returns null if the request is allowed.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const key = `${req.nextUrl.pathname}:${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  entry.count++

  if (entry.count > options.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    )
  }

  return null
}

// Cleanup stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 60_000)
}
