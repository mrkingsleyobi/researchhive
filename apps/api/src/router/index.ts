import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { researchOrchestrator } from '@vibecast/ai';
import { db } from '@vibecast/database';

const t = initTRPC.context<Context>().create();

// Helper to get or create a default user (temporary until auth is implemented)
async function getDefaultUser() {
  let user = await db.user.findFirst({
    where: { email: 'demo@vibecast.ai' },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: 'demo@vibecast.ai',
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
      message: 'VibecastAI API is running',
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
  }),
});

export type AppRouter = typeof appRouter;
