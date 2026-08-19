"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRun = saveRun;
exports.getRun = getRun;
exports.listRuns = listRuns;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(__dirname, '../../../');
const RUNS_DIR = path_1.default.join(ROOT_DIR, 'runs');
if (!fs_1.default.existsSync(RUNS_DIR)) {
    fs_1.default.mkdirSync(RUNS_DIR, { recursive: true });
}
function saveRun(runSummary) {
    const filePath = path_1.default.join(RUNS_DIR, `${runSummary.runId}.json`);
    fs_1.default.writeFileSync(filePath, JSON.stringify(runSummary, null, 2));
}
function getRun(runId) {
    const filePath = path_1.default.join(RUNS_DIR, `${runId}.json`);
    if (!fs_1.default.existsSync(filePath))
        return null;
    return JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
}
function listRuns(projectId) {
    if (!fs_1.default.existsSync(RUNS_DIR))
        return [];
    const files = fs_1.default.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'));
    const runs = [];
    for (const f of files) {
        try {
            const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(RUNS_DIR, f), 'utf-8'));
            if (!projectId || data.projectId === projectId) {
                runs.push(data);
            }
        }
        catch (e) {
            // ignore
        }
    }
    return runs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
