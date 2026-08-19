"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowRoutes = flowRoutes;
const loader_1 = require("../catalog/loader");
async function flowRoutes(fastify) {
    fastify.get('/api/projects/:projectId/flows', async (request) => {
        const { projectId } = request.params;
        return (0, loader_1.loadFlows)(projectId);
    });
    fastify.get('/api/projects/:projectId/flows/:flowId', async (request, reply) => {
        const { projectId, flowId } = request.params;
        const flow = (0, loader_1.loadFlow)(projectId, flowId);
        if (!flow) {
            reply.status(404);
            return { error: 'Flow not found' };
        }
        return flow;
    });
}
