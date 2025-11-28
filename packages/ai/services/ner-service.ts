/**
 * Named Entity Recognition (NER) Service
 * Extract named entities from text using HuggingFace models
 */

export interface NEREntity {
  entity: string;
  word: string;
  score: number;
  start: number;
  end: number;
  entityGroup?: string;
}

export interface NERConfig {
  model?: string;
  apiKey?: string;
  threshold?: number;
}

export interface NERResult {
  entities: NEREntity[];
  entityGroups: {
    [key: string]: string[];
  };
  text: string;
}

export class NERService {
  private model: string;
  private apiKey?: string;
  private threshold: number;

  constructor(config: NERConfig = {}) {
    // Use a specialized NER model (dslim/bert-base-NER is excellent for general NER)
    this.model = config.model || 'dslim/bert-base-NER';
    this.apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY;
    this.threshold = config.threshold || 0.9; // High confidence threshold
  }

  /**
   * Extract named entities from text
   */
  async extractEntities(text: string): Promise<NERResult> {
    if (this.apiKey && this.apiKey !== 'your-huggingface-api-key-here') {
      return await this.extractWithHuggingFace(text);
    }

    // Fallback to simple pattern-based extraction
    return this.extractSimple(text);
  }

  /**
   * Extract entities using HuggingFace API
   */
  private async extractWithHuggingFace(text: string): Promise<NERResult> {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.model}`,
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

      const rawEntities: NEREntity[] = await response.json();

      // Filter by confidence threshold
      const filteredEntities = rawEntities.filter(
        (entity) => entity.score >= this.threshold
      );

      // Group entities by type
      const entityGroups = this.groupEntities(filteredEntities);

      return {
        entities: filteredEntities,
        entityGroups,
        text,
      };
    } catch (error) {
      console.error('Failed to extract entities with HuggingFace:', error);
      return this.extractSimple(text);
    }
  }

  /**
   * Simple pattern-based entity extraction (fallback)
   */
  private extractSimple(text: string): NERResult {
    const entities: NEREntity[] = [];

    // Extract potential person names (capitalized words)
    const personPattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    let match;
    while ((match = personPattern.exec(text)) !== null) {
      entities.push({
        entity: 'B-PER',
        word: match[1],
        score: 0.7,
        start: match.index,
        end: match.index + match[1].length,
        entityGroup: 'PERSON',
      });
    }

    // Extract potential organizations (with Inc, Corp, Ltd, etc.)
    const orgPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|Ltd|LLC|Foundation|Institute|University)\.?))\b/g;
    while ((match = orgPattern.exec(text)) !== null) {
      entities.push({
        entity: 'B-ORG',
        word: match[1],
        score: 0.7,
        start: match.index,
        end: match.index + match[1].length,
        entityGroup: 'ORGANIZATION',
      });
    }

    // Extract potential locations (countries, cities - simple patterns)
    const locationPattern = /\b(United States|New York|London|Paris|Berlin|Tokyo|Beijing|San Francisco|Los Angeles|Chicago)\b/g;
    while ((match = locationPattern.exec(text)) !== null) {
      entities.push({
        entity: 'B-LOC',
        word: match[1],
        score: 0.7,
        start: match.index,
        end: match.index + match[1].length,
        entityGroup: 'LOCATION',
      });
    }

    const entityGroups = this.groupEntities(entities);

    return {
      entities,
      entityGroups,
      text,
    };
  }

  /**
   * Group entities by type
   */
  private groupEntities(entities: NEREntity[]): { [key: string]: string[] } {
    const groups: { [key: string]: string[] } = {};

    for (const entity of entities) {
      const group = entity.entityGroup || this.getEntityGroup(entity.entity);
      if (!groups[group]) {
        groups[group] = [];
      }
      if (!groups[group].includes(entity.word)) {
        groups[group].push(entity.word);
      }
    }

    return groups;
  }

  /**
   * Map entity type to group
   */
  private getEntityGroup(entityType: string): string {
    if (entityType.includes('PER')) return 'PERSON';
    if (entityType.includes('ORG')) return 'ORGANIZATION';
    if (entityType.includes('LOC')) return 'LOCATION';
    if (entityType.includes('MISC')) return 'MISCELLANEOUS';
    return 'OTHER';
  }

  /**
   * Extract entities from multiple texts
   */
  async extractEntitiesBatch(texts: string[]): Promise<NERResult[]> {
    const results = await Promise.all(
      texts.map((text) => this.extractEntities(text))
    );
    return results;
  }

  /**
   * Get unique entities across multiple documents
   */
  mergeResults(results: NERResult[]): NERResult {
    const allEntities: NEREntity[] = [];
    const mergedGroups: { [key: string]: Set<string> } = {};

    for (const result of results) {
      allEntities.push(...result.entities);

      for (const [group, words] of Object.entries(result.entityGroups)) {
        if (!mergedGroups[group]) {
          mergedGroups[group] = new Set();
        }
        words.forEach((word) => mergedGroups[group].add(word));
      }
    }

    const entityGroups: { [key: string]: string[] } = {};
    for (const [group, wordSet] of Object.entries(mergedGroups)) {
      entityGroups[group] = Array.from(wordSet);
    }

    return {
      entities: allEntities,
      entityGroups,
      text: results.map((r) => r.text).join('\n'),
    };
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
let nerInstance: NERService | null = null;

/**
 * Get or create NER service instance
 */
export function getNERService(config?: NERConfig): NERService {
  if (!nerInstance) {
    nerInstance = new NERService(config);
  }
  return nerInstance;
}
