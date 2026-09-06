# mdNinja 🥷

> **The Zero-Constraint Living Canon & Visual Markdown Workbench for Engineering Teams.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0-brightgreen?style=flat-square)](https://github.com/jamesnavinhill/projectmd)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live_Demo-mdninja.navinhill.com-indigo?style=flat-square)](https://mdninja.navinhill.com)

**mdNinja** connects your engineering repository's Markdown documents—architecture blueprints, living roadmaps, ADRs, interactive diagrams, and AI agent instructions—into an uncluttered, high-performance visual workbench with **zero database silos**.

Explore the public live demo: **[mdninja.navinhill.com](https://mdninja.navinhill.com)**

---

## ⚡ Highlights

* **Zero-Constraint Equal Split Workspace:** Dual equal panels (`Cmd + \`) powered by `react-resizable-panels`. No artificial "primary vs context" restrictions—both panels have 100% identical capabilities.
* **LaTeX Formula Typography:** Synchronous, zero-layout-shift mathematical rendering via KaTeX (`$math$` and `$$math$$`).
* **Unconstrained Vector Diagrams:** Interactive Mermaid.js code blocks converted into 60fps pan/zoom vectors with flip-to-edit toggle. Standalone diagrams expand to 100% of panel height.
* **Direct Local Filesystem I/O:** Edits write directly to disk (`fs.writeFile`) with zero lag. Your Git repository remains the single source of truth.
* **Native Living Canon Discovery:** Automatically scans and organizes `projectmd/` (ADRs, roadmaps, diagrams, audits), `docs/`, `.agents/`, and root Markdown files.
* **Zero-Leak Multi-User Isolation:** Ephemeral OAuth token exchange with strict browser-local `localStorage` persistence. Zero tokens or user repositories are ever stored on the server.
* **Universal Themes:** Curated themes (Default, Tokyo Night, Nord Frost, GitHub Dimmed, Paper Sepia) that adapt seamlessly across both Dark and Light modes.

---

## 🚀 Quick Start

### 1. Run Locally

```bash
# Clone the repository
git clone https://github.com/jamesnavinhill/projectmd.git
cd projectmd

# Install dependencies
npm install

# Start local workbench
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 2. Self-Host on Vercel

1. Fork or push this repository to GitHub.
2. Import into Vercel with **Root Directory:** `apps/web`.
3. Set your environment variables:
   * `NEXT_PUBLIC_APP_URL=https://mdninja.yourdomain.com`
   * `GITHUB_CLIENT_ID=your_github_client_id`
   * `GITHUB_CLIENT_SECRET=your_github_client_secret`
4. Deploy!

---

## 📁 The Living Canon Layout

```
[Repository Root]
├── .projectmd/                     <-- [Hidden] Tool Configuration & Mappings
│   └── config.json                 <-- Included paths, layout preferences, pinned files
│
├── projectmd/                      <-- [Visible] The Living Canon ("The Goods")
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

See [ADR 0004](projectmd/decisions/0004-zero-leak-multi-user-isolation.md) for full architectural details.

---

## 📄 License

MIT License — Copyright (c) 2026 mdNinja Contributors.
