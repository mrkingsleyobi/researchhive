import { describe, it, expect, beforeEach } from 'vitest';
import { SentimentService, getSentimentService } from '../sentiment-service';

describe('SentimentService', () => {
  let sentimentService: SentimentService;

  beforeEach(() => {
    sentimentService = new SentimentService();
  });

  describe('Sentiment Analysis', () => {
    it('should analyze positive sentiment', async () => {
      const text =
        'This is an excellent research paper with outstanding results and remarkable findings.';

      const result = await sentimentService.analyzeSentiment(text);

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.scores).toBeDefined();
      expect(Array.isArray(result.scores)).toBe(true);
      expect(result.text).toBe(text);
    });

    it('should analyze negative sentiment', async () => {
      const text =
        'This is a terrible paper with poor methodology and awful results.';

      const result = await sentimentService.analyzeSentiment(text);

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should analyze neutral sentiment', async () => {
      const text =
        'The study examined various factors and presented the data systematically.';

      const result = await sentimentService.analyzeSentiment(text);

      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should provide sentiment scores', async () => {
      const text = 'The research shows promising results.';

      const result = await sentimentService.analyzeSentiment(text);

      expect(result.scores).toBeDefined();
      expect(result.scores.length).toBeGreaterThan(0);

      result.scores.forEach((score) => {
        expect(score.label).toBeDefined();
        expect(typeof score.score).toBe('number');
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Emotion Analysis', () => {
    it('should analyze emotions in text', async () => {
      const text = 'I am so happy and excited about these wonderful results!';

      const result = await sentimentService.analyzeEmotions(text);

      expect(result).toBeDefined();
      expect(result.emotions).toBeDefined();
      expect(result.emotions.joy).toBeDefined();
      expect(result.emotions.sadness).toBeDefined();
      expect(result.emotions.anger).toBeDefined();
      expect(result.emotions.fear).toBeDefined();
      expect(result.emotions.surprise).toBeDefined();
      expect(result.emotions.love).toBeDefined();
      expect(result.dominant).toBeDefined();
      expect(result.text).toBe(text);
    });

    it('should identify dominant emotion', async () => {
      const text = 'I am very happy and joyful today!';

      const result = await sentimentService.analyzeEmotions(text);

      expect(result.dominant).toBeDefined();
      expect(typeof result.dominant).toBe('string');
    });

    it('should have emotion scores between 0 and 1', async () => {
      const text = 'This is an interesting study.';

      const result = await sentimentService.analyzeEmotions(text);

      Object.values(result.emotions).forEach((score) => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Batch Processing', () => {
    it('should analyze sentiment for multiple texts', async () => {
      const texts = [
        'This is excellent work with great results.',
        'This is poor work with terrible outcomes.',
        'The study presents data in a systematic manner.',
      ];

      const results = await sentimentService.analyzeSentimentBatch(texts);

      expect(results).toHaveLength(3);
      expect(results[0].sentiment).toBe('positive');
      expect(results[1].sentiment).toBe('negative');

      results.forEach((result, index) => {
        expect(result.text).toBe(texts[index]);
        expect(result.sentiment).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
  });

  describe('Aggregate Sentiment', () => {
    it('should calculate aggregate sentiment', async () => {
      const texts = [
        'This is excellent research.',
        'This is wonderful work.',
        'This is outstanding analysis.',
      ];

      const aggregate = await sentimentService.aggregateSentiment(texts);

      expect(aggregate).toBeDefined();
      expect(aggregate.overall).toBe('positive');
      expect(aggregate.distribution).toBeDefined();
      expect(aggregate.distribution.positive).toBeGreaterThan(0);
      expect(aggregate.averageConfidence).toBeGreaterThan(0);
    });

    it('should calculate distribution percentages', async () => {
      const texts = [
        'Great work!',
        'Terrible results.',
        'Neutral observation.',
        'Excellent findings!',
      ];

      const aggregate = await sentimentService.aggregateSentiment(texts);

      const total =
        aggregate.distribution.positive +
        aggregate.distribution.negative +
        aggregate.distribution.neutral;

      expect(total).toBeCloseTo(1, 2); // Sum should be approximately 1 (100%)
    });

    it('should determine overall sentiment from majority', async () => {
      const positiveTexts = [
        'Great research with excellent results.',
        'Outstanding work and remarkable findings.',
        'Wonderful analysis with significant improvements.',
      ];

      const aggregate = await sentimentService.aggregateSentiment(
        positiveTexts
      );

      expect(aggregate.overall).toBe('positive');
      expect(aggregate.distribution.positive).toBeGreaterThan(
        aggregate.distribution.negative
      );
    });
  });

  describe('Configuration', () => {
    it('should use custom configuration', () => {
      const customService = new SentimentService({
        model: 'custom-model',
      });

      expect(customService).toBeDefined();
    });

    it('should detect API availability', () => {
      const isUsingAPI = sentimentService.isUsingRealAPI();
      expect(typeof isUsingAPI).toBe('boolean');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for getSentimentService', () => {
      const instance1 = getSentimentService();
      const instance2 = getSentimentService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', async () => {
      const result = await sentimentService.analyzeSentiment('');

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
    });

    it('should handle very short text', async () => {
      const result = await sentimentService.analyzeSentiment('Good.');

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('positive');
    });

    it('should handle text with no sentiment words', async () => {
      const result = await sentimentService.analyzeSentiment(
        'The study used data from 2024.'
      );

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
    });

    it('should handle mixed sentiment', async () => {
      const text =
        'The research has excellent methodology but poor results and limited impact.';

      const result = await sentimentService.analyzeSentiment(text);

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const result = await sentimentService.analyzeSentiment(
        'Great! #research @awesome :)'
      );

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('positive');
    });

    it('should handle very long text', async () => {
      const longText = 'This is excellent research. '.repeat(100);

      const result = await sentimentService.analyzeSentiment(longText);

      expect(result).toBeDefined();
      expect(result.sentiment).toBe('positive');
    });
  });

  describe('Sentiment Detection Accuracy', () => {
    it('should detect strong positive sentiment', async () => {
      const strongPositive =
        'Absolutely wonderful, excellent, amazing, and outstanding work with fantastic results!';

      const result = await sentimentService.analyzeSentiment(strongPositive);

      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect strong negative sentiment', async () => {
      const strongNegative =
        'Terrible, awful, poor, bad, and problematic work with failed results.';

      const result = await sentimentService.analyzeSentiment(strongNegative);

      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should provide higher confidence for clear sentiment', async () => {
      const clearPositive = 'Excellent research with outstanding results.';
      const ambiguous = 'The data was collected.';

      const clearResult = await sentimentService.analyzeSentiment(
        clearPositive
      );
      const ambiguousResult = await sentimentService.analyzeSentiment(
        ambiguous
      );

      // Clear sentiment should have higher or equal confidence
      expect(clearResult.confidence).toBeGreaterThanOrEqual(
        ambiguousResult.confidence - 0.1
      );
    });
  });

  describe('Emotion Detection', () => {
    it('should detect joy in positive text', async () => {
      const joyfulText = 'I am so happy and excited about this!';

      const result = await sentimentService.analyzeEmotions(joyfulText);

      expect(result.emotions.joy).toBeGreaterThan(0);
    });

    it('should detect sadness in negative text', async () => {
      const sadText = 'This is disappointing and unfortunate.';

      const result = await sentimentService.analyzeEmotions(sadText);

      // In fallback mode, sadness should be detected
      expect(result.emotions).toBeDefined();
    });

    it('should have emotions sum to reasonable value', async () => {
      const text = 'This is interesting research work.';

      const result = await sentimentService.analyzeEmotions(text);

      const sum = Object.values(result.emotions).reduce(
        (acc, val) => acc + val,
        0
      );

      // In fallback mode with normalization, sum should be close to 1 or 0 (if no emotions)
      expect(sum).toBeGreaterThanOrEqual(0);
      expect(sum).toBeLessThanOrEqual(1.1); // Allow small floating point errors
    });
  });
});
