# Contributing

This repo holds the product, its living canon, and its agent operating rules in one place. The rules below are the contract for humans and AI agents alike — `AGENTS.md` at the root is the executable version for agents.

## Commands

```bash
npm run dev        # web workbench on :3000
npm run build      # prebuild syncs the canon bundle, then next build
npm run lint       # next lint in apps/web
npx tsc --noEmit -p apps/web/tsconfig.json   # typecheck
```

`npm run build` is the gate. It runs `prebuild` → `sync-canon` (regenerates `apps/web/src/lib/canon-data.json` from the repo's Markdown + `public/schema.json` from `@mdninja/canon`) → `next build` (which also typechecks). If you edited canon docs, the build is what ships them into the bundle — a stale `canon-data.json` means a stale demo.

For the monorepo's desktop target: `cargo check --manifest-path apps/web/src-tauri/Cargo.toml` validates the Rust crate.

## What CI runs

`.github/workflows/release.yml` fires on `v*` tags: `npm ci` → `sync-canon` → `build` → `mdninja --help` / `--version` smoke → publish `@mdninja/cli` to npm with provenance → GitHub release. There is no PR-time check pipeline, so **run the build locally before pushing.**

## Repo layout

| Path | Owns |
| :--- | :--- |
| `apps/web` | Next.js workbench (`src/`) + canon bundler (`scripts/sync-canon.mjs`) |
| `apps/web/src-tauri` | Tauri crate (native shell around the same web build) |
| `packages/cli` | `@mdninja/cli` — dev server, scaffold, and stdio MCP server |
| `packages/canon` | Single source of truth for the `.mdninja/config.json` contract + canon layout |
| `mdninja/` | This project's own living canon (ADRs, roadmaps, changelog, audits, research) |
| `docs/` | User-facing documentation |
| `.agents/skills` | Executable agent workflow skills |

## Rules that matter

1. **Canon before code, canon with code.** New architecture → ADR in `mdninja/decisions/` (template: `0000-template.md`, must include a `🤖 Agent Enforcement` section). Multi-step work → roadmap entry first. Behavior or plan changes → `[Unreleased]` changelog entry in the same session.
2. **Docs verified the session they're written.** Every command, flag, and path in `docs/` must actually run. A documented flag the code doesn't have is a bug.
3. **No dead UI, no dead config.** A control that doesn't connect to state, or a config field nothing reads, gets deleted. Advertised capability must be implemented capability.
4. **Session closeout.** Changelog → docs accuracy pass → commit + push. A dirty working tree at session end is an unfinished task.
5. **Doc voice.** State what exists and why, in one beat. No "it's not X, it's Y", no filler, no negative-space descriptions ("this doesn't do…").

## Style

* TypeScript strict mode in `apps/web`; keep imports explicit, components small, and CSS variables as the only theme tokens (see `mdninja/standards/coding-standards.md`).
* Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` + scope.
* Markdown over database. If a note needs to survive the session, it goes in `mdninja/`, not in an agent's memory.