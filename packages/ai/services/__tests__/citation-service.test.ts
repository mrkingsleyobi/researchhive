import { describe, it, expect, beforeEach } from 'vitest';
import { CitationService, Citation } from '../citation-service';

describe('CitationService', () => {
  let service: CitationService;
  let sampleCitation: Citation;

  beforeEach(() => {
    service = new CitationService();
    sampleCitation = {
      title: 'Understanding Machine Learning',
      url: 'https://example.com/ml-paper',
      authors: ['John Smith', 'Jane Doe'],
      publishedDate: '2024-03-15',
      accessedDate: '2024-11-28',
      source: 'Journal of AI Research',
      credibility: 0.95,
    };
  });

  describe('formatCitation', () => {
    describe('APA format', () => {
      it('should format complete citation in APA style', () => {
        const formatted = service.formatCitation(sampleCitation, 'apa');

        expect(formatted).toContain('Smith, J.');
        expect(formatted).toContain('Doe, J.');
        expect(formatted).toContain('(2024)');
        expect(formatted).toContain('Understanding Machine Learning');
        expect(formatted).toContain('Journal of AI Research');
        expect(formatted).toContain('https://example.com/ml-paper');
      });

      it('should handle single author', () => {
        const citation: Citation = {
          ...sampleCitation,
          authors: ['John Smith'],
        };
        const formatted = service.formatCitation(citation, 'apa');

        expect(formatted).toContain('Smith, J.');
        expect(formatted).not.toContain('&');
      });

      it('should handle two authors', () => {
        const formatted = service.formatCitation(sampleCitation, 'apa');

        expect(formatted).toContain('Smith, J., & Doe, J.');
      });

      it('should handle missing date', () => {
        const citation: Citation = {
          ...sampleCitation,
          publishedDate: undefined,
        };
        const formatted = service.formatCitation(citation, 'apa');

        expect(formatted).toBeDefined();
        expect(formatted).not.toContain('(2024)');
      });
    });

    describe('MLA format', () => {
      it('should format complete citation in MLA style', () => {
        const formatted = service.formatCitation(sampleCitation, 'mla');

        expect(formatted).toContain('Smith, J.');
        expect(formatted).toContain('"Understanding Machine Learning."');
        expect(formatted).toContain('Journal of AI Research');
        expect(formatted).toContain('Accessed');
      });
    });

    describe('Chicago format', () => {
      it('should format complete citation in Chicago style', () => {
        const formatted = service.formatCitation(sampleCitation, 'chicago');

        expect(formatted).toContain('Smith, J.');
        expect(formatted).toContain('"Understanding Machine Learning."');
        expect(formatted).toContain('Journal of AI Research');
      });
    });

    describe('Harvard format', () => {
      it('should format complete citation in Harvard style', () => {
        const formatted = service.formatCitation(sampleCitation, 'harvard');

        expect(formatted).toContain('Smith, J.');
        expect(formatted).toContain('(2024)');
        expect(formatted).toContain("'Understanding Machine Learning'");
        expect(formatted).toContain('Available at:');
      });
    });

    describe('BibTeX format', () => {
      it('should format complete citation in BibTeX style', () => {
        const formatted = service.formatCitation(sampleCitation, 'bibtex');

        expect(formatted).toContain('@article{');
        expect(formatted).toContain('author = {John Smith and Jane Doe}');
        expect(formatted).toContain('title = {Understanding Machine Learning}');
        expect(formatted).toContain('year = {2024}');
        expect(formatted).toContain('url = {https://example.com/ml-paper}');
      });

      it('should generate unique BibTeX keys', () => {
        const citation1 = { ...sampleCitation };
        const citation2 = {
          ...sampleCitation,
          title: 'Different Title',
          authors: ['Alice Brown'],
        };

        const formatted1 = service.formatCitation(citation1, 'bibtex');
        const formatted2 = service.formatCitation(citation2, 'bibtex');

        expect(formatted1).not.toEqual(formatted2);
      });
    });

    describe('JSON format', () => {
      it('should format citation as JSON', () => {
        const formatted = service.formatCitation(sampleCitation, 'json');
        const parsed = JSON.parse(formatted);

        expect(parsed.title).toBe('Understanding Machine Learning');
        expect(parsed.authors).toEqual(['John Smith', 'Jane Doe']);
        expect(parsed.credibility).toBe(0.95);
      });
    });
  });

  describe('formatCitations', () => {
    it('should format multiple citations with numbering', () => {
      const citations: Citation[] = [
        sampleCitation,
        { ...sampleCitation, title: 'Second Paper' },
      ];

      const formatted = service.formatCitations(citations, 'apa');

      expect(formatted).toContain('1.');
      expect(formatted).toContain('2.');
      expect(formatted).toContain('Understanding Machine Learning');
      expect(formatted).toContain('Second Paper');
    });

    it('should format BibTeX without numbering', () => {
      const citations: Citation[] = [sampleCitation, sampleCitation];
      const formatted = service.formatCitations(citations, 'bibtex');

      expect(formatted).not.toContain('1.');
      expect(formatted).toContain('@article{');
    });

    it('should handle empty array', () => {
      const formatted = service.formatCitations([], 'apa');

      expect(formatted).toBe('');
    });
  });

  describe('exportCitations', () => {
    it('should export with correct file extension for APA', () => {
      const exported = service.exportCitations([sampleCitation], 'apa');

      expect(exported.filename).toContain('.txt');
      expect(exported.mimeType).toBe('text/plain');
      expect(exported.content).toBeDefined();
    });

    it('should export with correct file extension for BibTeX', () => {
      const exported = service.exportCitations([sampleCitation], 'bibtex');

      expect(exported.filename).toContain('.bib');
      expect(exported.mimeType).toBe('application/x-bibtex');
    });

    it('should export with correct file extension for JSON', () => {
      const exported = service.exportCitations([sampleCitation], 'json');

      expect(exported.filename).toContain('.json');
      expect(exported.mimeType).toBe('application/json');
    });

    it('should use custom filename if provided', () => {
      const exported = service.exportCitations(
        [sampleCitation],
        'apa',
        'my-citations.txt'
      );

      expect(exported.filename).toBe('my-citations.txt');
    });

    it('should generate unique filenames', () => {
      const exported1 = service.exportCitations([sampleCitation], 'apa');
      const exported2 = service.exportCitations([sampleCitation], 'apa');

      // Filenames should be different due to timestamp
      expect(exported1.filename).not.toBe(exported2.filename);
    });
  });

  describe('edge cases', () => {
    it('should handle citation without authors', () => {
      const citation: Citation = {
        title: 'Anonymous Work',
        url: 'https://example.com',
      };

      const formatted = service.formatCitation(citation, 'apa');

      expect(formatted).toContain('Anonymous Work');
    });

    it('should handle citation without URL', () => {
      const citation: Citation = {
        title: 'Offline Source',
        url: '',
        authors: ['John Smith'],
      };

      const formatted = service.formatCitation(citation, 'apa');

      expect(formatted).toContain('Offline Source');
    });

    it('should handle special characters in title', () => {
      const citation: Citation = {
        title: 'AI: The Future & Beyond',
        url: 'https://example.com',
      };

      const formatted = service.formatCitation(citation, 'apa');

      expect(formatted).toContain('AI: The Future & Beyond');
    });
  });
});
