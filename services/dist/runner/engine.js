"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFlowRun = executeFlowRun;
const httpStep_1 = require("./httpStep");
const resolver_1 = require("./resolver");
const events_1 = require("./events");
const store_1 = require("../store");
async function executeFlowRun(runId, options) {
    const { projectId, flow, nodes, initialVars = {}, baseUrl = '', token } = options;
    const context = {
        vars: { ...flow.vars, ...initialVars },
        baseUrl,
        token: token || '',
        nodes: {}
    };
    for (const n of nodes) {
        context.nodes[n.id] = {
            baseUrl: n.baseUrl || baseUrl,
            id: n.id,
            path: n.path
        };
    }
    const stepsMap = new Map();
    flow.steps.forEach(s => stepsMap.set(s.id, s));
    const stepRecords = [];
    const completedSteps = new Set();
    const failedSteps = new Set();
    const isDependencySatisfied = (step) => {
        if (!step.needs || step.needs.length === 0)
            return true;
        return step.needs.every(needId => completedSteps.has(needId));
    };
    const hasDependencyFailed = (step) => {
        if (!step.needs || step.needs.length === 0)
            return false;
        return step.needs.some(needId => failedSteps.has(needId));
    };
    for (const step of flow.steps) {
        const nodeDef = nodes.find(n => n.id === step.node);
        const stepTitle = step.title || step.id;
        if (hasDependencyFailed(step)) {
            failedSteps.add(step.id);
            const skippedRecord = {
                stepId: step.id,
                nodeId: step.node,
                title: stepTitle,
                status: 'skipped',
                request: { method: step.request.method, url: step.request.url, headers: {}, body: null },
                error: 'Preceding dependency step failed',
                durationMs: 0
            };
            stepRecords.push(skippedRecord);
            events_1.runEvents.emitStep({
                runId,
                stepId: step.id,
                nodeId: step.node,
                status: 'skipped',
                error: skippedRecord.error
            });
            continue;
        }
        events_1.runEvents.emitStep({
            runId,
            stepId: step.id,
            nodeId: step.node,
            status: 'running'
        });
        const stepReq = (0, resolver_1.resolveDeep)(step.request, context);
        const reqUrl = (0, resolver_1.resolveTemplate)(stepReq.url, context);
        const reqHeaders = { ...stepReq.headers };
        if (context.token && !reqHeaders.Authorization && !reqHeaders.token) {
            reqHeaders.token = context.token;
            reqHeaders.Authorization = `Bearer ${context.token}`;
        }
        const res = await (0, httpStep_1.executeHttpStep)(stepReq.method, reqUrl, reqHeaders, stepReq.json, step.expect, step.export);
        if (res.exports) {
            Object.assign(context, res.exports);
            if (res.exports.token) {
                context.token = res.exports.token;
            }
        }
        const record = {
            stepId: step.id,
            nodeId: step.node,
            title: stepTitle,
            status: res.ok ? 'completed' : 'failed',
            request: {
                method: stepReq.method,
                url: reqUrl,
                headers: reqHeaders,
                body: stepReq.json
            },
            response: res,
            durationMs: res.durationMs
        };
        stepRecords.push(record);
        if (res.ok) {
            completedSteps.add(step.id);
            events_1.runEvents.emitStep({
                runId,
                stepId: step.id,
                nodeId: step.node,
                status: 'completed',
                result: res,
                durationMs: res.durationMs
            });
        }
        else {
            failedSteps.add(step.id);
            events_1.runEvents.emitStep({
                runId,
                stepId: step.id,
                nodeId: step.node,
                status: 'failed',
                error: res.error || `HTTP ${res.status}`,
                result: res,
                durationMs: res.durationMs
            });
        }
    }
    const summary = {
        runId,
        projectId,
        flowId: flow.id,
        timestamp: new Date().toISOString(),
        totalSteps: flow.steps.length,
        completed: completedSteps.size,
        failed: failedSteps.size,
        records: stepRecords
    };
    (0, store_1.saveRun)(summary);
    events_1.runEvents.emitDone(runId, summary);
    return stepRecords;
}
