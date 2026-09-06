# ADR 0005: Build-Time Bundled Canon for Serverless & Static Deployments

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

In local development and CLI mode (`npx mdninja`), `mdNinja` directly accesses the host filesystem via Node's `fs/promises`, dynamically scanning directories (`mdninja/`, `docs/`, `.agents/`) and writing edits back to disk in real time.

However, when deployed as a public demo or serverless web application (e.g. Vercel, AWS Lambda, Cloudflare Pages), the serverless execution container runs in an isolated root (`/var/task/apps/web`). Directories in the monorepo root (`../../mdninja`, `../../docs`) are outside the serverless function bundle unless explicitly bundled. Consequently, runtime filesystem walks can return empty lists (`{ rootName: "web", canon: [] }`), breaking the public demo experience.

## 2. Decision

We will implement a **Dual-Layer Living Canon Resolution Strategy**:
1. **Live Filesystem First:** The scanner first checks if the local filesystem contains `mdninja/` (standard behavior in local development and CLI runs). If found, live filesystem I/O is used with direct read/write capabilities.
2. **Build-Time Bundled Canon Fallback:** During `prebuild`, a lightweight synchronization script (`scripts/sync-canon.mjs`) reads the canonical documentation from the monorepo root and bundles a pre-indexed AST manifest into `apps/web/src/lib/canon-data.json`.
3. **Seamless Runtime Fallback:** When deployed in serverless environments where local filesystem traversal finds no repository canon, the scanner and content APIs automatically fall back to the bundled canon data.

## 3. Consequences

### Positive
* **Zero 404s in Production:** Hosted public deployments (like `mdninja.navinhill.com`) render the complete, authentic project canon immediately with 0ms disk latency.
* **Preserves Local Live I/O:** Local developers and self-hosters continue to enjoy live disk read/write synchronicity without stale cache issues.
* **Zero Fragility:** Does not depend on platform-specific serverless file tracing hacks or complex container path mounts.

### Negative
* Requires running the sync script during the build step when deploying to hosted environments.

## 4. 🤖 Agent Enforcement

* **DO:** Keep `scripts/sync-canon.mjs` updated if new living canon top-level directories are added to the repository.
* **DO NOT:** Hardcode mock documents; always sync directly from the live files in `mdninja/`, `docs/`, `.agents/`, and root Markdown files.
