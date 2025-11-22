import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect dashboard routes
 *
 * For now, this is a placeholder. Once Logto is fully configured with real credentials,
 * you can use Logto's middleware to protect routes:
 *
 * import { withLogtoApiRoute } from '@logto/next/server-actions';
 *
 * For demo purposes, we're allowing all requests to pass through.
 */
export function middleware(request: NextRequest) {
  // TODO: Add Logto authentication check when using real credentials
  // For now, allow all requests

  // Example of how to protect routes (commented out for demo):
  /*
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/logto');

  if (isProtectedRoute && !isAuthRoute) {
    // Check if user is authenticated
    // If not, redirect to sign-in
    // return NextResponse.redirect(new URL('/api/logto/sign-in', request.url));
  }
  */

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
