import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from '../router';

// Mock dependencies
vi.mock('@researchhive/database', () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    research: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    citation: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@researchhive/ai', () => ({
  researchOrchestrator: {
    startResearch: vi.fn(),
    getProgress: vi.fn(),
    getResults: vi.fn(),
    searchPreviousResearch: vi.fn(),
  },
  getCitationService: vi.fn(() => ({
    exportCitations: vi.fn(() => ({
      content: 'Mock citation content',
      filename: 'citations.txt',
      mimeType: 'text/plain',
    })),
  })),
}));

describe('tRPC Router', () => {
  describe('health endpoint', () => {
    it('should return ok status', async () => {
      const caller = appRouter.createCaller({});
      const result = await caller.health();

      expect(result.status).toBe('ok');
      expect(result.message).toBe('ResearchHive API is running');
      expect(result.timestamp).toBeDefined();
    });

    it('should include timestamp in ISO format', async () => {
      const caller = appRouter.createCaller({});
      const result = await caller.health();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('hello endpoint', () => {
    it('should greet with default name', async () => {
      const caller = appRouter.createCaller({});
      const result = await caller.hello({});

      expect(result.greeting).toBe('Hello World!');
    });

    it('should greet with custom name', async () => {
      const caller = appRouter.createCaller({});
      const result = await caller.hello({ name: 'Alice' });

      expect(result.greeting).toBe('Hello Alice!');
    });
  });

  describe('research endpoints', () => {
    it('should validate research creation input', async () => {
      const caller = appRouter.createCaller({});

      // Should fail without topic
      await expect(
        caller.research.create({ topic: '', depth: 'standard' })
      ).rejects.toThrow();
    });

    it('should validate depth parameter', async () => {
      const caller = appRouter.createCaller({});

      // Should fail with invalid depth
      await expect(
        // @ts-expect-error - testing invalid input
        caller.research.create({ topic: 'AI', depth: 'invalid' })
      ).rejects.toThrow();
    });
  });
});
