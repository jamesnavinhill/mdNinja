# Getting Started

mdNinja is a visual workbench for the living canon — your project's ADRs, roadmaps, diagrams, and notes as one navigable reading surface. This page gets you running; the [user guide](user-guide.md) covers what to do once it's open.

## Run it

Pick the path that fits:

### Option A — Any repo, zero clone (recommended)

```bash
npx @mdninja/cli            # serve the current directory
npx @mdninja/cli -d /path/to/repo
npx @mdninja/cli init       # scaffold a fresh living canon in this repo
```

The workbench, MCP server, and scaffolder all operate on the directory you point at (`-d` or cwd).

### Option B — Live demo

[mdninja.navinhill.com](https://mdninja.navinhill.com) runs this exact repository's canon. Zero install, good for a first look.

### Option C — This monorepo, locally

```bash
git clone https://github.com/jamesnavinhill/mdninja.git
cd mdninja
npm install
npm run dev
```

Open `http://localhost:3000`. Edits write straight to disk; Git shows them as normal working-tree changes.

### Option D — Desktop (Tauri)

```bash
cd apps/web
npm run tauri dev
```

Develops the same Next.js frontend inside a native webview. Requires a Rust toolchain, since Tauri compiles a small Rust binary around it. No installer is shipped yet — desktop build tooling exists, packaging is a roadmap item.

## What you'll see

* **Icon rail** (far left): jump to a canon section, toggle dark/light, open Settings.
* **File tree**: the repository's canon, `docs/`, `.agents/`, and root Markdown.
* **Panel(s)**: rendered Markdown. `Cmd/Ctrl + \` splits into two equal panels.

Keyboard map:

| Shortcut | Action |
| :--- | :--- |
| `Cmd + \` / `Ctrl + \` | Toggle equal-split panels |
| `Cmd + B` / `Ctrl + B` | Toggle file tree sidebar |
| `Cmd + S` / `Ctrl + S` | Save the active document to disk |

## Where things live

| Folder | Purpose |
| :--- | :--- |
| `mdninja/decisions/` | ADRs with agent-enforcement rules |
| `mdninja/roadmaps/` | Living timelines and task checklists |
| `mdninja/diagrams/` | Mermaid maps (render with 60fps pan/zoom) |
| `mdninja/research/` | Benchmarks, spikes, evaluations |
| `mdninja/audits/` | Performance and bundle audits |
| `mdninja/standards/` | Coding and UI conventions |
| `docs/` | This documentation |
| `.agents/` | Agent skills and directives |

Next up: [CLI & MCP reference](cli-reference.md), [configuration](configuration-guide.md), [troubleshooting](troubleshooting.md).
