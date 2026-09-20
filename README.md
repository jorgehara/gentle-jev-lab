# gentle-jev-lab

A public laboratory for testing TypeSafe JEV as a bounded tool planner in a Gentle-style workflow. The idea follows TypeSafe's state-driven demos such as Doom/Wikiracing: JEV chooses the next structured action from indexed state, while the host retains execution authority.

## Run

```bash
pnpm install
pnpm test
pnpm start
```

Open <http://localhost:8787>.

## MCP web endpoint

The local server exposes a minimal JSON-RPC MCP endpoint at `POST /mcp`:

- `initialize`
- `tools/list`
- `tools/call`

Only these synthetic, read-only tools are available: `project_summary`, `list_files`, and `read_file`. Paths are confined to `fixtures/demo-project`; files are capped at 16 KB. No shell, network proxying, writes, credentials, or deployment operations are exposed.

## Gentle/JEV experiment

1. Capture an intent and bounded project state.
2. Ask JEV to choose a tool or a small batch.
3. Validate the plan against the host allowlist.
4. Run independent reads in parallel and dependent reads in order.
5. Return summaries, not raw repository content, to the primary model.
6. Record latency, tokens, confidence, unnecessary calls, and completion quality.

The repository is intentionally synthetic and public so Alan and the Gentle Shell team can test the flow safely with their own AI tooling. See [TESTING.md](TESTING.md) for the complete experiment log and reproducible commands. The reusable [jev-understanding skill](skills/jev-understanding/SKILL.md) documents the safe JEV/Gentle interaction contract.

## Security

This lab contains no API keys and does not read the host filesystem outside the fixture directory. Keep TypeSafe credentials in the local environment only.
