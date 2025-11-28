/**
 * Neo4j Knowledge Graph Service
 * Manage research knowledge graph with entities, relationships, and insights
 */

import neo4j, { Driver, Session, Integer } from 'neo4j-driver';

export interface Neo4jConfig {
  uri?: string;
  user?: string;
  password?: string;
}

export interface KnowledgeNode {
  id: string;
  type: 'Topic' | 'Source' | 'Finding' | 'Entity' | 'Concept';
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeRelationship {
  from: string;
  to: string;
  type: 'RELATES_TO' | 'CITED_IN' | 'SUPPORTS' | 'CONTRADICTS' | 'DERIVED_FROM';
  properties?: Record<string, any>;
}

export interface GraphQuery {
  query: string;
  parameters?: Record<string, any>;
}

export class Neo4jService {
  private driver: Driver | null = null;
  private uri: string;
  private user: string;
  private password: string;
  private initialized: boolean = false;

  constructor(config: Neo4jConfig = {}) {
    this.uri = config.uri || process.env.NEO4J_URL || 'bolt://localhost:7687';
    this.user = config.user || process.env.NEO4J_USER || 'neo4j';
    this.password = config.password || process.env.NEO4J_PASSWORD || 'researchhive123';
  }

  /**
   * Initialize connection to Neo4j
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.user, this.password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
        }
      );

      // Verify connectivity
      await this.driver.verifyConnectivity();
      this.initialized = true;

      console.log('✅ Neo4j knowledge graph connected');

      // Create constraints and indexes
      await this.createConstraints();
    } catch (error) {
      console.error('Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  /**
   * Create database constraints and indexes
   */
  private async createConstraints(): Promise<void> {
    const session = this.getSession();

    try {
      // Unique constraints
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE'
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE'
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (f:Finding) REQUIRE f.id IS UNIQUE'
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE'
      );

      // Indexes for faster lookups
      await session.run(
        'CREATE INDEX IF NOT EXISTS FOR (t:Topic) ON (t.label)'
      );
      await session.run(
        'CREATE INDEX IF NOT EXISTS FOR (s:Source) ON (s.url)'
      );

      console.log('✅ Neo4j constraints and indexes created');
    } catch (error) {
      console.error('Failed to create constraints:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Get a new session
   */
  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call initialize() first.');
    }
    return this.driver.session();
  }

  /**
   * Create a knowledge node
   */
  async createNode(node: KnowledgeNode): Promise<void> {
    const session = this.getSession();

    try {
      await session.run(
        `
        MERGE (n:${node.type} {id: $id})
        SET n.label = $label,
            n += $properties,
            n.updated = timestamp()
        RETURN n
        `,
        {
          id: node.id,
          label: node.label,
          properties: node.properties,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Create a relationship between nodes
   */
  async createRelationship(rel: KnowledgeRelationship): Promise<void> {
    const session = this.getSession();

    try {
      const properties = rel.properties || {};
      await session.run(
        `
        MATCH (a {id: $from})
        MATCH (b {id: $to})
        MERGE (a)-[r:${rel.type}]->(b)
        SET r += $properties,
            r.created = coalesce(r.created, timestamp()),
            r.updated = timestamp()
        RETURN r
        `,
        {
          from: rel.from,
          to: rel.to,
          properties,
        }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Store research findings in knowledge graph
   */
  async storeResearch(
    researchId: string,
    topic: string,
    findings: string[],
    sources: Array<{ title: string; url: string; relevance: number }>
  ): Promise<void> {
    const session = this.getSession();

    try {
      // Create topic node
      await this.createNode({
        id: `topic:${researchId}`,
        type: 'Topic',
        label: topic,
        properties: {
          researchId,
          timestamp: Date.now(),
        },
      });

      // Create source nodes and relationships
      for (const source of sources) {
        const sourceId = `source:${Buffer.from(source.url).toString('base64').substring(0, 32)}`;

        await this.createNode({
          id: sourceId,
          type: 'Source',
          label: source.title,
          properties: {
            url: source.url,
            relevance: source.relevance,
          },
        });

        await this.createRelationship({
          from: `topic:${researchId}`,
          to: sourceId,
          type: 'CITED_IN',
          properties: { relevance: source.relevance },
        });
      }

      // Create finding nodes and relationships
      for (let i = 0; i < findings.length; i++) {
        const findingId = `finding:${researchId}:${i}`;

        await this.createNode({
          id: findingId,
          type: 'Finding',
          label: findings[i],
          properties: {
            researchId,
            index: i,
          },
        });

        await this.createRelationship({
          from: `topic:${researchId}`,
          to: findingId,
          type: 'DERIVED_FROM',
        });
      }

      console.log(`✅ Stored research ${researchId} in knowledge graph`);
    } finally {
      await session.close();
    }
  }

  /**
   * Find related topics using graph traversal
   */
  async findRelatedTopics(
    topicId: string,
    maxDepth: number = 2,
    limit: number = 10
  ): Promise<KnowledgeNode[]> {
    const session = this.getSession();

    try {
      const result = await session.run(
        `
        MATCH path = (start:Topic {id: $topicId})-[*1..${maxDepth}]-(related:Topic)
        WHERE start <> related
        RETURN DISTINCT related.id as id,
               related.label as label,
               related AS properties,
               length(path) as distance
        ORDER BY distance ASC
        LIMIT $limit
        `,
        { topicId, limit: Integer.fromNumber(limit) }
      );

      return result.records.map((record) => ({
        id: record.get('id'),
        type: 'Topic' as const,
        label: record.get('label'),
        properties: record.get('properties').properties,
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Get research subgraph for visualization
   */
  async getResearchSubgraph(researchId: string): Promise<{
    nodes: KnowledgeNode[];
    relationships: KnowledgeRelationship[];
  }> {
    const session = this.getSession();

    try {
      const result = await session.run(
        `
        MATCH (topic:Topic {id: $topicId})-[r]-(connected)
        RETURN topic, r, connected
        `,
        { topicId: `topic:${researchId}` }
      );

      const nodes: KnowledgeNode[] = [];
      const relationships: KnowledgeRelationship[] = [];
      const seenNodes = new Set<string>();

      for (const record of result.records) {
        const topic = record.get('topic');
        const related = record.get('connected');
        const rel = record.get('r');

        // Add topic node
        if (!seenNodes.has(topic.properties.id)) {
          nodes.push({
            id: topic.properties.id,
            type: topic.labels[0] as any,
            label: topic.properties.label,
            properties: topic.properties,
          });
          seenNodes.add(topic.properties.id);
        }

        // Add related node
        if (!seenNodes.has(related.properties.id)) {
          nodes.push({
            id: related.properties.id,
            type: related.labels[0] as any,
            label: related.properties.label,
            properties: related.properties,
          });
          seenNodes.add(related.properties.id);
        }

        // Add relationship
        relationships.push({
          from: rel.start.toString(),
          to: rel.end.toString(),
          type: rel.type as any,
          properties: rel.properties,
        });
      }

      return { nodes, relationships };
    } finally {
      await session.close();
    }
  }

  /**
   * Execute custom Cypher query
   */
  async query(graphQuery: GraphQuery): Promise<any[]> {
    const session = this.getSession();

    try {
      const result = await session.run(graphQuery.query, graphQuery.parameters || {});
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }

  /**
   * Get graph statistics
   */
  async getStatistics(): Promise<{
    totalNodes: number;
    totalRelationships: number;
    nodesByType: Record<string, number>;
  }> {
    const session = this.getSession();

    try {
      // Total nodes
      const nodesResult = await session.run('MATCH (n) RETURN count(n) as count');
      const totalNodes = nodesResult.records[0].get('count').toNumber();

      // Total relationships
      const relsResult = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
      const totalRelationships = relsResult.records[0].get('count').toNumber();

      // Nodes by type
      const typesResult = await session.run(
        'MATCH (n) RETURN labels(n)[0] as type, count(n) as count'
      );

      const nodesByType: Record<string, number> = {};
      for (const record of typesResult.records) {
        nodesByType[record.get('type')] = record.get('count').toNumber();
      }

      return {
        totalNodes,
        totalRelationships,
        nodesByType,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Close driver connection
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.initialized = false;
      console.log('✅ Neo4j connection closed');
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let neo4jInstance: Neo4jService | null = null;

/**
 * Initialize Neo4j service
 */
export async function initializeNeo4j(config?: Neo4jConfig): Promise<Neo4jService> {
  if (!neo4jInstance) {
    neo4jInstance = new Neo4jService(config);
    await neo4jInstance.initialize();
  }
  return neo4jInstance;
}

/**
 * Get Neo4j service instance
 */
export function getNeo4jService(): Neo4jService {
  if (!neo4jInstance) {
    throw new Error('Neo4j service not initialized. Call initializeNeo4j() first.');
  }
  return neo4jInstance;
}
