# Project Agents Operational Directive

This document defines operational rules, personas, and behavioral constraints for all AI coding assistants (Cursor, Claude Code, Windsurf, Roo Code, Gemini) working in this repository.

## 1. The Living Canon Mandate
* All architectural choices must be formalized in `projectmd/decisions/` using the standard ADR format (`0000-template.md`).
* When planning multi-step features, read `projectmd/roadmaps/roadmap.md` first to align with current phase priorities.
* Do not introduce external database dependencies for documentation; all persistent operational context must reside as Markdown in `projectmd/`.

## 2. Directory Layout
* `projectmd/decisions/`: Immutable decision records.
* `projectmd/roadmaps/`: Living execution timeline and checklists.
* `projectmd/diagrams/`: Mermaid and Excalidraw visual maps.
* `docs/`: User-facing and API documentation.
* `.agents/skills/`: Executable workflow instructions.

## 3. Agent Rules of Engagement
* **DO:** Check off completed tasks in `projectmd/roadmaps/roadmap.md` with `[x]` after verifying implementation.
* **DO:** Include the `🤖 Agent Enforcement` section in every new ADR.
* **DO NOT:** Commit `.next/` or build artifacts to Git.
