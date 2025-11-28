import { describe, it, expect, beforeEach } from 'vitest';
import {
  SummarizationService,
  getSummarizationService,
} from '../summarization-service';

describe('SummarizationService', () => {
  let summarizationService: SummarizationService;

  beforeEach(() => {
    summarizationService = new SummarizationService();
  });

  describe('Basic Summarization', () => {
    it('should generate summary for text', async () => {
      const text = `
        Artificial intelligence (AI) is transforming the world in unprecedented ways.
        Machine learning algorithms are now capable of performing complex tasks that
        once required human intelligence. Deep learning models have achieved remarkable
        success in areas like image recognition, natural language processing, and game playing.
        The rapid advancement of AI technology is creating both opportunities and challenges
        for society. Researchers are working to develop more efficient and ethical AI systems
        that can benefit humanity while minimizing potential risks.
      `;

      const result = await summarizationService.summarize(text);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.originalLength).toBe(text.length);
      expect(result.summaryLength).toBe(result.summary.length);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThan(1);
      expect(result.model).toBeDefined();
    });

    it('should produce shorter summary than original', async () => {
      const text = `
        Climate change is one of the most pressing challenges facing our planet.
        Rising global temperatures are causing ice caps to melt, sea levels to rise,
        and extreme weather events to become more frequent. Scientists agree that
        human activities, particularly the burning of fossil fuels, are the primary
        drivers of climate change. Governments and organizations worldwide are working
        to reduce carbon emissions and transition to renewable energy sources.
        Individual actions, such as reducing energy consumption and supporting
        sustainable practices, also play a crucial role in addressing this crisis.
      `.trim();

      const result = await summarizationService.summarize(text);

      expect(result.summaryLength).toBeLessThan(result.originalLength);
      expect(result.compressionRatio).toBeLessThan(1);
    });

    it('should maintain key information in summary', async () => {
      const text = `
        The research demonstrates that neural networks can effectively model complex
        patterns in data. Our study shows significant improvements over baseline methods.
        The proposed approach achieves state-of-the-art results on multiple benchmarks.
      `;

      const result = await summarizationService.summarize(text);

      expect(result.summary).toBeDefined();
      // Summary should contain some key terms
      const lowerSummary = result.summary.toLowerCase();
      const hasKeyTerms =
        lowerSummary.includes('research') ||
        lowerSummary.includes('neural') ||
        lowerSummary.includes('study') ||
        lowerSummary.includes('approach') ||
        lowerSummary.includes('results') ||
        lowerSummary.includes('demonstrates') ||
        lowerSummary.includes('improvements');

      expect(hasKeyTerms).toBe(true);
    });
  });

  describe('Batch Processing', () => {
    it('should summarize multiple texts', async () => {
      const texts = [
        'First research paper about machine learning and neural networks.',
        'Second paper discussing climate change and environmental impact.',
        'Third study on quantum computing and its applications.',
      ];

      const results = await summarizationService.summarizeBatch(texts);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.summary).toBeDefined();
        expect(result.text).toBe(texts[index]);
      });
    });
  });

  describe('Tiered Summarization', () => {
    it('should generate tiered summaries with different lengths', async () => {
      const text = `
        Quantum computing represents a paradigm shift in computational capability.
        Unlike classical computers that use bits (0 or 1), quantum computers use
        quantum bits or qubits that can exist in multiple states simultaneously
        through superposition. This property, along with quantum entanglement,
        allows quantum computers to solve certain problems exponentially faster
        than classical computers. Major tech companies and research institutions
        are investing billions in quantum computing research. Applications include
        cryptography, drug discovery, optimization problems, and artificial intelligence.
        However, quantum computers face significant challenges including decoherence,
        error rates, and the need for extremely low temperatures. Despite these
        obstacles, researchers are making steady progress toward practical quantum
        computing systems that could revolutionize various fields of science and technology.
      `;

      const tiered = await summarizationService.summarizeTiered(text);

      expect(tiered.abstract).toBeDefined();
      expect(tiered.brief).toBeDefined();
      expect(tiered.detailed).toBeDefined();

      // Abstract should be shortest
      expect(tiered.abstract.summaryLength).toBeLessThanOrEqual(
        tiered.brief.summaryLength
      );
      expect(tiered.brief.summaryLength).toBeLessThanOrEqual(
        tiered.detailed.summaryLength
      );
    });
  });

  describe('Bullet Point Summaries', () => {
    it('should generate bullet point summary', async () => {
      const text = `
        Machine learning is a subset of artificial intelligence. It enables systems
        to learn from data. Deep learning uses neural networks with multiple layers.
        These technologies are transforming industries. Applications include healthcare,
        finance, and autonomous vehicles.
      `;

      const bulletPoints = await summarizationService.summarizeBulletPoints(
        text,
        3
      );

      expect(bulletPoints).toBeDefined();
      expect(Array.isArray(bulletPoints)).toBe(true);
      expect(bulletPoints.length).toBeLessThanOrEqual(3);
      expect(bulletPoints.length).toBeGreaterThan(0);
    });

    it('should respect numPoints parameter', async () => {
      const text = `
        First sentence. Second sentence. Third sentence. Fourth sentence.
        Fifth sentence. Sixth sentence.
      `;

      const bulletPoints = await summarizationService.summarizeBulletPoints(
        text,
        2
      );

      expect(bulletPoints.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Configuration', () => {
    it('should use custom max length', () => {
      const customService = new SummarizationService({
        maxLength: 200,
        minLength: 100,
      });

      expect(customService).toBeDefined();
    });

    it('should detect API availability', () => {
      const isUsingAPI = summarizationService.isUsingRealAPI();
      expect(typeof isUsingAPI).toBe('boolean');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for getSummarizationService', () => {
      const instance1 = getSummarizationService();
      const instance2 = getSummarizationService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', async () => {
      const result = await summarizationService.summarize('');

      expect(result).toBeDefined();
      expect(result.summary).toBe('');
      expect(result.originalLength).toBe(0);
      expect(result.summaryLength).toBe(0);
    });

    it('should handle very short text', async () => {
      const text = 'Short text.';

      const result = await summarizationService.summarize(text);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle text with single sentence', async () => {
      const text = 'This is a single sentence about artificial intelligence.';

      const result = await summarizationService.summarize(text);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle text with special characters', async () => {
      const text = 'Research on AI & ML! (2024) #technology @future.';

      const result = await summarizationService.summarize(text);

      expect(result).toBeDefined();
    });
  });

  describe('Quality Checks', () => {
    it('should have reasonable compression ratio', async () => {
      const text = `
        This is a longer text that should be compressed significantly when summarized.
        The summarization service should extract the most important information.
        The compression ratio should be less than one, indicating reduction in length.
        We expect the summary to be concise yet informative.
      `.repeat(3);

      const result = await summarizationService.summarize(text);

      expect(result.compressionRatio).toBeLessThan(1);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });

    it('should include important keywords in summary', async () => {
      const text = `
        The research demonstrates novel approaches to deep learning.
        Our findings show significant improvements in model accuracy.
        The study concludes that the proposed method is effective.
      `;

      const result = await summarizationService.summarize(text);

      const lowerSummary = result.summary.toLowerCase();
      const importantWords = ['research', 'findings', 'study', 'method'];
      const hasImportantWord = importantWords.some((word) =>
        lowerSummary.includes(word)
      );

      expect(hasImportantWord).toBe(true);
    });
  });
});
