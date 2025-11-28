import { describe, it, expect, beforeEach } from 'vitest';
import { NERService, getNERService } from '../ner-service';

describe('NERService', () => {
  let nerService: NERService;

  beforeEach(() => {
    nerService = new NERService();
  });

  describe('Entity Extraction', () => {
    it('should extract entities from text', async () => {
      const text =
        'Apple Inc. was founded by Steve Jobs in Cupertino, California. Microsoft Corp. is located in Seattle.';

      const result = await nerService.extractEntities(text);

      expect(result).toBeDefined();
      expect(result.entities).toBeDefined();
      expect(result.entityGroups).toBeDefined();
      expect(result.text).toBe(text);
    });

    it('should extract person names', async () => {
      const text = 'Albert Einstein and Marie Curie were famous physicists.';

      const result = await nerService.extractEntities(text);

      expect(result.entities.length).toBeGreaterThan(0);

      // Check if person entities are found (in fallback mode)
      const personEntities = result.entities.filter(
        (e) => e.entityGroup === 'PERSON'
      );
      expect(personEntities.length).toBeGreaterThan(0);
    });

    it('should extract organizations', async () => {
      const text = 'Google Inc. and Amazon Corp. are tech companies.';

      const result = await nerService.extractEntities(text);

      const orgEntities = result.entities.filter(
        (e) => e.entityGroup === 'ORGANIZATION'
      );
      expect(orgEntities.length).toBeGreaterThan(0);
    });

    it('should extract locations', async () => {
      const text = 'I visited New York and London last summer.';

      const result = await nerService.extractEntities(text);

      const locationEntities = result.entities.filter(
        (e) => e.entityGroup === 'LOCATION'
      );
      expect(locationEntities.length).toBeGreaterThan(0);
    });
  });

  describe('Entity Grouping', () => {
    it('should group entities by type', async () => {
      const text =
        'Steve Jobs founded Apple Inc. in Cupertino. Bill Gates founded Microsoft Corp. in Seattle.';

      const result = await nerService.extractEntities(text);

      expect(result.entityGroups).toBeDefined();
      expect(Object.keys(result.entityGroups).length).toBeGreaterThan(0);
    });

    it('should not duplicate entities in groups', async () => {
      const text = 'Apple Inc. is a company. Apple Inc. makes iPhones.';

      const result = await nerService.extractEntities(text);

      // Each unique entity should appear only once in its group
      for (const entities of Object.values(result.entityGroups)) {
        const uniqueEntities = new Set(entities);
        expect(uniqueEntities.size).toBe(entities.length);
      }
    });
  });

  describe('Batch Processing', () => {
    it('should extract entities from multiple texts', async () => {
      const texts = [
        'Apple Inc. is in Cupertino.',
        'Microsoft Corp. is in Seattle.',
        'Google LLC is in Mountain View.',
      ];

      const results = await nerService.extractEntitiesBatch(texts);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.entities).toBeDefined();
        expect(result.entityGroups).toBeDefined();
      });
    });

    it('should merge results from multiple texts', async () => {
      const results = [
        await nerService.extractEntities('Apple Inc. is in Cupertino.'),
        await nerService.extractEntities('Microsoft Corp. is in Seattle.'),
      ];

      const merged = nerService.mergeResults(results);

      expect(merged.entities.length).toBeGreaterThanOrEqual(
        Math.max(results[0].entities.length, results[1].entities.length)
      );
      expect(Object.keys(merged.entityGroups).length).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should use custom configuration', () => {
      const customNER = new NERService({
        model: 'custom-model',
        threshold: 0.95,
      });

      expect(customNER).toBeDefined();
    });

    it('should detect API availability', () => {
      const isUsingAPI = nerService.isUsingRealAPI();
      expect(typeof isUsingAPI).toBe('boolean');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for getNERService', () => {
      const instance1 = getNERService();
      const instance2 = getNERService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', async () => {
      const result = await nerService.extractEntities('');

      expect(result.entities).toHaveLength(0);
      expect(Object.keys(result.entityGroups)).toHaveLength(0);
    });

    it('should handle text with no entities', async () => {
      const result = await nerService.extractEntities(
        'this is a simple sentence with no entities'
      );

      expect(result).toBeDefined();
      expect(result.entities).toBeDefined();
    });

    it('should handle very long text', async () => {
      const longText = 'Apple Inc. '.repeat(100);

      const result = await nerService.extractEntities(longText);

      expect(result).toBeDefined();
    });
  });
});
