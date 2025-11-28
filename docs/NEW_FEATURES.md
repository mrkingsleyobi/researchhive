# ResearchHive - New Features Documentation

**Last Updated:** November 28, 2025
**Version:** 1.1.0

This document describes the newly implemented features and improvements in ResearchHive.

---

## 📋 Table of Contents

1. [AgentDB Vector Search Integration](#agentdb-vector-search-integration)
2. [Enhanced Authentication](#enhanced-authentication)
3. [Error Boundaries](#error-boundaries)
4. [Citation Export](#citation-export)
5. [API Enhancements](#api-enhancements)
6. [Configuration Updates](#configuration-updates)

---

## 🔍 AgentDB Vector Search Integration

### Overview

ResearchHive now includes full AgentDB integration for semantic search and episodic memory, enabling intelligent research discovery and agent learning capabilities.

### Features

#### 1. Vector Storage
- **Automatic indexing** of all research projects and sources
- **384-dimensional embeddings** using sentence-transformers
- **HNSW indexing** for fast similarity search (96x-164x faster than linear search)
- **Graceful degradation** - works without HuggingFace API key using simple embeddings

#### 2. Semantic Search
- Search previous research by **meaning**, not just keywords
- **Similarity threshold** of 0.7 for relevant results
- Returns research ranked by **semantic similarity**
- Fallback to cache-based search if AgentDB unavailable

#### 3. Episodic Memory
- **Automatic episode storage** for each research session
- Tracks context, actions, outcomes, and success metrics
- Enables **reflexive learning** - agents improve over time
- Retrieves similar past episodes to inform future research

### Implementation

```typescript
// packages/ai/services/agentdb-service.ts
export class AgentDBService {
  async initialize(): Promise<void>
  async insert(document: VectorDocument): Promise<void>
  async search(queryVector: number[], limit: number, threshold: number): Promise<SearchResult[]>
  async storeEpisode(episode: Episode): Promise<void>
  async retrieveSimilarEpisodes(queryEmbedding: number[], limit: number): Promise<any[]>
}
```

### Usage

```typescript
import { getAgentDB, getEmbeddings } from '@researchhive/ai';

// Initialize
const agentDB = getAgentDB();
await agentDB.initialize();

// Generate embedding
const embeddings = getEmbeddings();
const vector = await embeddings.generateEmbedding('quantum computing');

// Search
const results = await agentDB.search(vector, 10, 0.7);
```

### Configuration

```env
# Enable AgentDB
AGENTDB_ENABLED=true

# Optional: HuggingFace API for real embeddings
HUGGINGFACE_API_KEY=your-key-here
```

### File Locations

- **Service**: `packages/ai/services/agentdb-service.ts`
- **Embeddings**: `packages/ai/services/embeddings-service.ts`
- **Integration**: `packages/ai/services/research-orchestrator.ts`

---

## 🔐 Enhanced Authentication

### Overview

Improved authentication system with Logto integration, demo mode support, and production-ready middleware.

### Features

#### 1. Demo Mode
- **Automatic demo user** creation (`demo@researchhive.ai`)
- **Visual indicator** in the dashboard header
- **Zero configuration** needed for development
- Gracefully switches to production mode with real credentials

#### 2. Production Authentication
- **Logto OAuth 2.0 / OIDC** integration
- **Session cookie** management
- **Route protection** middleware
- **Redirect handling** for unauthenticated users

#### 3. Smart Middleware
- **Automatic mode detection** based on `LOGTO_APP_ID`
- **Protected routes**: All `/dashboard/*` routes
- **Excluded routes**: Auth routes, API routes, static assets
- **Demo mode bypass** for easy development

### Implementation

```typescript
// apps/web/src/middleware.ts
export function middleware(request: NextRequest) {
  const isDemoMode = process.env.LOGTO_APP_ID === 'researchhive-app';

  if (isDemoMode) {
    // Allow access without authentication
    return NextResponse.next();
  }

  // Production: Check Logto session
  const logtoSession = request.cookies.get('logto_session');
  if (!logtoSession) {
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
```

### Usage

```typescript
import { getCurrentUser, isDemoMode } from '@/lib/auth-utils';

// In server components
const user = await getCurrentUser();
const demoMode = isDemoMode();

// user object:
{
  id: string;
  email: string;
  name?: string;
  role?: string;
}
```

### Configuration

```env
# Demo Mode (default)
LOGTO_APP_ID=researchhive-app
LOGTO_APP_SECRET=your-app-secret-here
LOGTO_ENDPOINT=http://localhost:3001

# Production Mode
LOGTO_APP_ID=your-production-app-id
LOGTO_APP_SECRET=your-production-secret
LOGTO_ENDPOINT=https://your-tenant.logto.app
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### File Locations

- **Middleware**: `apps/web/src/middleware.ts`
- **Auth Utils**: `apps/web/src/lib/auth-utils.ts`
- **Header Component**: `apps/web/src/components/dashboard/header.tsx`
- **Dashboard Layout**: `apps/web/src/app/dashboard/layout.tsx`

---

## 🛡️ Error Boundaries

### Overview

Comprehensive error handling with React error boundaries at multiple levels for graceful failure and better UX.

### Features

#### 1. Global Error Boundary
- **Catches all unhandled errors** in the application
- **Inline styles** (no external dependencies)
- **Minimal UI** for maximum reliability
- Located at: `apps/web/src/app/global-error.tsx`

#### 2. Application Error Boundary
- **Styled error page** using UI components
- **Development mode** shows error details
- **Try again** and **Go home** actions
- Located at: `apps/web/src/app/error.tsx`

#### 3. Dashboard Error Boundary
- **Dashboard-specific** error handling
- **Contextual error messages** for research features
- **Stack trace** display in development
- Located at: `apps/web/src/app/dashboard/error.tsx`

#### 4. Reusable Error Boundary Component
- **Class component** for wrapping any component tree
- **Custom fallback UI** support
- **Error callback** for logging
- **HOC wrapper** for functional components
- Located at: `apps/web/src/components/error-boundary.tsx`

### Implementation

```tsx
import { ErrorBoundary, withErrorBoundary } from '@/components/error-boundary';

// Option 1: Wrap components
<ErrorBoundary fallback={<CustomError />} onError={logError}>
  <YourComponent />
</ErrorBoundary>

// Option 2: HOC wrapper
const SafeComponent = withErrorBoundary(YourComponent, <CustomFallback />);
```

### Error UI Features

- ✅ Clear error messaging
- ✅ Retry functionality
- ✅ Navigation options
- ✅ Development-only error details
- ✅ Icon visual indicators
- ✅ Responsive design

### File Locations

- **Global**: `apps/web/src/app/global-error.tsx`
- **App Level**: `apps/web/src/app/error.tsx`
- **Dashboard**: `apps/web/src/app/dashboard/error.tsx`
- **Component**: `apps/web/src/components/error-boundary.tsx`

---

## 📚 Citation Export

### Overview

Professional citation formatting and export in multiple academic styles (APA, MLA, Chicago, Harvard, BibTeX, JSON).

### Features

#### 1. Multiple Citation Styles
- **APA** (7th edition)
- **MLA** (9th edition)
- **Chicago** (17th edition)
- **Harvard**
- **BibTeX** (for LaTeX)
- **JSON** (for programmatic use)

#### 2. Citation Service
Comprehensive citation formatting with:
- Author name formatting (Last, F. vs Last, First)
- Date formatting (various styles)
- Title formatting (quotes, italics)
- URL inclusion
- Accessed date tracking
- Credibility scores

#### 3. Export Formats
- **Plain text** (.txt) - APA, MLA, Chicago, Harvard
- **BibTeX** (.bib) - for LaTeX documents
- **JSON** (.json) - for data processing

### Implementation

```typescript
import { getCitationService } from '@researchhive/ai';

const service = getCitationService();

// Format single citation
const formatted = service.formatCitation(citation, 'apa');

// Format multiple citations
const allCitations = service.formatCitations(citations, 'mla');

// Export to file
const exported = service.exportCitations(citations, 'bibtex');
// Returns: { content, filename, mimeType }
```

### API Endpoints

```typescript
// Get citations for a research
trpc.research.getCitations.useQuery({ researchId: 'xxx' });

// Export citations
trpc.research.exportCitations.useQuery({
  researchId: 'xxx',
  style: 'apa' // or 'mla', 'chicago', 'harvard', 'bibtex', 'json'
});
```

### Example Output

**APA:**
```
Smith, J., & Doe, A. (2024). Understanding Quantum Computing. Tech Journal. https://example.com
```

**MLA:**
```
Smith, John, and Alice Doe. "Understanding Quantum Computing." Tech Journal, 15 Mar. 2024, https://example.com. Accessed 28 Nov. 2025.
```

**BibTeX:**
```bibtex
@article{smith2024understanding,
  author = {John Smith and Alice Doe},
  title = {Understanding Quantum Computing},
  journal = {Tech Journal},
  year = {2024},
  url = {https://example.com}
}
```

### File Locations

- **Service**: `packages/ai/services/citation-service.ts`
- **API Routes**: `apps/api/src/router/index.ts`
- **Types**: Exported from `packages/ai/index.ts`

---

## 🚀 API Enhancements

### New Endpoints

#### 1. Citation Endpoints

```typescript
// Export citations in specific format
research.exportCitations({
  researchId: string,
  style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex' | 'json'
})
// Returns: { content, filename, mimeType, citationCount }

// Get citations for research
research.getCitations({
  researchId: string
})
// Returns: Citation[]
```

#### 2. Enhanced Search

Vector-based semantic search now available:

```typescript
research.search({
  query: string,
  limit?: number
})
// Now uses AgentDB for semantic similarity
```

### API Improvements

- ✅ Better error messages
- ✅ Consistent response formats
- ✅ Proper typing with tRPC
- ✅ Updated API name from "VibecastAI" to "ResearchHive"

---

## ⚙️ Configuration Updates

### Environment Variables

#### New Variables

```env
# Anthropic AI (now properly documented)
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# HuggingFace (for embeddings)
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

#### Updated Variables

All references to "Vibecast" have been replaced with "ResearchHive":

```env
# Database
DATABASE_URL=postgresql://researchhive:researchhive123@localhost:5432/researchhive

# Redis
REDIS_URL=redis://:researchhive123@localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://researchhive:researchhive123@localhost:5672

# Neo4j
NEO4J_PASSWORD=researchhive123

# Logto
LOGTO_APP_ID=researchhive-app
```

### File Updates

- **`.env.example`**: Complete rebranding from Vibecast to ResearchHive
- **Header comment**: "ResearchHive Environment Configuration"
- **All credentials**: Updated with "researchhive" prefix

---

## 🧪 Testing

### Recommended Tests

```bash
# Test AgentDB integration
pnpm test:ai

# Test authentication flow
pnpm test:auth

# Test citation export
pnpm test:citations

# Test error boundaries
pnpm test:error-handling
```

### Manual Testing

1. **AgentDB**: Create research, verify vector storage
2. **Auth**: Test both demo and production modes
3. **Errors**: Trigger errors, verify boundaries work
4. **Citations**: Export in all formats

---

## 📖 Usage Examples

### Complete Research Flow

```typescript
// 1. Create research
const research = await trpc.research.create.mutate({
  topic: 'Machine Learning in Healthcare',
  depth: 'standard'
});

// 2. Monitor progress
const progress = await trpc.research.getProgress.useQuery({
  id: research.id
});

// 3. Get results
const results = await trpc.research.getResults.useQuery({
  id: research.id
});

// 4. Export citations
const citations = await trpc.research.exportCitations.useQuery({
  researchId: research.id,
  style: 'apa'
});

// 5. Download citations
const blob = new Blob([citations.content], { type: citations.mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = citations.filename;
a.click();
```

### Search Previous Research

```typescript
// Search using semantic similarity
const results = await trpc.research.search.useQuery({
  query: 'artificial intelligence applications',
  limit: 5
});

// Results are ranked by similarity
results.forEach(result => {
  console.log(`${result.text} (similarity: ${result.metadata.similarity})`);
});
```

---

## 🔄 Migration Guide

### From Previous Version

1. **Environment Setup**:
   ```bash
   # Update .env file
   cp .env.example .env
   # Add ANTHROPIC_API_KEY and HUGGINGFACE_API_KEY
   ```

2. **Database**:
   ```bash
   # No migration needed - schema unchanged
   pnpm db:generate
   ```

3. **Dependencies**:
   ```bash
   # AgentDB already in package.json
   pnpm install
   ```

4. **API Changes**:
   - Health endpoint message updated
   - New citation endpoints available
   - Enhanced search with semantic capabilities

---

## 🐛 Troubleshooting

### AgentDB Not Working

**Issue**: Vector search returns empty results

**Solutions**:
- Check if `AGENTDB_ENABLED=true` in .env
- Verify research has been created after AgentDB integration
- Check console for AgentDB initialization messages
- Try running research again to populate the database

### Authentication Issues

**Issue**: Redirected to sign-in on every request

**Solutions**:
- Verify `LOGTO_APP_ID=researchhive-app` for demo mode
- Check middleware configuration
- Clear browser cookies
- Verify .env file is loaded properly

### Citation Export Fails

**Issue**: Export returns empty or malformed citations

**Solutions**:
- Ensure research has citations in database
- Check research ID is correct
- Verify citation style is valid
- Check console for error messages

### Error Boundaries Not Showing

**Issue**: White screen instead of error UI

**Solutions**:
- Check if error.tsx files exist in correct locations
- Verify Next.js version is 13+ (App Router)
- Look for console errors
- Try clearing .next cache: `rm -rf .next`

---

## 📚 Additional Resources

- **Main Documentation**: `/docs/README.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Real AI Setup**: `/docs/REAL_AI_SETUP.md`
- **Authentication**: `/docs/AUTH_SETUP.md`
- **API Reference**: Generated from tRPC types

---

## 🎉 What's Next?

Planned features for v1.2.0:

- [ ] Real-time collaboration with WebSocket
- [ ] MCP Protocol server and client
- [ ] Knowledge graph visualization
- [ ] HuggingFace NER and summarization
- [ ] Enhanced analytics dashboard
- [ ] Testing suite with Vitest

---

**For questions or issues, please open a GitHub issue or contact the development team.**
