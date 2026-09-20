---
name: jev-understanding
description: "Understand and use TypeSafe JEV as a typed, read-only decision planner for bounded tool selection, confidence gates, and low-context project navigation."
license: MIT
metadata:
  author: Jorge Hara Devs
  version: "0.1.0"
---

# JEV understanding skill

Use this skill when designing, testing, or debugging a TypeSafe JEV integration in a Gentle-style workflow.

## Mental model

JEV is not the primary coding model and is not an executor. Treat it as a fast structured decision service:

```text
bounded state -> typed questions -> confidence-aware decision -> host validation -> read-only execution
```

The host remains authoritative. JEV must never authorize writes, arbitrary shell commands, delivery, deployment, review closure, or secret access.

## JavaScript SDK

Use `@typesafe-ai/sdk` with `TypeSafeClient.systemOne()` and typed primitives:

- `choice(instructions, criteria)` for named alternatives.
- `score(instructions, criteria)` for ordered rubrics.
- `noul(instructions, criteria)` for yes/no decisions.

Keep questions atomic and use separate questions when decisions can be made in parallel. Always inspect `answers`, `confidence`, `probabilities`, `model`, and `usage`.

## Gentle interaction contract

1. Build a small project snapshot: intent, revision, relevant paths, symbols, and bounded summaries.
2. Redact API keys, tokens, passwords, cookies, authorization headers, `.env` values, and production credentials.
3. Ask JEV to choose at most three read-only tools or the next bounded step.
4. Validate every tool against a host-owned allowlist.
5. Run independent reads in parallel and dependent reads in order.
6. Return compact summaries to the primary model instead of raw repository dumps.
7. Apply a confidence gate. Low confidence must use deterministic fallback or request another bounded context batch.
8. Record latency, token usage, confidence, selected tools, errors, and fallback decisions.

## Failure handling

- Missing key or SDK: deterministic local plan.
- HTTP 401: report authentication failure without retrying blindly; never print the key.
- 429/529/timeouts: bounded retry policy or local fallback.
- Invalid tool or unsafe path: reject before execution.
- Oversized state/result: truncate by policy or stop; never silently send a full repository.

## Evaluation checklist

Measure at least:

- end-to-end latency;
- input/output tokens;
- confidence and probability distribution;
- first-tool accuracy;
- unnecessary tool calls;
- parallel versus sequential duration;
- fallback rate;
- task completion quality;
- redaction and path-traversal behavior.

Use the public `gentle-jev-lab` fixture and MCP server before testing real repositories. Keep TypeSafe credentials in the local environment only.
