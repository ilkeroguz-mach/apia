import { FastifyInstance } from 'fastify';
import { loadGraph } from '../catalog/loader';
import { probeHostPort } from '../health/probe';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { projectId: string } }>('/api/projects/:projectId/health', async (request) => {
    const { projectId } = request.params;
    const graph = loadGraph(projectId);
    const healthStatus: Record<string, boolean> = {};

    for (const node of graph.nodes) {
      if (node.baseUrl) {
        try {
          const url = new URL(node.baseUrl);
          const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
          healthStatus[node.id] = await probeHostPort(url.hostname, port, 1000);
        } catch (e) {
          healthStatus[node.id] = false;
        }
      } else {
        healthStatus[node.id] = true;
      }
    }

    return healthStatus;
  });
}
