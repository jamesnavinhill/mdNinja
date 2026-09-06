# Project Agents Operational Directive

This document defines operational rules, personas, and behavioral constraints for all AI coding assistants (Cursor, Claude Code, Windsurf, Roo Code, Gemini) working in this repository.

## 1. The Living Canon Mandate
* All architectural choices must be formalized in `mdninja/decisions/` using the standard ADR format (`0000-template.md`).
* When planning multi-step features, read `mdninja/roadmaps/roadmap.md` first to align with current phase priorities.
* Do not introduce external database dependencies for documentation; all persistent operational context must reside as Markdown in `mdninja/`.

## 2. Directory Layout
* `mdninja/decisions/`: Immutable decision records.
* `mdninja/roadmaps/`: Living execution timeline and checklists.
* `mdninja/diagrams/`: Mermaid and Excalidraw visual maps.
* `docs/`: User-facing and API documentation.
* `.agents/skills/`: Executable workflow instructions.

## 3. Agent Rules of Engagement
* **DO:** Check off completed tasks in `mdninja/roadmaps/roadmap.md` with `[x]` after verifying implementation.
* **DO:** Include the `🤖 Agent Enforcement` section in every new ADR.
* **DO:** Use the native Model Context Protocol (MCP) server (`mdninja mcp`) or tools for path-safe living canon reads, edits, and ADR scaffolding.
* **DO NOT:** Commit `.next/` or build artifacts to Git.
