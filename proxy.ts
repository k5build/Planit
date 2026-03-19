import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth-config'

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/e/',
  '/api/auth',
  '/_next',
  '/favicon.ico',
]

const ADMIN_PATHS = ['/dashboard/admin', '/api/admin']

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === '/'
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p))
}

// Use auth() as middleware — this works in Edge Runtime without db
export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const response = NextResponse.next()
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  if (isPublicPath(pathname)) return response

  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    const redirect = NextResponse.redirect(loginUrl)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      redirect.headers.set(key, value)
    }
    return redirect
  }

  if (isAdminPath(pathname) && session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
