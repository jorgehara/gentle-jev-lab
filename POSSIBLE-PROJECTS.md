# Possible projects

Ideas to explore after the laboratory is stable.

## 1. gentle-browser-jev

A simple Gentle-style browser agent inspired by `jkudish/jev-browser`.

- Playwright controls the browser.
- JEV chooses one bounded action per step.
- Gentle owns budgets, domains, stop gates, recovery, screenshots, and traces.
- MCP exposes one safe `browse` tool.
- First tests use local/synthetic pages before real sites.

Reference: https://github.com/jkudish/jev-browser

## 2. Anita + JEV router

A JEV decision layer for the Anita bot, inspired by `grok-bot-jev`.

JEV would classify the request before expensive work and return explicit actions such as:

- `chat_only`
- `reuse_context`
- `run_deterministic`
- `research_capped`
- `allow_subagent`
- `stop_retry`
- `ask_human`

Implementation principles:

- Start in `shadow` mode: log advisory decisions without changing Anita behavior.
- Move to `active` mode only after sanitized A/B measurements.
- Keep Anita's primary model unchanged.
- Never let JEV send messages, publish, pay, delete, change permissions, or access credentials.
- Add a kill switch and `bypass jev` marker.
- Record latency, JEV calls, tool calls, retries, context reuse, and outcome quality.
- Report proxy savings honestly; do not claim token savings without direct usage data.

Reference: https://github.com/Bodila51/grok-bot-jev

## 3. Local ride app + JEV

A future Uber-like app for the local town, with JEV-assisted mobile workflows inspired by `droidrun/mobile-jev`.

Current status: requested idea, requirements not defined yet. Do not implement product behavior until we capture the local operating model, drivers, riders, service area, pricing, dispatch, payments, safety, privacy, and regulatory requirements.

Potential later architecture:

- rider and driver mobile/web flows;
- dispatch and route state;
- JEV choosing the next bounded mobile/UI action, never confirming a ride or payment by itself;
- Gentle-style execution budgets, stop gates, verification, and traceability;
- shadow-mode experiments before active automation;
- local synthetic fixtures before connecting real devices or accounts.

Reference: https://github.com/droidrun/mobile-jev
