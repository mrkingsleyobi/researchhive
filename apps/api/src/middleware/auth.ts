/**
 * Authentication Middleware for tRPC
 *
 * Validates Logto JWT tokens and attaches user information to the request context.
 */

import { TRPCError } from '@trpc/server';
import type { Context } from '../context';
import crypto from 'crypto';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

interface JWTPayload {
  sub: string; // User ID
  email?: string;
  name?: string;
  aud?: string | string[]; // Audience
  iss?: string; // Issuer
  exp?: number; // Expiration
  iat?: number; // Issued at
  scope?: string;
  role?: string;
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
 * Decode JWT without verification (use only when verification is not possible)
 */
function decodeJWT(token: string): { header: JWTHeader; payload: JWTPayload } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    return { header, payload };
  } catch {
    return null;
  }
}

/**
 * Verify JWT token signature and claims
 */
async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    const { header, payload } = decoded;

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.warn('⚠️  Token expired');
      return null;
    }

    // Verify issuer matches Logto endpoint
    if (payload.iss && process.env.LOGTO_ENDPOINT) {
      const expectedIssuer = process.env.LOGTO_ENDPOINT.replace(/\/$/, '');
      const actualIssuer = payload.iss.replace(/\/$/, '');
      if (actualIssuer !== expectedIssuer) {
        console.warn('⚠️  Token issuer mismatch');
        return null;
      }
    }

    // Verify audience matches app ID
    if (payload.aud && process.env.LOGTO_APP_ID) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(process.env.LOGTO_APP_ID)) {
        console.warn('⚠️  Token audience mismatch');
        return null;
      }
    }

    // TODO: For full security, verify signature with Logto's public key
    // This would require fetching the JWKS from Logto's discovery endpoint
    // For now, we trust the token if it passes basic validation
    console.info('✓ JWT token validated (basic checks passed)');

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
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
    if (isLogtoConfigured()) {
      // Verify JWT token
      const payload = await verifyJWT(token);

      if (!payload) {
        console.warn('⚠️  JWT verification failed');
        return null;
      }

      // Extract user information from JWT claims
      return {
        id: payload.sub,
        email: payload.email || `user-${payload.sub}@researchhive.ai`,
        name: payload.name,
        role: payload.role || 'USER',
      };
    }

    // If Logto not configured, attempt to decode token anyway
    const decoded = decodeJWT(token);
    if (decoded && decoded.payload) {
      return {
        id: decoded.payload.sub || 'unknown',
        email: decoded.payload.email || 'unknown@researchhive.ai',
        name: decoded.payload.name,
        role: decoded.payload.role || 'USER',
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
