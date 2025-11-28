/**
 * Text Summarization Service
 * Generate concise summaries using HuggingFace models
 */

export interface SummarizationConfig {
  model?: string;
  apiKey?: string;
  maxLength?: number;
  minLength?: number;
}

export interface SummarizationResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  model: string;
}

export class SummarizationService {
  private model: string;
  private apiKey?: string;
  private maxLength: number;
  private minLength: number;

  constructor(config: SummarizationConfig = {}) {
    // facebook/bart-large-cnn is excellent for research paper summarization
    this.model = config.model || 'facebook/bart-large-cnn';
    this.apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY;
    this.maxLength = config.maxLength || 150;
    this.minLength = config.minLength || 50;
  }

  /**
   * Generate summary for a text
   */
  async summarize(text: string): Promise<SummarizationResult> {
    if (this.apiKey && this.apiKey !== 'your-huggingface-api-key-here') {
      return await this.summarizeWithHuggingFace(text);
    }

    // Fallback to simple extractive summarization
    return this.summarizeSimple(text);
  }

  /**
   * Summarize using HuggingFace API
   */
  private async summarizeWithHuggingFace(
    text: string
  ): Promise<SummarizationResult> {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              max_length: this.maxLength,
              min_length: this.minLength,
              do_sample: false,
            },
            options: { wait_for_model: true },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const result = await response.json();

      const summary = Array.isArray(result) ? result[0].summary_text : result.summary_text;

      return {
        summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: summary.length / text.length,
        model: this.model,
      };
    } catch (error) {
      console.error('Failed to summarize with HuggingFace:', error);
      return this.summarizeSimple(text);
    }
  }

  /**
   * Simple extractive summarization (fallback)
   * Extracts most important sentences based on position and keywords
   */
  private summarizeSimple(text: string): SummarizationResult {
    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) {
      return {
        summary: '',
        originalLength: text.length,
        summaryLength: 0,
        compressionRatio: 0,
        model: 'simple-extractive',
      };
    }

    // Score sentences based on position and keywords
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;

      // Position scoring (first and last sentences are often important)
      if (index === 0) score += 3;
      if (index === sentences.length - 1) score += 2;

      // Keyword scoring (common important words in research)
      const keywords = [
        'research',
        'study',
        'findings',
        'results',
        'conclusion',
        'demonstrate',
        'show',
        'evidence',
        'analysis',
        'significant',
        'important',
        'novel',
        'propose',
        'develop',
        'method',
        'approach',
        'model',
        'system',
        'framework',
      ];

      const lowerSentence = sentence.toLowerCase();
      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword)) {
          score += 1;
        }
      }

      // Length scoring (prefer medium-length sentences)
      const words = sentence.split(/\s+/).length;
      if (words >= 10 && words <= 30) {
        score += 1;
      }

      return { sentence, score, index };
    });

    // Sort by score and select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, Math.ceil(sentences.length * 0.3)))
      .sort((a, b) => a.index - b.index); // Restore original order

    const summary = topSentences.map((s) => s.sentence).join('. ') + '.';

    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: summary.length / text.length,
      model: 'simple-extractive',
    };
  }

  /**
   * Generate summaries for multiple texts
   */
  async summarizeBatch(texts: string[]): Promise<SummarizationResult[]> {
    const results = await Promise.all(texts.map((text) => this.summarize(text)));
    return results;
  }

  /**
   * Generate tiered summaries (abstract, brief, detailed)
   */
  async summarizeTiered(
    text: string
  ): Promise<{
    abstract: SummarizationResult;
    brief: SummarizationResult;
    detailed: SummarizationResult;
  }> {
    // Abstract: Very short (50-100 words)
    const abstractService = new SummarizationService({
      model: this.model,
      apiKey: this.apiKey,
      maxLength: 100,
      minLength: 50,
    });

    // Brief: Medium (100-200 words)
    const briefService = new SummarizationService({
      model: this.model,
      apiKey: this.apiKey,
      maxLength: 200,
      minLength: 100,
    });

    // Detailed: Longer (200-400 words)
    const detailedService = new SummarizationService({
      model: this.model,
      apiKey: this.apiKey,
      maxLength: 400,
      minLength: 200,
    });

    const [abstract, brief, detailed] = await Promise.all([
      abstractService.summarize(text),
      briefService.summarize(text),
      detailedService.summarize(text),
    ]);

    return { abstract, brief, detailed };
  }

  /**
   * Generate bullet-point summary
   */
  async summarizeBulletPoints(text: string, numPoints: number = 5): Promise<string[]> {
    const result = await this.summarize(text);

    // Split summary into sentences
    const sentences = result.summary
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Return up to numPoints
    return sentences.slice(0, numPoints);
  }

  /**
   * Check if using real API or fallback
   */
  isUsingRealAPI(): boolean {
    return (
      !!this.apiKey &&
      this.apiKey !== 'your-huggingface-api-key-here' &&
      this.apiKey.length > 0
    );
  }
}

// Singleton instance
let summarizationInstance: SummarizationService | null = null;

/**
 * Get or create summarization service instance
 */
export function getSummarizationService(
  config?: SummarizationConfig
): SummarizationService {
  if (!summarizationInstance) {
    summarizationInstance = new SummarizationService(config);
  }
  return summarizationInstance;
}
