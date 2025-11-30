# 📘 ResearchHive API Reference

**Complete API documentation for ResearchHive**

Version: 1.0.0 (Beta)
Base URL: `https://api.your-domain.com`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Research Endpoints](#research-endpoints)
4. [Knowledge Graph Endpoints](#knowledge-graph-endpoints)
5. [User Endpoints](#user-endpoints)
6. [Health & Status](#health--status)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [Examples](#examples)
10. [SDKs & Client Libraries](#sdks--client-libraries)

---

## Overview

ResearchHive uses [tRPC](https://trpc.io/) for end-to-end type-safe API communication. All endpoints return JSON responses and support both REST-like HTTP calls and WebSocket connections.

### API Architecture

- **Protocol:** HTTP/HTTPS, WebSocket (for real-time updates)
- **Format:** JSON
- **Authentication:** JWT Bearer tokens (Logto)
- **Type Safety:** Full TypeScript types via tRPC

### Base URLs

```
Production:  https://api.your-domain.com
Development: http://localhost:4000
tRPC Path:   /trpc
WebSocket:   wss://api.your-domain.com (production) | ws://localhost:4000 (dev)
```

---

## Authentication

### Overview

ResearchHive uses JWT-based authentication via [Logto](https://logto.io). Protected endpoints require a valid JWT token in the `Authorization` header.

### Authentication Flow

1. **Redirect to Logto** - User clicks "Sign In"
2. **User Authenticates** - Completes Logto flow
3. **Receive JWT Token** - Redirected back with access token
4. **Include in Requests** - Add token to `Authorization` header

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Demo Mode

If Logto is not configured, the API runs in **demo mode** with a default user:

```json
{
  "id": "demo-user",
  "email": "demo@researchhive.com",
  "name": "Demo User",
  "role": "user"
}
```

### JWT Claims

The JWT token contains:

```typescript
{
  sub: string;        // User ID
  email: string;      // User email
  name?: string;      // User display name
  role?: string;      // User role (user, admin)
  iss: string;        // Issuer (Logto endpoint)
  aud: string;        // Audience (app ID)
  exp: number;        // Expiration timestamp
  iat: number;        // Issued at timestamp
}
```

---

## Research Endpoints

### Create Research

Create a new research task with AI agents.

**Endpoint:** `research.create`

**Method:** `POST /trpc/research.create`

**Authentication:** Required ✅

**Request Body:**

```typescript
{
  "json": {
    "topic": string;              // Research topic (required)
    "depth": "quick" | "standard" | "deep"; // Research depth (required)
    "description"?: string;       // Optional description
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "id": string;             // Unique research ID
        "topic": string;
        "depth": string;
        "status": "pending" | "gathering" | "analyzing" | "completed" | "failed";
        "createdAt": string;      // ISO 8601 timestamp
        "userId": string;
      }
    }
  }
}
```

**Example:**

```bash
curl -X POST https://api.your-domain.com/trpc/research.create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "topic": "Quantum Computing Applications in Healthcare",
      "depth": "standard",
      "description": "Focus on practical medical applications"
    }
  }'
```

**Response:**

```json
{
  "result": {
    "data": {
      "json": {
        "id": "cm3x4y5z6a7b8c9d0e1f2g3h",
        "topic": "Quantum Computing Applications in Healthcare",
        "depth": "standard",
        "status": "pending",
        "createdAt": "2024-11-30T12:00:00.000Z",
        "userId": "user_123"
      }
    }
  }
}
```

---

### Get Research by ID

Retrieve a specific research by ID.

**Endpoint:** `research.getById`

**Method:** `GET /trpc/research.getById?input={"json":{"id":"RESEARCH_ID"}}`

**Authentication:** Required ✅

**Query Parameters:**

```typescript
{
  "json": {
    "id": string;  // Research ID (required)
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "id": string;
        "topic": string;
        "depth": "quick" | "standard" | "deep";
        "description"?: string;
        "status": "pending" | "gathering" | "analyzing" | "completed" | "failed";
        "progress": number;        // 0-100
        "summary"?: string;        // Available when completed
        "keyFindings"?: string[];
        "createdAt": string;
        "updatedAt": string;
        "completedAt"?: string;
        "userId": string;
      }
    }
  }
}
```

**Example:**

```bash
curl "https://api.your-domain.com/trpc/research.getById?input=%7B%22json%22%3A%7B%22id%22%3A%22cm3x4y5z6a7b8c9d0e1f2g3h%22%7D%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get All Research

Retrieve all research for the authenticated user.

**Endpoint:** `research.getAll`

**Method:** `GET /trpc/research.getAll`

**Authentication:** Required ✅

**Query Parameters:** None (uses authenticated user)

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": Array<{
        "id": string;
        "topic": string;
        "depth": string;
        "status": string;
        "progress": number;
        "createdAt": string;
        "completedAt"?: string;
      }>
    }
  }
}
```

**Example:**

```bash
curl "https://api.your-domain.com/trpc/research.getAll" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "result": {
    "data": {
      "json": [
        {
          "id": "cm3x4y5z6a7b8c9d0e1f2g3h",
          "topic": "Quantum Computing Applications",
          "depth": "standard",
          "status": "completed",
          "progress": 100,
          "createdAt": "2024-11-30T12:00:00.000Z",
          "completedAt": "2024-11-30T12:05:23.000Z"
        },
        {
          "id": "cm3a1b2c3d4e5f6g7h8i9j0k",
          "topic": "Machine Learning in Finance",
          "depth": "deep",
          "status": "analyzing",
          "progress": 75,
          "createdAt": "2024-11-30T13:30:00.000Z"
        }
      ]
    }
  }
}
```

---

### Get Research Progress

Get real-time progress updates for ongoing research.

**Endpoint:** `research.getProgress`

**Method:** `GET /trpc/research.getProgress?input={"json":{"id":"RESEARCH_ID"}}`

**Authentication:** Required ✅

**Query Parameters:**

```typescript
{
  "json": {
    "id": string;  // Research ID
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "id": string;
        "status": "pending" | "gathering" | "analyzing" | "completed" | "failed";
        "progress": number;        // 0-100
        "currentStep"?: string;    // e.g., "Gathering sources from 8 agents"
        "agentsDeployed"?: number;
        "sourcesFound"?: number;
        "estimatedTimeRemaining"?: number; // seconds
      }
    }
  }
}
```

**Example:**

```bash
curl "https://api.your-domain.com/trpc/research.getProgress?input=%7B%22json%22%3A%7B%22id%22%3A%22cm3x4y5z6a7b8c9d0e1f2g3h%22%7D%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "result": {
    "data": {
      "json": {
        "id": "cm3x4y5z6a7b8c9d0e1f2g3h",
        "status": "gathering",
        "progress": 45,
        "currentStep": "Gathering sources from 8 agents",
        "agentsDeployed": 8,
        "sourcesFound": 12,
        "estimatedTimeRemaining": 15
      }
    }
  }
}
```

**WebSocket Updates:**

For real-time progress, connect via WebSocket:

```typescript
import { createWSClient, wsLink } from '@trpc/client';

const wsClient = createWSClient({
  url: 'wss://api.your-domain.com',
});

const client = createTRPCProxyClient({
  links: [wsLink({ client: wsClient })],
});

// Subscribe to progress updates
client.research.onProgress.subscribe(
  { id: 'RESEARCH_ID' },
  {
    onData: (progress) => {
      console.log('Progress:', progress);
    },
  }
);
```

---

### Get Research Results

Get complete results for a finished research.

**Endpoint:** `research.getResults`

**Method:** `GET /trpc/research.getResults?input={"json":{"id":"RESEARCH_ID"}}`

**Authentication:** Required ✅

**Query Parameters:**

```typescript
{
  "json": {
    "id": string;  // Research ID
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "id": string;
        "summary": string;
        "keyFindings": string[];
        "sources": Array<{
          "id": string;
          "title": string;
          "url": string;
          "description": string;
          "relevance": number;      // 0.0 - 1.0
          "credibility": number;    // 0 - 100
          "source": string;         // e.g., "arXiv", "Google", "Reddit"
          "publishedAt"?: string;
          "authors"?: string[];
        }>;
        "insights": string[];
        "recommendations": string[];
        "citations": Array<{
          "id": string;
          "text": string;
          "sourceId": string;
        }>;
        "metadata": {
          "agentsUsed": number;
          "sourcesGathered": number;
          "sourcesFiltered": number;
          "averageCredibility": number;
          "duration": number;       // seconds
        };
      }
    }
  }
}
```

**Example:**

```bash
curl "https://api.your-domain.com/trpc/research.getResults?input=%7B%22json%22%3A%7B%22id%22%3A%22cm3x4y5z6a7b8c9d0e1f2g3h%22%7D%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (truncated):**

```json
{
  "result": {
    "data": {
      "json": {
        "id": "cm3x4y5z6a7b8c9d0e1f2g3h",
        "summary": "Quantum computing shows promising applications in healthcare, particularly in drug discovery, medical imaging, and genomics...",
        "keyFindings": [
          "Quantum algorithms can accelerate drug discovery by 100x",
          "Medical image processing benefits from quantum ML",
          "Genomic sequencing speed improvements demonstrated"
        ],
        "sources": [
          {
            "id": "src_1",
            "title": "Quantum Computing in Drug Discovery",
            "url": "https://arxiv.org/abs/2024.12345",
            "description": "Analysis of quantum algorithms for molecular simulation",
            "relevance": 0.95,
            "credibility": 98,
            "source": "arXiv",
            "publishedAt": "2024-09-15T00:00:00.000Z",
            "authors": ["Dr. Jane Smith", "Dr. John Doe"]
          }
        ],
        "insights": [
          "Current quantum computers (50-100 qubits) already show advantages",
          "Major pharmaceutical companies investing heavily",
          "Expected mainstream adoption by 2027-2030"
        ],
        "recommendations": [
          "Pilot quantum drug discovery projects",
          "Partner with quantum cloud providers",
          "Train staff in quantum algorithms"
        ],
        "metadata": {
          "agentsUsed": 8,
          "sourcesGathered": 48,
          "sourcesFiltered": 20,
          "averageCredibility": 85,
          "duration": 8
        }
      }
    }
  }
}
```

---

### Delete Research

Delete a research by ID.

**Endpoint:** `research.delete`

**Method:** `POST /trpc/research.delete`

**Authentication:** Required ✅

**Request Body:**

```typescript
{
  "json": {
    "id": string;  // Research ID to delete
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "success": boolean;
        "id": string;
      }
    }
  }
}
```

**Example:**

```bash
curl -X POST https://api.your-domain.com/trpc/research.delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "id": "cm3x4y5z6a7b8c9d0e1f2g3h"
    }
  }'
```

---

## Knowledge Graph Endpoints

### Get Knowledge Graph

Retrieve knowledge graph for a completed research.

**Endpoint:** `research.getKnowledgeGraph`

**Method:** `GET /trpc/research.getKnowledgeGraph?input={"json":{"researchId":"RESEARCH_ID"}}`

**Authentication:** Required ✅

**Query Parameters:**

```typescript
{
  "json": {
    "researchId": string;  // Research ID
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "nodes": Array<{
          "id": string;
          "type": "topic" | "concept" | "source" | "author" | "organization";
          "label": string;
          "properties": Record<string, any>;
        }>;
        "edges": Array<{
          "id": string;
          "source": string;      // Node ID
          "target": string;      // Node ID
          "type": "RELATES_TO" | "CITES" | "AUTHORED_BY" | "PUBLISHED_BY" | "MENTIONS";
          "weight"?: number;
        }>;
        "stats": {
          "nodeCount": number;
          "edgeCount": number;
          "avgDegree": number;
        };
      }
    }
  }
}
```

**Example:**

```bash
curl "https://api.your-domain.com/trpc/research.getKnowledgeGraph?input=%7B%22json%22%3A%7B%22researchId%22%3A%22cm3x4y5z6a7b8c9d0e1f2g3h%22%7D%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Create Knowledge Graph

Generate knowledge graph from research citations.

**Endpoint:** `research.createKnowledgeGraph`

**Method:** `POST /trpc/research.createKnowledgeGraph`

**Authentication:** Required ✅

**Request Body:**

```typescript
{
  "json": {
    "researchId": string;  // Research ID
    "topic": string;       // Main topic
  }
}
```

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "success": boolean;
        "graphId": string;
        "nodeCount": number;
        "edgeCount": number;
      }
    }
  }
}
```

---

## User Endpoints

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `user.me`

**Method:** `GET /trpc/user.me`

**Authentication:** Required ✅

**Response:**

```typescript
{
  "result": {
    "data": {
      "json": {
        "id": string;
        "email": string;
        "name"?: string;
        "role": "user" | "admin";
        "createdAt": string;
      }
    }
  }
}
```

---

## Health & Status

### Health Check

Check API server health.

**Endpoint:** `health`

**Method:** `GET /health`

**Authentication:** Not required ❌

**Response:**

```typescript
{
  "status": "ok" | "degraded" | "down";
  "timestamp": string;         // ISO 8601
  "uptime": number;            // seconds
  "version": string;
  "services": {
    "database": "ok" | "down";
    "redis": "ok" | "down";
    "neo4j": "ok" | "down";
  };
}
```

**Example:**

```bash
curl https://api.your-domain.com/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-11-30T12:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "redis": "ok",
    "neo4j": "ok"
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```typescript
{
  "error": {
    "json": {
      "message": string;
      "code": string;
      "data"?: {
        "code": string;          // tRPC error code
        "httpStatus": number;
        "path": string;
      };
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `TIMEOUT` | 408 | Request timeout |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Example Error Response

```json
{
  "error": {
    "json": {
      "message": "Research not found",
      "code": "NOT_FOUND",
      "data": {
        "code": "NOT_FOUND",
        "httpStatus": 404,
        "path": "research.getById"
      }
    }
  }
}
```

---

## Rate Limits

### Limits per User

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `research.create` | 10 requests | 1 minute |
| `research.getAll` | 60 requests | 1 minute |
| `research.getById` | 120 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1638360000
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "json": {
      "message": "Rate limit exceeded. Try again in 45 seconds.",
      "code": "RATE_LIMIT_EXCEEDED",
      "data": {
        "retryAfter": 45
      }
    }
  }
}
```

---

## Examples

### Full Research Workflow (TypeScript)

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@researchhive/api';

// Create client
const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.your-domain.com/trpc',
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    }),
  ],
});

// 1. Create research
const research = await client.research.create.mutate({
  topic: 'AI in Healthcare',
  depth: 'standard',
  description: 'Focus on diagnostic applications',
});

console.log('Research created:', research.id);

// 2. Poll for progress
const checkProgress = async () => {
  const progress = await client.research.getProgress.query({
    id: research.id,
  });

  console.log(`Progress: ${progress.progress}% - ${progress.currentStep}`);

  if (progress.status === 'completed') {
    return true;
  } else if (progress.status === 'failed') {
    throw new Error('Research failed');
  }

  return false;
};

// Poll every 2 seconds
while (!(await checkProgress())) {
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// 3. Get results
const results = await client.research.getResults.query({
  id: research.id,
});

console.log('Summary:', results.summary);
console.log('Key Findings:', results.keyFindings);
console.log('Sources:', results.sources.length);

// 4. Get knowledge graph
const graph = await client.research.getKnowledgeGraph.query({
  researchId: research.id,
});

console.log('Graph nodes:', graph.nodes.length);
console.log('Graph edges:', graph.edges.length);
```

### cURL Examples

**Create Research:**

```bash
curl -X POST https://api.your-domain.com/trpc/research.create \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"json":{"topic":"AI in Healthcare","depth":"standard"}}'
```

**Get Progress:**

```bash
RESEARCH_ID="cm3x4y5z6a7b8c9d0e1f2g3h"
INPUT=$(echo -n "{\"json\":{\"id\":\"$RESEARCH_ID\"}}" | jq -sRr @uri)
curl "https://api.your-domain.com/trpc/research.getProgress?input=$INPUT" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Get Results:**

```bash
INPUT=$(echo -n "{\"json\":{\"id\":\"$RESEARCH_ID\"}}" | jq -sRr @uri)
curl "https://api.your-domain.com/trpc/research.getResults?input=$INPUT" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## SDKs & Client Libraries

### Official TypeScript Client

```bash
npm install @trpc/client
```

```typescript
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from '@researchhive/api';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({ url: 'https://api.your-domain.com/trpc' }),
  ],
});
```

### React Hooks (Next.js)

```bash
npm install @trpc/react-query @tanstack/react-query
```

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  const { data, isLoading } = trpc.research.getAll.useQuery();

  const createMutation = trpc.research.create.useMutation();

  return (
    <button onClick={() => createMutation.mutate({ topic: 'Test', depth: 'quick' })}>
      Create Research
    </button>
  );
}
```

---

## Support

- **Documentation:** https://github.com/mrkingsleyobi/researchhive/tree/main/docs
- **Issues:** https://github.com/mrkingsleyobi/researchhive/issues
- **Discussions:** https://github.com/mrkingsleyobi/researchhive/discussions

---

**Last Updated:** November 30, 2024
**API Version:** 1.0.0 (Beta)
