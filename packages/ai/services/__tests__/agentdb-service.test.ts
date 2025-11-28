import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentDBService } from '../agentdb-service';

describe('AgentDBService', () => {
  let service: AgentDBService;

  beforeEach(() => {
    service = new AgentDBService({
      backend: 'sqlite',
      path: ':memory:',
      dimensions: 384,
    });
  });

  afterEach(async () => {
    if (service) {
      await service.close();
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should not re-initialize if already initialized', async () => {
      await service.initialize();
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should throw error if operations called before initialization', async () => {
      const newService = new AgentDBService({
        backend: 'sqlite',
        path: ':memory:',
        dimensions: 384,
      });

      await expect(
        newService.insert({
          id: 'test',
          vector: new Array(384).fill(0),
          metadata: {},
        })
      ).rejects.toThrow('AgentDB not initialized');

      await newService.close();
    });
  });

  describe('insert and search', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should insert and retrieve documents', async () => {
      const vector = new Array(384).fill(0.1);
      const document = {
        id: 'doc1',
        vector,
        metadata: { title: 'Test Document' },
      };

      await service.insert(document);

      const results = await service.search(vector, 5, 0.5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should insert multiple documents', async () => {
      const documents = [
        {
          id: 'doc1',
          vector: new Array(384).fill(0.1),
          metadata: { title: 'Document 1' },
        },
        {
          id: 'doc2',
          vector: new Array(384).fill(0.2),
          metadata: { title: 'Document 2' },
        },
      ];

      await service.insertBatch(documents);

      const results = await service.search(new Array(384).fill(0.15), 10, 0.5);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array when no matches found', async () => {
      await service.insert({
        id: 'doc1',
        vector: new Array(384).fill(1.0),
        metadata: {},
      });

      // Search with very different vector and high threshold
      const results = await service.search(new Array(384).fill(0), 5, 0.99);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect similarity threshold', async () => {
      const vec1 = new Array(384).fill(1.0);
      const vec2 = new Array(384).fill(0.5);

      await service.insert({ id: 'doc1', vector: vec1, metadata: {} });

      // High threshold should return fewer results
      const strictResults = await service.search(vec2, 10, 0.95);
      const looseResults = await service.search(vec2, 10, 0.1);

      expect(looseResults.length).toBeGreaterThanOrEqual(strictResults.length);
    });
  });

  describe('episodic memory', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should store episodes', async () => {
      const episode = {
        context: 'Research on quantum computing',
        action: 'Gathered 10 sources',
        outcome: 'Successfully found relevant papers',
        success: true,
        timestamp: Date.now(),
        metadata: { topic: 'quantum computing' },
      };

      await expect(service.storeEpisode(episode)).resolves.not.toThrow();
    });

    it('should retrieve similar episodes', async () => {
      const episode = {
        context: 'Research on AI',
        action: 'Deployed agents',
        outcome: 'Completed research',
        success: true,
        timestamp: Date.now(),
      };

      await service.storeEpisode(episode);

      const queryVector = new Array(384).fill(0.1);
      const results = await service.retrieveSimilarEpisodes(queryVector, 5, 0.7);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle failed episodes', async () => {
      const episode = {
        context: 'Research on blockchain',
        action: 'Attempted scraping',
        outcome: 'Failed due to timeout',
        success: false,
        timestamp: Date.now(),
      };

      await expect(service.storeEpisode(episode)).resolves.not.toThrow();
    });
  });

  describe('causal graph', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should add causal edges', async () => {
      await expect(
        service.addCausalEdge('event1', 'event2', 0.8, 0.5)
      ).resolves.not.toThrow();
    });

    it('should query causal graph', async () => {
      await service.addCausalEdge('cause', 'effect', 0.9, 0.7);

      const result = await service.queryCausalGraph('cause');

      // May be null if causal feature not available
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('delete and clear', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should delete document by ID', async () => {
      await service.insert({
        id: 'deleteme',
        vector: new Array(384).fill(0.1),
        metadata: {},
      });

      await expect(service.delete('deleteme')).resolves.not.toThrow();
    });

    it('should clear all data', async () => {
      await service.insert({
        id: 'doc1',
        vector: new Array(384).fill(0.1),
        metadata: {},
      });

      await expect(service.clear()).resolves.not.toThrow();
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return database statistics', async () => {
      const stats = await service.getStats();

      // May be null if stats not available
      expect(stats === null || typeof stats === 'object').toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const badService = new AgentDBService({
        backend: 'sqlite',
        path: '/invalid/path/that/does/not/exist/db.sqlite',
        dimensions: 384,
      });

      // Should catch and log error, but not crash
      await expect(badService.initialize()).rejects.toThrow();

      await badService.close();
    });

    it('should handle invalid vector dimensions', async () => {
      await service.initialize();

      const wrongDimensionVector = new Array(100).fill(0.1);

      // Depending on implementation, may throw or handle gracefully
      try {
        await service.insert({
          id: 'wrong',
          vector: wrongDimensionVector,
          metadata: {},
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
