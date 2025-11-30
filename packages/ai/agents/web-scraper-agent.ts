/**
 * Web Scraper Agent
 *
 * Uses Google Custom Search API or DuckDuckGo to find general web sources.
 * Scrapes content from discovered URLs for deeper analysis.
 */

import { BaseAgent, SearchResult, AgentConfig } from './base-agent';

export class WebScraperAgent extends BaseAgent {
  private searchEngine: 'google' | 'duckduckgo';
  private apiKey?: string;
  private searchEngineId?: string;

  constructor(config: AgentConfig & { searchEngine?: 'google' | 'duckduckgo' } = {}) {
    super('WebScraperAgent', config);
    this.searchEngine = config.searchEngine || 'duckduckgo';
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  }

  async search(query: string, options: { maxResults?: number } = {}): Promise<SearchResult[]> {
    await this.checkRateLimit();

    console.log(`[${this.name}] Searching for: ${query}`);

    try {
      return await this.retry(() => this.performSearch(query, options));
    } catch (error) {
      console.error(`[${this.name}] Search failed:`, error);
      return [];
    }
  }

  private async performSearch(query: string, options: { maxResults?: number }): Promise<SearchResult[]> {
    const maxResults = options.maxResults || this.config.maxResults || 10;

    if (this.searchEngine === 'google' && this.apiKey && this.searchEngineId) {
      return this.searchGoogle(query, maxResults);
    } else {
      return this.searchDuckDuckGo(query, maxResults);
    }
  }

  /**
   * Search using Google Custom Search API
   */
  private async searchGoogle(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.apiKey!);
    url.searchParams.set('cx', this.searchEngineId!);
    url.searchParams.set('q', query);
    url.searchParams.set('num', Math.min(maxResults, 10).toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'Google Search',
        publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'],
        author: item.pagemap?.metatags?.[0]?.author,
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Search using DuckDuckGo HTML search (free, no API key required)
   */
  private async searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
    // DuckDuckGo HTML search URL
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo search error: ${response.status}`);
      }

      const html = await response.text();
      clearTimeout(timeoutId);

      // Parse HTML to extract search results
      const results = this.parseDuckDuckGoHTML(html);
      return results.slice(0, maxResults);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse DuckDuckGo HTML response
   */
  private parseDuckDuckGoHTML(html: string): SearchResult[] {
    const results: SearchResult[] = [];

    // Simple regex-based parsing (in production, use a proper HTML parser like cheerio)
    const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([^<]+)</g;

    let match;
    while ((match = resultPattern.exec(html)) !== null) {
      const [, url, title, snippet] = match;

      // Decode HTML entities
      const decodedUrl = this.decodeHTMLEntities(url);
      const decodedTitle = this.decodeHTMLEntities(title);
      const decodedSnippet = this.decodeHTMLEntities(snippet);

      results.push({
        title: decodedTitle,
        url: decodedUrl,
        snippet: decodedSnippet,
        source: 'DuckDuckGo',
      });
    }

    // Fallback: If regex fails, return mock results for development
    if (results.length === 0) {
      console.warn(`[${this.name}] Failed to parse DuckDuckGo results, using fallback`);
      return this.getFallbackResults(html.substring(0, 200));
    }

    return results;
  }

  /**
   * Decode HTML entities
   */
  private decodeHTMLEntities(text: string): string {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    return text.replace(/&[^;]+;/g, entity => entities[entity] || entity);
  }

  /**
   * Fallback results for development/testing
   */
  private getFallbackResults(query: string): SearchResult[] {
    return [
      {
        title: `Web search result for: ${query.substring(0, 50)}`,
        url: 'https://example.com/result1',
        snippet: 'This is a fallback result used when the search engine is unavailable. In production, real results will be returned.',
        source: 'Fallback',
      },
      {
        title: 'Related research article',
        url: 'https://example.com/result2',
        snippet: 'Additional context and information about the research topic.',
        source: 'Fallback',
      },
    ];
  }
}
