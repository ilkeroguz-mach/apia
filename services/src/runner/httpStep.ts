import { request } from 'undici';
import { buildCurlCommand } from './curl';
import { evaluateAssertions, AssertionResult } from './assertions';
import { extractJsonPath } from './resolver';

export interface HttpResponseResult {
  status: number;
  headers: Record<string, string>;
  body: any;
  durationMs: number;
  curl: string;
  assertions: AssertionResult[];
  exports: Record<string, any>;
  ok: boolean;
  error?: string;
}

export async function executeHttpStep(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body: any = undefined,
  expectations?: any[],
  exportRules?: Record<string, string>
): Promise<HttpResponseResult> {
  const startTime = Date.now();
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  const curl = buildCurlCommand(method, url, reqHeaders, body);

  try {
    const bodyStr = body !== undefined && body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
    const res = await request(url, {
      method: method.toUpperCase() as any,
      headers: reqHeaders,
      body: bodyStr,
      headersTimeout: 10000,
      bodyTimeout: 10000
    });

    const durationMs = Date.now() - startTime;
    const responseHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(res.headers)) {
      if (typeof v === 'string') responseHeaders[k] = v;
      else if (Array.isArray(v)) responseHeaders[k] = v.join(', ');
    }

    const text = await res.body.text();
    let jsonBody: any = text;
    try {
      jsonBody = JSON.parse(text);
    } catch (e) {
      // raw text fallback
    }

    const assertions = evaluateAssertions(expectations, res.statusCode, jsonBody);
    const ok = res.statusCode >= 200 && res.statusCode < 400 && assertions.every(a => a.passed);

    const exportedValues: Record<string, any> = {};
    if (exportRules) {
      for (const [varName, jsonPathExpr] of Object.entries(exportRules)) {
        const extracted = extractJsonPath(jsonBody, jsonPathExpr);
        if (extracted !== undefined) {
          exportedValues[varName] = extracted;
        }
      }
    }

    return {
      status: res.statusCode,
      headers: responseHeaders,
      body: jsonBody,
      durationMs,
      curl,
      assertions,
      exports: exportedValues,
      ok
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      status: 0,
      headers: {},
      body: { error: String(err.message || err) },
      durationMs,
      curl,
      assertions: [{ passed: false, message: `Request failed: ${err.message || err}` }],
      exports: {},
      ok: false,
      error: String(err.message || err)
    };
  }
}
