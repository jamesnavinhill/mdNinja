# ADR 0002: Zero-Constraint Equal Split-Panel Architecture

**Date:** 2026-09-05  
**Status:** Accepted  

## 1. Context

Early wireframes proposed a rigid "Primary View (left) vs. Context View (right)" layout. However, developers frequently need to compare two equal documents (e.g. comparing two quarterly roadmaps, drafting an ADR while viewing an architecture diagram, or comparing two agent skills). Forcing an asymmetric hierarchy introduces unnecessary friction.

## 2. Decision

We will implement two completely equal panels powered by `react-resizable-panels`:
* Both panels have identical capabilities (view, preview, edit, KaTeX, diagrams).
* The split panel is toggled on demand via `Cmd + \` or the split icon.
* Either panel can load any document from the repository without restriction.

## 3. Consequences

### Positive
* Complete flexibility for developers to cross-reference any two files.
* Eliminates artificial UI constraints.
* Zero cognitive overhead when switching focus between panels.

### Negative
* Requires maintaining active panel state for file tree click targets.

## 4. 🤖 Agent Enforcement

* **DO:** Ensure both panels in `SplitWorkspace.tsx` have identical capabilities.
* **DO NOT:** Introduce code that limits Panel 2 to "read-only" or "secondary" status.
