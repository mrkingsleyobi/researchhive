/**
 * Authentication utilities for getting user information
 */

import { cookies, headers } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

/**
 * Get the current user from the session
 * In demo mode, returns a demo user
 * In production, retrieves from Logto session
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check if we're in demo mode
  const isDemoMode = process.env.LOGTO_APP_ID === 'researchhive-app' ||
                     !process.env.LOGTO_APP_ID ||
                     process.env.LOGTO_APP_ID === 'your-app-id';

  if (isDemoMode) {
    // Return demo user
    return {
      id: 'demo-user-id',
      email: 'demo@researchhive.ai',
      name: 'Demo User',
      role: 'USER',
    };
  }

  // In production, check for Logto session
  // This would integrate with Logto's session management
  try {
    const cookieStore = cookies();
    const logtoSession = cookieStore.get('logto_session');

    if (!logtoSession) {
      return null;
    }

    // In a real implementation, you would decode and validate the session
    // For now, return a placeholder that indicates authentication is required
    return {
      id: 'authenticated-user',
      email: 'user@example.com',
      name: 'Authenticated User',
      role: 'USER',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get the demo mode status
 */
export function isDemoMode(): boolean {
  return process.env.LOGTO_APP_ID === 'researchhive-app' ||
         !process.env.LOGTO_APP_ID ||
         process.env.LOGTO_APP_ID === 'your-app-id';
}
