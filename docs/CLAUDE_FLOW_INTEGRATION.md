# Claude-Flow Integration Guide

This document explains how to integrate the full claude-flow swarm orchestration into ResearchHive.

## Current Implementation

The research orchestrator currently uses a **multi-agent simulation** that demonstrates the architecture without requiring external dependencies. This allows the application to work immediately while providing a clear upgrade path to full claude-flow integration.

### What's Implemented

✅ **Multi-Agent Architecture**
- Configurable agent count (4-16 based on depth)
- Parallel agent execution simulation
- Agent coordination and result aggregation

✅ **Research Pipeline**
- Source gathering phase
- Analysis and synthesis phase
- Result compilation
- Database persistence

✅ **Production-Ready Foundation**
- Error handling
- Progress tracking
- Status updates
- Scalable design

### What's Missing

⏳ **Real AI Models**
- Currently using mock source generation
- No actual web scraping
- No LLM-based synthesis

⏳ **Full Claude-Flow Features**
- Hive-mind swarm intelligence
- AgentDB vector search
- 100+ MCP tools
- Dynamic agent architecture

---

## Integrating Full Claude-Flow

### Option 1: CLI Integration (Recommended for MVP)

Use claude-flow's CLI via child processes:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ClaudeFlowIntegration {
  async executeSwarm(topic: string, agentCount: number) {
    const command = `npx claude-flow@alpha swarm \\
      --topic "${topic}" \\
      --agents ${agentCount} \\
      --output json`;

    const { stdout } = await execAsync(command);
    return JSON.parse(stdout);
  }
}
```

**Pros:**
- Uses full claude-flow capabilities
- No need to understand internals
- Official API

**Cons:**
- Slower (process overhead)
- Harder to debug
- Less control

### Option 2: Programmatic API (Future)

When claude-flow exposes a JavaScript API:

```typescript
import { ClaudeFlow } from 'claude-flow';

const flow = new ClaudeFlow({
  apiKey: process.env.ANTHROPIC_API_KEY,
  topology: 'hive-mind',
});

const swarm = await flow.createSwarm({
  agentCount: 8,
  task: 'research',
  topic: 'AI in Healthcare',
});

const results = await swarm.execute();
```

### Option 3: Hybrid Approach (Best for Production)

Combine current implementation with claude-flow features:

```typescript
export class HybridResearchOrchestrator {
  constructor(
    private useClaudeFlow: boolean = false
  ) {}

  async startResearch(config: ResearchConfig) {
    if (this.useClaudeFlow && process.env.CLAUDE_FLOW_ENABLED) {
      return this.executeWithClaudeFlow(config);
    }
    return this.executeWithBuiltIn(config);
  }

  private async executeWithClaudeFlow(config: ResearchConfig) {
    // Use full claude-flow
  }

  private async executeWithBuiltIn(config: ResearchConfig) {
    // Use current implementation
  }
}
```

---

## Step-by-Step Integration

### 1. Enable Claude-Flow Globally

```bash
# Install claude-flow
npm install -g claude-flow@alpha

# Verify installation
claude-flow --version
```

### 2. Configure Environment

Add to `.env`:
```bash
# Claude-Flow Configuration
CLAUDE_FLOW_ENABLED=true
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_FLOW_MAX_AGENTS=16
CLAUDE_FLOW_TOPOLOGY=hive-mind
```

### 3. Update Research Orchestrator

In `packages/ai/services/research-orchestrator.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ResearchOrchestrator {
  private async gatherSourcesWithClaudeFlow(
    topic: string,
    agentCount: number
  ): Promise<Source[]> {
    try {
      // Execute claude-flow swarm
      const command = `claude-flow swarm \\
        --mode research \\
        --topic "${topic}" \\
        --agents ${agentCount} \\
        --format json`;

      const { stdout } = await execAsync(command, {
        timeout: 300000, // 5 minutes
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      const result = JSON.parse(stdout);
      return result.sources || [];
    } catch (error) {
      console.error('Claude-Flow error, falling back:', error);
      return this.gatherSources(topic, agentCount); // Fallback
    }
  }
}
```

### 4. Add Feature Flag

```typescript
const USE_CLAUDE_FLOW =
  process.env.CLAUDE_FLOW_ENABLED === 'true' &&
  process.env.ANTHROPIC_API_KEY;

const sources = USE_CLAUDE_FLOW
  ? await this.gatherSourcesWithClaudeFlow(topic, agentCount)
  : await this.gatherSources(topic, agentCount);
```

---

## Alternative: Build Custom AI Agents

For more control, implement custom agents using Anthropic SDK:

### Install Dependencies

```bash
pnpm add @anthropic-ai/sdk
```

### Create Agent Class

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ResearchAgent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async search(topic: string, focus: string): Promise<Source[]> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Research "${topic}" focusing on "${focus}".
                 Find 3-5 high-quality sources with URLs.
                 Return as JSON array.`,
      }],
    });

    return JSON.parse(message.content[0].text);
  }
}
```

### Parallel Execution

```typescript
async gatherSources(topic: string, agentCount: number) {
  const focuses = [
    'recent developments',
    'best practices',
    'case studies',
    'academic research',
  ];

  // Create agents
  const agents = Array.from({ length: agentCount },
    () => new ResearchAgent()
  );

  // Execute in parallel
  const results = await Promise.all(
    agents.map((agent, i) =>
      agent.search(topic, focuses[i % focuses.length])
    )
  );

  // Aggregate results
  return results.flat();
}
```

---

## Testing Integration

### Test 1: CLI Integration
```bash
# Test claude-flow directly
npx claude-flow@alpha swarm \\
  --topic "AI in Healthcare" \\
  --agents 4 \\
  --format json
```

### Test 2: API Integration
```typescript
// In your test file
const orchestrator = new ResearchOrchestrator();
const result = await orchestrator.startResearch({
  topic: 'Test Topic',
  depth: 'quick',
});

// Verify real data vs mocks
expect(result.sources).toHaveLength(greaterThan(3));
expect(result.sources[0].url).toMatch(/^https?:\/\//);
```

---

## Performance Considerations

### Current Implementation
- ⚡ Instant response (mock data)
- 💾 Low memory usage
- 🆓 No API costs

### With Claude-Flow
- ⏱️ 30s-5min response time
- 💰 API costs ($0.50-$5 per research)
- 🧠 High-quality results
- 🔍 Real web scraping

### Optimization Tips
1. **Cache results** in AgentDB
2. **Rate limit** to control costs
3. **Parallel execution** for speed
4. **Fallback** to current implementation on errors

---

## Production Deployment

### Environment Variables
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_FLOW_ENABLED=true

# Optional
CLAUDE_FLOW_MAX_AGENTS=8
CLAUDE_FLOW_TIMEOUT=300000
CLAUDE_FLOW_RETRY_COUNT=3
```

### Monitoring
- Track API usage and costs
- Monitor research completion times
- Alert on failures
- Cache hit rates

---

## Next Steps

1. ✅ **Current**: Mock implementation works
2. ⏳ **Phase 1**: Add Anthropic SDK for real AI
3. ⏳ **Phase 2**: Integrate claude-flow CLI
4. ⏳ **Phase 3**: Build custom agent swarm
5. ⏳ **Phase 4**: Full hive-mind architecture

**Start with Phase 1** for quickest real AI integration!
