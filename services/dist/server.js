"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const projects_1 = require("./routes/projects");
const graph_1 = require("./routes/graph");
const health_1 = require("./routes/health");
const flows_1 = require("./routes/flows");
const runs_1 = require("./routes/runs");
const fastify = (0, fastify_1.default)({ logger: true });
async function start() {
    await fastify.register(cors_1.default, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });
    await fastify.register(projects_1.projectRoutes);
    await fastify.register(graph_1.graphRoutes);
    await fastify.register(health_1.healthRoutes);
    await fastify.register(flows_1.flowRoutes);
    await fastify.register(runs_1.runRoutes);
    try {
        const port = 7700;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Apia Services Backend listening on http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
