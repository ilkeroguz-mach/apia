import { JSONPath } from 'jsonpath-plus';

export function resolveTemplate(template: string, ctx: Record<string, any>): string {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g, (_, key) => {
    const parts = key.split('.');
    let val: any = ctx;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return `{{${key}}}`;
      }
    }
    return val !== undefined && val !== null ? String(val) : '';
  });
}

export function resolveDeep(obj: any, ctx: Record<string, any>): any {
  if (typeof obj === 'string') {
    return resolveTemplate(obj, ctx);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => resolveDeep(item, ctx));
  }
  if (obj && typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = resolveDeep(v, ctx);
    }
    return res;
  }
  return obj;
}

export function extractJsonPath(json: any, pathExpr: string): any {
  try {
    const results = JSONPath({ path: pathExpr, json });
    if (Array.isArray(results) && results.length > 0) {
      return results[0];
    }
    return results;
  } catch (err) {
    return undefined;
  }
}
