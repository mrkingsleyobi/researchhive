/**
 * Academic Research Agent
 *
 * Searches academic databases:
 * - arXiv (physics, math, CS, etc.)
 * - PubMed (medical/biomedical)
 * - Semantic Scholar (cross-disciplinary)
 */

import { BaseAgent, SearchResult, AgentConfig } from './base-agent';

export class AcademicAgent extends BaseAgent {
  constructor(config: AgentConfig = {}) {
    super('AcademicAgent', config);
  }

  async search(query: string, options: { maxResults?: number; source?: 'arxiv' | 'pubmed' | 'semantic-scholar' | 'all' } = {}): Promise<SearchResult[]> {
    await this.checkRateLimit();

    console.log(`[${this.name}] Searching academic sources for: ${query}`);

    const source = options.source || 'all';
    const maxResults = options.maxResults || this.config.maxResults || 10;

    try {
      const results: SearchResult[] = [];

      if (source === 'all' || source === 'arxiv') {
        const arxivResults = await this.retry(() => this.searchArXiv(query, maxResults));
        results.push(...arxivResults);
      }

      if (source === 'all' || source === 'pubmed') {
        const pubmedResults = await this.retry(() => this.searchPubMed(query, maxResults));
        results.push(...pubmedResults);
      }

      if (source === 'all' || source === 'semantic-scholar') {
        const semanticResults = await this.retry(() => this.searchSemanticScholar(query, maxResults));
        results.push(...semanticResults);
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.error(`[${this.name}] Search failed:`, error);
      return [];
    }
  }

  /**
   * Search arXiv for papers
   */
  private async searchArXiv(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = new URL('http://export.arxiv.org/api/query');
    url.searchParams.set('search_query', `all:${query}`);
    url.searchParams.set('start', '0');
    url.searchParams.set('max_results', maxResults.toString());
    url.searchParams.set('sortBy', 'relevance');
    url.searchParams.set('sortOrder', 'descending');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status}`);
      }

      const xml = await response.text();
      clearTimeout(timeoutId);

      return this.parseArXivXML(xml);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] arXiv search error:`, error);
      return [];
    }
  }

  /**
   * Parse arXiv XML response
   */
  private parseArXivXML(xml: string): SearchResult[] {
    const results: SearchResult[] = [];

    // Extract entries using regex (in production, use proper XML parser)
    const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
    let entryMatch;

    while ((entryMatch = entryPattern.exec(xml)) !== null) {
      const entry = entryMatch[1];

      const titleMatch = /<title>(.*?)<\/title>/.exec(entry);
      const summaryMatch = /<summary>(.*?)<\/summary>/.exec(entry);
      const linkMatch = /<id>(.*?)<\/id>/.exec(entry);
      const authorMatch = /<name>(.*?)<\/name>/.exec(entry);
      const publishedMatch = /<published>(.*?)<\/published>/.exec(entry);

      if (titleMatch && linkMatch) {
        results.push({
          title: titleMatch[1].trim().replace(/\s+/g, ' '),
          url: linkMatch[1].trim(),
          snippet: summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ').substring(0, 300) : '',
          source: 'arXiv',
          author: authorMatch ? authorMatch[1].trim() : undefined,
          publishedDate: publishedMatch ? publishedMatch[1].trim() : undefined,
        });
      }
    }

    return results;
  }

  /**
   * Search PubMed for medical/biomedical papers
   */
  private async searchPubMed(query: string, maxResults: number): Promise<SearchResult[]> {
    // Step 1: Search to get PMIDs
    const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    searchUrl.searchParams.set('db', 'pubmed');
    searchUrl.searchParams.set('term', query);
    searchUrl.searchParams.set('retmax', maxResults.toString());
    searchUrl.searchParams.set('retmode', 'json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(searchUrl.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`PubMed API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      const pmids = data.esearchresult?.idlist || [];

      if (pmids.length === 0) {
        return [];
      }

      // Step 2: Fetch summaries for PMIDs
      return await this.fetchPubMedSummaries(pmids);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] PubMed search error:`, error);
      return [];
    }
  }

  /**
   * Fetch PubMed article summaries
   */
  private async fetchPubMedSummaries(pmids: string[]): Promise<SearchResult[]> {
    const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
    summaryUrl.searchParams.set('db', 'pubmed');
    summaryUrl.searchParams.set('id', pmids.join(','));
    summaryUrl.searchParams.set('retmode', 'json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(summaryUrl.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`PubMed summary API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      const results: SearchResult[] = [];
      const uids = data.result?.uids || [];

      for (const uid of uids) {
        const article = data.result[uid];
        if (article) {
          results.push({
            title: article.title || 'Untitled',
            url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
            snippet: article.source || '',
            source: 'PubMed',
            author: article.authors?.[0]?.name,
            publishedDate: article.pubdate,
          });
        }
      }

      return results;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] PubMed summary error:`, error);
      return [];
    }
  }

  /**
   * Search Semantic Scholar
   */
  private async searchSemanticScholar(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = new URL('https://api.semanticscholar.org/graph/v1/paper/search');
    url.searchParams.set('query', query);
    url.searchParams.set('limit', Math.min(maxResults, 100).toString());
    url.searchParams.set('fields', 'title,abstract,url,authors,year,citationCount');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeoutId);

      return (data.data || []).map((paper: any) => ({
        title: paper.title,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        snippet: paper.abstract || '',
        source: 'Semantic Scholar',
        author: paper.authors?.[0]?.name,
        publishedDate: paper.year?.toString(),
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[${this.name}] Semantic Scholar search error:`, error);
      return [];
    }
  }
}
