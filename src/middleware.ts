import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/landing',
  '/home',
  '/about',
  '/business-divisions',
  '/gallery',
]

// Define routes that should redirect to dashboard if authenticated
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  // Special case for root path - exact match only
  const isRootPath = pathname === '/'
  const isPublicRoute = isRootPath || PUBLIC_ROUTES.some(route => route !== '/' && pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  // The auth cookie is written at login with the refresh token's expiry, so
  // the browser drops it the moment the session becomes unrecoverable. That
  // makes a simple presence check an accurate session check here, and it runs
  // on every navigation - hard refresh, link click, or direct URL - so an
  // expired user never reaches a protected page.
  const token = request.cookies.get('auth_token')

  // Outlives the session, so its presence without an auth cookie means the
  // session lapsed rather than the user never having signed in.
  const hadSession = request.cookies.get('had_session')

  // Allow public routes
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to dashboard if already authenticated and trying to access auth routes
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect to login if trying to access protected route without token
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    if (hadSession) {
      loginUrl.searchParams.set('session_expired', 'true')
    }
    return NextResponse.redirect(loginUrl)
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Additional security headers (these supplement the ones in next.config.js)
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
