# Changelog

All notable changes to **mdNinja / projectmd** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  * Automated repository discovery for `projectmd/`, `docs/`, `.agents/`, and root Markdown documents.
  * Collapsible icon rail with category routing and active file tracking.
  * Natural directory hierarchy without artificial tags or noisy wrappers.
* **Direct Local Filesystem I/O:**
  * Real-time read and write API (`/api/files`, `/api/content`) writing directly to disk via `fs.writeFile`.
  * Keyboard shortcut `Cmd + S` / `Ctrl + S` to save active documents.
* **Curated Design System & Theme Engine:**
  * Universal theme support across both Dark and Light modes: Default mdNinja, Tokyo Night, Nord Frost, GitHub Dimmed, and Paper Sepia.
  * Live typographic controls: font family, font size, line height, and maximum reading width.
* **Vercel Production Deployment & Analytics:**
  * Native `@vercel/analytics` integration.
  * Resolved 4 security advisories in upstream dependencies (`postcss@8.5.28`).
  * Production deployment configured for `https://mdninja.navinhill.com`.

---

## [0.9.0] - 2026-09-01

### Added
* Monorepo foundation using npm workspaces (`apps/web`, `packages/cli`).
* Standardized ADR template and living canon directives (`AGENTS.md`).
* Specification and requirements outline (`projectmd_outline.md`).
