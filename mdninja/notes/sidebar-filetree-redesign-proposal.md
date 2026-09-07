# Sidebar & File Tree Redesign — Proposal

Status: **proposal, awaiting owner ratification** (2026-09-07). Read-back of the hand sketch + James's notes. No code written against this yet.

---

## 1. The sketch, read back

The drawing shows the far-left icon rail, fully collapsed, with two columns of glyphs and three zones:

- **Top row:** two icons side by side = *project switcher + project avatar*.
- **Middle:** a vertical stack of ~10 icon pairs = the file-tree section entries.
- **Bottom:** one separated icon = the account **avatar**.
- To the right, a wide empty panel labeled **"GitHub menu selector w branches + Sync button"** — the file tree / GitHub pane that opens from the rail.

James's annotations, paraphrased:

> File tree icon rail is **hidden completely when closed**.
> **Optionally** keep the file-tree panel open (pinned) when the rail collapses.
> **Expand on hover** (over the project icon) — *optional, default*.
> **Click** the project icon to keep the panel open. Selecting a file from the picker does **NOT** keep the panel open.
> — or —
> **No** expand-on-hover: file picker expands on **click**, on the project icon. Or keep the file picker in the project header as-is for manual control.
> **All settings go through the central settings — fully uniform, in parity, persistent, clean, easy.**
> Projects row accepts **.ico / .png / icon only**. Adding many repos makes this useless for a single-repo install — what is the standard approach there?

Three open behavior models are offered (hover-expand / click-pin / header-pinned); we pick and configure through central settings, not hardcode.

---

## 2. Design decisions to ratify

| # | Decision | Options (from sketch) | Recommendation |
|---|----------|----------------------|----------------|
| D1 | Rail visibility when sidebar closed | (a) hidden entirely · (b) visible-as-rail | **(b) keep the rail.** The rail is the affordance that reopens the tree; hiding it removes the way back. Sketch says "hidden" for the *file-tree panel*, not the rail itself. |
| D2 | How the file picker opens | (a) hover over project icon · (b) click project icon · (c) pinned in project header | **(a) hover-expand as default, (b) click-to-pin**, hover delay + intent-out collapse. Matches sketch "OPTIONAL -default". |
| D3 | Pin persistence | session · persisted | **Persisted** via central settings store. |
| D4 | Selecting a file | pins panel · does not pin | **Does not pin** — panel auto-collapses after selection unless explicitly pinned. (Sketck explicit.) |
| D5 | Settings location | inline · central | **Central Settings modal** — one "Sidebar & File Tree" section, uniform + persisted. (Sketch explicit.) |
| D6 | Single-repo installs | always show Projects row · hide when 1 repo | **Hide Projects row when exactly one repo** (noise). Auto-show as soon as ≥2 repos connect. Standard approach (see §5). |

---

## 3. Behavior spec (the model we're aligning on)

**Icon rail (always visible, 46px).** Zones top→bottom: project switcher/avatar → file-tree section icons → (bottom, separated) theme toggle + account avatar. The account avatar + popover shipped this session.

**File-tree panel.** Three states driven by one enum `sidebarMode` (not scattered booleans):

```
"hidden"   → panel fully collapsed, only rail visible
"peek"     → transiently open (hover / rail-icon click), collapses on intent-out or file select
"pinned"   → stays open until user unpins; selecting a file does NOT collapse it
```

Transitions:
- Rail **project icon hover** (with `sidebarMode === "hidden"` and hover-expand enabled) → `"peek"`.
- Rail **project icon click** → toggles `"pinned"` ↔ `"hidden"`. (Click = keep open, per sketch.)
- **File selected** → if `"peek"`, collapse to `"hidden"`; if `"pinned"`, stay.
- **Pointer leaves** panel + rail, after a short out-delay → if `"peek"`, collapse.
- Existing **collapse header button** + `Cmd/Ctrl+B` → force `"hidden"` regardless of pin (explicit user intent wins).

**Pin indicator:** a small filled dot / pin glyph on the project icon when `sidebarMode === "pinned"`.

**Projects row (multi-repo).** Each connected repo = a **24px icon-only** chip (`.ico`/`.png`/favicon, **no label** in the rail). Active repo = accent ring. Overflow scrolls the icon strip. **Hidden entirely when exactly one repo is connected.**

---

## 4. Files touched

New:
- `apps/web/src/lib/sidebar.ts` — the `sidebarMode` state machine + persistence + hover-out delays. Single source; rail/tree/page subscribe via a `mdninja:sidebar` window event (same pattern as `mdninja:icons-changed`).

Edit:
- `apps/web/src/app/page.tsx` — replace `[isSidebarOpen]` boolean with `sidebarMode` from `lib/sidebar.ts`; pass mode + handlers to `IconRail` and the panel.
- `apps/web/src/components/sidebar/IconRail.tsx` — add project-switcher/avatar zone; emit hover/click intents; render pin indicator; render Projects icon strip.
- `apps/web/src/components/sidebar/ProjectPicker.tsx` — becomes the icon-strip + the "GitHub menu selector w/ branches + Sync button" pane content in peek/pinned mode.
- `apps/web/src/components/sidebar/FileTree.tsx` — respects mode; calls `notifyFileSelected()` (collapses peek, keeps pinned).
- `apps/web/src/components/modals/SettingsModal.tsx` — new **Sidebar & File Tree** section (uniform, persisted): hover-expand on/off, out-delay, click-vs-pin behavior, Projects-row visibility.
- `apps/web/src/styles/globals.css` — `.sidebar-panel` states (`hidden/peek/pinned`), rail pin indicator, Projects icon strip.

State contract: one `sidebarMode` enum + a `pinned` boolean persisted to `localStorage` (`mdninja_sidebar`), read centrally from Settings — *not* a new scattering of booleans in `page.tsx`.

---

## 5. Single-repo answer (standard approach)

Do not show a Projects row for one repo. The pattern mature editors use (VS Code, Zed, GitHub Desktop): the project/workspace switcher is **contextual** — invisible or a single static glyph at one workspace, an actual picker only once you have several. So:

- **1 repo:** no Projects row; current repo implied; rail header shows the repo icon alone.
- **≥2 repos:** icon strip appears; active = accent ring; `+` chip to add another.
- Long-term (many repos): the strip scrolls; a hover tooltip names each; the "…" overflow opens the full picker. Icon-only in the rail keeps it compact by design.

This avoids the "useless picker on single-repo installs" slop the sketch calls out while keeping the path to multi-repo clean.

---

## 6. Open questions for James

1. D1/d-rail: sketch says "hidden completely when closed" — confirm the **panel** hides but the **rail** stays (recommend), or do you want the rail gone too with only a hover hot-edge to summon it?
2. Hover-expand default delay: ~150ms in, ~300ms out — acceptable?
3. Projects strip order: connection order, or user-reorderable (drag)? Phase-2 nicety?
4. Does "GitHub menu selector w/ branches + Sync" live **in the file-tree pane header** (recommended, one pane) or as a separate dropdown from the project icon?
