import { Flow, Step, Node } from '../catalog/schema';
import { executeHttpStep, HttpResponseResult } from './httpStep';
import { resolveDeep, resolveTemplate } from './resolver';
import { runEvents } from './events';
import { saveRun } from '../store';

export interface RunOptions {
  projectId: string;
  flow: Flow;
  nodes: Node[];
  initialVars?: Record<string, any>;
  baseUrl?: string;
  token?: string;
}

export interface StepRunRecord {
  stepId: string;
  nodeId: string;
  title: string;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  };
  response?: HttpResponseResult;
  error?: string;
  durationMs: number;
}

export async function executeFlowRun(runId: string, options: RunOptions): Promise<StepRunRecord[]> {
  const { projectId, flow, nodes, initialVars = {}, baseUrl = '', token } = options;

  const context: Record<string, any> = {
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

  const stepsMap = new Map<string, Step>();
  flow.steps.forEach(s => stepsMap.set(s.id, s));

  const stepRecords: StepRunRecord[] = [];
  const completedSteps = new Set<string>();
  const failedSteps = new Set<string>();

  const isDependencySatisfied = (step: Step): boolean => {
    if (!step.needs || step.needs.length === 0) return true;
    return step.needs.every(needId => completedSteps.has(needId));
  };

  const hasDependencyFailed = (step: Step): boolean => {
    if (!step.needs || step.needs.length === 0) return false;
    return step.needs.some(needId => failedSteps.has(needId));
  };

  for (const step of flow.steps) {
    const nodeDef = nodes.find(n => n.id === step.node);
    const stepTitle = step.title || step.id;

    if (hasDependencyFailed(step)) {
      failedSteps.add(step.id);
      const skippedRecord: StepRunRecord = {
        stepId: step.id,
        nodeId: step.node,
        title: stepTitle,
        status: 'skipped',
        request: { method: step.request.method, url: step.request.url, headers: {}, body: null },
        error: 'Preceding dependency step failed',
        durationMs: 0
      };
      stepRecords.push(skippedRecord);
      runEvents.emitStep({
        runId,
        stepId: step.id,
        nodeId: step.node,
        status: 'skipped',
        error: skippedRecord.error
      });
      continue;
    }

    runEvents.emitStep({
      runId,
      stepId: step.id,
      nodeId: step.node,
      status: 'running'
    });

    const stepReq = resolveDeep(step.request, context);
    const reqUrl = resolveTemplate(stepReq.url, context);

    const reqHeaders: Record<string, string> = { ...stepReq.headers };
    if (context.token && !reqHeaders.Authorization && !reqHeaders.token) {
      reqHeaders.token = context.token;
      reqHeaders.Authorization = `Bearer ${context.token}`;
    }

    const res = await executeHttpStep(
      stepReq.method,
      reqUrl,
      reqHeaders,
      stepReq.json,
      step.expect,
      step.export
    );

    if (res.exports) {
      Object.assign(context, res.exports);
      if (res.exports.token) {
        context.token = res.exports.token;
      }
    }

    const record: StepRunRecord = {
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
      runEvents.emitStep({
        runId,
        stepId: step.id,
        nodeId: step.node,
        status: 'completed',
        result: res,
        durationMs: res.durationMs
      });
    } else {
      failedSteps.add(step.id);
      runEvents.emitStep({
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

  saveRun(summary);
  runEvents.emitDone(runId, summary);

  return stepRecords;
}
