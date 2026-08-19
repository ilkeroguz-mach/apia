export function buildCurlCommand(method: string, url: string, headers?: Record<string, string>, body?: any): string {
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
