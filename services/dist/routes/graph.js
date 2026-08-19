"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphRoutes = graphRoutes;
const loader_1 = require("../catalog/loader");
async function graphRoutes(fastify) {
    fastify.get('/api/projects/:projectId/graph', async (request, reply) => {
        const { projectId } = request.params;
        try {
            const graph = (0, loader_1.loadGraph)(projectId);
            const vars = (0, loader_1.loadVars)(projectId);
            return { ...graph, vars };
        }
        catch (err) {
            reply.status(404);
            return { error: err.message };
        }
    });
}
