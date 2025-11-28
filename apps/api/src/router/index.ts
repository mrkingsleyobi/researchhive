import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { researchOrchestrator, getCitationService } from '@researchhive/ai';
import { db } from '@researchhive/database';

const t = initTRPC.context<Context>().create();

// Helper to get or create a default user (temporary until auth is implemented)
async function getDefaultUser() {
  let user = await db.user.findFirst({
    where: { email: 'demo@researchhive.ai' },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: 'demo@researchhive.ai',
        name: 'Demo User',
        role: 'USER',
      },
    });
  }

  return user;
}

export const appRouter = t.router({
  health: t.procedure.query(() => {
    return {
      status: 'ok',
      message: 'ResearchHive API is running',
      timestamp: new Date().toISOString(),
    };
  }),

  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name || 'World'}!`,
      };
    }),

  // Research endpoints with AI orchestration and database persistence
  research: t.router({
    create: t.procedure
      .input(z.object({
        topic: z.string().min(1),
        depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        console.log('🚀 Creating research:', input);

        // Get default user (temporary until auth)
        const user = await getDefaultUser();

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

    getProgress: t.procedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        const progress = await researchOrchestrator.getProgress(input.id);
        return progress;
      }),

    getResults: t.procedure
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

    list: t.procedure
      .input(z.object({
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        const user = await getDefaultUser();

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

    search: t.procedure
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
    exportCitations: t.procedure
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

    getCitations: t.procedure
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
  }),
});

export type AppRouter = typeof appRouter;
