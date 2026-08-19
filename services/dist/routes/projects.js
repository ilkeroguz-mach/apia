"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = projectRoutes;
const config_1 = require("../config");
async function projectRoutes(fastify) {
    fastify.get('/api/projects', async () => {
        const cfg = (0, config_1.loadConfig)();
        return cfg.projects;
    });
}
