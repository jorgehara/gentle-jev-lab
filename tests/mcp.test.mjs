import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

let child;
const base = "http://127.0.0.1:8799";
test.before(async () => { child = spawn(process.execPath, ["server.mjs"], { cwd: new URL("..", import.meta.url), env: { ...process.env, PORT: "8799" }, stdio: "ignore" }); await new Promise(r => setTimeout(r, 150)); });
test.after(() => child?.kill());

test("MCP exposes only bounded read-only tools", async () => {
  const response = await fetch(`${base}/mcp`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
  const body = await response.json();
  assert.deepEqual(body.result.tools.map(t => t.name), ["project_summary", "list_files", "read_file"]);
});

test("MCP reads fixture files and rejects path traversal", async () => {
  const read = await fetch(`${base}/mcp`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "read_file", arguments: { path: "src/auth.js" } } }) });
  assert.match((await read.json()).result.content[0].text, /authenticate/);
  const denied = await fetch(`${base}/mcp`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "read_file", arguments: { path: "../../package.json" } } }) });
  assert.equal((await denied.json()).error.code, -32000);
});
