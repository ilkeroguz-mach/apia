import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../../');
const RUNS_DIR = path.join(ROOT_DIR, 'runs');

if (!fs.existsSync(RUNS_DIR)) {
  fs.mkdirSync(RUNS_DIR, { recursive: true });
}

export function saveRun(runSummary: any) {
  const filePath = path.join(RUNS_DIR, `${runSummary.runId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(runSummary, null, 2));
}

export function getRun(runId: string): any | null {
  const filePath = path.join(RUNS_DIR, `${runId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function listRuns(projectId?: string): any[] {
  if (!fs.existsSync(RUNS_DIR)) return [];
  const files = fs.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'));
  const runs: any[] = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), 'utf-8'));
      if (!projectId || data.projectId === projectId) {
        runs.push(data);
      }
    } catch (e) {
      // ignore
    }
  }
  return runs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
