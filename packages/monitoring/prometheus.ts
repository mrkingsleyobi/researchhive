/**
 * Prometheus Metrics Collection
 * Application performance and business metrics
 */

import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

// Create custom registry
export const registry = new Registry();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register: registry });

// HTTP Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [registry],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [registry],
});

// WebSocket metrics
export const websocketConnections = new Gauge({
  name: 'websocket_connections_current',
  help: 'Current number of WebSocket connections',
  registers: [registry],
});

export const websocketMessagesTotal = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['event_type', 'direction'],
  registers: [registry],
});

// Research metrics
export const researchTotal = new Counter({
  name: 'research_total',
  help: 'Total number of research tasks',
  labelNames: ['depth', 'status'],
  registers: [registry],
});

export const researchDuration = new Histogram({
  name: 'research_duration_seconds',
  help: 'Duration of research tasks in seconds',
  labelNames: ['depth'],
  buckets: [10, 30, 60, 120, 300, 600, 1200],
  registers: [registry],
});

export const agentsDeployed = new Counter({
  name: 'agents_deployed_total',
  help: 'Total number of agents deployed',
  labelNames: ['agent_type'],
  registers: [registry],
});

export const sourcesFound = new Counter({
  name: 'sources_found_total',
  help: 'Total number of sources found',
  labelNames: ['source_type'],
  registers: [registry],
});

// AI Service metrics
export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI service requests in seconds',
  labelNames: ['service', 'model'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

export const aiRequestTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI service requests',
  labelNames: ['service', 'model', 'status'],
  registers: [registry],
});

export const aiTokensUsed = new Counter({
  name: 'ai_tokens_used_total',
  help: 'Total number of AI tokens used',
  labelNames: ['service', 'model', 'type'],
  registers: [registry],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [registry],
});

export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  labelNames: ['database'],
  registers: [registry],
});

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [registry],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [registry],
});

// Knowledge Graph metrics
export const graphNodesTotal = new Gauge({
  name: 'knowledge_graph_nodes_total',
  help: 'Total number of nodes in knowledge graph',
  labelNames: ['node_type'],
  registers: [registry],
});

export const graphRelationshipsTotal = new Gauge({
  name: 'knowledge_graph_relationships_total',
  help: 'Total number of relationships in knowledge graph',
  labelNames: ['relationship_type'],
  registers: [registry],
});

/**
 * Get metrics as Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await registry.metrics();
}

/**
 * Get metrics as JSON
 */
export async function getMetricsJSON(): Promise<any> {
  return await registry.getMetricsAsJSON();
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics(): void {
  registry.resetMetrics();
}

/**
 * Helper to measure function duration
 */
export function measureDuration<T>(
  histogram: Histogram<string>,
  labels: Record<string, string | number>,
  fn: () => Promise<T>
): Promise<T> {
  const end = histogram.startTimer(labels);
  return fn().finally(() => end());
}

/**
 * Helper to track counter
 */
export function incrementCounter(
  counter: Counter<string>,
  labels: Record<string, string | number>,
  value: number = 1
): void {
  counter.inc(labels, value);
}

/**
 * Helper to set gauge
 */
export function setGauge(
  gauge: Gauge<string>,
  labels: Record<string, string | number>,
  value: number
): void {
  gauge.set(labels, value);
}
