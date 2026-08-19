"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTemplate = resolveTemplate;
exports.resolveDeep = resolveDeep;
exports.extractJsonPath = extractJsonPath;
const jsonpath_plus_1 = require("jsonpath-plus");
function resolveTemplate(template, ctx) {
    if (typeof template !== 'string')
        return template;
    return template.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g, (_, key) => {
        const parts = key.split('.');
        let val = ctx;
        for (const p of parts) {
            if (val && typeof val === 'object' && p in val) {
                val = val[p];
            }
            else {
                return `{{${key}}}`;
            }
        }
        return val !== undefined && val !== null ? String(val) : '';
    });
}
function resolveDeep(obj, ctx) {
    if (typeof obj === 'string') {
        return resolveTemplate(obj, ctx);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => resolveDeep(item, ctx));
    }
    if (obj && typeof obj === 'object') {
        const res = {};
        for (const [k, v] of Object.entries(obj)) {
            res[k] = resolveDeep(v, ctx);
        }
        return res;
    }
    return obj;
}
function extractJsonPath(json, pathExpr) {
    try {
        const results = (0, jsonpath_plus_1.JSONPath)({ path: pathExpr, json });
        if (Array.isArray(results) && results.length > 0) {
            return results[0];
        }
        return results;
    }
    catch (err) {
        return undefined;
    }
}
