# ResearchHive: Product Requirements Document (PRD)

**Version:** 1.0.0
**Last Updated:** 2025-11-22
**Owner:** Full-Stack Architecture Team
**Status:** Draft for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [User Personas](#user-personas)
4. [Core Features](#core-features)
5. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
6. [Technical Requirements](#technical-requirements)
7. [Ruvnet Libraries Integration](#ruvnet-libraries-integration)
8. [Open-Source Integration Strategy](#open-source-integration-strategy)
9. [HuggingFace AI Tasks](#huggingface-ai-tasks)
10. [MCP Implementation](#mcp-implementation)
11. [API Design](#api-design)
12. [Database Schema](#database-schema)
13. [Security & Compliance](#security--compliance)
14. [Performance Requirements](#performance-requirements)
15. [Testing Strategy](#testing-strategy)
16. [Deployment Strategy](#deployment-strategy)
17. [Monetization & Business Model](#monetization--business-model)
18. [Success Metrics](#success-metrics)
19. [Roadmap](#roadmap)

---

## 1. Executive Summary

ResearchHive is an AI-powered content intelligence platform that automates research, analysis, and knowledge synthesis. By leveraging multi-agent swarm orchestration, vector-based memory, and advanced NLP models, we reduce research time from hours to minutes while maintaining source traceability and collaborative capabilities.

### Key Objectives
- **Reduce research time by 85%** (6 hours → 50 minutes average)
- **Increase research quality** through AI-powered fact-checking and multi-source synthesis
- **Enable team collaboration** with shared knowledge graphs and real-time updates
- **Build open-source community** targeting 5K+ GitHub stars in 6 months
- **Achieve product-market fit** with 1,000+ active users in first 3 months

---

## 2. Product Vision

### Vision Statement
"Empower every knowledge worker with an AI research assistant that thinks like a team of experts, works 24/7, and never forgets."

### Mission
Transform scattered information into actionable insights through intelligent agent orchestration, making deep research accessible to everyone.

### Core Values
1. **Open by Default** - Open-source core, transparent development
2. **AI for Good** - Democratize access to research capabilities
3. **Quality Over Speed** - Accuracy and source traceability are paramount
4. **Community-Driven** - Build with and for the community
5. **Privacy-Respecting** - User data stays private, optional self-hosting

---

## 3. User Personas

### Primary Personas

#### 1. **Sarah - Content Creator**
- **Role:** YouTube educator, newsletter writer
- **Age:** 28
- **Tech Savvy:** High
- **Pain Points:**
  - Spends 6+ hours researching for each video
  - Struggles to track sources and citations
  - Can't reuse research across content pieces
  - Fact-checking is manual and time-consuming
- **Goals:**
  - Produce 3 videos/week instead of 1
  - Build a personal knowledge base
  - Ensure content accuracy
- **Success Metrics:**
  - Research time reduced from 6h to <1h
  - Zero fact-checking errors
  - 200% increase in content output

#### 2. **Dr. James - Academic Researcher**
- **Role:** PhD candidate in Climate Science
- **Age:** 32
- **Tech Savvy:** Medium
- **Pain Points:**
  - Literature review takes months
  - Can't keep up with new papers (100+/week)
  - Manual citation management
  - Difficult to find cross-disciplinary connections
- **Goals:**
  - Complete literature review in weeks, not months
  - Discover hidden research connections
  - Maintain perfect citations
- **Success Metrics:**
  - 10x faster literature discovery
  - 5x more papers reviewed
  - Zero citation errors

#### 3. **Marcus - Business Analyst**
- **Role:** Market intelligence lead at Series B startup
- **Age:** 35
- **Tech Savvy:** High
- **Pain Points:**
  - Manual competitive analysis
  - Can't track market trends in real-time
  - Reports take days to compile
  - Knowledge locked in individual analysts
- **Goals:**
  - Automated competitive monitoring
  - Real-time market insights
  - Team knowledge sharing
- **Success Metrics:**
  - Daily automated reports instead of weekly manual
  - 50% reduction in research costs
  - Team-wide knowledge access

### Secondary Personas

#### 4. **Lisa - Technical Writer**
- Needs: API documentation research, changelog tracking
- Volume: 20+ docs/month

#### 5. **Tom - Journalist**
- Needs: Fast fact-checking, source verification
- Timeline: Hours, not days

#### 6. **Emma - Product Manager**
- Needs: User research synthesis, competitor analysis
- Collaboration: Cross-functional teams

---

## 4. Core Features

### 4.1 Multi-Agent Research Engine

**Description:** AI swarm that researches topics across multiple sources in parallel.

**Capabilities:**
- Deploy 8+ specialized research agents simultaneously
- Cover web, academic, news, social media, government data
- Automatic source credibility scoring
- Real-time progress updates via WebSocket

**User Flow:**
1. User inputs research topic + parameters
2. System spawns specialized agents
3. Agents work in parallel, emit progress events
4. Results stream to user in real-time
5. Final synthesis delivered with citations

**Acceptance Criteria:**
- ✅ Research completes in <5 minutes for standard topics
- ✅ Minimum 10 sources per research
- ✅ Source credibility score (0-100) for each finding
- ✅ Real-time progress bar updates every 2 seconds
- ✅ Automatic fallback if agent fails

### 4.2 Knowledge Graph Visualization

**Description:** Interactive graph showing relationships between research topics, entities, and sources.

**Capabilities:**
- Automatic entity extraction (people, companies, technologies)
- Causal relationship discovery
- Time-based evolution tracking
- Zoom/pan/filter interactions
- Export as PNG/SVG

**User Flow:**
1. User completes research
2. System builds knowledge graph automatically
3. User explores graph interactively
4. Click nodes to see source details
5. Discover hidden connections

**Acceptance Criteria:**
- ✅ Graph renders in <3 seconds for 100 nodes
- ✅ Smooth 60fps interactions
- ✅ Highlight path between any 2 nodes
- ✅ Filter by entity type, date range
- ✅ Export in multiple formats

### 4.3 Collaborative Research Workspace

**Description:** Real-time collaboration on research projects with team members.

**Capabilities:**
- Live cursors showing team member activity
- Comment threads on specific findings
- Version history with diff view
- Team-wide knowledge base
- Shared agent swarms

**User Flow:**
1. User creates research project
2. Invites team members
3. Everyone sees real-time updates
4. Add comments and annotations
5. Merge findings into final report

**Acceptance Criteria:**
- ✅ <100ms latency for updates
- ✅ Conflict resolution for simultaneous edits
- ✅ Full audit trail of changes
- ✅ @mentions notify team members
- ✅ Role-based access control

### 4.4 Smart Research Templates

**Description:** Pre-configured research workflows for common use cases.

**Templates:**
- **Competitive Analysis** - Track 5 competitors across 10 dimensions
- **Literature Review** - Academic paper discovery and synthesis
- **Market Research** - Industry trends, market size, key players
- **Product Research** - User reviews, feature comparison, pricing
- **News Monitoring** - Topic tracking with daily digests
- **Technical Documentation** - API research, best practices

**User Flow:**
1. User selects template
2. Fills in specific parameters (e.g., competitors)
3. Template auto-configures agents
4. Research runs automatically
5. Results formatted per template

**Acceptance Criteria:**
- ✅ 20+ templates at launch
- ✅ Custom template creation
- ✅ Template marketplace (community)
- ✅ Template versioning
- ✅ One-click template instantiation

### 4.5 Citation Management

**Description:** Automatic citation generation and source tracking.

**Capabilities:**
- Support APA, MLA, Chicago, Harvard formats
- Export to BibTeX, EndNote, Zotero
- Source verification and link rot detection
- Automatic archive.org backups
- Plagiarism detection

**User Flow:**
1. System tracks all sources automatically
2. User selects citation style
3. Citations generated inline
4. Export bibliography
5. Verify all links are active

**Acceptance Criteria:**
- ✅ Support 10+ citation formats
- ✅ <1 second citation generation
- ✅ Automatic link checking (weekly)
- ✅ Archive.org integration for backup
- ✅ Duplicate source detection

### 4.6 Research Automation (n8n Integration)

**Description:** Scheduled and triggered research workflows.

**Capabilities:**
- Daily/weekly/monthly research schedules
- Trigger on external events (RSS, webhooks)
- Multi-step workflows (research → analyze → notify)
- Integration with 300+ services
- Email/Slack/Discord notifications

**User Flow:**
1. User creates workflow in visual editor
2. Configures trigger (schedule or event)
3. Adds research steps
4. Configures output destination
5. Workflow runs automatically

**Acceptance Criteria:**
- ✅ Visual workflow editor (n8n UI)
- ✅ 50+ pre-built workflow templates
- ✅ Error handling and retries
- ✅ Execution logs and debugging
- ✅ Conditional branching

### 4.7 AI-Powered Insights

**Description:** Automatic pattern detection and insight generation.

**Capabilities:**
- Trend detection across research projects
- Anomaly highlighting (unexpected findings)
- Sentiment analysis of sources
- Key takeaways extraction
- "People also researched" recommendations

**User Flow:**
1. Complete multiple research projects
2. AI analyzes patterns across projects
3. Insights dashboard shows trends
4. Drill down into specific insights
5. Save insights to knowledge base

**Acceptance Criteria:**
- ✅ Insights updated in real-time
- ✅ Confidence score for each insight
- ✅ Explainable AI (show reasoning)
- ✅ User feedback loop (thumbs up/down)
- ✅ Export insights as report

### 4.8 Reflexive Learning System

**Description:** Agents learn from successes and failures to improve over time.

**Capabilities:**
- Episode memory (what worked, what didn't)
- Skill library (reusable research patterns)
- Personalized agent behavior
- Team-level learning (shared memory)
- Performance analytics

**User Flow:**
1. Agents complete research tasks
2. System stores episodes in AgentDB
3. Agents retrieve similar past episodes
4. Apply learned patterns to new research
5. Users see improving performance

**Acceptance Criteria:**
- ✅ 20% performance improvement after 10 uses
- ✅ <50ms memory retrieval
- ✅ Transparent learning (show what was learned)
- ✅ Privacy controls (opt-out of learning)
- ✅ Export/import learned patterns

---

## 5. User Stories & Acceptance Criteria

### Epic 1: Research Automation

**US-1.1: Quick Research**
```
As a content creator
I want to research a topic in under 5 minutes
So that I can focus on creating content instead of gathering information

Acceptance Criteria:
- Given I enter a topic like "quantum computing trends 2025"
- When I click "Research"
- Then I receive a comprehensive report in <5 minutes
- And the report includes 10+ credible sources
- And all sources are properly cited
- And I can see the research process in real-time
```

**US-1.2: Deep Research**
```
As an academic researcher
I want to conduct deep literature reviews
So that I can discover all relevant papers on a topic

Acceptance Criteria:
- Given I select "Deep Research" mode
- When I provide a research question
- Then agents search arXiv, PubMed, Semantic Scholar
- And results include 50+ relevant papers
- And papers are ranked by relevance and citation count
- And I can export to reference managers
```

**US-1.3: Scheduled Research**
```
As a market analyst
I want to schedule daily competitor monitoring
So that I stay updated without manual work

Acceptance Criteria:
- Given I create a scheduled research workflow
- When I set daily frequency and competitor names
- Then research runs automatically every day at 9am
- And results are emailed to me
- And I can see trends over time
```

### Epic 2: Team Collaboration

**US-2.1: Real-Time Collaboration**
```
As a team lead
I want to collaborate on research with my team in real-time
So that we can work together efficiently

Acceptance Criteria:
- Given I invite team members to a research project
- When any member makes changes
- Then all members see updates within 100ms
- And I can see who is viewing/editing
- And we can comment on specific findings
```

**US-2.2: Knowledge Sharing**
```
As a team member
I want to access previous team research
So that I don't duplicate work

Acceptance Criteria:
- Given I search the team knowledge base
- When I enter keywords
- Then I see all related past research
- And I can filter by date, author, tags
- And I can clone research to build upon it
```

### Epic 3: Quality & Accuracy

**US-3.1: Fact Checking**
```
As a journalist
I want to verify facts automatically
So that I can ensure article accuracy

Acceptance Criteria:
- Given I paste text to fact-check
- When I click "Verify"
- Then each claim is validated against sources
- And I see confidence scores (0-100)
- And contradictory sources are highlighted
```

**US-3.2: Source Credibility**
```
As any user
I want to know source credibility
So that I can trust the research

Acceptance Criteria:
- Given research results include sources
- When I view a source
- Then I see credibility score (0-100)
- And scoring factors are explained
- And I can see source domain authority
```

### Epic 4: Extensibility

**US-4.1: Custom Templates**
```
As a power user
I want to create custom research templates
So that I can standardize my research process

Acceptance Criteria:
- Given I access the template editor
- When I define research parameters and steps
- Then I can save as a reusable template
- And I can share templates with my team
- And templates can be published to marketplace
```

**US-4.2: API Integration**
```
As a developer
I want to integrate ResearchHive into my app
So that I can add research capabilities

Acceptance Criteria:
- Given I have an API key
- When I call the research API
- Then I receive structured JSON responses
- And I can stream real-time updates
- And I have access to full SDK documentation
```

---

## 6. Technical Requirements

### 6.1 Functional Requirements

**FR-1: Multi-Agent Orchestration**
- Deploy minimum 8 agents per research task
- Support mesh, hierarchical, and ring topologies
- Agent communication via QUIC protocol (50-70% faster than TCP)
- Automatic agent recovery on failure
- Resource limits: max 20 agents per user, 100 per team

**FR-2: Vector Search**
- Index 1M+ documents with embeddings
- Search latency <10ms (p95)
- Support semantic search with 0.8+ similarity threshold
- Hybrid search (keyword + semantic)
- Multi-language support (English, Spanish, French, German, Chinese)

**FR-3: Real-Time Updates**
- WebSocket connections for live updates
- SSE for MCP protocol communication
- <100ms latency for collaborative edits
- Offline support with sync on reconnect
- Optimistic UI updates

**FR-4: Data Processing**
- Process 100+ sources per research
- Extract entities (people, orgs, locations, technologies)
- Summarize documents up to 50K words
- Generate knowledge graphs with 1000+ nodes
- Export in 10+ formats (PDF, DOCX, MD, JSON, HTML)

**FR-5: Workflow Automation**
- Support 50+ workflow templates
- Schedule workflows (cron syntax)
- Trigger on webhooks, RSS, file changes
- Conditional branching and loops
- Error handling with retries

### 6.2 Non-Functional Requirements

**NFR-1: Performance**
- Page load time: <2 seconds (p95)
- Time to First Byte: <500ms
- Research completion: <5 minutes (standard), <15 minutes (deep)
- Vector search: <10ms (p95)
- API response time: <200ms (p95)
- Core Web Vitals: All green (LCP <2.5s, FID <100ms, CLS <0.1)

**NFR-2: Scalability**
- Support 10,000 concurrent users
- Process 1,000 research requests/hour
- Handle 1M documents in knowledge base
- Auto-scale based on demand (3-20 pods)
- Database: 100GB initial, scalable to 10TB

**NFR-3: Availability**
- 99.9% uptime SLA (43 minutes downtime/month)
- Zero-downtime deployments
- Automatic failover for databases
- Multi-region deployment (US, EU, APAC)
- CDN for global content delivery

**NFR-4: Security**
- OWASP Top 10 compliance
- SOC 2 Type II certification (within 12 months)
- GDPR and CCPA compliance
- End-to-end encryption for sensitive data
- Regular penetration testing (quarterly)
- Bug bounty program

**NFR-5: Reliability**
- Mean Time Between Failures (MTBF): 720 hours
- Mean Time To Recovery (MTTR): <15 minutes
- Data backup: hourly (retained 30 days)
- Disaster recovery: RPO <1 hour, RTO <4 hours
- Chaos engineering tests monthly

**NFR-6: Maintainability**
- Code coverage: >85%
- Documentation coverage: 100% public APIs
- Automated tests: >90% passing
- Code review: 100% of PRs
- Dependency updates: weekly

**NFR-7: Usability**
- Mobile-responsive (320px - 2560px)
- WCAG 2.1 AA accessibility compliance
- Support latest 2 browser versions
- Keyboard navigation support
- Screen reader compatible

---

## 7. Ruvnet Libraries Integration

### 7.1 Library Inventory

#### NPM Packages (Core Integration)

**1. claude-flow (@latest alpha)**
- **Version:** 3.x alpha
- **Purpose:** Multi-agent swarm orchestration
- **Integration Points:**
  - Research task coordination
  - Agent lifecycle management
  - Swarm topology configuration
  - MCP server/client implementation
- **Configuration:**
```javascript
// config/claude-flow.config.js
export default {
  version: '3.x',
  topology: 'mesh',
  protocol: 'quic',
  agents: {
    min: 4,
    max: 20,
    defaultCount: 8,
  },
  memory: {
    backend: 'agentdb',
    reflexion: true,
    episodic: true,
    causal: true,
  },
  modelRouter: {
    complex: 'claude-3.5-sonnet',
    standard: 'deepseek/deepseek-chat',
    fast: 'google/gemini-flash-1.5',
    local: 'onnx',
  },
};
```

**2. agentdb (v1.6.1)**
- **Version:** 1.6.1
- **Purpose:** Vector database with reflexive memory
- **Integration Points:**
  - Semantic search for research
  - Episode memory storage
  - Causal graph management
  - Skill library persistence
- **Features Used:**
  - HNSW vector indexing (96x-164x faster)
  - SQLite/WASM backend
  - Reflexion memory
  - Causal relationships
- **Configuration:**
```javascript
import agentdb from 'agentdb';

const db = agentdb.init({
  backend: 'sqlite',
  path: './data/agentdb.sqlite',
  dimensions: 384, // all-MiniLM-L6-v2 embeddings
  indexType: 'hnsw',
  hnswM: 16,
  hnswEfConstruction: 200,
});

// Enable reflexive learning
db.reflexion.configure({
  enabled: true,
  maxEpisodes: 10000,
  similarityThreshold: 0.8,
});
```

**3. research-swarm (v1.2.2)**
- **Version:** 1.2.2
- **Purpose:** Multi-source research automation
- **Integration Points:**
  - Web scraping coordination
  - API aggregation
  - Result normalization
  - Source credibility scoring
- **Capabilities:**
  - Parallel source fetching
  - Rate limiting and retry logic
  - Content extraction and cleaning
  - Duplicate detection

**4. agentic-flow (v2.7.31)**
- **Version:** 2.7.31
- **Purpose:** Cost-optimized multi-model routing
- **Integration Points:**
  - LLM request routing
  - Cost tracking
  - Performance monitoring
  - Local inference fallback
- **Cost Savings:**
  - 99% reduction via DeepSeek routing
  - ONNX local inference for simple tasks
  - Intelligent model selection

**5. agentic-mcp**
- **Purpose:** MCP server implementation
- **Integration Points:**
  - Web search tool
  - Database tool
  - Summarization tool
  - Custom tool registration
- **Exposed Tools:**
  - research_topic
  - synthesize_findings
  - query_knowledge_graph
  - extract_entities
  - fact_check

**6. dspy-ts**
- **Purpose:** Declarative self-learning framework
- **Integration Points:**
  - Prompt optimization
  - Few-shot learning
  - Automatic evaluation
  - Chain-of-thought reasoning

#### Rust Crates (Optional Performance Boost)

**7. ruv-swarm-wasm**
- **Purpose:** WebAssembly-powered agent execution
- **Integration:** Browser-based agent inference
- **Performance:** 2.8-4.4x SIMD speedup
- **Bundle Size:** <800KB compressed

**8. neural-swarm**
- **Purpose:** High-performance neural network orchestration
- **Integration:** Local model inference
- **Use Case:** Offline research capabilities

### 7.2 Integration Architecture

**Hybrid Memory System:**
```typescript
// src/lib/memory/hybrid-memory.ts
import agentdb from 'agentdb';
import { HybridReasoningBank } from 'agentic-flow/reasoningbank';

export class HybridMemorySystem {
  private agentdb: AgentDB;
  private reasoningBank: HybridReasoningBank;

  async initialize() {
    this.agentdb = agentdb.init({ backend: 'sqlite' });
    this.reasoningBank = new HybridReasoningBank({
      preferWasm: true,
      fallbackToApi: false,
    });
  }

  async storeEpisode(episode: ResearchEpisode) {
    // Store in AgentDB for reflexive learning
    await this.agentdb.reflexion.store({
      context: episode.context,
      action: episode.action,
      outcome: episode.outcome,
      success: episode.success,
      timestamp: Date.now(),
    });

    // Store patterns in reasoning bank
    if (episode.patterns.length > 0) {
      for (const pattern of episode.patterns) {
        await this.reasoningBank.storePattern(pattern);
      }
    }
  }

  async retrieveSimilarEpisodes(query: string, limit = 10) {
    const embedding = await this.generateEmbedding(query);
    return await this.agentdb.reflexion.retrieve(
      embedding,
      limit,
      0.8 // similarity threshold
    );
  }

  async buildCausalGraph(events: Event[]) {
    for (let i = 0; i < events.length - 1; i++) {
      const cause = events[i];
      const effect = events[i + 1];

      await this.agentdb.causal.addEdge({
        cause: cause.id,
        effect: effect.id,
        confidence: this.calculateConfidence(cause, effect),
        uplift: this.calculateUplift(cause, effect),
      });
    }
  }
}
```

**Multi-Agent Orchestration:**
```typescript
// src/lib/agents/research-orchestrator.ts
import { ClaudeFlow } from 'claude-flow';
import { ResearchSwarm } from 'research-swarm';

export class ResearchOrchestrator {
  private swarm: ClaudeFlow;

  async initialize() {
    this.swarm = new ClaudeFlow({
      topology: 'mesh',
      protocol: 'quic',
      agents: this.defineAgentRoles(),
    });

    await this.swarm.initialize();
  }

  async research(topic: string, options: ResearchOptions) {
    // Spawn queen agent (coordinator)
    const queen = await this.swarm.spawn('queen', {
      role: 'coordinator',
      priority: 'high',
    });

    // Create research plan
    const plan = await queen.createPlan({
      topic,
      depth: options.depth,
      sources: options.sources,
    });

    // Spawn specialized research agents
    const researchers = await Promise.all(
      plan.sources.map((source) =>
        this.swarm.spawn('researcher', {
          specialization: source,
          parallelism: 2,
        })
      )
    );

    // Execute research in parallel
    const results = await Promise.all(
      researchers.map((agent) =>
        agent.execute({
          topic,
          source: agent.specialization,
          timeout: 60000,
        })
      )
    );

    // Spawn analysis agents
    const analyzers = await this.spawnAnalyzers(results.length);

    // Analyze results
    const analyzed = await this.analyzeResults(analyzers, results);

    // Synthesize findings
    const synthesis = await this.synthesize(analyzed);

    return synthesis;
  }

  private defineAgentRoles() {
    return [
      { type: 'queen', capabilities: ['planning', 'coordination'] },
      {
        type: 'researcher',
        capabilities: ['web_scraping', 'api_fetching', 'extraction'],
      },
      {
        type: 'analyzer',
        capabilities: ['summarization', 'ner', 'sentiment', 'fact_check'],
      },
      {
        type: 'synthesizer',
        capabilities: ['graph_building', 'report_generation'],
      },
    ];
  }
}
```

### 7.3 Performance Optimization with Ruvnet Libraries

**Cost Optimization:**
```typescript
// src/lib/optimization/model-router.ts
import { AgenticFlow } from 'agentic-flow';

export class IntelligentModelRouter {
  private router: AgenticFlow;

  async route(task: Task) {
    const complexity = this.assessComplexity(task);

    if (complexity === 'simple' && task.allowLocal) {
      // Use local ONNX inference (free)
      return await this.executeLocal(task);
    } else if (complexity === 'simple') {
      // Use DeepSeek (99% cost savings)
      return await this.router.execute(task, {
        model: 'deepseek/deepseek-chat',
        temperature: 0.3,
      });
    } else if (complexity === 'medium') {
      // Use Gemini Flash (fast + cheap)
      return await this.router.execute(task, {
        model: 'google/gemini-flash-1.5',
        temperature: 0.5,
      });
    } else {
      // Use Claude Sonnet (best reasoning)
      return await this.router.execute(task, {
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
      });
    }
  }

  private assessComplexity(task: Task): 'simple' | 'medium' | 'complex' {
    // Heuristics for complexity assessment
    const factors = {
      inputLength: task.input.length,
      requiresReasoning: task.requiresChainOfThought,
      requiresAccuracy: task.accuracyThreshold > 0.9,
      hasConstraints: task.constraints.length > 0,
    };

    const score =
      factors.inputLength / 1000 +
      (factors.requiresReasoning ? 2 : 0) +
      (factors.requiresAccuracy ? 2 : 0) +
      factors.hasConstraints;

    if (score < 2) return 'simple';
    if (score < 4) return 'medium';
    return 'complex';
  }
}
```

**WASM Performance Boost:**
```typescript
// src/lib/inference/wasm-accelerator.ts
import { RuvSwarmWasm } from 'ruv-swarm-wasm';

export class WasmAccelerator {
  private swarm: RuvSwarmWasm;

  async initialize() {
    this.swarm = await RuvSwarmWasm.load({
      simd: true, // 2.8-4.4x speedup
      threads: navigator.hardwareConcurrency,
    });
  }

  async inferLocal(model: string, input: string) {
    // Browser-based inference with WASM
    const result = await this.swarm.infer({
      model,
      input,
      maxTokens: 512,
    });

    return result;
  }

  // Use for simple tasks: entity extraction, sentiment analysis
  async extractEntities(text: string) {
    return await this.inferLocal('ner-model', text);
  }

  async analyzeSentiment(text: string) {
    return await this.inferLocal('sentiment-model', text);
  }
}
```

---

## 8. Open-Source Integration Strategy

### 8.1 Selected Open-Source Tools

#### Core CMS: Strapi v4

**Why Strapi:**
- Headless CMS with excellent API
- Plugin architecture for extensibility
- Built-in user management and RBAC
- GraphQL and REST APIs
- Active community (50K+ GitHub stars)

**Customization Strategy:**
```typescript
// Custom Strapi plugins
plugins/
├── strapi-plugin-vector-search/
│   ├── server/
│   │   ├── controllers/
│   │   │   └── search.controller.ts
│   │   ├── services/
│   │   │   └── vector-search.service.ts
│   │   └── routes/
│   │       └── search.routes.ts
│   └── admin/
│       └── components/
│           └── SearchInterface.tsx
│
├── strapi-plugin-ai-research/
│   ├── server/
│   │   ├── controllers/
│   │   │   └── research.controller.ts
│   │   ├── services/
│   │   │   ├── agent-orchestrator.service.ts
│   │   │   └── knowledge-graph.service.ts
│   │   └── routes/
│   │       └── research.routes.ts
│   └── admin/
│       └── components/
│           ├── ResearchDashboard.tsx
│           ├── KnowledgeGraphViewer.tsx
│           └── AgentMonitor.tsx
│
└── strapi-plugin-citations/
    ├── server/
    │   ├── services/
    │   │   ├── citation-generator.service.ts
    │   │   └── source-verifier.service.ts
    │   └── content-types/
    │       └── citation/
    │           └── schema.json
    └── admin/
        └── components/
            └── CitationManager.tsx
```

**Content Types:**
```json
// api/research-project/content-types/research-project/schema.json
{
  "kind": "collectionType",
  "collectionName": "research_projects",
  "info": {
    "singularName": "research-project",
    "pluralName": "research-projects",
    "displayName": "Research Project"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": { "type": "string", "required": true },
    "description": { "type": "text" },
    "topic": { "type": "string", "required": true },
    "depth": {
      "type": "enumeration",
      "enum": ["quick", "standard", "deep"],
      "default": "standard"
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "in_progress", "completed", "failed"],
      "default": "pending"
    },
    "sources": { "type": "json" },
    "findings": { "type": "json" },
    "knowledge_graph": { "type": "json" },
    "citations": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::citation.citation"
    },
    "team": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::team.team"
    },
    "owner": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "collaborators": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "plugin::users-permissions.user"
    }
  }
}
```

#### Workflow Engine: n8n

**Why n8n:**
- Visual workflow builder
- 300+ integrations
- Self-hosted option
- Custom node development
- Active community

**Custom Nodes:**
```typescript
// nodes/ResearchHive/ResearchNode.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class ResearchNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ResearchHive Research',
    name: 'researchhiveResearch',
    group: ['transform'],
    version: 1,
    description: 'Trigger AI research using ResearchHive',
    defaults: {
      name: 'ResearchHive Research',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'researchhiveApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Topic',
        name: 'topic',
        type: 'string',
        default: '',
        placeholder: 'e.g., AI trends in healthcare',
        description: 'Research topic',
      },
      {
        displayName: 'Depth',
        name: 'depth',
        type: 'options',
        options: [
          { name: 'Quick', value: 'quick' },
          { name: 'Standard', value: 'standard' },
          { name: 'Deep', value: 'deep' },
        ],
        default: 'standard',
      },
      {
        displayName: 'Sources',
        name: 'sources',
        type: 'multiOptions',
        options: [
          { name: 'Web', value: 'web' },
          { name: 'Academic', value: 'academic' },
          { name: 'News', value: 'news' },
          { name: 'Social Media', value: 'social' },
        ],
        default: ['web', 'news'],
      },
    ],
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const topic = this.getNodeParameter('topic', i) as string;
      const depth = this.getNodeParameter('depth', i) as string;
      const sources = this.getNodeParameter('sources', i) as string[];

      const response = await this.helpers.request({
        method: 'POST',
        url: 'https://api.researchhive.ai/v1/research',
        body: { topic, depth, sources },
        json: true,
      });

      returnData.push({ json: response });
    }

    return [returnData];
  }
}
```

**Workflow Templates:**
- Daily competitor monitoring
- RSS feed research automation
- Social media sentiment tracking
- Academic paper alerting
- Market intelligence gathering

#### Authentication: Logto

**Why Logto:**
- Open-source Auth0 alternative
- Modern UI/UX
- Social login support
- MFA built-in
- RBAC and custom claims

**Integration:**
```typescript
// src/lib/auth/logto-client.ts
import LogtoClient from '@logto/node';

export const logtoClient = new LogtoClient({
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
});

// Custom claims for RBAC
export async function enrichUserToken(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });

  return {
    'https://researchhive.ai/claims': {
      role: user.role,
      teamId: user.teamId,
      permissions: await getUserPermissions(userId),
    },
  };
}
```

#### Search: Meilisearch

**Why Meilisearch:**
- Blazing fast (<50ms search)
- Typo tolerance
- Faceted search
- Simple API
- Rust-powered performance

**Configuration:**
```typescript
// src/lib/search/meilisearch-client.ts
import { MeiliSearch } from 'meilisearch';

export const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_URL!,
  apiKey: process.env.MEILISEARCH_KEY!,
});

// Index configuration
export async function setupResearchIndex() {
  const index = meili.index('research');

  await index.updateSettings({
    searchableAttributes: ['title', 'description', 'findings', 'sources'],
    filterableAttributes: ['status', 'depth', 'owner', 'team', 'createdAt'],
    sortableAttributes: ['createdAt', 'updatedAt', 'title'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'custom:relevance_score',
    ],
  });
}
```

#### API Gateway: Kong

**Why Kong:**
- Enterprise-grade features
- Rich plugin ecosystem
- Rate limiting and analytics
- GraphQL/REST/gRPC support
- Open-source core

**Configuration:**
```yaml
# kong.yml
_format_version: "3.0"

services:
  - name: research-api
    url: http://research-api:4000
    routes:
      - name: research-routes
        paths:
          - /api/research
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
      - name: jwt
        config:
          key_claim_name: kid
          secret_is_base64: false
      - name: prometheus
        config:
          status_code_metrics: true
          latency_metrics: true

  - name: strapi-cms
    url: http://strapi:1337
    routes:
      - name: cms-routes
        paths:
          - /api/cms
    plugins:
      - name: cors
        config:
          origins: ["*"]
          methods: ["GET", "POST", "PUT", "DELETE"]
```

### 8.2 Integration Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Research UI  │  │  Graph View  │  │ Settings UI  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────┐
│                  Kong API Gateway                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Rate Limit │  │    JWT     │  │    CORS    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────┬────────────────────┬────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐    ┌──────────────────┐
│  Research API    │    │   Strapi CMS     │
│  (Custom tRPC)   │    │  (Extended)      │
│                  │    │                  │
│  ┌────────────┐  │    │  ┌────────────┐  │
│  │ AI Agents  │◄─┼────┼─▶│ Content    │  │
│  └────────────┘  │    │  └────────────┘  │
│  ┌────────────┐  │    │  ┌────────────┐  │
│  │ AgentDB    │  │    │  │ PostgreSQL │  │
│  └────────────┘  │    │  └────────────┘  │
└────────┬─────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐    ┌──────────────────┐
│   n8n Workflows  │    │  Meilisearch     │
│                  │    │  (Search Engine) │
│  ┌────────────┐  │    │                  │
│  │ Custom     │  │    │  ┌────────────┐  │
│  │ Nodes      │  │    │  │  Research  │  │
│  └────────────┘  │    │  │  Index     │  │
└──────────────────┘    └──┴────────────┴──┘
         │                   │
         ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│              External Integrations                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │HuggingFace│ │OpenRouter │ │  Logto   │  │ Redis   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Contribution Plan to Upstream Projects

**Planned Contributions:**

**Strapi:**
- Vector search plugin (open-source)
- Real-time collaboration hooks
- Performance optimizations for large datasets
- GraphQL subscription improvements

**n8n:**
- ResearchHive nodes package
- Multi-agent orchestration patterns
- Enhanced error handling for AI workflows
- Webhook retry improvements

**Meilisearch:**
- Semantic search integration
- Custom ranking functions for research
- Multi-modal search (text + metadata)
- Performance benchmarks

**Kong:**
- MCP protocol plugin
- WebSocket connection pooling
- Advanced rate limiting strategies
- Monitoring integrations

**Contribution Workflow:**
1. Fork upstream repository
2. Create feature branch
3. Implement feature + tests + docs
4. Submit PR with detailed description
5. Iterate based on maintainer feedback
6. Celebrate merged PR 🎉

---

## 9. HuggingFace AI Tasks

### 9.1 Tasks Integration Matrix

| HF Task | Model | Use Case | Frequency | Caching |
|---------|-------|----------|-----------|---------|
| **Text Summarization** | facebook/bart-large-cnn | Multi-document synthesis | Every research | 24h TTL |
| **Named Entity Recognition** | dslim/bert-base-NER | Entity extraction | Every research | 7d TTL |
| **Sentiment Analysis** | distilbert-base-uncased-finetuned-sst-2-english | Source sentiment | On demand | 24h TTL |
| **Question Answering** | deepset/roberta-base-squad2 | Fact extraction | Per query | 1h TTL |
| **Zero-Shot Classification** | facebook/bart-large-mnli | Content categorization | Every research | 24h TTL |
| **Text Embeddings** | sentence-transformers/all-MiniLM-L6-v2 | Semantic search | Every add | Permanent |
| **Text Generation** | gpt2 / mistralai/Mistral-7B | Report writing | Per export | No cache |
| **Translation** | Helsinki-NLP/opus-mt | Multi-language support | On demand | 30d TTL |

### 9.2 Detailed Task Implementation

**Task 1: Text Summarization**

**Model:** `facebook/bart-large-cnn`

**Purpose:** Condense long research documents into concise summaries

**Implementation:**
```typescript
// src/lib/ai/summarization.service.ts
import { HfInference } from '@huggingface/inference';

export class SummarizationService {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async summarizeDocument(text: string, maxLength = 150): Promise<string> {
    // Check cache first
    const cacheKey = `summary:${hashText(text)}:${maxLength}`;
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    // Call HuggingFace API
    const response = await this.hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: text,
      parameters: {
        max_length: maxLength,
        min_length: Math.floor(maxLength / 3),
        do_sample: false,
      },
    });

    const summary = response.summary_text;

    // Cache for 24 hours
    await redis.setex(cacheKey, 86400, summary);

    return summary;
  }

  async summarizeMultipleDocuments(
    documents: string[]
  ): Promise<string> {
    // Summarize each document
    const summaries = await Promise.all(
      documents.map((doc) => this.summarizeDocument(doc, 100))
    );

    // Combine and summarize again
    const combined = summaries.join('\n\n');
    return await this.summarizeDocument(combined, 300);
  }
}
```

**Usage in Research Flow:**
```typescript
// After gathering sources
const summaries = await summarizationService.summarizeMultipleDocuments(
  sources.map((s) => s.content)
);
```

**Task 2: Named Entity Recognition (NER)**

**Model:** `dslim/bert-base-NER`

**Purpose:** Extract people, organizations, locations from research

**Implementation:**
```typescript
// src/lib/ai/ner.service.ts
export class NERService {
  async extractEntities(text: string): Promise<Entity[]> {
    const response = await this.hf.tokenClassification({
      model: 'dslim/bert-base-NER',
      inputs: text,
    });

    // Group consecutive tokens
    const entities = this.groupEntities(response);

    // Store in knowledge graph
    await this.storeInKnowledgeGraph(entities);

    return entities;
  }

  private groupEntities(tokens: any[]): Entity[] {
    const entities: Entity[] = [];
    let current: Entity | null = null;

    for (const token of tokens) {
      const type = token.entity_group;
      const word = token.word;

      if (current && current.type === type) {
        // Continue existing entity
        current.text += word.startsWith('##') ? word.slice(2) : ' ' + word;
        current.score = Math.max(current.score, token.score);
      } else {
        // Start new entity
        if (current) entities.push(current);
        current = {
          text: word,
          type,
          score: token.score,
        };
      }
    }

    if (current) entities.push(current);

    return entities.filter((e) => e.score > 0.8); // High confidence only
  }

  private async storeInKnowledgeGraph(entities: Entity[]) {
    for (const entity of entities) {
      await neo4j.run(
        `
        MERGE (e:Entity {name: $name, type: $type})
        ON CREATE SET e.first_seen = timestamp()
        ON MATCH SET e.last_seen = timestamp(), e.frequency = e.frequency + 1
      `,
        { name: entity.text, type: entity.type }
      );
    }
  }
}
```

**Task 3: Sentiment Analysis**

**Model:** `distilbert-base-uncased-finetuned-sst-2-english`

**Purpose:** Analyze sentiment of sources for bias detection

**Implementation:**
```typescript
// src/lib/ai/sentiment.service.ts
export class SentimentService {
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const response = await this.hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text,
    });

    const sentiment = response[0];

    return {
      label: sentiment.label, // POSITIVE or NEGATIVE
      score: sentiment.score,
      interpretation: this.interpretSentiment(sentiment.score, sentiment.label),
    };
  }

  async analyzeSources(sources: Source[]): Promise<SourceSentiment[]> {
    const results = await Promise.all(
      sources.map(async (source) => ({
        sourceId: source.id,
        sentiment: await this.analyzeSentiment(source.content),
      }))
    );

    // Detect bias
    const bias = this.detectBias(results);

    return results.map((r) => ({
      ...r,
      biasWarning: bias.outliers.includes(r.sourceId),
    }));
  }

  private detectBias(results: any[]): { outliers: string[] } {
    const scores = results.map((r) =>
      r.sentiment.label === 'POSITIVE' ? r.sentiment.score : -r.sentiment.score
    );

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const stdDev = Math.sqrt(
      scores.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
        scores.length
    );

    // Flag outliers (>2 std devs from mean)
    const outliers = results
      .filter((r, i) => Math.abs(scores[i] - mean) > 2 * stdDev)
      .map((r) => r.sourceId);

    return { outliers };
  }
}
```

**Task 4: Question Answering**

**Model:** `deepset/roberta-base-squad2`

**Purpose:** Extract specific answers from research documents

**Implementation:**
```typescript
// src/lib/ai/qa.service.ts
export class QuestionAnsweringService {
  async answerQuestion(
    question: string,
    context: string
  ): Promise<AnswerResult> {
    const response = await this.hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: {
        question,
        context,
      },
    });

    return {
      answer: response.answer,
      score: response.score,
      start: response.start,
      end: response.end,
      context: context.substring(
        Math.max(0, response.start - 100),
        Math.min(context.length, response.end + 100)
      ),
    };
  }

  async answerFromMultipleSources(
    question: string,
    sources: Source[]
  ): Promise<AnswerResult[]> {
    const answers = await Promise.all(
      sources.map((source) =>
        this.answerQuestion(question, source.content).catch(() => null)
      )
    );

    return answers
      .filter((a) => a !== null && a.score > 0.5)
      .sort((a, b) => b.score - a.score);
  }
}
```

**Task 5: Text Embeddings**

**Model:** `sentence-transformers/all-MiniLM-L6-v2`

**Purpose:** Generate embeddings for semantic search

**Implementation:**
```typescript
// src/lib/ai/embeddings.service.ts
export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    const cacheKey = `embedding:${hashText(text)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Generate embedding
    const response = await this.hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });

    const embedding = Array.from(response as number[]);

    // Cache permanently (embeddings don't change)
    await redis.set(cacheKey, JSON.stringify(embedding));

    return embedding;
  }

  async indexDocument(doc: Document) {
    const embedding = await this.generateEmbedding(doc.content);

    // Store in AgentDB
    await agentdb.insert({
      id: doc.id,
      vector: embedding,
      metadata: {
        title: doc.title,
        source: doc.source,
        date: doc.date,
      },
    });

    // Store in Qdrant for production
    await qdrant.upsert('research', {
      points: [
        {
          id: doc.id,
          vector: embedding,
          payload: doc.metadata,
        },
      ],
    });
  }

  async semanticSearch(
    query: string,
    limit = 10
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    // Search in AgentDB (faster)
    const results = await agentdb.search(queryEmbedding, limit, 0.7);

    return results.map((r) => ({
      id: r.id,
      score: r.score,
      metadata: r.metadata,
    }));
  }
}
```

### 9.3 Cost Optimization for HuggingFace

**Strategy:**
1. **Aggressive Caching** - Cache all API responses with appropriate TTL
2. **Local Inference** - Use Transformers.js for simple tasks in browser
3. **Batch Processing** - Combine multiple requests where possible
4. **Model Selection** - Use smaller models for non-critical tasks
5. **Rate Limiting** - Prevent unnecessary API calls

**Cost Calculator:**
```typescript
// src/lib/ai/cost-tracker.ts
export class AIcostTracker {
  async trackUsage(model: string, tokensUsed: number) {
    const cost = this.calculateCost(model, tokensUsed);

    await db.aiUsage.create({
      data: {
        model,
        tokens: tokensUsed,
        cost,
        timestamp: new Date(),
      },
    });

    // Alert if exceeding budget
    const monthlyTotal = await this.getMonthlyTotal();
    if (monthlyTotal > BUDGET_LIMIT) {
      await this.sendBudgetAlert(monthlyTotal);
    }
  }

  private calculateCost(model: string, tokens: number): number {
    const pricing = {
      'facebook/bart-large-cnn': 0.0004, // per 1K tokens
      'dslim/bert-base-NER': 0.0003,
      'distilbert-base-uncased-finetuned-sst-2-english': 0.0002,
      'sentence-transformers/all-MiniLM-L6-v2': 0.0002,
    };

    const pricePerK = pricing[model] || 0.0005;
    return (tokens / 1000) * pricePerK;
  }
}
```

---

## 10. MCP Implementation

### 10.1 MCP Server Configuration

**Server Setup:**
```typescript
// src/mcp/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  SSEServerTransport,
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server';
import { z } from 'zod';

const server = new Server(
  {
    name: 'researchhive-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Tool 1: research_topic
const ResearchTopicSchema = z.object({
  topic: z.string().describe('The research topic'),
  depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
  sources: z
    .array(z.string())
    .default(['web', 'academic', 'news'])
    .describe('Sources to search'),
  max_results: z.number().default(10),
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'research_topic',
      description:
        'Research a topic using multi-agent swarm. Returns comprehensive findings with citations.',
      inputSchema: zodToJsonSchema(ResearchTopicSchema),
    },
    {
      name: 'synthesize_findings',
      description: 'Synthesize research findings into structured report',
      inputSchema: {
        type: 'object',
        properties: {
          research_id: { type: 'string' },
          format: {
            type: 'string',
            enum: ['markdown', 'pdf', 'json', 'html'],
          },
          style: {
            type: 'string',
            enum: ['academic', 'business', 'casual'],
          },
        },
        required: ['research_id'],
      },
    },
    {
      name: 'query_knowledge_graph',
      description: 'Query knowledge graph for relationships and insights',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          entity_types: { type: 'array', items: { type: 'string' } },
          max_depth: { type: 'number', default: 3 },
        },
        required: ['query'],
      },
    },
    {
      name: 'extract_entities',
      description: 'Extract named entities from text',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          entity_types: {
            type: 'array',
            items: { type: 'string' },
            default: ['PER', 'ORG', 'LOC'],
          },
        },
        required: ['text'],
      },
    },
    {
      name: 'fact_check',
      description: 'Verify claims against multiple sources',
      inputSchema: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['claim'],
      },
    },
    {
      name: 'semantic_search',
      description: 'Search knowledge base using semantic similarity',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number', default: 10 },
          threshold: { type: 'number', default: 0.7 },
        },
        required: ['query'],
      },
    },
  ],
}));

// Tool Implementation: research_topic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'research_topic') {
    const args = ResearchTopicSchema.parse(request.params.arguments);

    // Start research
    const researchId = await orchestrator.startResearch(args);

    // Stream progress via SSE
    const stream = orchestrator.streamProgress(researchId);

    for await (const update of stream) {
      // Emit progress events
      await server.notification({
        method: 'notifications/progress',
        params: {
          progressToken: researchId,
          value: update.progress,
        },
      });
    }

    // Return final results
    const results = await orchestrator.getResults(researchId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  // Handle other tools...
});

// Resources: Expose research projects
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'researchhive://research/recent',
      name: 'Recent Research Projects',
      description: 'Last 10 research projects',
      mimeType: 'application/json',
    },
    {
      uri: 'researchhive://knowledge-graph/entities',
      name: 'Knowledge Graph Entities',
      description: 'All entities in knowledge graph',
      mimeType: 'application/json',
    },
  ],
}));

// Prompts: Pre-configured research prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: 'competitive_analysis',
      description: 'Analyze competitors in a market',
      arguments: [
        {
          name: 'company',
          description: 'Your company name',
          required: true,
        },
        {
          name: 'competitors',
          description: 'Comma-separated competitor names',
          required: true,
        },
      ],
    },
    {
      name: 'literature_review',
      description: 'Academic literature review',
      arguments: [
        {
          name: 'research_question',
          description: 'Your research question',
          required: true,
        },
      ],
    },
  ],
}));

// Start SSE server for web clients
const sseTransport = new SSEServerTransport('/mcp/sse', server);
app.use('/mcp/sse', sseTransport.handler);

// Start stdio server for CLI clients
if (process.argv.includes('--stdio')) {
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
}

export { server, sseTransport };
```

### 10.2 MCP Client Integration (Frontend)

```typescript
// src/lib/mcp/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export class MCPClient {
  private client: Client;
  private transport: SSEClientTransport;

  async connect() {
    this.client = new Client(
      {
        name: 'researchhive-web-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    this.transport = new SSEClientTransport(
      new URL(`${process.env.NEXT_PUBLIC_API_URL}/mcp/sse`)
    );

    await this.client.connect(this.transport);
  }

  async researchTopic(
    topic: string,
    options?: Partial<ResearchOptions>
  ): Promise<ResearchResult> {
    const response = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'research_topic',
          arguments: {
            topic,
            depth: options?.depth || 'standard',
            sources: options?.sources || ['web', 'academic', 'news'],
            max_results: options?.maxResults || 10,
          },
        },
      },
      CallToolResultSchema
    );

    return JSON.parse(response.content[0].text);
  }

  async * streamResearchProgress(
    topic: string
  ): AsyncGenerator<ResearchUpdate> {
    // Subscribe to progress notifications
    this.client.setNotificationHandler((notification) => {
      if (notification.method === 'notifications/progress') {
        return notification.params;
      }
    });

    // Start research
    const promise = this.researchTopic(topic);

    // Yield progress updates
    // (In practice, use EventEmitter or RxJS)
    while (true) {
      // Wait for notification
      yield await new Promise((resolve) => {
        const handler = (notif) => {
          if (notif.method === 'notifications/progress') {
            resolve(notif.params.value);
          }
        };
        this.client.setNotificationHandler(handler);
      });
    }
  }

  async semanticSearch(query: string, limit = 10) {
    const response = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'semantic_search',
          arguments: { query, limit },
        },
      },
      CallToolResultSchema
    );

    return JSON.parse(response.content[0].text);
  }

  async disconnect() {
    await this.client.close();
  }
}

// React Hook
export function useMCPClient() {
  const [client] = useState(() => new MCPClient());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    client.connect().then(() => setConnected(true));
    return () => client.disconnect();
  }, []);

  return { client, connected };
}

// Usage in component
export function ResearchInterface() {
  const { client, connected } = useMCPClient();
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleResearch = async (topic: string) => {
    // Stream progress
    const stream = client.streamResearchProgress(topic);

    for await (const update of stream) {
      setProgress(update.progress);

      if (update.status === 'completed') {
        setResults(update.results);
        break;
      }
    }
  };

  return (
    <div>
      {progress > 0 && <ProgressBar value={progress} />}
      {results && <ResultsView data={results} />}
    </div>
  );
}
```

### 10.3 VS Code Extension Integration

```typescript
// extensions/vscode/src/extension.ts
import * as vscode from 'vscode';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export async function activate(context: vscode.ExtensionContext) {
  // Create MCP client
  const client = new Client(
    {
      name: 'researchhive-vscode',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  // Connect to local MCP server
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['researchhive-mcp-server', '--stdio'],
  });

  await client.connect(transport);

  // Command: Research Selection
  const researchCommand = vscode.commands.registerCommand(
    'researchhive.researchSelection',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.document.getText(editor.selection);
      if (!selection) return;

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Researching...',
          cancellable: false,
        },
        async (progress) => {
          const result = await client.request({
            method: 'tools/call',
            params: {
              name: 'research_topic',
              arguments: { topic: selection },
            },
          });

          // Insert results as comment
          editor.edit((editBuilder) => {
            editBuilder.insert(
              editor.selection.end,
              `\n\n/**\n * Research Results:\n * ${JSON.stringify(result, null, 2)}\n */\n`
            );
          });
        }
      );
    }
  );

  context.subscriptions.push(researchCommand);
}
```

---

This PRD is getting very extensive! Let me continue with the remaining sections in the next part.
