"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getFlowsDir = getFlowsDir;
exports.getProjectDir = getProjectDir;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ROOT_DIR = path_1.default.resolve(__dirname, '../../');
const CONFIG_PATH = path_1.default.join(ROOT_DIR, 'apia.config.json');
function loadConfig() {
    if (!fs_1.default.existsSync(CONFIG_PATH)) {
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
    const raw = fs_1.default.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
}
function getFlowsDir() {
    return path_1.default.join(ROOT_DIR, 'flows');
}
function getProjectDir(projectId) {
    const cfg = loadConfig();
    const proj = cfg.projects.find(p => p.id === projectId);
    const dirName = proj ? proj.dir : projectId;
    return path_1.default.join(getFlowsDir(), dirName);
}
