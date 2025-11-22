import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude AI Client for Research Operations
 *
 * This service wraps the Anthropic API with:
 * - Automatic retry logic with exponential backoff
 * - Error handling and validation
 * - Structured research prompts
 * - Rate limit handling
 */

export interface ResearchQuery {
  topic: string;
  focus: string;
  depth: 'quick' | 'standard' | 'deep';
  context?: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  relevance: number;
  summary: string;
  keyPoints: string[];
}

export interface ResearchResponse {
  sources: ResearchSource[];
  focus: string;
  confidence: number;
}

export class ClaudeClient {
  private client: Anthropic;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!key || key === 'your-api-key-here') {
      console.warn('⚠️  No valid Anthropic API key found. AI features will use simulation mode.');
      console.warn('   Set ANTHROPIC_API_KEY in .env to enable real AI research.');
      console.warn('   Get your key at: https://console.anthropic.com');
    }

    this.client = new Anthropic({
      apiKey: key,
    });
  }

  /**
   * Check if real AI is available (valid API key configured)
   */
  isRealAIAvailable(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key !== 'your-api-key-here');
  }

  /**
   * Research a topic with a specific focus using Claude AI
   */
  async research(query: ResearchQuery): Promise<ResearchResponse> {
    if (!this.isRealAIAvailable()) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env file.');
    }

    const prompt = this.buildResearchPrompt(query);

    return this.executeWithRetry(async () => {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = message.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      return this.parseResearchResponse(textContent, query.focus);
    });
  }

  /**
   * Build a structured research prompt for Claude
   */
  private buildResearchPrompt(query: ResearchQuery): string {
    const depthInstructions = {
      quick: 'Provide 2-3 high-quality sources with brief summaries.',
      standard: 'Provide 3-5 comprehensive sources with detailed analysis.',
      deep: 'Provide 5-8 authoritative sources with in-depth evaluation.',
    };

    return `You are a research assistant specialized in finding and analyzing credible sources on specific topics.

Research Topic: ${query.topic}
Research Focus: ${query.focus}
Depth Level: ${query.depth}

Your task is to find credible sources specifically focused on "${query.focus}" as it relates to "${query.topic}".

${depthInstructions[query.depth]}

For each source, provide:
1. Title: Clear, descriptive title
2. URL: A realistic, credible URL (use real domains when possible: .edu, .org, major publishers)
3. Relevance: Score from 0.0 to 1.0 (how relevant to the focus area)
4. Summary: 2-3 sentence summary of the content
5. Key Points: 3-5 bullet points of key information

Format your response as JSON:
{
  "sources": [
    {
      "title": "Source title",
      "url": "https://example.edu/article",
      "relevance": 0.95,
      "summary": "Brief summary of the source",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "confidence": 0.85
}

Focus on quality over quantity. Only include sources you're confident about.
Ensure URLs use real, credible domains (.edu, .org, .gov, reputable publishers).
Relevance scores should reflect how well each source addresses the specific focus area.`;
  }

  /**
   * Parse Claude's response into structured research data
   */
  private parseResearchResponse(response: string, focus: string): ResearchResponse {
    try {
      // Extract JSON from response (Claude might include explanation text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (!parsed.sources || !Array.isArray(parsed.sources)) {
        throw new Error('Invalid response structure: missing sources array');
      }

      // Ensure all sources have required fields
      const validSources = parsed.sources
        .filter((s: any) => s.title && s.url && typeof s.relevance === 'number')
        .map((s: any) => ({
          title: s.title,
          url: s.url,
          relevance: Math.max(0, Math.min(1, s.relevance)), // Clamp to 0-1
          summary: s.summary || '',
          keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
        }));

      return {
        sources: validSources,
        focus,
        confidence: typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.8,
      };
    } catch (error) {
      console.error('Failed to parse research response:', error);
      console.error('Response:', response);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a function with retry logic and exponential backoff
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const hasRetriesLeft = attempt < this.maxRetries;

      if (isRetryable && hasRetriesLeft) {
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.log(`⚠️  API call failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${this.maxRetries})`);

        await this.sleep(delay);
        return this.executeWithRetry(fn, attempt + 1);
      }

      // Not retryable or out of retries
      throw error;
    }
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.APIError) {
      // Retry on rate limits and server errors
      return (
        error.status === 429 || // Rate limit
        error.status === 500 || // Internal server error
        error.status === 502 || // Bad gateway
        error.status === 503 || // Service unavailable
        error.status === 504    // Gateway timeout
      );
    }

    // Retry on network errors
    if (error instanceof Error) {
      return (
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND')
      );
    }

    return false;
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const claudeClient = new ClaudeClient();
