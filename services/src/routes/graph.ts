import { FastifyInstance } from 'fastify';
import { loadGraph, loadVars } from '../catalog/loader';

export async function graphRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>('/api/projects/:projectId/graph', async (request, reply) => {
    const { projectId } = request.params;
    try {
      const graph = loadGraph(projectId);
      const vars = loadVars(projectId);
      return { ...graph, vars };
    } catch (err: any) {
      reply.status(404);
      return { error: err.message };
    }
  });
}
