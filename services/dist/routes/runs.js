"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRoutes = runRoutes;
const loader_1 = require("../catalog/loader");
const engine_1 = require("../runner/engine");
const events_1 = require("../runner/events");
const store_1 = require("../store");
const config_1 = require("../config");
async function runRoutes(fastify) {
    fastify.post('/api/runs', async (request, reply) => {
        const { projectId, flowId, nodeId, token, customBody } = request.body;
        const graph = (0, loader_1.loadGraph)(projectId);
        const cfg = (0, config_1.loadConfig)();
        const projConfig = cfg.projects.find(p => p.id === projectId);
        const baseUrl = projConfig ? projConfig.base : 'https://ecom-api.gencallar.com.tr';
        let targetFlow = flowId ? (0, loader_1.loadFlow)(projectId, flowId) : null;
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
        (0, engine_1.executeFlowRun)(runId, {
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
    fastify.get('/api/runs/:id/stream', (request, reply) => {
        const { id: runId } = request.params;
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        const onStep = (data) => {
            if (data.runId === runId) {
                reply.raw.write(`event: step\ndata: ${JSON.stringify(data)}\n\n`);
            }
        };
        const onDone = (data) => {
            if (data.runId === runId) {
                reply.raw.write(`event: done\ndata: ${JSON.stringify(data.summary)}\n\n`);
                cleanup();
                reply.raw.end();
            }
        };
        const cleanup = () => {
            events_1.runEvents.off('step', onStep);
            events_1.runEvents.off('done', onDone);
        };
        events_1.runEvents.on('step', onStep);
        events_1.runEvents.on('done', onDone);
        request.raw.on('close', cleanup);
    });
    fastify.get('/api/runs', async (request) => {
        const { project } = request.query;
        return (0, store_1.listRuns)(project);
    });
    fastify.get('/api/runs/:id', async (request, reply) => {
        const { id } = request.params;
        const run = (0, store_1.getRun)(id);
        if (!run) {
            reply.status(404);
            return { error: 'Run not found' };
        }
        return run;
    });
}
