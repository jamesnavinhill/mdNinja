# ADR 0012: Sidebar State Machine & Projects Rail

**Date:** 2026-09-07
**Status:** Implemented & verified

## 1. Context

The file-tree panel was controlled by a single `isSidebarOpen` boolean in `page.tsx`, and the project/repo switcher was a `ProjectPicker` dropdown in the panel header. James's design sketch replaced this with: an icon-only projects strip in the icon rail; a file-tree panel that expands on hover and pins on click; and a GitHub selector (repo + branch + sync) in the panel — with all behavior centralized and persisted in Settings.

## 2. Decision

**A single sidebar state machine (`apps/web/src/lib/sidebar.ts`) owns the panel.** Mode is one enum persisted to `localStorage` (`mdninja_sidebar`) and broadcast on the `mdninja:sidebar` event; rail, tree, page, and Settings all read/write that one blob. No scattered booleans.

```
"hidden"  → panel collapsed; only the icon rail shows
"peek"    → transiently open (hover / rail click); closes on intent-out or on file select
"pinned"  → stays open until unpinned; selecting a file does NOT close it
```

| Decision | Choice | Why |
|---|---|---|
| Rail visibility | The **panel** hides; the **rail** always stays | The rail is the way back; hiding it leaves no affordance (VS Code activity-bar pattern). |
| Open behavior | **Hover → "peek"** (default, `hoverExpand`), **click → "pinned"** | Matches the sketch. Hover delays are tuned defaults and configurable, not hardcoded constants scattered in components. |
| File select | **Never pins** — closes "peek", keeps "pinned" | Explicit in the sketch. |
| Settings | Central **Sidebar** tab in SettingsModal reads/writes the same blob | James's rule: all settings central, uniform, persisted. |

**Projects rail strip (icon-only, top of the icon rail).** Connected GitHub repos (from `mdninja_repos`) render as 26px icon-only chips; active repo gets an accent ring. **Drag-and-drop reorder is built in from the start** (native HTML5 DnD), persisted to `mdninja_projects_order` and broadcast on `mdninja:projects-changed`. A trailing `+` chip opens the GitHub settings tab. With 0–1 repos the strip collapses to the single repo icon (no picker noise on a single-repo install). The first project chip is the "project icon" that drives the panel. `ProjectPicker.tsx` is **deleted**; its header role is replaced by the **GitHub selector** row in the panel (active repo, branch, Sync button that re-scans). The search input is kept, moved directly under that header.

## 3. Consequences

One source of truth for panel state means the behavior is uniform and persisted across every surface. The keyboard toggle (`Cmd/Ctrl+B`) maps to the same machine (`forceHide` when open, `togglePinnedFromRail` when hidden). New consumers subscribe to `mdninja:sidebar` instead of threading props.

Harness note: in headless Chromium the rail-bottom avatar sits near the viewport edge and Playwright force-clicks can double-toggle the popover; the state machine itself is verified via dispatched clicks, and a real single user click is the truth.

## 4. 🤖 Agent Enforcement

* Panel state changes ONLY through `lib/sidebar.ts` transitions. Do not add `isSidebarOpen`-style booleans or new mode enums elsewhere.
* Settings writes the same `mdninja_sidebar` blob via `setSidebarState` — never a separate copy.
* Project order persists to `mdninja_projects_order`; the strip stays icon-only (no labels).
* Do not resurrect a separate project-picker dropdown; the rail strip + the panel GitHub selector are the two surfaces.
