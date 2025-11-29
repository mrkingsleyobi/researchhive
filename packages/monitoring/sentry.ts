/**
 * Sentry Error Tracking and Performance Monitoring
 * Centralized error tracking for API and Web applications
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  enabled?: boolean;
}

/**
 * Initialize Sentry for Node.js applications (API)
 */
export function initializeSentryNode(config: SentryConfig = {}) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    release = process.env.SENTRY_RELEASE || 'researchhive@1.0.0',
    tracesSampleRate = environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate = environment === 'production' ? 0.1 : 1.0,
    enabled = !!dsn && environment !== 'development',
  } = config;

  if (!enabled) {
    console.log('⚠️  Sentry disabled (no DSN or development mode)');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate,
    profilesSampleRate,
    integrations: [
      new ProfilingIntegration(),
    ],
    beforeSend(event, hint) {
      // Filter out non-errors
      if (event.level === 'info' || event.level === 'debug') {
        return null;
      }

      // Add custom context
      if (event.user) {
        event.user.ip_address = undefined; // Privacy: don't track IPs
      }

      return event;
    },
  });

  console.log(`✅ Sentry initialized (${environment})`);
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

/**
 * Flush events (call before shutdown)
 */
export async function flush(timeout: number = 2000): Promise<boolean> {
  return await Sentry.flush(timeout);
}

/**
 * Close Sentry client
 */
export async function close(timeout: number = 2000): Promise<boolean> {
  return await Sentry.close(timeout);
}

export { Sentry };
