/**
 * Embeddings Service
 * Generate vector embeddings for semantic search
 */

export interface EmbeddingsConfig {
  model?: string;
  dimensions?: number;
  apiKey?: string;
}

export class EmbeddingsService {
  private model: string;
  private dimensions: number;
  private apiKey?: string;

  constructor(config: EmbeddingsConfig = {}) {
    this.model = config.model || 'sentence-transformers/all-MiniLM-L6-v2';
    this.dimensions = config.dimensions || 384;
    this.apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY;
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // If HuggingFace API key is available, use it
    if (this.apiKey && this.apiKey !== 'your-huggingface-api-key-here') {
      return await this.generateWithHuggingFace(text);
    }

    // Otherwise, use simple hash-based embedding (for development)
    return this.generateSimpleEmbedding(text);
  }

  /**
   * Generate embeddings using HuggingFace API
   */
  private async generateWithHuggingFace(text: string): Promise<number[]> {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.model}`,
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

      // HuggingFace returns nested arrays, flatten if needed
      if (Array.isArray(result) && Array.isArray(result[0])) {
        return result[0];
      }

      return result;
    } catch (error) {
      console.error('Failed to generate embedding with HuggingFace:', error);
      // Fallback to simple embedding
      return this.generateSimpleEmbedding(text);
    }
  }

  /**
   * Generate simple hash-based embedding (for development without API key)
   * This is NOT suitable for production but allows the system to work
   */
  private generateSimpleEmbedding(text: string): number[] {
    const normalized = text.toLowerCase().trim();
    const embedding = new Array(this.dimensions).fill(0);

    // Simple character-based hashing
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = charCode % this.dimensions;
      embedding[index] += 1;
    }

    // Word-based features
    const words = normalized.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);
      const index = hash % this.dimensions;
      embedding[index] += 2;
    }

    // Normalize the vector
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  /**
   * Simple hash function for strings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map((text) => this.generateEmbedding(text))
    );
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
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
let embeddingsInstance: EmbeddingsService | null = null;

/**
 * Get or create embeddings service instance
 */
export function getEmbeddings(config?: EmbeddingsConfig): EmbeddingsService {
  if (!embeddingsInstance) {
    embeddingsInstance = new EmbeddingsService(config);
  }
  return embeddingsInstance;
}
