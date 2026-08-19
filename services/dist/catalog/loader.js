"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGraph = loadGraph;
exports.loadVars = loadVars;
exports.loadFlows = loadFlows;
exports.loadFlow = loadFlow;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const config_1 = require("../config");
const schema_1 = require("./schema");
function loadGraph(projectId) {
    const dir = (0, config_1.getProjectDir)(projectId);
    const graphFile = path_1.default.join(dir, 'graph.yaml');
    if (!fs_1.default.existsSync(graphFile)) {
        throw new Error(`Graph file not found for project: ${projectId} at ${graphFile}`);
    }
    const raw = fs_1.default.readFileSync(graphFile, 'utf-8');
    const parsed = yaml_1.default.parse(raw);
    return schema_1.GraphSchema.parse(parsed);
}
function loadVars(projectId) {
    const dir = (0, config_1.getProjectDir)(projectId);
    const varsFile = path_1.default.join(dir, 'vars.yaml');
    if (!fs_1.default.existsSync(varsFile))
        return {};
    const raw = fs_1.default.readFileSync(varsFile, 'utf-8');
    return yaml_1.default.parse(raw) || {};
}
function loadFlows(projectId) {
    const dir = (0, config_1.getProjectDir)(projectId);
    const flowsDir = path_1.default.join(dir, 'flows');
    if (!fs_1.default.existsSync(flowsDir))
        return [];
    const files = fs_1.default.readdirSync(flowsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    const flows = [];
    for (const f of files) {
        const raw = fs_1.default.readFileSync(path_1.default.join(flowsDir, f), 'utf-8');
        const parsed = yaml_1.default.parse(raw);
        flows.push(schema_1.FlowSchema.parse(parsed));
    }
    return flows;
}
function loadFlow(projectId, flowId) {
    const flows = loadFlows(projectId);
    return flows.find(f => f.id === flowId) || null;
}
