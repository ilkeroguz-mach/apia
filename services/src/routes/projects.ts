import { FastifyInstance } from 'fastify';
import { loadConfig } from '../config';

export async function projectRoutes(fastify: FastifyInstance) {
  fastify.get('/api/projects', async () => {
    const cfg = loadConfig();
    return cfg.projects;
  });
}
