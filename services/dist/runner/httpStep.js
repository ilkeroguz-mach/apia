"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeHttpStep = executeHttpStep;
const undici_1 = require("undici");
const curl_1 = require("./curl");
const assertions_1 = require("./assertions");
const resolver_1 = require("./resolver");
async function executeHttpStep(method, url, headers = {}, body = undefined, expectations, exportRules) {
    const startTime = Date.now();
    const reqHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };
    const curl = (0, curl_1.buildCurlCommand)(method, url, reqHeaders, body);
    try {
        const bodyStr = body !== undefined && body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
        const res = await (0, undici_1.request)(url, {
            method: method.toUpperCase(),
            headers: reqHeaders,
            body: bodyStr,
            headersTimeout: 10000,
            bodyTimeout: 10000
        });
        const durationMs = Date.now() - startTime;
        const responseHeaders = {};
        for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === 'string')
                responseHeaders[k] = v;
            else if (Array.isArray(v))
                responseHeaders[k] = v.join(', ');
        }
        const text = await res.body.text();
        let jsonBody = text;
        try {
            jsonBody = JSON.parse(text);
        }
        catch (e) {
            // raw text fallback
        }
        const assertions = (0, assertions_1.evaluateAssertions)(expectations, res.statusCode, jsonBody);
        const ok = res.statusCode >= 200 && res.statusCode < 400 && assertions.every(a => a.passed);
        const exportedValues = {};
        if (exportRules) {
            for (const [varName, jsonPathExpr] of Object.entries(exportRules)) {
                const extracted = (0, resolver_1.extractJsonPath)(jsonBody, jsonPathExpr);
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
    }
    catch (err) {
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
