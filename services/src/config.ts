import path from 'path';
import fs from 'fs';

export interface ProjectConfig {
  id: string;
  label: string;
  dir: string;
  base: string;
}

export interface ApiaConfig {
  root: string;
  projects: ProjectConfig[];
}

const ROOT_DIR = path.resolve(__dirname, '../../');
const CONFIG_PATH = path.join(ROOT_DIR, 'apia.config.json');

export function loadConfig(): ApiaConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      root: '.',
      projects: [
        { id: 'gencallar', label: 'Gençallar', dir: 'gencallar', base: 'https://ecom-api.gencallar.com.tr' },
        { id: 'tepehome', label: 'Tepe Home', dir: 'tepehome', base: 'https://ecom-api.tepehome.com.tr' },
        { id: 'k-rides', label: 'K-Rides', dir: 'k-rides', base: 'https://ecom-api.k-rides.com.tr' },
        { id: 'mymagazacilik', label: 'MyMagazacilik', dir: 'mymagazacilik', base: 'https://ecom-api-mymagazacilik.machinarium.dev' }
      ]
    };
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function getFlowsDir(): string {
  return path.join(ROOT_DIR, 'flows');
}

export function getProjectDir(projectId: string): string {
  const cfg = loadConfig();
  const proj = cfg.projects.find(p => p.id === projectId);
  const dirName = proj ? proj.dir : projectId;
  return path.join(getFlowsDir(), dirName);
}
