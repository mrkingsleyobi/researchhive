import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddingsService } from '../embeddings-service';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;

  beforeEach(() => {
    service = new EmbeddingsService({
      dimensions: 384,
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for simple text', async () => {
      const text = 'quantum computing';
      const embedding = await service.generateEmbedding(text);

      expect(embedding).toBeDefined();
      expect(embedding).toHaveLength(384);
      expect(embedding.every(n => typeof n === 'number')).toBe(true);
    });

    it('should generate consistent embeddings for same text', async () => {
      const text = 'machine learning';
      const embedding1 = await service.generateEmbedding(text);
      const embedding2 = await service.generateEmbedding(text);

      expect(embedding1).toEqual(embedding2);
    });

    it('should normalize embedding vectors', async () => {
      const text = 'artificial intelligence';
      const embedding = await service.generateEmbedding(text);

      // Check if vector is normalized (magnitude should be close to 1)
      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );

      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should handle empty text', async () => {
      const embedding = await service.generateEmbedding('');

      expect(embedding).toBeDefined();
      expect(embedding).toHaveLength(384);
    });

    it('should handle long text', async () => {
      const longText = 'word '.repeat(1000);
      const embedding = await service.generateEmbedding(longText);

      expect(embedding).toBeDefined();
      expect(embedding).toHaveLength(384);
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['text 1', 'text 2', 'text 3'];
      const embeddings = await service.generateEmbeddings(texts);

      expect(embeddings).toHaveLength(3);
      expect(embeddings.every(e => e.length === 384)).toBe(true);
    });

    it('should handle empty array', async () => {
      const embeddings = await service.generateEmbeddings([]);

      expect(embeddings).toHaveLength(0);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vec = [1, 2, 3, 4, 5];
      const similarity = service.cosineSimilarity(vec, vec);

      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = service.cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      const similarity = service.cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should throw error for vectors of different lengths', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];

      expect(() => service.cosineSimilarity(vec1, vec2)).toThrow(
        'Vectors must have the same length'
      );
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 2, 3];
      const similarity = service.cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });
  });

  describe('isUsingRealAPI', () => {
    it('should return false without API key', () => {
      const service = new EmbeddingsService();

      expect(service.isUsingRealAPI()).toBe(false);
    });

    it('should return false with placeholder API key', () => {
      const service = new EmbeddingsService({
        apiKey: 'your-huggingface-api-key-here',
      });

      expect(service.isUsingRealAPI()).toBe(false);
    });

    it('should return true with real API key', () => {
      const service = new EmbeddingsService({
        apiKey: 'hf_realkey123',
      });

      expect(service.isUsingRealAPI()).toBe(true);
    });
  });
});
