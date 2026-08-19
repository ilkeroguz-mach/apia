import { FastifyInstance } from 'fastify';
import { loadFlows, loadFlow } from '../catalog/loader';

export async function flowRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>('/api/projects/:projectId/flows', async (request) => {
    const { projectId } = request.params;
    return loadFlows(projectId);
  });

  fastify.get<{ Params: { projectId: string; flowId: string } }>('/api/projects/:projectId/flows/:flowId', async (request, reply) => {
    const { projectId, flowId } = request.params;
    const flow = loadFlow(projectId, flowId);
    if (!flow) {
      reply.status(404);
      return { error: 'Flow not found' };
    }
    return flow;
  });
}
