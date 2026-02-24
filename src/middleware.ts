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

  // For now, check localStorage token (this will be replaced with cookie-based auth)
  // Note: In a proper implementation, you should validate the token with your backend
  const token = request.cookies.get('auth_token')

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
