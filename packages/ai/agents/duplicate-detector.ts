/**
 * Duplicate Detection Service
 *
 * Detects and removes duplicate search results based on:
 * - URL similarity
 * - Title similarity (Levenshtein distance)
 * - Content similarity
 */

import type { SearchResult } from './base-agent';

export class DuplicateDetector {
  /**
   * Remove duplicate results from a list
   */
  static removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Map<string, SearchResult>();
    const deduplicated: SearchResult[] = [];

    for (const result of results) {
      // Normalize URL for comparison
      const normalizedUrl = this.normalizeUrl(result.url);

      // Check if we've seen this URL before
      if (seen.has(normalizedUrl)) {
        continue;
      }

      // Check for title similarity with existing results
      const isDuplicate = Array.from(seen.values()).some(existing => {
        return this.isTitleSimilar(result.title, existing.title, 0.85);
      });

      if (!isDuplicate) {
        seen.set(normalizedUrl, result);
        deduplicated.push(result);
      }
    }

    return deduplicated;
  }

  /**
   * Normalize URL for comparison
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // Remove www prefix
      let hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');

      // Remove trailing slash
      let pathname = urlObj.pathname.replace(/\/$/, '');

      // Remove common tracking parameters
      const cleanParams = new URLSearchParams();
      for (const [key, value] of urlObj.searchParams) {
        if (!this.isTrackingParam(key)) {
          cleanParams.set(key, value);
        }
      }

      const params = cleanParams.toString();
      return `${hostname}${pathname}${params ? '?' + params : ''}`;
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Check if a URL parameter is likely a tracking parameter
   */
  private static isTrackingParam(param: string): boolean {
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'source',
      '_ga',
    ];
    return trackingParams.includes(param.toLowerCase());
  }

  /**
   * Check if two titles are similar using Levenshtein distance
   */
  private static isTitleSimilar(title1: string, title2: string, threshold: number = 0.85): boolean {
    const normalized1 = title1.toLowerCase().trim();
    const normalized2 = title2.toLowerCase().trim();

    // Exact match
    if (normalized1 === normalized2) {
      return true;
    }

    // Calculate similarity using Levenshtein distance
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create a 2D array for dynamic programming
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    // Fill the DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Group similar results together
   */
  static groupSimilarResults(results: SearchResult[]): SearchResult[][] {
    const groups: SearchResult[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < results.length; i++) {
      if (processed.has(i)) continue;

      const group: SearchResult[] = [results[i]];
      processed.add(i);

      for (let j = i + 1; j < results.length; j++) {
        if (processed.has(j)) continue;

        if (this.isTitleSimilar(results[i].title, results[j].title, 0.8)) {
          group.push(results[j]);
          processed.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Merge duplicate results, keeping the best one
   */
  static mergeDuplicates(results: SearchResult[]): SearchResult[] {
    const groups = this.groupSimilarResults(results);

    return groups.map(group => {
      if (group.length === 1) {
        return group[0];
      }

      // Keep the result with highest credibility score, or first one if no scores
      return group.reduce((best, current) => {
        const bestScore = (best as any).credibilityScore || 0;
        const currentScore = (current as any).credibilityScore || 0;
        return currentScore > bestScore ? current : best;
      });
    });
  }

  /**
   * Get duplicate statistics
   */
  static getStatistics(original: SearchResult[], deduplicated: SearchResult[]) {
    return {
      original: original.length,
      deduplicated: deduplicated.length,
      duplicatesRemoved: original.length - deduplicated.length,
      deduplicationRate: original.length > 0
        ? ((original.length - deduplicated.length) / original.length * 100).toFixed(1) + '%'
        : '0%',
    };
  }
}
