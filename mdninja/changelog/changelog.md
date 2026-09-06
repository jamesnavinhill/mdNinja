# Changelog

All notable changes to **mdNinja** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-09-06

### Fixed (truth / drift / security hardening)
* **Single living-canon config contract.** Extracted a shared `@mdninja/canon` package (`packages/canon/index.js`) as the one source of truth for the `.mdninja/config.json` shape + canonical `mdninja/` layout; both `mdninja init` (CLI) and `POST /api/scaffold` (web) now write the identical artifact. Previously the two scaffolders copied divergent configs that did not match the runtime scanner.
* **Scaffold only what the runtime reads.** Generated config is now exactly `{ $schema, name, canon }`. Removed the unimplemented `include` / `exclude` / `preferences.pinned` / `preferences.defaultLayout` fields from the scaffolded artifact (the scanner never read them, so committing them advertised a false contract).
* **Canonical directory order unified.** Both scaffolders now create `audits, changelog, decisions, diagrams, notes, research, roadmaps, standards` (the web route previously used a different set).
* **OAuth postMessage hardened.** `/api/auth/callback/github` now posts the account payload to the application origin (was `*`); the Settings listener now validates `event.origin === window.location.origin` (tokens are no longer broadcast to an arbitrary opener window).
* **Docs corrected to match code.** README, getting-started, configuration-guide, and architecture-overview now describe only implemented behavior: clarified what `mdninja dev -d` does and doesn't affect, that the bundled workbench scans the directory it is launched from, and that `mdninja build` requires a monorepo checkout. Replaced all non-portable absolute `file:///c:/...` ADR links with repo-relative links.

---

## [1.0.0] - 2026-09-06

### Added
* **Dual Equal Split-Panel Workspace:**
  * Powered by `react-resizable-panels` with draggable splitter handles.
  * Zero-constraint architecture: both panels have 100% equal capabilities to view, edit, render KaTeX, or display interactive diagrams.
  * Global hotkey `Cmd + \` / `Ctrl + \` to toggle split mode.
* **Markdown AST & Math Rendering Pipeline:**
  * Unified pipeline chaining `remark-parse`, `remark-gfm`, `remark-math`, `remark-rehype`, `rehype-katex`, `rehype-highlight`, and `rehype-stringify`.
  * Inline LaTeX math (`$E = mc^2$`) and display formulas (`$$\dots$$`) rendered via KaTeX with zero layout shift.
* **Interactive Diagram Engine:**
  * Automated Mermaid code block interception rendering crisp SVG vector graphics.
  * Vector pan and zoom controls powered by `react-zoom-pan-pinch` with 60fps hardware accelerated GPU transforms.
  * Unconstrained diagram canvas: standalone diagram files automatically expand to fill 100% of panel height.
  * Integrated "Edit Code" flip toggle to modify raw diagram syntax inline.
* **Zero-Leak Multi-Repo GitHub OAuth:**
  * Ephemeral server-side OAuth flow (`/api/auth/github` & `/api/auth/callback/github`) with popup postMessage return.
  * Strict browser-isolated credential storage in `localStorage` (`mdninja_gh_accounts`, `mdninja_repos`).
  * Direct client-side fetching of repositories from GitHub REST API—zero server-side token storage or multi-tenant data leakage.
* **Living Canon Scanner & Navigation:**
  * Automated repository discovery for `mdninja/`, `docs/`, `.agents/`, and root Markdown documents.
  * Collapsible icon rail with category routing and active file tracking.
  * Natural directory hierarchy without artificial tags or noisy wrappers.
* **Direct Local Filesystem I/O:**
  * Real-time read and write API (`/api/files`, `/api/content`) writing directly to disk via `fs.writeFile`.
  * Keyboard shortcut `Cmd + S` / `Ctrl + S` to save active documents.
* **Curated Design System & Theme Engine:**
  * Universal theme support across both Dark and Light modes: Default mdNinja, Tokyo Night, Nord Frost, GitHub Dimmed, and Paper Sepia.
  * Live typographic controls: font family, font size, line height, and maximum reading width.
* **Standalone CLI Runner (`@mdninja/cli`):**
  * Executable binary `npx @mdninja/cli` supporting `dev`, `init`, `mcp`, and `build` commands.
  * One-command canonical directory scaffolding (`mdninja init`).
* **Model Context Protocol (MCP) Stdio Server:**
  * Native stdio MCP server for AI coding assistants (Cursor, Claude Desktop, Windsurf, Antigravity).
  * 7 core living canon tools: `get_canon_structure`, `read_canon_doc`, `write_canon_doc`, `list_adrs`, `create_adr`, `get_roadmap`, `update_roadmap_task` (ADR 0007).
* **Tauri 2.0 Native Desktop Shell:**
  * Sub-20MB installer and <30MB baseline RAM footprint housing the shared Next.js web application.
  * Cross-platform OS webview integration (WebView2 / WebKit) with zero Electron bloat (ADR 0008).
  * High-resolution native shuriken/markdown icons across all desktop formats.
* **Vercel Production Deployment & Analytics:**
  * Native `@vercel/analytics` integration.
  * Resolved all security advisories in upstream dependencies (`npm audit` -> 0 vulnerabilities).
  * Production deployment active on `https://mdninja.navinhill.com`.

---

## [0.9.0] - 2026-09-01

### Added
* Monorepo foundation using npm workspaces (`apps/web`, `packages/cli`).
* Standardized ADR template and living canon directives (`AGENTS.md`).
* Specification and requirements outline (`mdninja_outline.md`).
