import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { researchOrchestrator, getCitationService, getNeo4jService } from '@researchhive/ai';
import { db } from '@researchhive/database';
import { getUserFromContext, optionalAuth } from '../middleware/auth';

const t = initTRPC.context<Context>().create();

// Create reusable procedures
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const user = await getUserFromContext(ctx);
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Helper to get or create a user in the database
async function getOrCreateUser(email: string, name?: string) {
  let user = await db.user.findFirst({
    where: { email },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: name || 'User',
        role: 'USER',
      },
    });
  }

  return user;
}

export const appRouter = t.router({
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      message: 'ResearchHive API is running',
      timestamp: new Date().toISOString(),
    };
  }),

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name || 'World'}!`,
      };
    }),

  // Research endpoints with AI orchestration and database persistence
  research: t.router({
    create: protectedProcedure
      .input(z.object({
        topic: z.string().min(1),
        depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log('🚀 Creating research:', input);

        // Get authenticated user from context
        const authUser = (ctx as any).user;
        const user = await getOrCreateUser(authUser.email, authUser.name);

        // Create research in database
        const research = await db.research.create({
          data: {
            topic: input.topic,
            description: input.description,
            depth: input.depth.toUpperCase(),
            status: 'IN_PROGRESS',
            userId: user.id,
          },
        });

        // Start research with AI orchestrator
        researchOrchestrator.startResearch({
          topic: input.topic,
          depth: input.depth,
        }, research.id); // Pass database ID

        return {
          id: research.id,
          topic: research.topic,
          depth: input.depth,
          status: 'in_progress',
          createdAt: research.createdAt.toISOString(),
        };
      }),

    getProgress: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        const progress = await researchOrchestrator.getProgress(input.id);
        return progress;
      }),

    getResults: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        // Try to get from orchestrator first (for in-progress research)
        const cachedResults = await researchOrchestrator.getResults(input.id);
        if (cachedResults) {
          return cachedResults;
        }

        // Otherwise get from database
        const research = await db.research.findUnique({
          where: { id: input.id },
          include: { citations: true },
        });

        if (!research || !research.findings) {
          return null;
        }

        // Parse findings from database
        return JSON.parse(research.findings);
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input, ctx }) => {
        const authUser = (ctx as any).user;
        const user = await getOrCreateUser(authUser.email, authUser.name);

        const researches = await db.research.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          include: {
            citations: true,
          },
        });

        return researches.map(r => ({
          id: r.id,
          topic: r.topic,
          status: r.status.toLowerCase(),
          depth: r.depth.toLowerCase(),
          createdAt: r.createdAt.toISOString(),
          sourcesCount: r.citations.length,
        }));
      }),

    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional().default(5),
      }))
      .query(async ({ input }) => {
        const results = await researchOrchestrator.searchPreviousResearch(
          input.query,
          input.limit
        );
        return results;
      }),

    // Citation export endpoints
    exportCitations: protectedProcedure
      .input(z.object({
        researchId: z.string(),
        style: z.enum(['apa', 'mla', 'chicago', 'harvard', 'bibtex', 'json']).default('apa'),
      }))
      .query(async ({ input }) => {
        // Get research with citations
        const research = await db.research.findUnique({
          where: { id: input.researchId },
          include: { citations: true },
        });

        if (!research) {
          throw new Error('Research not found');
        }

        // Convert database citations to citation format
        const citations = research.citations.map(c => ({
          title: c.title,
          url: c.url,
          source: c.source,
          credibility: c.credibility,
          authors: [], // Can be enhanced to parse authors from metadata
          publishedDate: undefined,
          accessedDate: c.createdAt.toISOString(),
        }));

        // Export using citation service
        const citationService = getCitationService();
        const exported = citationService.exportCitations(
          citations,
          input.style,
          `${research.topic}-citations`
        );

        return {
          content: exported.content,
          filename: exported.filename,
          mimeType: exported.mimeType,
          citationCount: citations.length,
        };
      }),

    getCitations: protectedProcedure
      .input(z.object({
        researchId: z.string(),
      }))
      .query(async ({ input }) => {
        const citations = await db.citation.findMany({
          where: { researchId: input.researchId },
          orderBy: { credibility: 'desc' },
        });

        return citations.map(c => ({
          id: c.id,
          title: c.title,
          url: c.url,
          source: c.source,
          credibility: c.credibility,
          createdAt: c.createdAt.toISOString(),
        }));
      }),

    // Knowledge graph endpoints
    getKnowledgeGraph: protectedProcedure
      .input(z.object({
        researchId: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const neo4jService = getNeo4jService();

          // Query the knowledge graph for this research
          const query = `
            MATCH (t:Topic {researchId: $researchId})
            OPTIONAL MATCH (t)-[r]-(n)
            RETURN t, collect({node: n, relationship: r}) as connections
          `;

          const result = await neo4jService.executeQuery(query, { researchId: input.researchId });

          // Transform Neo4j result to graph format for frontend
          const nodes: any[] = [];
          const edges: any[] = [];
          const nodeIds = new Set<string>();

          for (const record of result) {
            const topicNode = record.get('t');
            const connections = record.get('connections');

            // Add topic node
            if (topicNode && !nodeIds.has(topicNode.identity.toString())) {
              nodes.push({
                id: topicNode.identity.toString(),
                type: topicNode.labels[0] || 'Topic',
                data: {
                  label: topicNode.properties.name || topicNode.properties.title || 'Topic',
                  ...topicNode.properties,
                },
              });
              nodeIds.add(topicNode.identity.toString());
            }

            // Add connected nodes and relationships
            for (const conn of connections) {
              if (conn.node && conn.relationship) {
                const connNode = conn.node;
                const relationship = conn.relationship;

                // Add connected node
                if (!nodeIds.has(connNode.identity.toString())) {
                  nodes.push({
                    id: connNode.identity.toString(),
                    type: connNode.labels[0] || 'Node',
                    data: {
                      label: connNode.properties.name || connNode.properties.title || 'Node',
                      ...connNode.properties,
                    },
                  });
                  nodeIds.add(connNode.identity.toString());
                }

                // Add edge
                edges.push({
                  id: relationship.identity.toString(),
                  source: relationship.start.toString(),
                  target: relationship.end.toString(),
                  type: relationship.type,
                  data: relationship.properties,
                });
              }
            }
          }

          return {
            nodes,
            edges,
            stats: {
              nodeCount: nodes.length,
              edgeCount: edges.length,
              researchId: input.researchId,
            },
          };
        } catch (error) {
          console.error('Failed to fetch knowledge graph:', error);

          // Return empty graph if Neo4j is not available
          return {
            nodes: [],
            edges: [],
            stats: {
              nodeCount: 0,
              edgeCount: 0,
              researchId: input.researchId,
              error: 'Knowledge graph not available. Ensure Neo4j is configured and running.',
            },
          };
        }
      }),

    createKnowledgeGraph: protectedProcedure
      .input(z.object({
        researchId: z.string(),
        topic: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const neo4jService = getNeo4jService();

          // Get research data
          const research = await db.research.findUnique({
            where: { id: input.researchId },
            include: { citations: true },
          });

          if (!research) {
            throw new Error('Research not found');
          }

          // Create topic node
          await neo4jService.createNode('Topic', {
            researchId: input.researchId,
            name: input.topic,
            createdAt: new Date().toISOString(),
          });

          // Create source nodes and relationships
          for (const citation of research.citations) {
            const sourceId = await neo4jService.createNode('Source', {
              title: citation.title,
              url: citation.url,
              credibility: citation.credibility,
            });

            // Create relationship between topic and source
            await neo4jService.createRelationship(
              'Topic',
              'Source',
              'CITED_IN',
              { researchId: input.researchId, name: input.topic },
              { url: citation.url }
            );
          }

          return {
            success: true,
            message: `Knowledge graph created for research: ${input.topic}`,
          };
        } catch (error) {
          console.error('Failed to create knowledge graph:', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create knowledge graph',
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
