import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'artbox_session'

// Routes that require authentication
const protectedRoutes = ['/admin']
const publicAdminRoutes = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  // Check if this is a protected admin route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if this is a public admin route (like login)
  const isPublicAdminRoute = publicAdminRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  // If it's a protected route and not a public admin route
  if (isProtectedRoute && !isPublicAdminRoute) {
    // No session cookie - redirect to login
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is logged in and trying to access login page, redirect to admin
  if (isPublicAdminRoute && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)'
  ]
}
