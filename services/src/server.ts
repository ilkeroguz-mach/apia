import Fastify from 'fastify';
import cors from '@fastify/cors';
import { projectRoutes } from './routes/projects';
import { graphRoutes } from './routes/graph';
import { healthRoutes } from './routes/health';
import { flowRoutes } from './routes/flows';
import { runRoutes } from './routes/runs';

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  await fastify.register(projectRoutes);
  await fastify.register(graphRoutes);
  await fastify.register(healthRoutes);
  await fastify.register(flowRoutes);
  await fastify.register(runRoutes);

  try {
    const port = 7700;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Apia Services Backend listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
