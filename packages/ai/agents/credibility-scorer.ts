/**
 * Source Credibility Scorer
 *
 * Evaluates the credibility of sources based on multiple factors:
 * - Domain reputation
 * - Publication type
 * - Citation count (for academic sources)
 * - Author reputation
 * - Recency
 */

import type { SearchResult } from './base-agent';

export interface CredibilityFactors {
  domainReputation: number; // 0-1
  publicationType: number; // 0-1
  citationCount?: number;
  authorReputation?: number; // 0-1
  recency: number; // 0-1
}

export interface ScoredResult extends SearchResult {
  credibilityScore: number;
  credibilityFactors?: CredibilityFactors;
}

export class CredibilityScorer {
  // High-reputation academic domains
  private static ACADEMIC_DOMAINS = [
    'arxiv.org',
    'ncbi.nlm.nih.gov',
    'pubmed.ncbi.nlm.nih.gov',
    'semanticscholar.org',
    'scholar.google.com',
    'ieee.org',
    'acm.org',
    'nature.com',
    'science.org',
    'springer.com',
    'sciencedirect.com',
  ];

  // High-reputation news domains
  private static NEWS_DOMAINS = [
    'bbc.com',
    'reuters.com',
    'apnews.com',
    'npr.org',
    'theguardian.com',
    'nytimes.com',
    'washingtonpost.com',
    'wsj.com',
    'economist.com',
    'ft.com',
  ];

  // Medium-reputation tech domains
  private static TECH_DOMAINS = [
    'techcrunch.com',
    'wired.com',
    'arstechnica.com',
    'theverge.com',
    'zdnet.com',
    'cnet.com',
  ];

  /**
   * Score a single search result
   */
  static scoreResult(result: SearchResult): ScoredResult {
    const factors: CredibilityFactors = {
      domainReputation: this.scoreDomainReputation(result),
      publicationType: this.scorePublicationType(result),
      recency: this.scoreRecency(result),
    };

    // Calculate weighted average
    const weights = {
      domainReputation: 0.40,
      publicationType: 0.30,
      recency: 0.30,
    };

    const credibilityScore =
      factors.domainReputation * weights.domainReputation +
      factors.publicationType * weights.publicationType +
      factors.recency * weights.recency;

    return {
      ...result,
      credibilityScore: Math.round(credibilityScore * 100), // Convert to 0-100
      credibilityFactors: factors,
    };
  }

  /**
   * Score multiple results and sort by credibility
   */
  static scoreResults(results: SearchResult[]): ScoredResult[] {
    return results
      .map(result => this.scoreResult(result))
      .sort((a, b) => b.credibilityScore - a.credibilityScore);
  }

  /**
   * Score domain reputation
   */
  private static scoreDomainReputation(result: SearchResult): number {
    try {
      const url = new URL(result.url);
      const domain = url.hostname.toLowerCase().replace(/^www\./, '');

      // Academic domains get highest score
      if (this.ACADEMIC_DOMAINS.some(d => domain.includes(d))) {
        return 1.0;
      }

      // High-reputation news
      if (this.NEWS_DOMAINS.some(d => domain.includes(d))) {
        return 0.9;
      }

      // Tech news
      if (this.TECH_DOMAINS.some(d => domain.includes(d))) {
        return 0.8;
      }

      // Government domains
      if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
        return 0.85;
      }

      // Organization domains
      if (domain.endsWith('.org')) {
        return 0.7;
      }

      // Social media platforms (lower credibility for individual posts)
      if (domain.includes('reddit.com') || domain.includes('twitter.com')) {
        return 0.5;
      }

      // Default for unknown domains
      return 0.6;
    } catch {
      return 0.5; // Invalid URL
    }
  }

  /**
   * Score publication type
   */
  private static scorePublicationType(result: SearchResult): number {
    const source = result.source.toLowerCase();

    // Academic papers
    if (source.includes('arxiv') || source.includes('pubmed') || source.includes('semantic scholar')) {
      return 1.0;
    }

    // News articles
    if (source.includes('news') || source.includes('bbc') || source.includes('reuters')) {
      return 0.8;
    }

    // Social media
    if (source.includes('reddit') || source.includes('twitter') || source.includes('hacker news')) {
      return 0.6;
    }

    // General web
    return 0.7;
  }

  /**
   * Score recency (newer is better)
   */
  private static scoreRecency(result: SearchResult): number {
    if (!result.publishedDate) {
      return 0.5; // No date = medium score
    }

    try {
      const publishedDate = new Date(result.publishedDate);
      const now = new Date();
      const ageInDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

      // Scoring based on age
      if (ageInDays < 7) return 1.0; // Within a week
      if (ageInDays < 30) return 0.9; // Within a month
      if (ageInDays < 90) return 0.8; // Within 3 months
      if (ageInDays < 180) return 0.7; // Within 6 months
      if (ageInDays < 365) return 0.6; // Within a year
      if (ageInDays < 730) return 0.5; // Within 2 years
      return 0.4; // Older than 2 years
    } catch {
      return 0.5; // Invalid date
    }
  }

  /**
   * Filter results by minimum credibility score
   */
  static filterByCredibility(results: ScoredResult[], minScore: number = 60): ScoredResult[] {
    return results.filter(result => result.credibilityScore >= minScore);
  }

  /**
   * Get credibility statistics for a set of results
   */
  static getStatistics(results: ScoredResult[]) {
    if (results.length === 0) {
      return {
        count: 0,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        highCredibility: 0,
        mediumCredibility: 0,
        lowCredibility: 0,
      };
    }

    const scores = results.map(r => r.credibilityScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    return {
      count: results.length,
      averageScore: Math.round(averageScore),
      minScore,
      maxScore,
      highCredibility: results.filter(r => r.credibilityScore >= 80).length,
      mediumCredibility: results.filter(r => r.credibilityScore >= 60 && r.credibilityScore < 80).length,
      lowCredibility: results.filter(r => r.credibilityScore < 60).length,
    };
  }
}
