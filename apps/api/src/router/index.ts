import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

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

  // Placeholder for future research endpoint
  research: t.router({
    create: t.procedure
      .input(z.object({
        topic: z.string().min(1),
        depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
      }))
      .mutation(async ({ input }) => {
        // TODO: Implement research orchestration with claude-flow
        return {
          id: Math.random().toString(36).substr(2, 9),
          topic: input.topic,
          depth: input.depth,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
