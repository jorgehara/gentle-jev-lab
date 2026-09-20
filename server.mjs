import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "fixtures/demo-project");
const web = resolve(fileURLToPath(new URL(".", import.meta.url)), "web");
const port = Number(process.env.PORT ?? 8787);
const MAX_BYTES = 16_000;
const SAFE_TOOLS = new Set(["project_summary", "list_files", "read_file"]);

function safePath(input = ".") {
  const target = resolve(root, normalize(input));
  const rel = relative(root, target);
  if (rel.startsWith("..") || rel.includes(`..${"/"}`) || rel.includes(`..${"\\"}`)) throw new Error("Path escapes fixture project.");
  return target;
}

async function listFiles(dir = root, prefix = "") {
  const entries = await (await import("node:fs/promises")).readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = join(prefix, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) files.push(...await listFiles(join(dir, entry.name), rel));
    else files.push(rel);
  }
  return files.slice(0, 200);
}

async function callTool(name, args = {}) {
  if (!SAFE_TOOLS.has(name)) throw new Error("Only bounded read-only tools are available.");
  if (name === "project_summary") return { root: "fixtures/demo-project", files: await listFiles(), note: "Synthetic public fixture; no credentials or commands." };
  if (name === "list_files") return { files: await listFiles(safePath(args.path), args.path ?? "") };
  const path = safePath(args.path);
  const info = await stat(path);
  if (!info.isFile() || info.size > MAX_BYTES) throw new Error("Only regular files under 16KB can be read.");
  return { path: args.path, content: await readFile(path, "utf8") };
}

function json(res, status, body) { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); res.end(JSON.stringify(body)); }
async function handler(req, res) {
  if (req.method === "GET" && req.url === "/") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(await readFile(join(web, "index.html"), "utf8")); return; }
  if (req.method !== "POST" || req.url !== "/mcp") return json(res, 404, { error: "Not found" });
  let body = ""; for await (const chunk of req) { body += chunk; if (body.length > 32_000) return json(res, 413, { error: "Request too large" }); }
  try {
    const request = JSON.parse(body);
    if (request.method === "initialize") return json(res, 200, { jsonrpc: "2.0", id: request.id, result: { protocolVersion: "2024-11-05", serverInfo: { name: "gentle-jev-lab", version: "0.1.0" }, capabilities: { tools: {} } } });
    if (request.method === "tools/list") return json(res, 200, { jsonrpc: "2.0", id: request.id, result: { tools: [...SAFE_TOOLS].map(name => ({ name, description: "Bounded read-only fixture inspection", inputSchema: { type: "object" } })) } });
    if (request.method === "tools/call") { const result = await callTool(request.params?.name, request.params?.arguments); return json(res, 200, { jsonrpc: "2.0", id: request.id, result: { content: [{ type: "text", text: JSON.stringify(result) }] } }); }
    return json(res, 400, { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "Unsupported MCP method" } });
  } catch (error) { return json(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32000, message: error.message } }); }
}
http.createServer(handler).listen(port, () => console.log(`gentle-jev-lab listening on http://localhost:${port}`));
