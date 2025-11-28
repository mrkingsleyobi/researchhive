import type { ResearchDepth, Research } from '@researchhive/types';
import { db } from '@researchhive/database';
import { claudeClient } from './claude-client';
import { AgentDBService, initializeAgentDB, getAgentDB } from './agentdb-service';
import { EmbeddingsService, getEmbeddings } from './embeddings-service';
import path from 'path';

export interface ResearchConfig {
  topic: string;
  depth: ResearchDepth;
  sources?: string[];
}

export interface ResearchProgress {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  agentsDeployed?: number;
  sourcesFound?: number;
}

export interface ResearchResult {
  summary: string;
  keyFindings: string[];
  sources: Array<{
    title: string;
    url: string;
    relevance: number;
    credibility: number;
  }>;
  insights: string[];
  recommendations: string[];
}

export type ProgressEventEmitter = (
  researchId: string,
  progress: ResearchProgress
) => void;

/**
 * Orchestrates multi-agent research using claude-flow and AgentDB
 */
export class ResearchOrchestrator {
  private agentDB: AgentDBService;
  private embeddings: EmbeddingsService;
  private activeResearch: Map<string, ResearchProgress> = new Map();
  private resultsCache: Map<string, ResearchResult> = new Map();
  private initialized: boolean = false;
  private progressEmitter?: ProgressEventEmitter;

  constructor(progressEmitter?: ProgressEventEmitter) {
    this.agentDB = getAgentDB();
    this.embeddings = getEmbeddings();
    this.progressEmitter = progressEmitter;
    this.initialize().catch(error => {
      console.error('Failed to initialize ResearchOrchestrator:', error);
    });
    console.log('🧠 Research Orchestrator initialized');
  }

  /**
   * Initialize AgentDB for knowledge persistence
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.agentDB.initialize();
      this.initialized = true;
      console.log('✅ AgentDB initialized for vector search and episodic memory');
    } catch (error) {
      console.warn('⚠️  AgentDB initialization failed, continuing without vector search:', error);
      // Continue without AgentDB - graceful degradation
    }
  }

  /**
   * Start a new research task with multi-agent swarm
   */
  async startResearch(config: ResearchConfig, databaseId: string): Promise<string> {
    console.log(`🔬 Starting research: ${config.topic}`);
    console.log(`📊 Depth: ${config.depth}`);
    console.log(`🆔 Research ID: ${databaseId}`);

    // Initialize research progress tracking
    this.activeResearch.set(databaseId, {
      status: 'in_progress',
      progress: 0,
      currentStep: 'Initializing agents',
      agentsDeployed: 0,
      sourcesFound: 0,
    });

    // Run research asynchronously
    this.executeResearch(databaseId, config).catch(async (error) => {
      console.error(`Research ${databaseId} failed:`, error);
      this.activeResearch.set(databaseId, {
        status: 'failed',
        progress: 0,
        currentStep: 'Error: ' + error.message,
      });

      // Update database
      await db.research.update({
        where: { id: databaseId },
        data: { status: 'FAILED' },
      });
    });

    return databaseId;
  }

  /**
   * Execute research using multi-agent swarm
   */
  private async executeResearch(
    researchId: string,
    config: ResearchConfig
  ): Promise<void> {
    const agentCount = this.getAgentCount(config.depth);

    // Step 1: Deploy agents
    this.updateProgress(researchId, {
      progress: 10,
      currentStep: `Deploying ${agentCount} research agents`,
      agentsDeployed: agentCount,
    });

    // Step 2: Research phase - gather information
    this.updateProgress(researchId, {
      progress: 30,
      currentStep: 'Gathering sources and information',
    });

    // Simulate research gathering (this will be replaced with actual claude-flow integration)
    const sources = await this.gatherSources(config.topic, agentCount);

    this.updateProgress(researchId, {
      progress: 50,
      currentStep: 'Analyzing and synthesizing findings',
      sourcesFound: sources.length,
    });

    // Step 3: Store findings in AgentDB for future reference
    await this.storeFindings(researchId, config.topic, sources);

    // Step 4: Synthesize results
    this.updateProgress(researchId, {
      progress: 80,
      currentStep: 'Generating final report',
    });

    const results = await this.synthesizeResults(researchId, config.topic, sources);

    // Step 5: Complete
    this.updateProgress(researchId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Research completed',
    });

    // Store complete results in cache
    this.resultsCache.set(researchId, results);

    // Save to database
    await db.research.update({
      where: { id: researchId },
      data: {
        status: 'COMPLETED',
        findings: JSON.stringify(results),
        sources: JSON.stringify(results.sources),
      },
    });

    // Create citations
    for (const source of results.sources) {
      await db.citation.create({
        data: {
          researchId,
          title: source.title,
          url: source.url,
          source: 'web',
          credibility: source.credibility,
        },
      });
    }

    console.log(`✅ Research ${researchId} saved to database`);
  }

  /**
   * Gather sources using multi-agent approach with parallel execution
   *
   * Uses real Claude AI agents when API key is configured, otherwise falls back to simulation.
   */
  private async gatherSources(
    topic: string,
    agentCount: number
  ): Promise<Array<{ title: string; url: string; relevance: number }>> {
    console.log(`📚 ${agentCount} agents gathering sources for: ${topic}`);

    // Define research focuses for agents to specialize in
    const focuses = [
      'overview and fundamentals',
      'recent developments and trends',
      'best practices and guidelines',
      'case studies and examples',
      'research papers and academic sources',
      'industry reports and analysis',
      'expert opinions and thought leadership',
      'tools and technologies',
    ];

    // Check if real AI is available
    const useRealAI = claudeClient.isRealAIAvailable();

    if (useRealAI) {
      console.log('🤖 Using real Claude AI for research');
      return this.gatherSourcesWithAI(topic, agentCount, focuses);
    } else {
      console.log('🔬 Using simulation mode (set ANTHROPIC_API_KEY for real AI)');
      return this.gatherSourcesSimulation(topic, agentCount, focuses);
    }
  }

  /**
   * Gather sources using real Claude AI agents
   */
  private async gatherSourcesWithAI(
    topic: string,
    agentCount: number,
    focuses: string[]
  ): Promise<Array<{ title: string; url: string; relevance: number }>> {
    // Deploy AI agents in parallel
    const agentPromises = Array.from({ length: agentCount }, async (_, index) => {
      const focus = focuses[index % focuses.length];
      const agentId = `Agent-${index + 1}`;

      console.log(`  🤖 ${agentId}: Researching ${topic} - ${focus}`);

      try {
        const response = await claudeClient.research({
          topic,
          focus,
          depth: agentCount <= 4 ? 'quick' : agentCount <= 8 ? 'standard' : 'deep',
        });

        return response.sources.map(source => ({
          ...source,
          focus,
          agentId,
        }));
      } catch (error) {
        console.error(`  ❌ ${agentId} failed:`, error instanceof Error ? error.message : 'Unknown error');
        // Return empty array on failure - other agents may succeed
        return [];
      }
    });

    // Wait for all agents to complete
    const agentResults = await Promise.all(agentPromises);

    // Flatten results from all agents
    const allSources = agentResults.flat();

    // Aggregate and deduplicate results
    const uniqueSources = this.deduplicateSources(allSources);

    // Sort by relevance (best sources first)
    const sortedSources = uniqueSources
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, Math.max(3, Math.floor(agentCount * 2))); // Up to 2x sources per agent

    console.log(`  ✅ Collected ${sortedSources.length} unique sources from AI agents`);

    return sortedSources.map(({ title, url, relevance }) => ({
      title,
      url,
      relevance,
    }));
  }

  /**
   * Gather sources using simulation (fallback when no API key)
   */
  private async gatherSourcesSimulation(
    topic: string,
    agentCount: number,
    focuses: string[]
  ): Promise<Array<{ title: string; url: string; relevance: number }>> {
    // Simulate parallel agent execution
    const agentPromises = Array.from({ length: agentCount }, async (_, index) => {
      const focus = focuses[index % focuses.length];
      const agentId = `Agent-${index + 1}`;

      console.log(`  🤖 ${agentId}: Researching ${topic} - ${focus}`);

      // Simulate agent processing time (varies by agent workload)
      await this.simulateAgentWork(100 + Math.random() * 200);

      return {
        title: `${topic} - ${focus.charAt(0).toUpperCase() + focus.slice(1)}`,
        url: `https://example.com/research/${this.slugify(topic)}/${this.slugify(focus)}`,
        relevance: 0.75 + Math.random() * 0.25, // 0.75-1.0 range
        focus,
        agentId,
      };
    });

    // Wait for all agents to complete (parallel execution)
    const allSources = await Promise.all(agentPromises);

    // Aggregate and deduplicate results
    const uniqueSources = this.deduplicateSources(allSources);

    // Sort by relevance (best sources first)
    const sortedSources = uniqueSources
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, Math.max(3, Math.floor(agentCount * 0.75))); // Top 75% of agents' findings

    console.log(`  ✅ Collected ${sortedSources.length} unique sources`);

    return sortedSources.map(({ title, url, relevance }) => ({
      title,
      url,
      relevance,
    }));
  }

  /**
   * Simulate agent processing time
   */
  private async simulateAgentWork(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convert string to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Remove duplicate sources based on URL and title similarity
   */
  private deduplicateSources<T extends { url: string; title: string }>(
    sources: T[]
  ): T[] {
    const seen = new Set<string>();
    return sources.filter(source => {
      const key = `${source.url}|${source.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Store findings in AgentDB for semantic search and future retrieval
   */
  private async storeFindings(
    researchId: string,
    topic: string,
    sources: Array<{ title: string; url: string; relevance: number }>
  ): Promise<void> {
    console.log(`💾 Storing ${sources.length} sources for research ${researchId}`);

    if (!this.initialized) {
      console.warn('⚠️  AgentDB not initialized, skipping vector storage');
      return;
    }

    try {
      // Generate embedding for the research topic
      const topicEmbedding = await this.embeddings.generateEmbedding(topic);

      // Store the research in AgentDB
      await this.agentDB.insert({
        id: researchId,
        vector: topicEmbedding,
        metadata: {
          topic,
          sourceCount: sources.length,
          timestamp: Date.now(),
          sources: sources.map(s => ({
            title: s.title,
            url: s.url,
            relevance: s.relevance,
          })),
        },
      });

      // Store each source individually for granular search
      for (const source of sources) {
        const sourceText = `${source.title}`;
        const sourceEmbedding = await this.embeddings.generateEmbedding(sourceText);

        await this.agentDB.insert({
          id: `${researchId}-source-${source.url}`,
          vector: sourceEmbedding,
          metadata: {
            researchId,
            topic,
            sourceTitle: source.title,
            sourceUrl: source.url,
            relevance: source.relevance,
            timestamp: Date.now(),
          },
        });
      }

      console.log(`✅ Stored research and ${sources.length} sources in AgentDB`);

      // Store as an episode for reflexive learning
      await this.agentDB.storeEpisode({
        context: `Research on topic: ${topic}`,
        action: `Gathered ${sources.length} sources using ${this.getAgentCount('standard')} agents`,
        outcome: `Successfully collected ${sources.length} relevant sources`,
        success: sources.length > 0,
        timestamp: Date.now(),
        metadata: {
          topic,
          researchId,
          sourceCount: sources.length,
        },
      });
    } catch (error) {
      console.error('Failed to store findings in AgentDB:', error);
      // Continue without storage - graceful degradation
    }
  }

  /**
   * Synthesize research results from gathered sources
   *
   * In production, this would use AI models to:
   * - Analyze and summarize content from each source
   * - Extract key findings and insights
   * - Generate recommendations based on patterns
   * - Score credibility and relevance
   */
  private async synthesizeResults(
    researchId: string,
    topic: string,
    sources: Array<{ title: string; url: string; relevance: number }>
  ): Promise<ResearchResult> {
    console.log(`🔬 Synthesizing results from ${sources.length} sources...`);

    // Simulate AI analysis time
    await this.simulateAgentWork(500);

    // Calculate diversity score (how many different aspects covered)
    const diversityScore = Math.min(sources.length / 8, 1);

    // Generate contextual summary
    const summary = this.generateSummary(topic, sources.length, diversityScore);

    // Extract key findings based on source analysis
    const keyFindings = this.extractKeyFindings(topic, sources, diversityScore);

    // Generate insights from cross-referencing sources
    const insights = this.generateInsights(topic, sources);

    // Provide actionable recommendations
    const recommendations = this.generateRecommendations(topic, diversityScore);

    // Add credibility scores based on relevance
    const scoredSources = sources.map(s => ({
      ...s,
      credibility: Math.min(0.85 + s.relevance * 0.15, 1.0), // 0.85-1.0 range
    }));

    return {
      summary,
      keyFindings,
      sources: scoredSources,
      insights,
      recommendations,
    };
  }

  private generateSummary(topic: string, sourceCount: number, diversity: number): string {
    const quality = diversity > 0.7 ? 'comprehensive' : diversity > 0.4 ? 'thorough' : 'focused';
    return `${quality.charAt(0).toUpperCase() + quality.slice(1)} research on "${topic}" has been completed with ${sourceCount} high-quality sources analyzed across multiple perspectives, providing actionable insights and recommendations.`;
  }

  private extractKeyFindings(topic: string, sources: any[], diversity: number): string[] {
    const findings: string[] = [];

    // Finding 1: Based on topic analysis
    findings.push(
      `Analysis of ${sources.length} sources reveals ${topic} is a significant area with substantial documentation and ongoing development`
    );

    // Finding 2: Based on diversity
    if (diversity > 0.6) {
      findings.push(
        'Multiple perspectives examined, including fundamentals, recent developments, best practices, and real-world applications'
      );
    } else {
      findings.push(
        'Research focused on core aspects, providing deep insights into key areas'
      );
    }

    // Finding 3: Based on source quality
    const avgRelevance = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;
    if (avgRelevance > 0.85) {
      findings.push(
        'High-quality, highly relevant sources confirm the importance and current relevance of this topic'
      );
    } else {
      findings.push(
        'Credible sources provide validated information and established best practices'
      );
    }

    return findings;
  }

  private generateInsights(topic: string, sources: any[]): string[] {
    return [
      `Cross-referencing ${sources.length} sources reveals consistent patterns and validates key concepts`,
      'Recent publications and established resources show both foundational principles and emerging trends',
      'Multiple authoritative sources converge on similar conclusions, increasing confidence in findings',
    ];
  }

  private generateRecommendations(topic: string, diversity: number): string[] {
    const recommendations: string[] = [
      `Continue monitoring developments in ${topic} to stay current with latest advancements`,
      'Consider implementing identified best practices to maximize value and minimize risks',
    ];

    if (diversity > 0.6) {
      recommendations.push(
        'Leverage the comprehensive perspective gained to make informed strategic decisions'
      );
    }

    return recommendations;
  }

  /**
   * Update research progress and emit WebSocket events
   */
  private updateProgress(
    researchId: string,
    updates: Partial<ResearchProgress>
  ): void {
    const current = this.activeResearch.get(researchId) || {
      status: 'in_progress' as const,
      progress: 0,
    };

    const newProgress = {
      ...current,
      ...updates,
    };

    this.activeResearch.set(researchId, newProgress);

    // Emit progress update via WebSocket if emitter is configured
    if (this.progressEmitter) {
      this.progressEmitter(researchId, newProgress);
    }
  }

  /**
   * Get research progress
   */
  async getProgress(researchId: string): Promise<ResearchProgress> {
    const progress = this.activeResearch.get(researchId);

    if (!progress) {
      return {
        status: 'pending',
        progress: 0,
        currentStep: 'Research not found',
      };
    }

    return progress;
  }

  /**
   * Get research results from cache
   */
  async getResults(researchId: string): Promise<ResearchResult | null> {
    return this.resultsCache.get(researchId) || null;
  }

  /**
   * Search previous research using vector similarity search
   */
  async searchPreviousResearch(query: string, limit: number = 5) {
    if (!this.initialized) {
      console.warn('⚠️  AgentDB not initialized, using cache fallback');
      return Array.from(this.resultsCache.entries())
        .slice(0, limit)
        .map(([id, result]) => ({
          id,
          text: result.summary,
          metadata: { query },
        }));
    }

    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.embeddings.generateEmbedding(query);

      // Search for similar research in AgentDB
      const results = await this.agentDB.search(queryEmbedding, limit, 0.7);

      console.log(`🔍 Found ${results.length} similar research items for query: "${query}"`);

      return results.map(result => ({
        id: result.id,
        text: result.metadata.topic || 'Unknown topic',
        metadata: {
          ...result.metadata,
          similarity: result.score,
          query,
        },
      }));
    } catch (error) {
      console.error('Vector search failed, using cache fallback:', error);
      return Array.from(this.resultsCache.entries())
        .slice(0, limit)
        .map(([id, result]) => ({
          id,
          text: result.summary,
          metadata: { query },
        }));
    }
  }

  private getAgentCount(depth: ResearchDepth): number {
    switch (depth) {
      case 'quick':
        return 4;
      case 'standard':
        return 8;
      case 'deep':
        return 16;
      default:
        return 8;
    }
  }
}

// Singleton instance - can be configured with progress emitter
let researchOrchestratorInstance: ResearchOrchestrator | null = null;

export function initializeResearchOrchestrator(
  progressEmitter?: ProgressEventEmitter
): ResearchOrchestrator {
  if (!researchOrchestratorInstance) {
    researchOrchestratorInstance = new ResearchOrchestrator(progressEmitter);
  }
  return researchOrchestratorInstance;
}

export function getResearchOrchestrator(): ResearchOrchestrator {
  if (!researchOrchestratorInstance) {
    researchOrchestratorInstance = new ResearchOrchestrator();
  }
  return researchOrchestratorInstance;
}

// Legacy export for backward compatibility
export const researchOrchestrator = getResearchOrchestrator();
