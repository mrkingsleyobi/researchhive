/**
 * Social Media Agent
 *
 * Searches social media platforms:
 * - Reddit (via Reddit API)
 * - Twitter/X (via Twitter API v2)
 * - Hacker News (public API)
 */

import { BaseAgent, SearchResult, AgentConfig } from './base-agent';

export class SocialAgent extends BaseAgent {
  private redditClientId?: string;
  private redditClientSecret?: string;
  private twitterBearerToken?: string;
  private redditAccessToken?: string;

  constructor(config: AgentConfig = {}) {
    super('SocialAgent', config);
    this.redditClientId = process.env.REDDIT_CLIENT_ID;
    this.redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
  }

  async search(query: string, options: { maxResults?: number; platform?: 'reddit' | 'twitter' | 'hackernews' | 'all' } = {}): Promise<SearchResult[]> {
    await this.checkRateLimit();

    console.log(`[${this.name}] Searching social media for: ${query}`);

    const platform = options.platform || 'all';
    const maxResults = options.maxResults || this.config.maxResults || 10;

    try {
      const results: SearchResult[] = [];

      if (platform === 'all' || platform === 'reddit') {
        const redditResults = await this.retry(() => this.searchReddit(query, maxResults));
        results.push(...redditResults);
      }

      if (platform === 'all' || platform === 'twitter') {
        const twitterResults = await this.retry(() => this.searchTwitter(query, maxResults));
        results.push(...twitterResults);
      }

      if (platform === 'all' || platform === 'hackernews') {
        const hnResults = await this.retry(() => this.searchHackerNews(query, maxResults));
        results.push(...hnResults);
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.error(`[${this.name}] Search failed:`, error);
      return this.getFallbackResults(query);
    }
  }

  /**
   * Search Reddit
   */
  private async searchReddit(query: string, maxResults: number): Promise<SearchResult[]> {
    // Authenticate if credentials exist
    if (this.redditClientId && this.redditClientSecret && !this.redditAccessToken) {
      await this.authenticateReddit();
    }

    // Use Reddit search API (works without auth, but with limits)
    const url = new URL('https://www.reddit.com/search.json');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', Math.min(maxResults, 100).toString());
    url.searchParams.set('sort', 'relevance');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const headers: HeadersInit = {
        'User-Agent': 'ResearchHive/1.0.0',
      };

      if (this.redditAccessToken) {
        headers['Authorization'] = `Bearer ${this.redditAccessToken}`;
      }

      const response = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.data?.children || []).map((post: any) => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        snippet: post.data.selftext?.substring(0, 300) || post.data.title,
        source: `Reddit (r/${post.data.subreddit})`,
        author: post.data.author,
        publishedDate: new Date(post.data.created_utc * 1000).toISOString(),
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] Reddit search error:`, error);
      return [];
    }
  }

  /**
   * Authenticate with Reddit API
   */
  private async authenticateReddit(): Promise<void> {
    const auth = Buffer.from(`${this.redditClientId}:${this.redditClientSecret}`).toString('base64');

    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Reddit auth error: ${response.status}`);
      }

      const data = await response.json();
      this.redditAccessToken = data.access_token;
    } catch (error) {
      console.error(`[${this.name}] Reddit authentication failed:`, error);
    }
  }

  /**
   * Search Twitter/X
   */
  private async searchTwitter(query: string, maxResults: number): Promise<SearchResult[]> {
    if (!this.twitterBearerToken) {
      console.warn(`[${this.name}] No TWITTER_BEARER_TOKEN found, skipping Twitter search`);
      return [];
    }

    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', query);
    url.searchParams.set('max_results', Math.min(maxResults, 100).toString());
    url.searchParams.set('tweet.fields', 'created_at,author_id,public_metrics');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.twitterBearerToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.data || []).map((tweet: any) => ({
        title: tweet.text.substring(0, 100) + '...',
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        snippet: tweet.text,
        source: 'Twitter',
        publishedDate: tweet.created_at,
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] Twitter search error:`, error);
      return [];
    }
  }

  /**
   * Search Hacker News (via Algolia API)
   */
  private async searchHackerNews(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = new URL('https://hn.algolia.com/api/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('tags', 'story');
    url.searchParams.set('hitsPerPage', Math.min(maxResults, 100).toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Hacker News API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.hits || []).map((hit: any) => ({
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        snippet: hit.story_text || hit.title,
        source: 'Hacker News',
        author: hit.author,
        publishedDate: hit.created_at,
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] Hacker News search error:`, error);
      return [];
    }
  }

  /**
   * Fallback social media results
   */
  private getFallbackResults(query: string): SearchResult[] {
    return [
      {
        title: `Discussion: ${query}`,
        url: 'https://reddit.com/r/example',
        snippet: `Community discussion about ${query}. Configure Reddit API credentials for real results.`,
        source: 'Social Fallback',
        publishedDate: new Date().toISOString(),
      },
      {
        title: `Trending: ${query}`,
        url: 'https://twitter.com/example',
        snippet: `Social media conversation about ${query}. Configure Twitter API credentials for real results.`,
        source: 'Social Fallback',
        publishedDate: new Date().toISOString(),
      },
    ];
  }
}
