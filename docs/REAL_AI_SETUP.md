# Real AI Integration Setup Guide

**Status:** ✅ PRODUCTION READY
**Date:** 2025-11-22
**Version:** 1.0.0

## Overview

ResearchHive now supports **real Claude AI-powered research** using the Anthropic API. The system intelligently uses real AI when an API key is configured, or gracefully falls back to simulation mode for development.

## Quick Start

### 1. Get Your Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your new API key (starts with `sk-ant-...`)

**Pricing:**
- Free tier available with $5 credit
- Pay-as-you-go after free tier
- Claude Sonnet 4.5: ~$3 per million input tokens
- See [Anthropic Pricing](https://www.anthropic.com/pricing) for details

### 2. Configure Your Environment

Open your `.env` file and update the `ANTHROPIC_API_KEY`:

```bash
# Anthropic AI (Required for real AI-powered research)
# Get your API key from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

**Important:** Never commit your real API key to version control!

### 3. Restart Your Servers

```bash
pnpm dev
```

You should see:
```
🧠 Research Orchestrator initialized
🚀 Server ready at http://0.0.0.0:4000
```

**No warning message** = Real AI is active ✅
**Warning message** = Simulation mode (no valid API key) ⚠️

### 4. Test Real AI Research

Create a research request:

```bash
curl -X POST http://localhost:4000/trpc/research.create \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Artificial Intelligence Ethics",
    "depth": "standard",
    "description": "Research on AI ethics and responsible AI development"
  }'
```

Check the server logs:
- **Real AI:** `🤖 Using real Claude AI for research`
- **Simulation:** `🔬 Using simulation mode (set ANTHROPIC_API_KEY for real AI)`

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Research Orchestrator                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Check if ANTHROPIC_API_KEY is configured         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│           ┌───────────────┴───────────────┐                 │
│           │                                │                 │
│     ✅ Valid Key                    ❌ No/Invalid Key       │
│           │                                │                 │
│  ┌────────▼─────────┐           ┌─────────▼──────────┐     │
│  │   Real AI Mode   │           │  Simulation Mode   │     │
│  │                  │           │                    │     │
│  │ • Claude Sonnet  │           │ • Mock Data       │     │
│  │ • 8 AI Agents    │           │ • Instant Results │     │
│  │ • Real Research  │           │ • No API Costs    │     │
│  └──────────────────┘           └────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Agent Research Process

When real AI is enabled, the system deploys **8 specialized Claude AI agents** in parallel:

1. **Agent 1:** Overview and Fundamentals
2. **Agent 2:** Recent Developments and Trends
3. **Agent 3:** Best Practices and Guidelines
4. **Agent 4:** Case Studies and Examples
5. **Agent 5:** Research Papers and Academic Sources
6. **Agent 6:** Industry Reports and Analysis
7. **Agent 7:** Expert Opinions and Thought Leadership
8. **Agent 8:** Tools and Technologies

Each agent:
- Uses Claude Sonnet 4.5 (latest model)
- Researches with specific focus area
- Returns 2-5 high-quality sources
- Includes relevance scores (0-1 scale)
- Provides summaries and key points

**Parallel Execution:** All agents run simultaneously using `Promise.all()` for optimal performance.

**Deduplication:** Results are automatically deduplicated based on URL and title.

**Ranking:** Sources sorted by relevance, top results selected.

## Features

### 🤖 Real Claude AI Integration

✅ **Production-Ready**
- Claude Sonnet 4.5 (model: `claude-sonnet-4-5-20250929`)
- 8 specialized research agents
- Parallel execution for speed
- Comprehensive error handling

✅ **Intelligent Fallback**
- Automatic simulation mode when no API key
- Clear user guidance via console messages
- No code changes needed to switch modes

✅ **Robust Error Handling**
- Automatic retry with exponential backoff (3 retries)
- Rate limit handling (429 errors)
- Network error recovery
- Graceful degradation (failed agents don't block research)

### 📊 Research Depth Levels

| Depth    | Agents | Expected Sources | API Calls | Approx. Cost* |
|----------|--------|------------------|-----------|---------------|
| quick    | 4      | 6-12            | 4         | $0.05-0.10    |
| standard | 8      | 12-24           | 8         | $0.10-0.20    |
| deep     | 16     | 24-48           | 16        | $0.20-0.40    |

*Estimated cost based on Claude Sonnet 4.5 pricing. Actual cost varies by response length.

### 🔒 Security Features

✅ **API Key Validation**
- Checks for presence of API key
- Validates key format (not "your-api-key-here")
- Clear warning messages when invalid

✅ **Safe Defaults**
- Simulation mode by default
- Requires explicit API key configuration
- Never exposes keys in logs or errors

## Code Examples

### Using the Claude Client Directly

```typescript
import { claudeClient } from '@researchhive/ai/services/claude-client';

// Check if real AI is available
if (claudeClient.isRealAIAvailable()) {
  console.log('Real AI enabled ✅');
} else {
  console.log('Simulation mode ⚠️');
}

// Perform research with specific focus
const response = await claudeClient.research({
  topic: 'Quantum Computing',
  focus: 'recent developments and trends',
  depth: 'standard',
});

console.log('Sources found:', response.sources.length);
console.log('Confidence:', response.confidence);
```

### Response Format

```typescript
interface ResearchResponse {
  sources: Array<{
    title: string;           // "Quantum Computing Advances in 2024"
    url: string;             // "https://example.edu/quantum-2024"
    relevance: number;       // 0.95 (0-1 scale)
    summary: string;         // "Brief summary of content..."
    keyPoints: string[];     // ["Point 1", "Point 2", ...]
  }>;
  focus: string;             // "recent developments and trends"
  confidence: number;        // 0.85 (0-1 scale)
}
```

### Customizing Research

The Claude client uses structured prompts optimized for each depth level:

- **Quick:** 2-3 sources, brief summaries
- **Standard:** 3-5 sources, detailed analysis
- **Deep:** 5-8 sources, in-depth evaluation

All sources include:
- Credible URLs (.edu, .org, .gov, reputable publishers)
- Relevance scores
- Content summaries
- Key points extraction

## Monitoring and Debugging

### Console Logs

**Server Startup:**
```
⚠️  No valid Anthropic API key found. AI features will use simulation mode.
   Set ANTHROPIC_API_KEY in .env to enable real AI research.
   Get your key at: https://console.anthropic.com
```
↑ This means simulation mode is active

**OR**

```
🧠 Research Orchestrator initialized
```
↑ No warning = Real AI is active

**During Research:**
```
📚 8 agents gathering sources for: Quantum Computing
🤖 Using real Claude AI for research
  🤖 Agent-1: Researching Quantum Computing - overview and fundamentals
  🤖 Agent-2: Researching Quantum Computing - recent developments and trends
  ...
  ✅ Collected 16 unique sources from AI agents
```

**Agent Failures:**
```
  ❌ Agent-3 failed: Rate limit exceeded
  ⚠️  API call failed, retrying in 2000ms... (attempt 1/3)
```

### Error Types and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `No valid Anthropic API key found` | Missing/invalid API key | Set `ANTHROPIC_API_KEY` in `.env` |
| `Rate limit exceeded (429)` | Too many requests | Wait or upgrade API tier |
| `Network timeout` | API unreachable | Check internet connection, retry |
| `Invalid response format` | Unexpected AI output | Check logs, may auto-recover |
| `All agents failed` | Systemic issue | Check API status, key validity |

### Testing Checklist

✅ **Simulation Mode Works**
```bash
# Remove or set invalid API key
ANTHROPIC_API_KEY=your-api-key-here

# Should use simulation mode
pnpm dev
curl -X POST http://localhost:4000/trpc/research.create ...
# Check logs for: "🔬 Using simulation mode"
```

✅ **Real AI Mode Works**
```bash
# Set valid API key
ANTHROPIC_API_KEY=sk-ant-your-real-key

# Should use real AI
pnpm dev
curl -X POST http://localhost:4000/trpc/research.create ...
# Check logs for: "🤖 Using real Claude AI for research"
```

✅ **Error Handling Works**
```bash
# Set invalid API key
ANTHROPIC_API_KEY=sk-ant-invalid

# Should show error and retry
# Check logs for retry messages
```

## Production Deployment

### Environment Variables

```bash
# Production .env
ANTHROPIC_API_KEY=sk-ant-your-production-key
DATABASE_URL=postgresql://...  # Use PostgreSQL in production
NODE_ENV=production
```

### Rate Limiting

Anthropic API limits:
- **Tier 1 (Free):** 50 requests/min, 40,000 tokens/min
- **Tier 2:** 1,000 requests/min, 80,000 tokens/min
- **Tier 3+:** Higher limits, contact Anthropic

**Built-in Protection:**
- Automatic retry on 429 errors
- Exponential backoff (1s, 2s, 4s)
- Max 3 retries per request
- Graceful agent failures

### Cost Management

**Optimization Tips:**

1. **Use appropriate depth:**
   - Quick research: 4 agents
   - Standard research: 8 agents
   - Deep research: 16 agents (only when needed)

2. **Monitor usage:**
   - Check Anthropic dashboard
   - Track research completion rates
   - Set up billing alerts

3. **Implement caching:**
   - Results already cached in-memory
   - Add Redis for distributed caching
   - Cache common research topics

4. **User quotas:**
   - Limit research requests per user
   - Implement tier-based access
   - Queue expensive deep research

### Monitoring

**Key Metrics:**

- API calls per research
- Success rate (% completed)
- Average response time
- Cost per research
- Error rate by type

**Recommended Tools:**

- Anthropic Console (API usage)
- Application logs (research metrics)
- Error tracking (Sentry, etc.)
- Performance monitoring (DataDog, New Relic)

## Troubleshooting

### Problem: "No valid Anthropic API key found"

**Cause:** API key not set or invalid format

**Solution:**
1. Check `.env` file has `ANTHROPIC_API_KEY`
2. Verify key starts with `sk-ant-`
3. Restart servers after updating `.env`
4. Check for typos in key

### Problem: Research takes too long

**Cause:** Network latency, API rate limits, or model processing

**Solution:**
1. Use `quick` depth for faster results (4 agents)
2. Check network connection
3. Verify API tier limits
4. Consider implementing timeout limits

### Problem: "All agents failed"

**Cause:** Systemic API issue or invalid key

**Solution:**
1. Check Anthropic API status: https://status.anthropic.com
2. Verify API key validity in console
3. Check server logs for specific error messages
4. Ensure sufficient API credits

### Problem: Inconsistent results

**Cause:** AI non-determinism (temperature > 0)

**Solution:**
- This is expected behavior (temperature: 0.7)
- Provides diverse, creative research
- Lower temperature in `claude-client.ts` for more consistent results
- Current setting balances creativity and reliability

## Advanced Configuration

### Custom Model Selection

Edit `packages/ai/services/claude-client.ts`:

```typescript
const message = await this.client.messages.create({
  model: 'claude-sonnet-4-5-20250929',  // Change model here
  max_tokens: 4096,                      // Adjust token limit
  temperature: 0.7,                       // 0-1 (creativity)
  // ...
});
```

Available models:
- `claude-sonnet-4-5-20250929` (Recommended, best balance)
- `claude-opus-4-20250514` (Most capable, higher cost)
- `claude-haiku-3-5-20241022` (Fastest, lower cost)

### Custom Research Prompts

Modify `buildResearchPrompt()` in `claude-client.ts` to customize:
- Instruction style
- Source requirements
- Output format
- Quality criteria

### Streaming Support (Future)

The Anthropic SDK supports streaming for real-time updates:

```typescript
// Future enhancement
const stream = await this.client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  stream: true,
  // ...
});

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    // Update UI with partial results
    updateProgress(event.delta.text);
  }
}
```

## Next Steps

1. ✅ **Get API Key:** Sign up at https://console.anthropic.com
2. ✅ **Configure .env:** Add your `ANTHROPIC_API_KEY`
3. ✅ **Test:** Run a research and verify real AI mode
4. 📊 **Monitor:** Track usage and costs in Anthropic Console
5. 🚀 **Deploy:** Move to production with PostgreSQL

## Related Documentation

- [CLAUDE_FLOW_INTEGRATION.md](./CLAUDE_FLOW_INTEGRATION.md) - Alternative integration approaches
- [AI_WORKFLOW_VALIDATION.md](./AI_WORKFLOW_VALIDATION.md) - Validation test results
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication configuration
- [Anthropic API Docs](https://docs.anthropic.com) - Official API documentation

## Support

**Questions or Issues?**

1. Check console logs for error messages
2. Verify API key in Anthropic Console
3. Review [Anthropic Documentation](https://docs.anthropic.com)
4. Check server status: https://status.anthropic.com

---

**Implementation Complete** ✅
Real AI integration is production-ready and tested. The system intelligently uses Claude AI when configured, or falls back to simulation mode for development.
