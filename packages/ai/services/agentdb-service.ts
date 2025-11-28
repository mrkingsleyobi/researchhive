/**
 * AgentDB Service
 * Handles vector storage, semantic search, and episodic memory
 */

import agentdb from 'agentdb';

export interface AgentDBConfig {
  backend: 'sqlite' | 'wasm';
  path?: string;
  dimensions: number;
  indexType?: 'flat' | 'hnsw';
  hnswM?: number;
  hnswEfConstruction?: number;
}

export interface VectorDocument {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export interface Episode {
  context: string;
  action: string;
  outcome: string;
  success: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class AgentDBService {
  private db: any;
  private initialized: boolean = false;
  private dimensions: number;

  constructor(private config: AgentDBConfig) {
    this.dimensions = config.dimensions;
  }

  /**
   * Initialize AgentDB with configuration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.db = agentdb.init({
        backend: this.config.backend,
        path: this.config.path || './data/agentdb.sqlite',
        dimensions: this.config.dimensions,
        indexType: this.config.indexType || 'hnsw',
        hnswM: this.config.hnswM || 16,
        hnswEfConstruction: this.config.hnswEfConstruction || 200,
      });

      // Enable reflexive learning
      if (this.db.reflexion) {
        this.db.reflexion.configure({
          enabled: true,
          maxEpisodes: 10000,
          similarityThreshold: 0.8,
        });
      }

      this.initialized = true;
      console.log('✅ AgentDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AgentDB:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AgentDB not initialized. Call initialize() first.');
    }
  }

  /**
   * Insert a document with vector embedding
   */
  async insert(document: VectorDocument): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.insert({
        id: document.id,
        vector: document.vector,
        metadata: document.metadata,
      });
    } catch (error) {
      console.error('Failed to insert document:', error);
      throw error;
    }
  }

  /**
   * Batch insert multiple documents
   */
  async insertBatch(documents: VectorDocument[]): Promise<void> {
    this.ensureInitialized();

    try {
      for (const doc of documents) {
        await this.insert(doc);
      }
    } catch (error) {
      console.error('Failed to batch insert documents:', error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    limit: number = 10,
    similarityThreshold: number = 0.7
  ): Promise<SearchResult[]> {
    this.ensureInitialized();

    try {
      const results = await this.db.search(queryVector, limit, similarityThreshold);

      return results.map((r: any) => ({
        id: r.id,
        score: r.score,
        metadata: r.metadata,
      }));
    } catch (error) {
      console.error('Failed to search vectors:', error);
      throw error;
    }
  }

  /**
   * Store an episode for reflexive learning
   */
  async storeEpisode(episode: Episode): Promise<void> {
    this.ensureInitialized();

    if (!this.db.reflexion) {
      console.warn('Reflexion not available in this AgentDB version');
      return;
    }

    try {
      await this.db.reflexion.store({
        context: episode.context,
        action: episode.action,
        outcome: episode.outcome,
        success: episode.success,
        timestamp: episode.timestamp,
        metadata: episode.metadata,
      });
    } catch (error) {
      console.error('Failed to store episode:', error);
      throw error;
    }
  }

  /**
   * Retrieve similar episodes from memory
   */
  async retrieveSimilarEpisodes(
    queryEmbedding: number[],
    limit: number = 10,
    similarityThreshold: number = 0.8
  ): Promise<any[]> {
    this.ensureInitialized();

    if (!this.db.reflexion) {
      console.warn('Reflexion not available in this AgentDB version');
      return [];
    }

    try {
      const episodes = await this.db.reflexion.retrieve(
        queryEmbedding,
        limit,
        similarityThreshold
      );
      return episodes;
    } catch (error) {
      console.error('Failed to retrieve episodes:', error);
      return [];
    }
  }

  /**
   * Add a causal edge to the causal graph
   */
  async addCausalEdge(
    cause: string,
    effect: string,
    confidence: number,
    uplift: number
  ): Promise<void> {
    this.ensureInitialized();

    if (!this.db.causal) {
      console.warn('Causal graph not available in this AgentDB version');
      return;
    }

    try {
      await this.db.causal.addEdge({
        cause,
        effect,
        confidence,
        uplift,
      });
    } catch (error) {
      console.error('Failed to add causal edge:', error);
      throw error;
    }
  }

  /**
   * Query the causal graph
   */
  async queryCausalGraph(nodeId: string): Promise<any> {
    this.ensureInitialized();

    if (!this.db.causal) {
      console.warn('Causal graph not available in this AgentDB version');
      return null;
    }

    try {
      return await this.db.causal.query(nodeId);
    } catch (error) {
      console.error('Failed to query causal graph:', error);
      return null;
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.delete(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.db.clear();
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    this.ensureInitialized();

    try {
      const stats = await this.db.stats();
      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.initialized && this.db.close) {
      await this.db.close();
      this.initialized = false;
    }
  }
}

// Singleton instance
let agentDBInstance: AgentDBService | null = null;

/**
 * Get or create AgentDB service instance
 */
export function getAgentDB(config?: AgentDBConfig): AgentDBService {
  if (!agentDBInstance) {
    const defaultConfig: AgentDBConfig = {
      backend: 'sqlite',
      path: './data/agentdb.sqlite',
      dimensions: 384, // all-MiniLM-L6-v2 embeddings
      indexType: 'hnsw',
      hnswM: 16,
      hnswEfConstruction: 200,
    };

    agentDBInstance = new AgentDBService(config || defaultConfig);
  }

  return agentDBInstance;
}

/**
 * Initialize the global AgentDB instance
 */
export async function initializeAgentDB(config?: AgentDBConfig): Promise<AgentDBService> {
  const instance = getAgentDB(config);
  await instance.initialize();
  return instance;
}
