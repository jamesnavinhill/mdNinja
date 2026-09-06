# Getting Started with projectmd

Welcome to **projectmd**—the zero-constraint visual Markdown workbench and living canon viewer for modern engineering repositories.

## Quick Start

### 1. Launching in an Existing Repository

Run the following command in the root of any Git repository:

```bash
npx projectmd
```

This starts a lightweight local development server and opens the visual workbench in your default browser.

### 2. The Living Canon (`projectmd/`)

`projectmd` looks for a top-level `projectmd/` folder containing your project's living history:

* `projectmd/decisions/`: Architecture Decision Records (ADRs) with agent enforcement directives.
* `projectmd/roadmaps/`: Living Gantt charts and progress tasklists.
* `projectmd/diagrams/`: Interactive Mermaid and Excalidraw visual maps.
* `projectmd/research/`: Technical evaluations, benchmarks, and spikes.
* `projectmd/notes/`: Engineering scratchpads and meeting notes.

### 3. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + \` / `Ctrl + \` | Toggle Equal Dual-Panel Split View |
| `Cmd + B` / `Ctrl + B` | Toggle File Explorer Sidebar |
| `Cmd + S` / `Ctrl + S` | Save active document directly to disk |
| `Double Click` | Activate inline block editor in preview mode |
