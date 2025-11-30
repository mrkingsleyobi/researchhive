/**
 * Base Agent Class
 *
 * Abstract base class for all research agents.
 * Provides common functionality for searching, error handling, and rate limiting.
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  author?: string;
  relevanceScore?: number;
  credibilityScore?: number;
}

export interface AgentConfig {
  maxResults?: number;
  timeout?: number;
  retryAttempts?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export abstract class BaseAgent {
  protected name: string;
  protected config: AgentConfig;
  protected requestCount: { minute: number; hour: number } = { minute: 0, hour: 0 };
  protected lastRequestTime: number = 0;

  constructor(name: string, config: AgentConfig = {}) {
    this.name = name;
    this.config = {
      maxResults: config.maxResults || 10,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      rateLimit: config.rateLimit || {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
      },
    };
  }

  /**
   * Abstract method to be implemented by each agent
   */
  abstract search(query: string, options?: any): Promise<SearchResult[]>;

  /**
   * Check if rate limit allows making a request
   */
  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Reset counters if enough time has passed
    if (timeSinceLastRequest > 60000) {
      this.requestCount.minute = 0;
    }
    if (timeSinceLastRequest > 3600000) {
      this.requestCount.hour = 0;
    }

    // Check rate limits
    if (this.requestCount.minute >= this.config.rateLimit!.requestsPerMinute) {
      const waitTime = 60000 - timeSinceLastRequest;
      if (waitTime > 0) {
        console.log(`[${this.name}] Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.requestCount.minute = 0;
    }

    if (this.requestCount.hour >= this.config.rateLimit!.requestsPerHour) {
      throw new Error(`${this.name}: Hourly rate limit exceeded`);
    }

    this.requestCount.minute++;
    this.requestCount.hour++;
    this.lastRequestTime = now;
  }

  /**
   * Retry logic for failed requests
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    attemptNumber: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attemptNumber < this.config.retryAttempts!) {
        const waitTime = Math.pow(2, attemptNumber) * 1000; // Exponential backoff
        console.log(`[${this.name}] Retry attempt ${attemptNumber + 1} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.retry(fn, attemptNumber + 1);
      }
      throw error;
    }
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return {
      name: this.name,
      requestsThisMinute: this.requestCount.minute,
      requestsThisHour: this.requestCount.hour,
    };
  }
}
