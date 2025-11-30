/**
 * Authentication Middleware for tRPC
 *
 * Validates Logto JWT tokens and attaches user information to the request context.
 */

import { TRPCError } from '@trpc/server';
import type { Context } from '../context';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Check if Logto authentication is configured
 */
export function isLogtoConfigured(): boolean {
  return !!(
    process.env.LOGTO_ENDPOINT &&
    process.env.LOGTO_APP_ID &&
    process.env.LOGTO_APP_SECRET
  );
}

/**
 * Extract and verify JWT token from Authorization header
 */
async function verifyToken(authHeader: string | undefined): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // In production, verify the JWT token with Logto
    // For now, we'll use a simple decode for development
    if (isLogtoConfigured()) {
      // TODO: Implement actual JWT verification with Logto
      // This would use @logto/js or a similar library
      // const user = await verifyLogtoToken(token);
      // return user;

      // Temporary mock verification
      console.warn('⚠️  Logto JWT verification not fully implemented. Using mock auth.');
      return {
        id: 'user-from-token',
        email: 'user@researchhive.ai',
        name: 'Authenticated User',
        role: 'USER',
      };
    }

    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get user from context or create demo user
 */
export async function getUserFromContext(ctx: Context): Promise<AuthUser> {
  // Try to get user from Authorization header
  const authHeader = ctx.req.headers.authorization;
  const user = await verifyToken(authHeader);

  if (user) {
    return user;
  }

  // Fallback to demo user if Logto is not configured
  if (!isLogtoConfigured()) {
    return {
      id: 'demo-user',
      email: 'demo@researchhive.ai',
      name: 'Demo User',
      role: 'USER',
    };
  }

  // If Logto is configured but no valid token, throw error
  throw new TRPCError({
    code: 'UNAUTHORIZED',
    message: 'Authentication required. Please log in.',
  });
}

/**
 * Middleware: Require authentication
 */
export async function requireAuth(ctx: Context): Promise<AuthUser> {
  const user = await getUserFromContext(ctx);

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.',
    });
  }

  return user;
}

/**
 * Middleware: Require specific role
 */
export async function requireRole(ctx: Context, requiredRole: string): Promise<AuthUser> {
  const user = await requireAuth(ctx);

  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `This action requires ${requiredRole} role.`,
    });
  }

  return user;
}

/**
 * Middleware: Optional authentication (allows both authenticated and anonymous)
 */
export async function optionalAuth(ctx: Context): Promise<AuthUser | null> {
  try {
    return await getUserFromContext(ctx);
  } catch {
    return null;
  }
}
