"use client";

import React, { useState, useEffect } from "react";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";
import { FileItem, RepoScanResult } from "@/lib/types";
import {
  IconPack,
  NavIconKey,
  getFolderIcon,
  loadIconPack,
  loadIconOverrides,
} from "@/lib/icons";

interface FileTreeProps {
  scanData: RepoScanResult | null;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  targetToFocus: string | null;
}

// Map a folder's name to a semantic nav key (so folder icons follow the registry/overrides).
const FOLDER_KEY_MAP: Record<string, NavIconKey> = {
  audits: "audits",
  changelog: "changelog",
  decisions: "decisions",
  diagrams: "diagrams",
  notes: "notes",
  research: "research",
  roadmaps: "roadmaps",
};

export const FileTree: React.FC<FileTreeProps> = ({
  scanData,
  activeFile,
  onSelectFile,
  targetToFocus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const defaultsAppliedRef = React.useRef(false);

  // Default workspace layout (per design-edits):
  //   - mdninja living canon: EXPANDED (the goods, front and centre)
  //   - docs / .agents / project root: COLLAPSED (tucked out of the way)
  //   - each canon subfolder: COLLAPSED (open on demand), matching the screenshot.
  useEffect(() => {
    if (!scanData || defaultsAppliedRef.current) return;
    defaultsAppliedRef.current = true;
    const canonKey = scanData.canonName || "mdninja";
    const nested: Record<string, boolean> = {};
    (scanData.canon || []).forEach((item) => {
      if (item.isDirectory) nested[item.relativePath] = true; // collapsed by default
    });
    setCollapsedSections((prev) => ({
      [canonKey]: false,       // canon expanded
      docs: true,              // docs collapsed
      ".agents": true,         // .agents collapsed
      root: true,              // project root collapsed
      ...nested,               // each canon subfolder collapsed
      ...prev,                 // respect any manual toggles/seeds already applied
    }));
  }, [scanData]);

  // Icon engine: pack + overrides loaded once.
  const [iconPack, setIconPack] = useState<IconPack>("lucide");
  const [iconOverrides, setIconOverrides] = useState<Partial<Record<NavIconKey, NavIconKey>>>({});
  useEffect(() => {
    const refresh = () => {
      setIconPack(loadIconPack());
      setIconOverrides(loadIconOverrides());
    };
    refresh();
    window.addEventListener("mdninja:icons-changed", refresh);
    return () => window.removeEventListener("mdninja:icons-changed", refresh);
  }, []);

  const folderIconFor = (name: string) => {
    const key = FOLDER_KEY_MAP[name] ?? "folder";
    const Cmp = getFolderIcon(iconPack, key, iconOverrides);
    return <Cmp size={12} color="var(--accent)" />;
  };

  // When an icon in the rail is clicked, ensure that folder is expanded and scroll to it
  useEffect(() => {
    if (!targetToFocus) return;

    const canonKey = scanData?.canonName || "mdninja";

    // Expand parent section and target folder
    setCollapsedSections((prev) => {
      const next = { ...prev };
      if (targetToFocus === "canon" || targetToFocus === "mdninja") {
        next[canonKey] = false;
      } else if (targetToFocus === "docs") {
        next["docs"] = false;
      } else if (targetToFocus === "agents") {
        next[".agents"] = false;
      } else if (targetToFocus === "root") {
        next["root"] = false;
      } else {
        // e.g. "decisions" or "roadmaps" inside canon
        next[canonKey] = false;
        next[`${canonKey}/${targetToFocus}`] = false;
      }
      return next;
    });

    const el = document.getElementById(`nav-${targetToFocus}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [targetToFocus, scanData]);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  if (!scanData) {
    return (
      <div style={{ padding: "14px", color: "var(--text-muted)", fontSize: "12px" }}>
        scanning...
      </div>
    );
  }

  const canonKey = scanData.canonName || "mdninja";
  const canonList = scanData.canon || [];
  const { docs, agents, rootFiles } = scanData;

  const matchesSearch = (item: FileItem): boolean => {
    if (!searchQuery) return true;
    if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    if (item.children) {
      return item.children.some(matchesSearch);
    }
    return false;
  };

  // During an active search, collect every directory that contains a match,
  // so we can force it (and its ancestors) open and surface the matched file.
  const forceOpen = new Set<string>();
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const collect = (item: FileItem, ancestors: string[]): boolean => {
      const selfMatch = item.name.toLowerCase().includes(q);
      let childMatch = false;
      if (item.children) {
        for (const child of item.children) {
          if (collect(child, [...ancestors, item.relativePath])) childMatch = true;
        }
      }
      if (!item.isDirectory) return selfMatch;
      if (selfMatch || childMatch) {
        ancestors.forEach((a) => forceOpen.add(a));
        return true;
      }
      return false;
    };
    [...canonList, ...docs, ...agents, ...rootFiles].forEach((it) => collect(it, []));
  }

  const renderItem = (item: FileItem, depth = 0) => {
    if (!matchesSearch(item)) return null;

    if (item.isDirectory && item.children) {
      const isCollapsed = !!collapsedSections[item.relativePath] && !forceOpen.has(item.relativePath);
      // Target id for rail navigation (e.g. nav-decisions, nav-roadmaps)
      const folderKey = item.name;

      return (
        <div key={item.relativePath} id={`nav-${folderKey}`}>
          <div
            className="tree-item"
            style={{ paddingLeft: `${14 + depth * 10}px` }}
            onClick={() => toggleSection(item.relativePath)}
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            {folderIconFor(item.name)}
            <span>{item.name}</span>
          </div>
          {!isCollapsed && item.children.map((child) => renderItem(child, depth + 1))}
        </div>
      );
    }

    const isActive = activeFile === item.relativePath;

    return (
      <div
        key={item.relativePath}
        className={`tree-item ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${22 + depth * 10}px` }}
        onClick={() => onSelectFile(item.relativePath)}
        title={item.relativePath}
      >
        <FileText size={12} color={isActive ? "var(--accent)" : "var(--text-secondary)"} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </span>
      </div>
    );
  };

  // A section is force-open during search if any of its descendants match.
  const sectionOpen = (sectionKey: string, items: FileItem[]): boolean => {
    if (!searchQuery) return !collapsedSections[sectionKey];
    return items.some(matchesSearch) ? true : !collapsedSections[sectionKey];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="filter files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="file-tree-container">
        {/* Living Canon (mdninja/ or custom) */}
        {canonList.length > 0 && (
          <div className="tree-section" id={`nav-${canonKey}`}>
            <div
              className="tree-section-title"
              onClick={() => toggleSection(canonKey)}
            >
              {!sectionOpen(canonKey, canonList) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>{canonKey}</span>
            </div>
            {sectionOpen(canonKey, canonList) &&
              canonList.map((item) => renderItem(item, 0))}
          </div>
        )}

        {/* docs/ */}
        {docs.length > 0 && (
          <div className="tree-section" id="nav-docs">
            <div
              className="tree-section-title"
              onClick={() => toggleSection("docs")}
            >
              {!sectionOpen("docs", docs) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>docs</span>
            </div>
            {sectionOpen("docs", docs) &&
              docs.map((item) => renderItem(item, 0))}
          </div>
        )}

        {/* .agents/ */}
        {agents.length > 0 && (
          <div className="tree-section" id="nav-agents">
            <div
              className="tree-section-title"
              onClick={() => toggleSection(".agents")}
            >
              {!sectionOpen(".agents", agents) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>.agents</span>
            </div>
            {sectionOpen(".agents", agents) &&
              agents.map((item) => renderItem(item, 0))}
          </div>
        )}

        {/* Root Directory Files */}
        {rootFiles.length > 0 && (
          <div className="tree-section" id="nav-root">
            <div
              className="tree-section-title"
              onClick={() => toggleSection("root")}
            >
              {!sectionOpen("root", rootFiles) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>{scanData.rootName || "mdninja"}</span>
            </div>
            {sectionOpen("root", rootFiles) &&
              rootFiles.map((item) => renderItem(item, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
