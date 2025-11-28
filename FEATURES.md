# ResearchHive - New Features Documentation

This document provides comprehensive documentation for all newly implemented features in ResearchHive.

## Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [HuggingFace NLP Services](#huggingface-nlp-services)
3. [Real-Time WebSocket Support](#real-time-websocket-support)
4. [Neo4j Knowledge Graph](#neo4j-knowledge-graph)
5. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
6. [Production Infrastructure](#production-infrastructure)

---

## Testing Infrastructure

### Overview
Comprehensive testing framework with unit tests, E2E tests, and CI/CD pipeline integration.

### Unit Testing with Vitest

**Configuration:** `vitest.config.ts`

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test embeddings-service.test.ts
```

**Coverage Requirements:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Test Files:**
- `packages/ai/services/__tests__/embeddings-service.test.ts`
- `packages/ai/services/__tests__/citation-service.test.ts`
- `packages/ai/services/__tests__/agentdb-service.test.ts`
- `packages/ai/services/__tests__/ner-service.test.ts`
- `packages/ai/services/__tests__/summarization-service.test.ts`
- `packages/ai/services/__tests__/sentiment-service.test.ts`
- `apps/api/src/__tests__/router.test.ts`

### E2E Testing with Playwright

**Configuration:** `playwright.config.ts`

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e --project=chromium
```

**Browser Coverage:**
- Desktop Chrome (1280x720)
- Desktop Firefox (1280x720)
- Desktop Safari (1280x720)
- Mobile Chrome (375x667)
- Mobile Safari (375x667)

**Test Suites:**
- `e2e/landing.spec.ts` - Landing page functionality
- `e2e/dashboard.spec.ts` - Dashboard features and navigation
- `e2e/research-flow.spec.ts` - Complete research workflow

### CI/CD Pipeline

**Workflow:** `.github/workflows/ci.yml`

**Jobs:**
1. **Lint** - ESLint checks on all packages
2. **Typecheck** - TypeScript compilation verification
3. **Unit Tests** - Vitest with coverage upload to Codecov
4. **E2E Tests** - Playwright across all browsers
5. **Build** - Full production build verification
6. **Security** - pnpm audit for vulnerabilities

**Triggers:**
- Push to `main`, `develop`, `claude/**` branches
- Pull requests to any branch

---

## HuggingFace NLP Services

### Named Entity Recognition (NER)

**Service:** `packages/ai/services/ner-service.ts`

**Usage:**
```typescript
import { getNERService } from '@researchhive/ai';

const nerService = getNERService();
const result = await nerService.extractEntities(
  'Apple Inc. was founded by Steve Jobs in Cupertino, California.'
);

console.log(result.entities);
// [
//   { entity: 'B-ORG', word: 'Apple Inc.', score: 0.95, ... },
//   { entity: 'B-PER', word: 'Steve Jobs', score: 0.93, ... },
//   { entity: 'B-LOC', word: 'Cupertino', score: 0.91, ... }
// ]

console.log(result.entityGroups);
// {
//   ORGANIZATION: ['Apple Inc.'],
//   PERSON: ['Steve Jobs'],
//   LOCATION: ['Cupertino', 'California']
// }
```

**Features:**
- Extracts Person, Organization, Location, Miscellaneous entities
- Uses `dslim/bert-base-NER` model (90% confidence threshold)
- Batch processing support
- Entity grouping and deduplication
- Pattern-based fallback for offline use

**API Reference:**
- `extractEntities(text: string): Promise<NERResult>`
- `extractEntitiesBatch(texts: string[]): Promise<NERResult[]>`
- `mergeResults(results: NERResult[]): NERResult`
- `isUsingRealAPI(): boolean`

### Text Summarization

**Service:** `packages/ai/services/summarization-service.ts`

**Usage:**
```typescript
import { getSummarizationService } from '@researchhive/ai';

const summaryService = getSummarizationService();

// Basic summarization
const result = await summaryService.summarize(longText);
console.log(result.summary);
console.log(`Compression: ${(result.compressionRatio * 100).toFixed(1)}%`);

// Tiered summaries
const tiered = await summaryService.summarizeTiered(text);
console.log('Abstract:', tiered.abstract.summary);
console.log('Brief:', tiered.brief.summary);
console.log('Detailed:', tiered.detailed.summary);

// Bullet points
const bullets = await summaryService.summarizeBulletPoints(text, 5);
bullets.forEach((point, i) => console.log(`${i + 1}. ${point}`));
```

**Features:**
- Uses `facebook/bart-large-cnn` model
- Configurable max/min length (50-400 words)
- Tiered summarization (abstract, brief, detailed)
- Bullet-point generation
- Extractive fallback with keyword scoring

**API Reference:**
- `summarize(text: string): Promise<SummarizationResult>`
- `summarizeBatch(texts: string[]): Promise<SummarizationResult[]>`
- `summarizeTiered(text: string): Promise<{ abstract, brief, detailed }>`
- `summarizeBulletPoints(text: string, numPoints?: number): Promise<string[]>`

### Sentiment Analysis

**Service:** `packages/ai/services/sentiment-service.ts`

**Usage:**
```typescript
import { getSentimentService } from '@researchhive/ai';

const sentimentService = getSentimentService();

// Analyze sentiment
const result = await sentimentService.analyzeSentiment(
  'This is an excellent research paper with outstanding results!'
);
console.log(result.sentiment); // 'positive'
console.log(result.confidence); // 0.92

// Analyze emotions
const emotions = await sentimentService.analyzeEmotions(text);
console.log(emotions.dominant); // 'joy'
console.log(emotions.emotions); // { joy: 0.85, sadness: 0.05, ... }

// Aggregate sentiment
const aggregate = await sentimentService.aggregateSentiment(texts);
console.log(aggregate.overall); // 'positive'
console.log(aggregate.distribution); // { positive: 0.70, negative: 0.15, neutral: 0.15 }
```

**Features:**
- Uses `distilbert-base-uncased-finetuned-sst-2-english`
- Sentiment classification (positive, negative, neutral)
- Emotion detection (joy, sadness, anger, fear, surprise, love)
- Confidence scores for all predictions
- Batch processing and aggregation
- Lexicon-based fallback

**API Reference:**
- `analyzeSentiment(text: string): Promise<SentimentResult>`
- `analyzeEmotions(text: string): Promise<EmotionResult>`
- `analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]>`
- `aggregateSentiment(texts: string[]): Promise<AggregateResult>`

---

## Real-Time WebSocket Support

### Overview
Socket.io-based real-time communication for research progress tracking and collaboration.

### Server-Side WebSocket Service

**Service:** `apps/api/src/websocket.ts`

**Events:**
- `progress-update` - Research progress updates (0-100%)
- `chat-message` - Messages between user and AI agents
- `agent-status` - Individual agent status updates
- `source-found` - New source discovered notifications
- `research-complete` - Research completion event
- `research-error` - Error notifications

**Room-Based Communication:**
```typescript
// Client joins research room
socket.emit('join-research', researchId);

// Server sends updates only to subscribed clients
wsService.emitProgressUpdate({
  researchId: 'abc123',
  status: 'in_progress',
  progress: 45,
  currentStep: 'Analyzing sources',
  agentsDeployed: 8,
  sourcesFound: 12,
  timestamp: new Date().toISOString()
});
```

### Client-Side React Hook

**Hook:** `apps/web/src/hooks/useResearchProgress.ts`

**Usage:**
```typescript
import { useResearchProgress } from '@/hooks/useResearchProgress';

function ResearchPage({ researchId }) {
  const {
    progress,
    messages,
    isConnected,
    error,
    connect,
    disconnect,
  } = useResearchProgress({
    researchId,
    onProgress: (update) => {
      console.log(`Progress: ${update.progress}%`);
    },
    onChatMessage: (msg) => {
      console.log(`${msg.role}: ${msg.message}`);
    },
    onComplete: (data) => {
      console.log('Research completed!', data);
    },
    autoConnect: true,
  });

  return (
    <div>
      <ConnectionStatus connected={isConnected} />
      <ProgressBar value={progress?.progress || 0} />
      <ChatMessages messages={messages} />
    </div>
  );
}
```

**Features:**
- Automatic reconnection on network failures
- Connection health monitoring (ping/pong)
- User presence tracking
- Message history management
- TypeScript type safety

---

## Neo4j Knowledge Graph

### Overview
Graph database integration for storing and querying research relationships and insights.

### Service

**Service:** `packages/ai/services/neo4j-service.ts`

**Usage:**
```typescript
import { initializeNeo4j } from '@researchhive/ai';

// Initialize Neo4j
const neo4j = await initializeNeo4j({
  uri: 'bolt://localhost:7687',
  user: 'neo4j',
  password: 'password'
});

// Store research in knowledge graph
await neo4j.storeResearch(
  researchId,
  'Machine Learning',
  ['Finding 1', 'Finding 2'],
  [{ title: 'Paper 1', url: 'https://...', relevance: 0.95 }]
);

// Find related topics
const related = await neo4j.findRelatedTopics('topic:research-123', 2, 10);

// Get research subgraph for visualization
const graph = await neo4j.getResearchSubgraph(researchId);
console.log(graph.nodes); // Array of nodes
console.log(graph.relationships); // Array of edges

// Custom Cypher queries
const results = await neo4j.query({
  query: 'MATCH (t:Topic)-[:RELATES_TO]->(r:Topic) RETURN t, r LIMIT 10',
  parameters: {}
});
```

**Node Types:**
- `Topic` - Research topics
- `Source` - Academic papers, websites, articles
- `Finding` - Key research findings
- `Entity` - Named entities (people, organizations, locations)
- `Concept` - Abstract concepts and ideas

**Relationship Types:**
- `RELATES_TO` - Topics relate to each other
- `CITED_IN` - Sources cited in research
- `SUPPORTS` - Findings support conclusions
- `CONTRADICTS` - Conflicting information
- `DERIVED_FROM` - Findings derived from sources

**Features:**
- Automatic constraint and index creation
- Connection pooling (up to 50 connections)
- Graph traversal and path finding
- Subgraph extraction for visualization
- Statistics and analytics

---

## Model Context Protocol (MCP)

### Overview
Implementation of Anthropic's Model Context Protocol for tool integration with Claude.

### MCP Server

**Service:** `packages/ai/services/mcp-service.ts`

**Available Tools:**
1. **research** - Start new research task
2. **search_knowledge** - Search vector database
3. **get_citations** - Get formatted citations
4. **extract_entities** - Named entity recognition
5. **summarize** - Text summarization
6. **analyze_sentiment** - Sentiment analysis
7. **query_graph** - Knowledge graph queries

**Usage:**
```typescript
import { getMCPServer } from '@researchhive/ai';

const mcpServer = getMCPServer({
  name: 'researchhive-mcp',
  version: '1.0.0'
});

// Get available tools
const tools = mcpServer.getTools();
console.log(tools.map(t => t.name));

// Register custom tool
mcpServer.registerTool({
  name: 'custom_analysis',
  description: 'Perform custom analysis',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string' }
    },
    required: ['data']
  }
});

// Execute tool
const result = await mcpServer.executeTool('research', {
  topic: 'Quantum Computing',
  depth: 'standard'
});
```

**Resources:**
- `research://list` - List of all research projects
- `knowledge://graph` - Full knowledge graph data
- `agentdb://vectors` - Vector database embeddings

**Prompts:**
- `research_assistant` - Research assistant persona
- `citation_helper` - Citation formatting assistant

### MCP Client

**Usage:**
```typescript
import { createMCPClient } from '@researchhive/ai';

const client = createMCPClient('http://localhost:4000/mcp');
await client.connect();

const tools = await client.listTools();
const result = await client.callTool('research', { topic: 'AI' });

await client.disconnect();
```

---

## Production Infrastructure

### Docker Configuration

**Files:**
- `Dockerfile.api` - Multi-stage build for Fastify API
- `Dockerfile.web` - Multi-stage build for Next.js frontend
- `docker-compose.prod.yml` - Full production stack
- `nginx.conf` - Reverse proxy configuration
- `.dockerignore` - Build optimization

**Stack Services:**
- PostgreSQL 16 (relational database)
- Redis 7 (cache and sessions)
- Neo4j 5 (knowledge graph)
- API (Fastify on port 4000)
- Web (Next.js on port 3000)
- Nginx (reverse proxy on port 80/443)

**Start Production Stack:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Environment Variables:**
```env
# Database
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://user:pass@postgres:5432/db

# Cache
REDIS_PASSWORD=secure_password
REDIS_URL=redis://:pass@redis:6379

# Neo4j
NEO4J_PASSWORD=secure_password
NEO4J_URL=bolt://neo4j:7687

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...

# Authentication
LOGTO_ENDPOINT=https://...
LOGTO_APP_ID=...
LOGTO_APP_SECRET=...
```

### Kubernetes Deployment

**File:** `k8s/deployment.yaml`

**Resources:**
- Namespace: `researchhive`
- API Deployment: 3 replicas (scales 3-20 based on CPU/memory)
- Web Deployment: 2 replicas (scales 2-10)
- Services: ClusterIP for internal communication
- Ingress: SSL/TLS with cert-manager
- HorizontalPodAutoscaler: Auto-scaling based on metrics

**Deploy to Kubernetes:**
```bash
kubectl apply -f k8s/deployment.yaml
```

**Resource Limits:**
- API: 512Mi-1Gi memory, 250m-1000m CPU
- Web: 256Mi-512Mi memory, 100m-500m CPU

**Health Checks:**
- Liveness: HTTP GET /health every 10s
- Readiness: HTTP GET /health every 5s

### CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

**Workflow:**
1. Checkout code
2. Setup Node.js 20 and pnpm 8.14.0
3. Install dependencies
4. Run lint, typecheck, tests in parallel
5. Upload coverage to Codecov
6. Build production artifacts
7. Run security audit

**Status Badges:**
```markdown
![CI](https://github.com/user/researchhive/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/user/researchhive/branch/main/graph/badge.svg)
```

---

## Configuration Summary

### Required Environment Variables

```env
# API Server
PORT=4000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN=https://researchhive.ai

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Neo4j
NEO4J_URL=bolt://...
NEO4J_USER=neo4j
NEO4J_PASSWORD=...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...

# Authentication
LOGTO_ENDPOINT=https://...
LOGTO_APP_ID=...
LOGTO_APP_SECRET=...
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.researchhive.ai
```

### Package Dependencies

**API:**
- socket.io: ^4.7.5
- fastify: ^4.25.2
- @trpc/server: ^10.45.0

**Web:**
- socket.io-client: ^4.7.5
- next: 14.0.4
- @tanstack/react-query: ^5.17.9

**AI Package:**
- neo4j-driver: ^5.17.0
- @anthropic-ai/sdk: ^0.70.1
- agentdb: ^1.6.1

**Dev Dependencies:**
- vitest: Latest
- @playwright/test: Latest
- @vitest/coverage-v8: Latest

---

## Quick Start Guide

### Local Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Build for production
pnpm build
```

### Production Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop stack
docker-compose -f docker-compose.prod.yml down
```

### Kubernetes Deployment

```bash
# Create namespace and secrets
kubectl create namespace researchhive
kubectl create secret generic researchhive-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=anthropic-api-key=$ANTHROPIC_API_KEY

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -n researchhive
kubectl get svc -n researchhive
kubectl get ingress -n researchhive
```

---

## Monitoring and Debugging

### Health Checks

```bash
# API health
curl http://localhost:4000/health

# WebSocket connection
curl http://localhost:4000/socket.io/

# Neo4j status
curl http://localhost:7474/

# Postgres status
psql $DATABASE_URL -c "SELECT 1"
```

### Logs

```bash
# View API logs
docker-compose logs -f api

# View Web logs
docker-compose logs -f web

# View all logs
docker-compose logs -f

# Kubernetes logs
kubectl logs -f deployment/researchhive-api -n researchhive
```

### Performance Metrics

```bash
# Get HPA status
kubectl get hpa -n researchhive

# Get resource usage
kubectl top pods -n researchhive

# Neo4j statistics
const stats = await neo4jService.getStatistics();
console.log(stats); // { totalNodes, totalRelationships, nodesByType }
```

---

## Best Practices

### Testing
- Maintain 80%+ code coverage
- Write E2E tests for critical user flows
- Use mocks for external dependencies
- Run tests in CI/CD before deployment

### Security
- Never commit secrets to repository
- Use environment variables for configuration
- Enable CORS only for trusted origins
- Regular security audits with `pnpm audit`

### Performance
- Use caching (Redis) for frequently accessed data
- Implement pagination for large datasets
- Enable HPA for auto-scaling
- Monitor resource usage and optimize

### Monitoring
- Set up health check endpoints
- Use structured logging
- Track key metrics (response time, error rate)
- Set up alerts for critical errors

---

## Support and Resources

### Documentation
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Getting Started](./GETTING_STARTED.md)

### Contributing
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Submit PR with clear description

### License
MIT License - See [LICENSE](./LICENSE)

---

**Last Updated:** 2025-11-28
**Version:** 1.0.0
**Status:** Production Ready
