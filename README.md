# mdNinja

> The Zero-Constraint Living Canon & Visual Markdown Workbench.

**mdNinja** connects your engineering repository's Markdown documents—architecture specs, living roadmaps, ADRs, diagrams, and AI agent instructions—into a high-performance visual workbench with zero database silos.

## Features
* **Zero-Constraint Equal Split Workspace:** Dual equal panels (`Cmd + \`) powered by `react-resizable-panels`.
* **LaTeX Formula Rendering:** Fast, zero-layout-shift math via KaTeX (`$math$` and `$$math$$`).
* **Unconstrained Diagram Magic:** Interactive Mermaid.js & Excalidraw diagrams with smooth pan and zoom.
* **Direct Local Filesystem I/O:** Edits write directly to disk (`fs.writeFile`) with zero lag.
* **Native Repo Aggregation:** Automatically scans and organizes `projectmd/`, `docs/`, `.agents/`, and root files.

## Getting Started

```bash
# Run locally in any repository
npx mdninja
```
