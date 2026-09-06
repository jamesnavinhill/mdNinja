# mdNinja 🥷

> **The Zero-Constraint Living Canon Workbench & Model Context Protocol (MCP) Server for Engineering Teams and AI Agents.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-orange?style=flat-square&logo=tauri)](https://tauri.app/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-purple?style=flat-square)](https://modelcontextprotocol.io)
[![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0-brightgreen?style=flat-square)](https://github.com/jamesnavinhill/mdNinja)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live_Demo-mdninja.navinhill.com-indigo?style=flat-square)](https://mdninja.navinhill.com)

**mdNinja** connects your engineering repository's Markdown documents—architecture blueprints, living roadmaps, ADRs, interactive diagrams, and AI agent memory—into an uncluttered, high-performance visual workbench and standardized MCP interface with **zero database silos**.

Explore the public live demo: **[mdninja.navinhill.com](https://mdninja.navinhill.com)**

---

## ⚡ Highlights

* **Zero-Constraint Equal Split Workspace:** Dual equal panels (`Cmd + \`) powered by `react-resizable-panels`. No artificial "primary vs context" restrictions—both panels have 100% identical capabilities.
* **Native Model Context Protocol (MCP) Server:** Out-of-the-box stdio integration for Cursor, Claude Desktop, Windsurf, and Google Antigravity to navigate, read, write, and index the Living Canon.
* **Native Desktop Shell (Tauri 2.0):** Sub-20MB installer and <30MB baseline RAM footprint—eliminating Electron's heavy resource penalties.
* **LaTeX Formula Typography:** Synchronous, zero-layout-shift mathematical rendering via KaTeX (`$math$` and `$$math$$`).
* **Unconstrained Vector Diagrams:** Interactive Mermaid.js code blocks converted into 60fps pan/zoom vectors with flip-to-edit toggle and dynamic dark/light theme reactivity.
* **Direct Local Filesystem I/O:** Edits write directly to disk (`fs.writeFile`) with zero lag. Your Git repository remains the single source of truth.
* **Native Living Canon Discovery:** Automatically scans and organizes `mdninja/` (ADRs, roadmaps, diagrams, audits), `docs/`, `.agents/`, and root Markdown files.
* **Zero-Leak Multi-User Isolation:** Ephemeral OAuth token exchange with strict browser-local `localStorage` persistence. Zero tokens or user repositories are ever stored on the server ([ADR 0004](mdninja/decisions/0004-zero-leak-multi-user-isolation.md)).

---

## 🚀 Quick Start

### 1. Instant CLI Runner (Zero-Install)
Run mdNinja in any repository or directory using `npx`:

```bash
# Run the workbench against the current directory
npx @mdninja/cli

# Or serve an arbitrary repo explicitly
npx @mdninja/cli --dir /path/to/any/repo

# Scaffold the .mdninja config + canonical mdninja/ folders in the current directory
npx @mdninja/cli init
```

> `mdninja dev` (the default command) serves the repo named by `--dir`/`-d` (or the current directory if omitted). The scanner honors the target directory, so the workbench, MCP, and scaffold all operate on the same repo.

### 2. Connect Your AI Assistant (MCP)
Add mdNinja to your AI coding assistant (Cursor, Claude Desktop, Windsurf) via stdio:

```json
{
  "mcpServers": {
    "mdninja": {
      "command": "npx",
      "args": ["-y", "@mdninja/cli", "mcp"]
    }
  }
}
```

### 3. Native Desktop App (Tauri 2.0)
Build and run the native desktop shell:

```bash
cd apps/web
npm run tauri dev
```

### 4. Run Monorepo Locally

```bash
git clone https://github.com/jamesnavinhill/mdNinja.git
cd mdNinja
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 The Living Canon Layout

```
[Repository Root]
├── .mdninja/                      <-- [Hidden] Tool Configuration & Mappings
│   └── config.json                 <-- Included paths, layout preferences, pinned files
│
├── mdninja/                       <-- [Visible] The Living Canon ("The Goods")
│   ├── audits/                     <-- Performance benchmarks & security audits
│   ├── changelog/                  <-- Version history & release notes
│   ├── decisions/                  <-- Architecture Decision Records (ADRs) with agent enforcement
│   ├── diagrams/                   <-- System schemas & sequence diagrams (Mermaid)
│   ├── notes/                      <-- Engineering scratchpads & technical notes
│   ├── research/                   <-- Spikes, token economics, parser benchmarks
│   ├── roadmaps/                   <-- Living Gantt charts & milestone execution checklists
│   └── standards/                  <-- UI philosophy, code conventions & agent directives
│
├── docs/                           <-- Product & API documentation
├── .agents/                        <-- AI agent skills, directives & operational memory
└── README.md, AGENTS.md            <-- Root Markdown files
```

---

## 🛠️ CLI Commands (`@mdninja/cli`)

| Command | Description |
| :--- | :--- |
| `mdninja dev [options]` | Start the local visual workbench (default command). Options: `-p, --port <port>`, `--no-open`, `-d, --dir <path>` (serve that repo's canon; defaults to the current directory). |
| `mdninja init [options]` | Scaffold `.mdninja/config.json` and canonical directories (`mdninja/`). Options: `-f, --force`, `-d, --dir <path>`. |
| `mdninja mcp` | Launch the Model Context Protocol (MCP) server over `stdio` for AI assistants. |
| `mdninja build` | Sync living canon + build. **Requires a monorepo checkout** (spawns the web app's `sync-canon`/`build` scripts); a no-op-friendly standard for CI. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + \` / `Ctrl + \` | Toggle Equal Dual-Panel Split View |
| `Cmd + B` / `Ctrl + B` | Toggle File Explorer Sidebar |
| `Cmd + S` / `Ctrl + S` | Save active document directly to disk |
| `Double Click` | Activate inline block editor in preview mode |

---

## 🛡️ Security & Zero-Leak Architecture

When deployed as a public demo or shared instance, `mdNinja` guarantees that no visitor's credentials or private repository data can ever be accessed by another visitor:

1. OAuth tokens are exchanged ephemerally in `/api/auth/callback/github`.
2. The payload is transferred via `window.opener.postMessage` directly into that visitor's private browser `localStorage`.
3. Zero tokens or private repositories are stored in server memory, cache, or database.

See [ADR 0004](mdninja/decisions/0004-zero-leak-multi-user-isolation.md) for full architectural details.

---

## 📄 Documentation Links

* [Getting Started Guide](docs/getting-started.md)
* [Architecture Overview](docs/architecture-overview.md)
* [Configuration Guide](docs/configuration-guide.md)
* [Living Roadmap](mdninja/roadmaps/roadmap.md)
* [Cloud Hosting & Custom Domains Roadmap](mdninja/roadmaps/cloud-and-custom-domains-roadmap.md)
* [Architecture Decision Records (ADRs)](mdninja/decisions/0001-monorepo-structure.md)

---

## 📄 License

MIT License — Copyright (c) 2026 mdNinja Contributors.
