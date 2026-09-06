import React from "react";
import {
  Folder as LucideFolder,
  ShieldCheck,
  History,
  GitFork,
  Network,
  StickyNote,
  Compass,
  Milestone,
  Folder,
  FileText,
  type LucideIcon,
} from "lucide-react";
import {
  Folder as PhFolder,
  ShieldCheck as PhShieldCheck,
  ClockClockwise as PhHistory,
  GitFork as PhGitFork,
  Graph as PhNetwork,
  Note as PhStickyNote,
  MapPin as PhCompass,
  FlagBanner as PhMilestone,
  FileText as PhFileText,
  type Icon as PhIcon,
} from "@phosphor-icons/react";

export type IconPack = "lucide" | "phosphor";

/**
 * Central icon registry. Consumers ask for an icon by semantic key,
 * and the active pack resolves the concrete component.
 */
export type NavIconKey =
  | "folder"
  | "file"
  | "audits"
  | "changelog"
  | "decisions"
  | "diagrams"
  | "notes"
  | "research"
  | "roadmaps";

interface PackEntry {
  folder: LucideIcon;
  file: LucideIcon;
  audits: LucideIcon;
  changelog: LucideIcon;
  decisions: LucideIcon;
  diagrams: LucideIcon;
  notes: LucideIcon;
  research: LucideIcon;
  roadmaps: LucideIcon;
}

const LUCIDE_PACK: PackEntry = {
  folder: LucideFolder,
  file: FileText,
  audits: ShieldCheck,
  changelog: History,
  decisions: GitFork,
  diagrams: Network,
  notes: StickyNote,
  research: Compass,
  roadmaps: Milestone,
};

const PHOSPHOR_PACK: PackEntry = {
  folder: PhFolder as unknown as LucideIcon,
  file: PhFileText as unknown as LucideIcon,
  audits: PhShieldCheck as unknown as LucideIcon,
  changelog: PhHistory as unknown as LucideIcon,
  decisions: PhGitFork as unknown as LucideIcon,
  diagrams: PhNetwork as unknown as LucideIcon,
  notes: PhStickyNote as unknown as LucideIcon,
  research: PhCompass as unknown as LucideIcon,
  roadmaps: PhMilestone as unknown as LucideIcon,
};

export const ICON_PACKS: Record<IconPack, PackEntry> = {
  lucide: LUCIDE_PACK,
  phosphor: PHOSPHOR_PACK,
};

/** Resolve the component for a semantic nav icon in the active pack. */
export function getNavIcon(pack: IconPack, key: NavIconKey): LucideIcon {
  return ICON_PACKS[pack][key];
}

/* ---------- Persisted preferences (pack + per-folder overrides) ---------- */

const PACK_KEY = "mdninja_icon_pack";
const OVERRIDE_KEY = "mdninja_icon_overrides";

export function loadIconPack(): IconPack {
  try {
    const v = localStorage.getItem(PACK_KEY);
    return v === "phosphor" ? "phosphor" : "lucide";
  } catch {
    return "lucide";
  }
}
export function saveIconPack(pack: IconPack) {
  try {
    localStorage.setItem(PACK_KEY, pack);
  } catch {
    /* ignore */
  }
}

/** Folder icon overrides keyed by semantic nav key. */
export function loadIconOverrides(): Partial<Record<NavIconKey, NavIconKey>> {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
export function saveIconOverrides(o: Partial<Record<NavIconKey, NavIconKey>>) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

/** Resolve a folder's icon, honoring a user override if one exists. */
export function getFolderIcon(
  pack: IconPack,
  key: NavIconKey,
  overrides: Partial<Record<NavIconKey, NavIconKey>>
): LucideIcon {
  const resolved = overrides[key] ?? key;
  return getNavIcon(pack, resolved);
}
