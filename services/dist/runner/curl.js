"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCurlCommand = buildCurlCommand;
function buildCurlCommand(method, url, headers, body) {
    let cmd = `curl -X ${method.toUpperCase()} '${url}'`;
    if (headers) {
        for (const [k, v] of Object.entries(headers)) {
            cmd += ` -H '${k}: ${v}'`;
        }
    }
    if (body) {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        cmd += ` -d '${bodyStr.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
}
