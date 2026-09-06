# ADR 0001: Adopt Monorepo Structure with npm Workspaces

**Date:** 2026-09-05  
**Status:** Accepted  

## 1. Context

`mdNinja` requires multiple interconnected packages:
1. `@mdninja/web`: The Next.js 15 visual workbench and living canon viewer.
2. `@mdninja/cli`: The zero-install CLI runner invoked via `npx mdninja`.
3. `mdninja/`: The living canon containing engineering decisions, roadmaps, and diagrams.

We needed a structure that allows co-locating the web app and the CLI without polluting or conflicting with existing root documentation files.

## 2. Decision

We will structure the project as an npm workspaces monorepo:
* `apps/web`: Next.js 15 App Router web application.
* `packages/cli`: Standalone CLI launcher.
* `mdninja/`: First-class living canon directory.
* `.mdninja/`: Tool configuration (`config.json`).

## 3. Consequences

### Positive
* Single root `package.json` installs and hoists shared dependencies cleanly.
* Clear isolation between web UI, CLI packaging, and project documentation.
* The web app can be developed, tested, and bundled independently.

### Negative
* Requires referencing workspace scripts (e.g. `npm run dev --workspace=@mdninja/web`).

## 4. 🤖 Agent Enforcement

* **DO:** Place web frontend components, API routes, and styles inside `apps/web/src/`.
* **DO:** Keep CLI launcher code in `packages/cli/`.
* **DO NOT:** Install conflicting packages directly in the root directory without npm workspace flags.
