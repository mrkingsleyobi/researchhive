import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { researchOrchestrator } from '@vibecast/ai';

const t = initTRPC.context<Context>().create();

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

  // Research endpoints with AI orchestration
  research: t.router({
    create: t.procedure
      .input(z.object({
        topic: z.string().min(1),
        depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        console.log('🚀 Creating research:', input);

        // Start research with AI orchestrator
        const researchId = await researchOrchestrator.startResearch({
          topic: input.topic,
          depth: input.depth,
        });

        return {
          id: researchId,
          topic: input.topic,
          depth: input.depth,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
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
        const results = await researchOrchestrator.getResults(input.id);
        return results;
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
