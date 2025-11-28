import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect dashboard routes with Logto authentication
 *
 * In demo mode (when LOGTO_APP_ID = 'researchhive-app'), authentication is bypassed.
 * In production mode, users must authenticate via Logto.
 */
export function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/logto');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api') && !isAuthRoute;

  // Skip middleware for auth routes and non-protected routes
  if (!isProtectedRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Check if we're in demo mode
  const isDemoMode = process.env.LOGTO_APP_ID === 'researchhive-app' ||
                     !process.env.LOGTO_APP_ID ||
                     process.env.LOGTO_APP_ID === 'your-app-id';

  if (isDemoMode) {
    // Demo mode: Allow access without authentication
    const response = NextResponse.next();
    response.headers.set('X-Demo-Mode', 'true');
    return response;
  }

  // Production mode: Check authentication
  // In a real implementation, you would check the Logto session cookie here
  const logtoSession = request.cookies.get('logto_session');

  if (!logtoSession) {
    // No session found, redirect to sign-in
    const signInUrl = new URL('/api/logto/sign-in', request.url);
    signInUrl.searchParams.set('redirect_uri', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
