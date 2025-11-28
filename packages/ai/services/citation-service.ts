/**
 * Citation Service
 * Handles citation formatting and export in various styles
 */

export interface Citation {
  title: string;
  url: string;
  authors?: string[];
  publishedDate?: string;
  accessedDate?: string;
  source?: string;
  credibility?: number;
}

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex' | 'json';

export class CitationService {
  /**
   * Format a citation in the specified style
   */
  formatCitation(citation: Citation, style: CitationStyle): string {
    switch (style) {
      case 'apa':
        return this.formatAPA(citation);
      case 'mla':
        return this.formatMLA(citation);
      case 'chicago':
        return this.formatChicago(citation);
      case 'harvard':
        return this.formatHarvard(citation);
      case 'bibtex':
        return this.formatBibTeX(citation);
      case 'json':
        return JSON.stringify(citation, null, 2);
      default:
        return this.formatAPA(citation);
    }
  }

  /**
   * Format multiple citations
   */
  formatCitations(citations: Citation[], style: CitationStyle): string {
    return citations
      .map((citation, index) => {
        const formatted = this.formatCitation(citation, style);
        return style === 'bibtex' ? formatted : `${index + 1}. ${formatted}`;
      })
      .join('\n\n');
  }

  /**
   * Export citations to a file (returns content as string)
   */
  exportCitations(
    citations: Citation[],
    style: CitationStyle,
    filename?: string
  ): { content: string; filename: string; mimeType: string } {
    const content = this.formatCitations(citations, style);
    const extension = this.getFileExtension(style);
    const defaultFilename = `citations-${Date.now()}${extension}`;

    return {
      content,
      filename: filename || defaultFilename,
      mimeType: this.getMimeType(style),
    };
  }

  /**
   * Format citation in APA style (7th edition)
   * Example: Smith, J. (2023). Title of Article. Source. https://example.com
   */
  private formatAPA(citation: Citation): string {
    const parts: string[] = [];

    // Authors
    if (citation.authors && citation.authors.length > 0) {
      const authors = this.formatAuthorsAPA(citation.authors);
      parts.push(authors);
    }

    // Year
    if (citation.publishedDate) {
      const year = this.extractYear(citation.publishedDate);
      parts.push(`(${year}).`);
    }

    // Title
    parts.push(`${citation.title}.`);

    // Source
    if (citation.source) {
      parts.push(`${citation.source}.`);
    }

    // URL
    if (citation.url) {
      parts.push(citation.url);
    }

    return parts.join(' ');
  }

  /**
   * Format citation in MLA style (9th edition)
   * Example: Smith, John. "Title of Article." Source, Date, URL. Accessed Date.
   */
  private formatMLA(citation: Citation): string {
    const parts: string[] = [];

    // Authors
    if (citation.authors && citation.authors.length > 0) {
      const authors = this.formatAuthorsMLA(citation.authors);
      parts.push(`${authors}.`);
    }

    // Title
    parts.push(`"${citation.title}."`);

    // Source
    if (citation.source) {
      parts.push(`${citation.source},`);
    }

    // Date
    if (citation.publishedDate) {
      parts.push(`${this.formatDateMLA(citation.publishedDate)},`);
    }

    // URL
    if (citation.url) {
      parts.push(`${citation.url}.`);
    }

    // Accessed date
    if (citation.accessedDate) {
      parts.push(`Accessed ${this.formatDateMLA(citation.accessedDate)}.`);
    }

    return parts.join(' ');
  }

  /**
   * Format citation in Chicago style (17th edition)
   * Example: Smith, John. "Title of Article." Source, Date. https://example.com.
   */
  private formatChicago(citation: Citation): string {
    const parts: string[] = [];

    // Authors
    if (citation.authors && citation.authors.length > 0) {
      const authors = this.formatAuthorsChicago(citation.authors);
      parts.push(`${authors}.`);
    }

    // Title
    parts.push(`"${citation.title}."`);

    // Source
    if (citation.source) {
      parts.push(`${citation.source}.`);
    }

    // Date
    if (citation.publishedDate) {
      parts.push(`${this.formatDateChicago(citation.publishedDate)}.`);
    }

    // URL
    if (citation.url) {
      parts.push(citation.url + '.');
    }

    return parts.join(' ');
  }

  /**
   * Format citation in Harvard style
   * Example: Smith, J. (2023) 'Title of Article', Source. Available at: https://example.com (Accessed: Date).
   */
  private formatHarvard(citation: Citation): string {
    const parts: string[] = [];

    // Authors and year
    if (citation.authors && citation.authors.length > 0) {
      const authors = this.formatAuthorsHarvard(citation.authors);
      const year = citation.publishedDate ? this.extractYear(citation.publishedDate) : 'n.d.';
      parts.push(`${authors} (${year})`);
    }

    // Title
    parts.push(`'${citation.title}',`);

    // Source
    if (citation.source) {
      parts.push(`${citation.source}.`);
    }

    // URL
    if (citation.url) {
      parts.push(`Available at: ${citation.url}`);
    }

    // Accessed date
    if (citation.accessedDate) {
      parts.push(`(Accessed: ${this.formatDateHarvard(citation.accessedDate)}).`);
    }

    return parts.join(' ');
  }

  /**
   * Format citation in BibTeX format
   */
  private formatBibTeX(citation: Citation): string {
    const key = this.generateBibTeXKey(citation);
    const fields: string[] = [];

    if (citation.authors && citation.authors.length > 0) {
      fields.push(`  author = {${citation.authors.join(' and ')}}`);
    }

    fields.push(`  title = {${citation.title}}`);

    if (citation.source) {
      fields.push(`  journal = {${citation.source}}`);
    }

    if (citation.publishedDate) {
      const year = this.extractYear(citation.publishedDate);
      fields.push(`  year = {${year}}`);
    }

    if (citation.url) {
      fields.push(`  url = {${citation.url}}`);
    }

    if (citation.accessedDate) {
      fields.push(`  note = {Accessed: ${citation.accessedDate}}`);
    }

    return `@article{${key},\n${fields.join(',\n')}\n}`;
  }

  // Helper methods for author formatting

  private formatAuthorsAPA(authors: string[]): string {
    if (authors.length === 1) {
      return this.formatAuthorLastFirst(authors[0]);
    } else if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])}, & ${this.formatAuthorLastFirst(authors[1])}`;
    } else {
      const formatted = authors.slice(0, -1).map(a => this.formatAuthorLastFirst(a));
      return `${formatted.join(', ')}, & ${this.formatAuthorLastFirst(authors[authors.length - 1])}`;
    }
  }

  private formatAuthorsMLA(authors: string[]): string {
    if (authors.length === 1) {
      return this.formatAuthorLastFirst(authors[0]);
    } else if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])}, and ${authors[1]}`;
    } else {
      return `${this.formatAuthorLastFirst(authors[0])}, et al`;
    }
  }

  private formatAuthorsChicago(authors: string[]): string {
    return this.formatAuthorsMLA(authors);
  }

  private formatAuthorsHarvard(authors: string[]): string {
    if (authors.length === 1) {
      return this.getLastNameInitials(authors[0]);
    } else if (authors.length === 2) {
      return `${this.getLastNameInitials(authors[0])} and ${this.getLastNameInitials(authors[1])}`;
    } else {
      return `${this.getLastNameInitials(authors[0])} et al.`;
    }
  }

  private formatAuthorLastFirst(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(n => n[0] + '.').join(' ');
    return `${lastName}, ${initials}`;
  }

  private getLastNameInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(n => n[0] + '.').join('');
    return `${lastName}, ${initials}`;
  }

  // Helper methods for date formatting

  private extractYear(date: string): string {
    const match = date.match(/\d{4}/);
    return match ? match[0] : 'n.d.';
  }

  private formatDateMLA(date: string): string {
    // Try to parse the date and format as "Day Month Year"
    try {
      const d = new Date(date);
      const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return date;
    }
  }

  private formatDateChicago(date: string): string {
    // Format as "Month Day, Year"
    try {
      const d = new Date(date);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } catch {
      return date;
    }
  }

  private formatDateHarvard(date: string): string {
    // Format as "Day Month Year"
    try {
      const d = new Date(date);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return date;
    }
  }

  // Helper methods for file handling

  private generateBibTeXKey(citation: Citation): string {
    const author = citation.authors && citation.authors.length > 0
      ? citation.authors[0].split(' ').pop()?.toLowerCase()
      : 'unknown';
    const year = citation.publishedDate ? this.extractYear(citation.publishedDate) : 'nd';
    const titleWord = citation.title.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${author}${year}${titleWord}`;
  }

  private getFileExtension(style: CitationStyle): string {
    switch (style) {
      case 'bibtex':
        return '.bib';
      case 'json':
        return '.json';
      default:
        return '.txt';
    }
  }

  private getMimeType(style: CitationStyle): string {
    switch (style) {
      case 'bibtex':
        return 'application/x-bibtex';
      case 'json':
        return 'application/json';
      default:
        return 'text/plain';
    }
  }
}

// Singleton instance
let citationServiceInstance: CitationService | null = null;

/**
 * Get or create citation service instance
 */
export function getCitationService(): CitationService {
  if (!citationServiceInstance) {
    citationServiceInstance = new CitationService();
  }
  return citationServiceInstance;
}
