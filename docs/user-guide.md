# User Guide

How to drive the workbench once it's open.

## The layout

```
┌──────┬──────────────┬──────────────────────────────────────────┐
│ Rail │ File tree    │ Panel(s)                                  │
│      │              │ ┌ toolbar: breadcrumb · save · edit · ┐   │
│ canon│ mdninja/     │ │ split                                │   │
│ docs │   decisions  │ ├──────────────────────────────────────┤   │
│ .agents│  roadmaps  │ │ rendered markdown / raw editor       │   │
│ root │   diagrams   │ │                                        │   │
│      │ docs/        │ └────────────────────────────────────────┘   │
└──────┴──────────────┴──────────────────────────────────────────┘
```

* **Rail** — jump straight to a canon section (decisions, roadmaps, …), `☀/☾` flips dark/light, the avatar opens Settings.
* **File tree** — everything the scanner found: canon, `docs/`, `.agents/`, root Markdown. Click a folder to collapse, a file to open it in the active panel.
* **Panels** — the reading surface. Single panel by default; `Cmd/Ctrl + \` splits into two equal panels with a draggable divider. Each panel has its own toolbar.

## Reading a document

Files render as Markdown with tables, task lists, KaTeX math, and highlighted code blocks. Markdown links to other repo files open inside the workbench instead of navigating away.

## Diagrams

Fenced `` ```mermaid `` blocks render as interactive vectors:

* Scroll to zoom, drag to pan. The floating buttons (bottom-right) are zoom in / out / reset.
* A file that is *only* a diagram fills the full panel height.
* Diagrams take their colors from your active theme, palette, and accent automatically.
* To edit a diagram's source, flip the panel into edit mode (toolbar) — the raw Markdown is there.

Diagram syntax is standard [Mermaid](https://mermaid.js.org/).

## Editing and saving

* Toolbar **edit** icon (or the same button showing a "preview" icon while editing) flips the panel between rendered preview and raw Markdown.
* Type, then press `Cmd/Ctrl + S` or click Save. The write goes straight to the filesystem — Git picks it up from there.
* The save pill tells you the state: `saved` fades on its own, `unsaved` means there's work to persist.

## Themes and comfort

Settings → **Styling, Themes & Comfort**:

* **Reading palettes** — Default, Tokyo Night, Nord Frost, GitHub Dimmed, Paper Sepia. Each works in both dark and light.
* **Accent color** — full spectrum picker; diagrams, links, and UI chrome follow it live.
* **Typography** — font family, size, line height, and document max-width sliders apply instantly.
* **Sidebar & File Tree** — expand-on-hover toggle and hover open/close delays, persisted centrally.

Dark/light is the rail toggle; palette, accent, and sidebar behavior are the Settings job. Everything re-renders live. Folder icons use the built-in Lucide pack by default.

## Connect a GitHub repo

Settings → **GitHub Connections** → *Add Account* opens the OAuth popup. Your repositories load into the panel; connect as many accounts as you like.

Security model: the token exchange is ephemeral on the server, and tokens live only in your browser's `localStorage`. Nothing account-related is ever stored on the server (see [ADR 0004](../mdninja/decisions/0004-zero-leak-multi-user-isolation.md)).

## Daily workflow, condensed

1. Open the repo's canon (icon rail → `roadmaps` is a good start).
2. Read the ADR that governs the work you're doing.
3. Split (`Cmd + \`) when comparing two docs side by side.
4. Edit → `Cmd + S` → commit with your normal Git flow.