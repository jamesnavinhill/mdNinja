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
* **DO:** Run the production build (`npm run build`) after any code change and fix what breaks before ending the session.
* **DO NOT:** Commit `.next/` or build artifacts to Git.

## 4. Session Closeout (mandatory)
Every session ends with these steps, in order:

1. **Changelog entry.** If the session touched code, changed system behavior, or altered any plan (roadmap, ADR status, scope), add an entry under `[Unreleased]` in `mdninja/changelog/changelog.md`. Code edits without a changelog entry are an incomplete task.
2. **Docs accuracy pass.** Verify any documentation the session's changes affected (`docs/`, `README.md`, ADRs, roadmaps) still matches the code. Docs lie only when nobody checks.
3. **Commit and push.** Commit all work with a conventional commit message (`feat:`/`fix:`/`docs:`/`refactor:`/`chore:` + scope), then push to `origin` on the current branch. Work that lives only in a dirty working tree is unfinished work.

## 5. Documentation Voice
Docs are written for a human who will act on them, not for a model to sound good.
* **SAY THE THING.** "We do X." — stop. Never "we don't do Y, we do X" or "it's not Y, it's X." State what exists and why in one beat.
* **No filler.** Cut "in order to" chains, passive constructions, and throat-clearing preludes. If a sentence could be deleted without losing meaning, delete it.
* **Accurate by construction.** Every command, path, flag, and behavior written in a doc must be verified against the code in the same session it's written. A documented command that doesn't run is a defect, filed the same as a bug.
* **To the point, and only that.** One doc, one job. Cross-reference instead of repeating.
