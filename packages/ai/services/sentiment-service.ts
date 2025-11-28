/**
 * Sentiment Analysis Service
 * Analyze sentiment and emotions in text using HuggingFace models
 */

export interface SentimentConfig {
  model?: string;
  apiKey?: string;
}

export interface SentimentScore {
  label: string;
  score: number;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  scores: SentimentScore[];
  text: string;
}

export interface EmotionResult {
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    love: number;
  };
  dominant: string;
  text: string;
}

export class SentimentService {
  private model: string;
  private apiKey?: string;

  constructor(config: SentimentConfig = {}) {
    // distilbert-base-uncased-finetuned-sst-2-english is excellent for sentiment
    this.model = config.model || 'distilbert-base-uncased-finetuned-sst-2-english';
    this.apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY;
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (this.apiKey && this.apiKey !== 'your-huggingface-api-key-here') {
      return await this.analyzeWithHuggingFace(text);
    }

    // Fallback to simple lexicon-based analysis
    return this.analyzeSimple(text);
  }

  /**
   * Analyze sentiment using HuggingFace API
   */
  private async analyzeWithHuggingFace(text: string): Promise<SentimentResult> {
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
            options: { wait_for_model: true },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const result = await response.json();

      // HuggingFace returns array of label-score pairs
      const scores: SentimentScore[] = Array.isArray(result[0]) ? result[0] : result;

      // Find highest scoring sentiment
      const topScore = scores.reduce((max, current) =>
        current.score > max.score ? current : max
      );

      const sentiment = this.normalizeSentiment(topScore.label);

      return {
        sentiment,
        confidence: topScore.score,
        scores,
        text,
      };
    } catch (error) {
      console.error('Failed to analyze sentiment with HuggingFace:', error);
      return this.analyzeSimple(text);
    }
  }

  /**
   * Simple lexicon-based sentiment analysis (fallback)
   */
  private analyzeSimple(text: string): SentimentResult {
    const lowerText = text.toLowerCase();

    // Positive words
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'positive',
      'success',
      'successful',
      'effective',
      'efficient',
      'innovative',
      'novel',
      'significant',
      'important',
      'valuable',
      'useful',
      'improved',
      'better',
      'best',
      'superior',
      'advanced',
      'breakthrough',
      'remarkable',
      'outstanding',
    ];

    // Negative words
    const negativeWords = [
      'bad',
      'poor',
      'terrible',
      'awful',
      'negative',
      'failure',
      'failed',
      'ineffective',
      'inefficient',
      'limited',
      'weak',
      'worse',
      'worst',
      'inferior',
      'problematic',
      'issue',
      'problem',
      'error',
      'difficult',
      'challenge',
      'limitation',
      'drawback',
      'disadvantage',
    ];

    // Count positive and negative words
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    }

    for (const word of negativeWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    }

    // Calculate sentiment
    const total = positiveCount + negativeCount;
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;

    if (total === 0) {
      sentiment = 'neutral';
      confidence = 0.5;
    } else {
      const positiveRatio = positiveCount / total;
      if (positiveRatio > 0.6) {
        sentiment = 'positive';
        confidence = 0.5 + positiveRatio * 0.3;
      } else if (positiveRatio < 0.4) {
        sentiment = 'negative';
        confidence = 0.5 + (1 - positiveRatio) * 0.3;
      } else {
        sentiment = 'neutral';
        confidence = 0.6;
      }
    }

    const scores: SentimentScore[] = [
      { label: 'POSITIVE', score: positiveCount / (total || 1) },
      { label: 'NEGATIVE', score: negativeCount / (total || 1) },
    ];

    return {
      sentiment,
      confidence,
      scores,
      text,
    };
  }

  /**
   * Normalize sentiment label from different models
   */
  private normalizeSentiment(label: string): 'positive' | 'negative' | 'neutral' {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('pos')) return 'positive';
    if (lowerLabel.includes('neg')) return 'negative';
    return 'neutral';
  }

  /**
   * Analyze emotions in text (using emotion detection model)
   */
  async analyzeEmotions(text: string): Promise<EmotionResult> {
    if (this.apiKey && this.apiKey !== 'your-huggingface-api-key-here') {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: text,
              options: { wait_for_model: true },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const scores = Array.isArray(result[0]) ? result[0] : result;

          const emotions = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            love: 0,
          };

          for (const score of scores) {
            const emotion = score.label.toLowerCase();
            if (emotion in emotions) {
              emotions[emotion as keyof typeof emotions] = score.score;
            }
          }

          const dominant = Object.entries(emotions).reduce((max, [emotion, score]) =>
            score > emotions[max as keyof typeof emotions] ? emotion : max
          );

          return { emotions, dominant, text };
        }
      } catch (error) {
        console.error('Failed to analyze emotions:', error);
      }
    }

    // Fallback to simple emotion analysis
    return this.analyzeEmotionsSimple(text);
  }

  /**
   * Simple emotion analysis (fallback)
   */
  private analyzeEmotionsSimple(text: string): EmotionResult {
    const lowerText = text.toLowerCase();

    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'excellent'],
      sadness: ['sad', 'unhappy', 'disappointed', 'poor', 'unfortunate'],
      anger: ['angry', 'frustrated', 'annoyed', 'terrible', 'awful'],
      fear: ['afraid', 'scared', 'worried', 'concerned', 'anxious'],
      surprise: ['surprised', 'unexpected', 'amazing', 'astonishing'],
      love: ['love', 'passionate', 'enthusiastic', 'devoted'],
    };

    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      love: 0,
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          emotions[emotion as keyof typeof emotions] += 1;
        }
      }
    }

    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      for (const emotion of Object.keys(emotions) as Array<keyof typeof emotions>) {
        emotions[emotion] = emotions[emotion] / total;
      }
    }

    const dominant = Object.entries(emotions).reduce((max, [emotion, score]) =>
      score > emotions[max as keyof typeof emotions] ? emotion : max
    );

    return { emotions, dominant, text };
  }

  /**
   * Analyze sentiment for multiple texts
   */
  async analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(
      texts.map((text) => this.analyzeSentiment(text))
    );
    return results;
  }

  /**
   * Get aggregate sentiment across multiple texts
   */
  async aggregateSentiment(texts: string[]): Promise<{
    overall: 'positive' | 'negative' | 'neutral';
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    averageConfidence: number;
  }> {
    const results = await this.analyzeSentimentBatch(texts);

    const distribution = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    let totalConfidence = 0;

    for (const result of results) {
      distribution[result.sentiment]++;
      totalConfidence += result.confidence;
    }

    const total = results.length;
    const averageConfidence = totalConfidence / total;

    // Determine overall sentiment
    let overall: 'positive' | 'negative' | 'neutral';
    if (distribution.positive > distribution.negative && distribution.positive > distribution.neutral) {
      overall = 'positive';
    } else if (distribution.negative > distribution.positive && distribution.negative > distribution.neutral) {
      overall = 'negative';
    } else {
      overall = 'neutral';
    }

    // Normalize distribution to percentages
    distribution.positive = distribution.positive / total;
    distribution.negative = distribution.negative / total;
    distribution.neutral = distribution.neutral / total;

    return {
      overall,
      distribution,
      averageConfidence,
    };
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
let sentimentInstance: SentimentService | null = null;

/**
 * Get or create sentiment service instance
 */
export function getSentimentService(config?: SentimentConfig): SentimentService {
  if (!sentimentInstance) {
    sentimentInstance = new SentimentService(config);
  }
  return sentimentInstance;
}
