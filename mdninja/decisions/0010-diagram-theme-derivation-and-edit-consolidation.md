# ADR 0010: Diagram Theme Derivation & Edit Control Consolidation

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

Rendered Mermaid diagrams and the app itself had three separate, conflicting styling contracts:

1. **A dead "Mermaid Theme" setting.** The Settings modal carried a "Diagram Engine" tab with a Mermaid theme dropdown (Dark / Neutral Slate / Forest / Default), a pan/zoom sensitivity slider, and two canvas-interaction checkboxes. None of these were wired to anything: the dropdown's `defaultValue` was never read, the slider had no handler, and the checkboxes were static `defaultChecked` inputs whose values existed nowhere. The controls advertised configuration that the code did not honor.
2. **Redundant edit affordances on diagrams.** Every rendered diagram carried a floating "Edit Code" button overlaid on the focal content. Raw-syntax editing is already handled by the panel toolbar's edit mode (icon-only, per the design-edits note), so the on-diagram buttons duplicated the command, covered diagram real estate, and contradicted the clean-surface design principles.
3. **Theme mismatch.** Diagrams were only re-themed on `data-theme` (light/dark) flips with hardcoded palettes, while accent changes and reading-palette switches (`data-palette`, inline `--accent`) left diagrams stale — the "blocks that don't match the theme" symptom.

## 2. Decision

* **Diagrams are pure derivations of the workspace theme.** `MermaidViewer` resolves every Mermaid `themeVariables` color from the live CSS custom properties (`--bg-*`, `--text-*`, `--accent*`, `--border-*`) at render time, and a `MutationObserver` on `<html>` (`data-theme`, `data-palette`, `style`) forces a re-render on any of: light/dark toggle, reading-palette switch, or custom-accent change. No separate Mermaid theme exists or may exist.
* **Diagrams are read-only surfaces.** Rendered diagrams (standalone and embedded) expose **no** edit controls. Raw Mermaid syntax is edited exclusively via the panel toolbar's edit mode, which is the single source for document editing.
* **The Settings "Diagram Engine" tab is deleted.** The "Diagrams" tab in the Settings modal and the `diagrams` value in `SettingsTab` are removed. The only surviving diagram surface control is the floating zoom cluster (zoom in / out / reset) on standalone diagrams — the diagram's primary interaction with no toolbar equivalent.
* **Documentation contract updated.** `docs/architecture-overview.md`, `mdninja/research/mdninja_outline.md`, and the changelog no longer advertise "flip-to-edit" / "Edit Code" behavior; they describe single-source editing and theme derivation instead.

## 3. Consequences

### Positive
* One styling source of truth: workspace theme + palette + accent. Diagrams can no longer drift from the surrounding document.
* Zero dead configuration surface. Every remaining Settings control either works or documents an explicit contract.
* The diagram's focal area is unobstructed; editing has exactly one discoverable entry point (panel toolbar).

### Negative
* The Settings icon rail now has three tabs instead of four — a visible surface reduction that must stay in sync with `SettingsTab` consumers (`IconRail`, `page.tsx`).
* Zoom control appearance/position is the only floating UI over diagram content; any future "on-diagram" tooling must be justified against this ADR.

## 4. 🤖 Agent Enforcement

* **DO:** Derive all Mermaid `themeVariables` from the live CSS custom properties in `apps/web/src/styles/globals.css`; never hardcode hex values in `MermaidViewer`.
* **DO NOT:** Re-add any per-diagram or global Mermaid theme selector (dropdown, setting, prop, or otherwise) — a diagram theme is a cross-wired duplicate of the workspace theme by definition.
* **DO NOT:** Add edit/flip controls to the `MermaidViewer` render surface (neither standalone nor embedded). Diagram editing routes through the panel toolbar only.
* **DO:** Keep the zoom cluster as the sole floating control on standalone diagrams, and keep it icon-only (no text labels), consistent with the design-edits note.
* **DO NOT:** Ship static/unwired form controls (checkboxes, sliders, selects without handlers or persisted state) — advertised configuration must be real configuration.
