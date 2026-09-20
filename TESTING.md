# Testing log

This document records every reproducible test performed for the Gentle/JEV laboratory. Secrets are never recorded here.

## Environment

- OS: Windows
- Node: 22.x
- Package manager: pnpm 9.15.9
- Local repository: `C:\Users\JorgeHaraDevs\gentle-jev-lab`
- Public repository: <https://github.com/jorgehara/gentle-jev-lab>
- Server URL: <http://localhost:8787>

## Test 1 — MCP unit/integration suite

Command:

```powershell
cd C:\Users\JorgeHaraDevs\gentle-jev-lab
pnpm install
pnpm test
```

Coverage:

- `tools/list` exposes only `project_summary`, `list_files`, and `read_file`.
- `read_file` can read the synthetic authentication fixture.
- `read_file` rejects `../../package.json` path traversal.
- The MCP server starts and stops as a child process.

Observed result:

```text
2/2 tests passed
~465 ms
```

## Test 2 — Gentle tool-plan unit suite

Executed in the companion `gentle-shell-jev` repository:

```powershell
node --experimental-strip-types --test tests/jev-context.test.ts tests/jev-tool-plan.test.ts
```

Coverage:

- Secret redaction and bounded state.
- Deterministic fallback without JEV.
- Confidence gate.
- Read-only allowlist.
- Maximum three planned steps.
- Parallel independent tools.
- Ordered dependent tools.
- Local p95 latency guard.

Observed result:

```text
8/8 relevant tests passed
local fallback p95 <25 ms
```

## Test 3 — End-to-end simulated JEV workflow

Command:

```powershell
node --experimental-strip-types --test tests/jev-workflow.e2e.test.ts
```

Flow:

```text
JEV plan → Gentle validates → MCP-like executor runs → summaries return to model
```

Observed result:

```text
1/1 E2E test passed
```

## Test 4 — Real TypeSafe/JEV request

The request was executed with `@typesafe-ai/sdk` and `TypeSafeClient.systemOne()` against the real service. The key was supplied only through the local PowerShell process and is intentionally not recorded.

State sent:

```json
{
  "intent": "find authentication middleware",
  "files": ["src/auth.ts", "tests/auth.test.ts"],
  "revision": "local"
}
```

Questions:

- `choice`: `symbol_search`, `codegraph`, or `read_symbol`.
- `noul`: whether more context is needed.

Observed result:

```json
{
  "ok": true,
  "elapsedMs": 1014.2,
  "model": "jev-1.13.0",
  "input_tokens": 375,
  "output_tokens": 59,
  "choice": "symbol_search",
  "confidence": 0.36,
  "more": 0.75
}
```

Interpretation: the service and SDK worked. The confidence gate correctly treats `0.36` as too low for automatic execution when the configured threshold is `0.75`, so Gentle should use fallback or request another bounded context batch.

## Test 5 — Invalid credential behavior

An earlier credential produced an HTTP 401. This confirmed that authentication errors are surfaced and do not silently become an unsafe tool plan. Credentials pasted into chat are considered compromised and must be revoked.

## Test 6 — Browser/MCP smoke test

Start the server:

```powershell
pnpm start
```

Open <http://localhost:8787> and click **Run project summary**. The page calls `POST /mcp` and renders the bounded JSON response and request latency.

## What is not measured yet

- Real JEV selection of a three-tool plan.
- Latency under repeated real TypeSafe requests.
- Token comparison against a primary model navigating the same fixture.
- Timeline/event observability UI.
- Tests against a real external repository.

These are intentionally separate follow-up experiments. The fixture remains synthetic and public until the safety and measurement contract is accepted.
