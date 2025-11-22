import { handleAuthRoutes } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { NextRequest } from 'next/server';

/**
 * Logto authentication route handler
 * Handles: /api/logto/sign-in, /api/logto/sign-out, /api/logto/callback
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { logto: string[] } }
) {
  return handleAuthRoutes(logtoConfig)(request, { params });
}
