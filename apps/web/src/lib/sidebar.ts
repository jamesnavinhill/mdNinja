"use client";

/**
 * Sidebar state machine — single source of truth for the file-tree panel.
 *
 * Three modes:
 *  - "hidden": panel fully collapsed; only the icon rail is visible.
 *  - "peek":   transiently open (hover / rail-icon click). Collapses on intent-out
 *              or when a file is selected. The default drive-by browsing mode.
 *  - "pinned": stays open until the user unpins. Selecting a file does NOT collapse it.
 *
 * The whole app reads/writes ONE persisted blob (`mdninja_sidebar`) through this
 * module and subscribes to the `mdninja:sidebar` window event — never a scattering
 * of `isSidebarOpen` booleans. Settings writes the same blob, so behavior is uniform
 * and persisted across the rail, the tree, and the settings surface.
 */

export type SidebarMode = "hidden" | "peek" | "pinned";

export interface SidebarSettings {
  /** Expand the panel on hover over the project icon (default true). */
  hoverExpand: boolean;
  /** Delay before hover opens the panel (ms). */
  hoverInDelayMs: number;
  /** Delay before pointer-out collapses a "peek" panel (ms). */
  hoverOutDelayMs: number;
}

export interface SidebarState extends SidebarSettings {
  mode: SidebarMode;
}

const KEY = "mdninja_sidebar";
const EVENT = "mdninja:sidebar";

export const DEFAULT_SIDEBAR: SidebarState = {
  mode: "hidden",
  hoverExpand: true,
  hoverInDelayMs: 150,
  hoverOutDelayMs: 300,
};

export function loadSidebarState(): SidebarState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SIDEBAR };
    const parsed = JSON.parse(raw) as Partial<SidebarState>;
    return {
      mode:
        parsed.mode === "peek" || parsed.mode === "pinned" || parsed.mode === "hidden"
          ? parsed.mode
          : DEFAULT_SIDEBAR.mode,
      hoverExpand: typeof parsed.hoverExpand === "boolean" ? parsed.hoverExpand : DEFAULT_SIDEBAR.hoverExpand,
      hoverInDelayMs:
        typeof parsed.hoverInDelayMs === "number" ? parsed.hoverInDelayMs : DEFAULT_SIDEBAR.hoverInDelayMs,
      hoverOutDelayMs:
        typeof parsed.hoverOutDelayMs === "number" ? parsed.hoverOutDelayMs : DEFAULT_SIDEBAR.hoverOutDelayMs,
    };
  } catch {
    return { ...DEFAULT_SIDEBAR };
  }
}

function persist(state: SidebarState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable */
  }
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function setSidebarState(next: Partial<SidebarState>) {
  const merged = { ...loadSidebarState(), ...next };
  persist(merged);
  notify();
}

/* ---------------- Derived transitions (the only ways mode changes) ---------------- */

/** Rail project-icon clicked: pin if not pinned, else hide. */
export function togglePinnedFromRail() {
  const s = loadSidebarState();
  setSidebarState({ mode: s.mode === "pinned" ? "hidden" : "pinned" });
}

/** Rail project-icon (or any rail target) intended to transiently open the panel. */
export function peekOpen() {
  const s = loadSidebarState();
  if (s.mode === "hidden") setSidebarState({ mode: "peek" });
}

/** Pointer left the panel+rail zone: collapse only a transient "peek". */
export function peekCloseOnIntentOut() {
  const s = loadSidebarState();
  if (s.mode === "peek") setSidebarState({ mode: "hidden" });
}

/** A file was selected in the tree: collapse "peek", keep "pinned". */
export function notifyFileSelected() {
  const s = loadSidebarState();
  if (s.mode === "peek") setSidebarState({ mode: "hidden" });
}

/** Explicit user collapse (Cmd/Ctrl+B or header button): hide regardless of mode. */
export function forceHide() {
  setSidebarState({ mode: "hidden" });
}

/** React helper: is the panel visible? */
export function isPanelOpen(mode: SidebarMode): boolean {
  return mode !== "hidden";
}

export { EVENT as SIDEBAR_EVENT, KEY as SIDEBAR_STORAGE_KEY };
