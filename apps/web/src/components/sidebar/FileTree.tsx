"use client";

import React, { useState, useEffect } from "react";
import { FileText, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { FileItem, RepoScanResult } from "@/lib/types";

interface FileTreeProps {
  scanData: RepoScanResult | null;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  targetToFocus: string | null;
}

export const FileTree: React.FC<FileTreeProps> = ({
  scanData,
  activeFile,
  onSelectFile,
  targetToFocus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // When an icon in the rail is clicked, ensure that folder is expanded and scroll to it
  useEffect(() => {
    if (!targetToFocus) return;

    // Expand parent section and target folder
    setCollapsedSections((prev) => {
      const next = { ...prev };
      if (targetToFocus === "projectmd") {
        next["projectmd"] = false;
      } else if (targetToFocus === "docs") {
        next["docs"] = false;
      } else if (targetToFocus === "agents") {
        next[".agents"] = false;
      } else if (targetToFocus === "root") {
        next["root"] = false;
      } else {
        // e.g. "decisions" or "roadmaps" inside projectmd
        next["projectmd"] = false;
        next[`projectmd/${targetToFocus}`] = false;
      }
      return next;
    });

    const el = document.getElementById(`nav-${targetToFocus}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [targetToFocus]);

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

  const { projectmd, docs, agents, rootFiles } = scanData;

  const matchesSearch = (item: FileItem): boolean => {
    if (!searchQuery) return true;
    if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    if (item.children) {
      return item.children.some(matchesSearch);
    }
    return false;
  };

  const renderItem = (item: FileItem, depth = 0) => {
    if (!matchesSearch(item)) return null;

    if (item.isDirectory && item.children) {
      const isCollapsed = collapsedSections[item.relativePath];
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
            <Folder size={12} color="var(--accent)" />
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
        {/* projectmd/ */}
        {projectmd.length > 0 && (
          <div className="tree-section" id="nav-projectmd">
            <div
              className="tree-section-title"
              onClick={() => toggleSection("projectmd")}
            >
              {collapsedSections["projectmd"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>projectmd</span>
            </div>
            {!collapsedSections["projectmd"] &&
              projectmd.map((item) => renderItem(item, 0))}
          </div>
        )}

        {/* docs/ */}
        {docs.length > 0 && (
          <div className="tree-section" id="nav-docs">
            <div
              className="tree-section-title"
              onClick={() => toggleSection("docs")}
            >
              {collapsedSections["docs"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>docs</span>
            </div>
            {!collapsedSections["docs"] &&
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
              {collapsedSections[".agents"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>.agents</span>
            </div>
            {!collapsedSections[".agents"] &&
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
              {collapsedSections["root"] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>{scanData.rootName || "projectmd"}</span>
            </div>
            {!collapsedSections["root"] &&
              rootFiles.map((item) => renderItem(item, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
