import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './router';
import { createContext } from './context';

const fastify = Fastify({
  logger: true,
  maxParamLength: 5000,
});

async function main() {
  // Register plugins
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register tRPC
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    },
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  const port = parseInt(process.env.PORT || '4000');
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://${host}:${port}`);
    console.log(`📡 tRPC endpoint: http://${host}:${port}/trpc`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
