import { FastifyInstance } from 'fastify';
import { loadGraph, loadFlow } from '../catalog/loader';
import { executeFlowRun } from '../runner/engine';
import { runEvents } from '../runner/events';
import { listRuns, getRun } from '../store';
import { loadConfig } from '../config';

export async function runRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: {
      projectId: string;
      flowId?: string;
      nodeId?: string;
      token?: string;
      customBody?: any;
    };
  }>('/api/runs', async (request, reply) => {
    const { projectId, flowId, nodeId, token, customBody } = request.body;
    const graph = loadGraph(projectId);
    const cfg = loadConfig();
    const projConfig = cfg.projects.find(p => p.id === projectId);
    const baseUrl = projConfig ? projConfig.base : 'https://ecom-api.gencallar.com.tr';

    let targetFlow = flowId ? loadFlow(projectId, flowId) : null;

    if (!targetFlow && nodeId) {
      const nodeDef = graph.nodes.find(n => n.id === nodeId);
      if (!nodeDef) {
        reply.status(404);
        return { error: `Node '${nodeId}' not found` };
      }
      targetFlow = {
        id: `single-${nodeId}`,
        title: `${nodeDef.method} ${nodeDef.path}`,
        touches: [nodeId],
        vars: {},
        steps: [
          {
            id: `step-${nodeId}`,
            node: nodeId,
            title: `${nodeDef.method} ${nodeDef.path}`,
            request: {
              method: nodeDef.method,
              url: `${baseUrl}${nodeDef.path}`,
              json: customBody !== undefined ? customBody : nodeDef.body
            },
            export: nodeDef.provides ? { [nodeDef.provides]: '$.data.token' } : undefined
          }
        ]
      };
    }

    if (!targetFlow) {
      reply.status(400);
      return { error: 'Must provide either flowId or nodeId' };
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Asynchronously execute flow
    executeFlowRun(runId, {
      projectId,
      flow: targetFlow,
      nodes: graph.nodes,
      baseUrl,
      token
    }).catch(err => {
      console.error(`Run ${runId} execution error:`, err);
    });

    return { runId };
  });

  fastify.get<{ Params: { id: string } }>('/api/runs/:id/stream', (request, reply) => {
    const { id: runId } = request.params;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const onStep = (data: any) => {
      if (data.runId === runId) {
        reply.raw.write(`event: step\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    const onDone = (data: any) => {
      if (data.runId === runId) {
        reply.raw.write(`event: done\ndata: ${JSON.stringify(data.summary)}\n\n`);
        cleanup();
        reply.raw.end();
      }
    };

    const cleanup = () => {
      runEvents.off('step', onStep);
      runEvents.off('done', onDone);
    };

    runEvents.on('step', onStep);
    runEvents.on('done', onDone);

    request.raw.on('close', cleanup);
  });

  fastify.get<{ Querystring: { project?: string } }>('/api/runs', async (request) => {
    const { project } = request.query;
    return listRuns(project);
  });

  fastify.get<{ Params: { id: string } }>('/api/runs/:id', async (request, reply) => {
    const { id } = request.params;
    const run = getRun(id);
    if (!run) {
      reply.status(404);
      return { error: 'Run not found' };
    }
    return run;
  });
}
