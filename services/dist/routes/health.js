"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
const loader_1 = require("../catalog/loader");
const probe_1 = require("../health/probe");
async function healthRoutes(fastify) {
    fastify.get('/api/projects/:projectId/health', async (request) => {
        const { projectId } = request.params;
        const graph = (0, loader_1.loadGraph)(projectId);
        const healthStatus = {};
        for (const node of graph.nodes) {
            if (node.baseUrl) {
                try {
                    const url = new URL(node.baseUrl);
                    const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
                    healthStatus[node.id] = await (0, probe_1.probeHostPort)(url.hostname, port, 1000);
                }
                catch (e) {
                    healthStatus[node.id] = false;
                }
            }
            else {
                healthStatus[node.id] = true;
            }
        }
        return healthStatus;
    });
}
