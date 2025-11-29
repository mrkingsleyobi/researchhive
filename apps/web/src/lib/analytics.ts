/**
 * Analytics Integration
 * PostHog for product analytics and feature flags
 */

'use client';

import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      console.warn('⚠️  PostHog API key not found. Analytics disabled.');
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.opt_out_capturing(); // Disable in development
          console.log('📊 PostHog initialized (capturing disabled in development)');
        } else {
          console.log('📊 PostHog initialized');
        }
      },
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      autocapture: false, // Manual event tracking for better control
    });
  }
}

/**
 * Track pageview
 */
export function trackPageview(path?: string) {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      $current_url: path || window.location.href,
    });
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}

/**
 * Reset user session
 */
export function resetUser() {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.people.set(properties);
  }
}

/**
 * Track research events
 */
export const ResearchAnalytics = {
  started: (researchId: string, topic: string, depth: string) => {
    trackEvent('research_started', { researchId, topic, depth });
  },

  completed: (researchId: string, duration: number, sourcesFound: number) => {
    trackEvent('research_completed', { researchId, duration, sourcesFound });
  },

  failed: (researchId: string, error: string) => {
    trackEvent('research_failed', { researchId, error });
  },

  exported: (researchId: string, format: string) => {
    trackEvent('research_exported', { researchId, format });
  },
};

/**
 * Track UI interactions
 */
export const UIAnalytics = {
  buttonClick: (buttonName: string, location: string) => {
    trackEvent('button_clicked', { buttonName, location });
  },

  modalOpened: (modalName: string) => {
    trackEvent('modal_opened', { modalName });
  },

  featureUsed: (featureName: string) => {
    trackEvent('feature_used', { featureName });
  },
};

/**
 * Track errors
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent('error_occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Get feature flag value
 */
export function isFeatureEnabled(flagName: string): boolean {
  if (typeof window !== 'undefined') {
    return posthog.isFeatureEnabled(flagName) || false;
  }
  return false;
}

/**
 * Get feature flag variant
 */
export function getFeatureVariant(flagName: string): string | boolean {
  if (typeof window !== 'undefined') {
    return posthog.getFeatureFlag(flagName) || false;
  }
  return false;
}

export { posthog };
