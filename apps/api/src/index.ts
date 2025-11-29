import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './router';
import { createContext } from './context';
import { initializeWebSocket } from './websocket';
import { initializeResearchOrchestrator } from '@researchhive/ai';
import { initializeSentryNode, captureException } from '@researchhive/monitoring';
import { getMetrics, httpRequestDuration, httpRequestTotal, websocketConnections } from '@researchhive/monitoring';
import { getCache } from '@researchhive/cache';

const fastify = Fastify({
  logger: true,
  maxParamLength: 5000,
});

async function main() {
  // Initialize monitoring (Sentry)
  initializeSentryNode({
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || 'researchhive@1.0.0',
  });

  // Initialize Redis cache
  try {
    const cache = await getCache();
    console.log('✅ Redis cache initialized');
  } catch (error) {
    console.warn('⚠️  Redis cache failed to initialize:', error);
  }

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

  // Request metrics middleware
  fastify.addHook('onRequest', async (request, reply) => {
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - (request as any).startTime) / 1000;
    httpRequestDuration.observe(
      { method: request.method, route: request.routerPath || 'unknown', status_code: reply.statusCode },
      duration
    );
    httpRequestTotal.inc({
      method: request.method,
      route: request.routerPath || 'unknown',
      status_code: reply.statusCode,
    });
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

  // Prometheus metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    try {
      const metrics = await getMetrics();
      reply.header('Content-Type', 'text/plain; version=0.0.4');
      return metrics;
    } catch (error) {
      captureException(error as Error, { endpoint: '/metrics' });
      reply.status(500).send({ error: 'Failed to generate metrics' });
    }
  });

  // Start server
  const port = parseInt(process.env.PORT || '4000');
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://${host}:${port}`);
    console.log(`📡 tRPC endpoint: http://${host}:${port}/trpc`);

    // Initialize WebSocket service
    const wsService = initializeWebSocket(fastify);
    console.log(`🔌 WebSocket ready at ws://${host}:${port}/socket.io`);

    // Initialize ResearchOrchestrator with WebSocket progress updates
    initializeResearchOrchestrator((researchId, progress) => {
      wsService.emitProgressUpdate({
        researchId,
        ...progress,
        timestamp: new Date().toISOString(),
      });
    });
    console.log('🔬 Research Orchestrator connected to WebSocket');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
