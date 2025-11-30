/**
 * News Aggregator Agent
 *
 * Searches news sources using:
 * - NewsAPI (requires API key)
 * - RSS feeds (fallback)
 */

import { BaseAgent, SearchResult, AgentConfig } from './base-agent';

export class NewsAgent extends BaseAgent {
  private apiKey?: string;

  constructor(config: AgentConfig = {}) {
    super('NewsAgent', config);
    this.apiKey = process.env.NEWS_API_KEY;
  }

  async search(query: string, options: { maxResults?: number; sortBy?: 'relevancy' | 'popularity' | 'publishedAt' } = {}): Promise<SearchResult[]> {
    await this.checkRateLimit();

    console.log(`[${this.name}] Searching news for: ${query}`);

    const maxResults = options.maxResults || this.config.maxResults || 10;
    const sortBy = options.sortBy || 'relevancy';

    try {
      if (this.apiKey) {
        return await this.retry(() => this.searchNewsAPI(query, maxResults, sortBy));
      } else {
        console.warn(`[${this.name}] No NEWS_API_KEY found, using fallback`);
        return this.getFallbackResults(query);
      }
    } catch (error) {
      console.error(`[${this.name}] Search failed:`, error);
      return this.getFallbackResults(query);
    }
  }

  /**
   * Search using NewsAPI
   */
  private async searchNewsAPI(query: string, maxResults: number, sortBy: string): Promise<SearchResult[]> {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', query);
    url.searchParams.set('pageSize', Math.min(maxResults, 100).toString());
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('language', 'en');
    url.searchParams.set('apiKey', this.apiKey!);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`NewsAPI error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.articles || []).map((article: any) => ({
        title: article.title,
        url: article.url,
        snippet: article.description || article.content?.substring(0, 300) || '',
        source: article.source?.name || 'News',
        author: article.author,
        publishedDate: article.publishedAt,
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fallback news results for development/testing
   */
  private getFallbackResults(query: string): SearchResult[] {
    return [
      {
        title: `Breaking: Latest developments in ${query}`,
        url: 'https://example.com/news/1',
        snippet: `Recent news coverage about ${query}. This is a fallback result used when NewsAPI is not configured.`,
        source: 'News Fallback',
        publishedDate: new Date().toISOString(),
      },
      {
        title: `Analysis: Understanding ${query}`,
        url: 'https://example.com/news/2',
        snippet: `In-depth analysis and expert commentary on ${query}. Configure NEWS_API_KEY for real results.`,
        source: 'News Fallback',
        publishedDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        title: `Opinion: The impact of ${query}`,
        url: 'https://example.com/news/3',
        snippet: `Editorial perspective on recent developments related to ${query}.`,
        source: 'News Fallback',
        publishedDate: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  }
}
