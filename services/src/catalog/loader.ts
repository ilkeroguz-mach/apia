import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { getProjectDir, loadConfig } from '../config';
import { GraphSchema, FlowSchema, Graph, Flow } from './schema';

export function loadGraph(projectId: string): Graph {
  const dir = getProjectDir(projectId);
  const graphFile = path.join(dir, 'graph.yaml');
  if (!fs.existsSync(graphFile)) {
    throw new Error(`Graph file not found for project: ${projectId} at ${graphFile}`);
  }
  const raw = fs.readFileSync(graphFile, 'utf-8');
  const parsed = YAML.parse(raw);
  return GraphSchema.parse(parsed);
}

export function loadVars(projectId: string): Record<string, any> {
  const dir = getProjectDir(projectId);
  const varsFile = path.join(dir, 'vars.yaml');
  if (!fs.existsSync(varsFile)) return {};
  const raw = fs.readFileSync(varsFile, 'utf-8');
  return YAML.parse(raw) || {};
}

export function loadFlows(projectId: string): Flow[] {
  const dir = getProjectDir(projectId);
  const flowsDir = path.join(dir, 'flows');
  if (!fs.existsSync(flowsDir)) return [];

  const files = fs.readdirSync(flowsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  const flows: Flow[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(flowsDir, f), 'utf-8');
    const parsed = YAML.parse(raw);
    flows.push(FlowSchema.parse(parsed));
  }
  return flows;
}

export function loadFlow(projectId: string, flowId: string): Flow | null {
  const flows = loadFlows(projectId);
  return flows.find(f => f.id === flowId) || null;
}
