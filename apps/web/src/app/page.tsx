"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IconRail, RailTarget } from "@/components/sidebar/IconRail";
import { FileTree } from "@/components/sidebar/FileTree";
import { ProjectPicker } from "@/components/sidebar/ProjectPicker";
import { SplitWorkspace } from "@/components/workspace/SplitWorkspace";
import { SettingsModal, SettingsTab } from "@/components/modals/SettingsModal";
import { RepoScanResult, getFirstDocInDirectory } from "@/lib/types";
import canonData from "@/lib/canon-data.json";

export default function WorkspacePage() {
  const [scanData, setScanData] = useState<RepoScanResult | null>(
    (canonData.scanResult as RepoScanResult) || null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTarget, setActiveTarget] = useState<RailTarget | null>("roadmaps");
  const [targetToFocus, setTargetToFocus] = useState<string | null>(null);

  // Dual Panel State
  const [panel1File, setPanel1File] = useState<string | null>(() => {
    const defaultData = canonData.scanResult as RepoScanResult;
    const canonName = defaultData?.canonName || "mdninja";
    const preferred = `${canonName}/roadmaps/roadmap.md`;
    if (canonData.contents && (canonData.contents as Record<string, string>)[preferred]) {
      return preferred;
    }
    return (
      getFirstDocInDirectory("roadmaps", defaultData) ||
      getFirstDocInDirectory("canon", defaultData) ||
      Object.keys(canonData.contents || {})[0] ||
      null
    );
  });
  const [panel2File, setPanel2File] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"panel1" | "panel2">("panel1");
  const [isSplitOpen, setIsSplitOpen] = useState(false);

  // Settings & Styling State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("themes");
  const [accentColor, setAccentColor] = useState("#cea1ce");
  const [fontFamily, setFontFamily] = useState("-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.65);
  const [maxWidth, setMaxWidth] = useState(960);
  const [activeTheme, setActiveTheme] = useState("default");

  // Dynamic CSS variables binding for user preferences (typography & custom accent)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--font-sans", fontFamily);
    root.style.setProperty("--font-size-md", `${fontSize}px`);
    root.style.setProperty("--line-height-md", `${lineHeight}`);
    root.style.setProperty("--max-width-md", `${maxWidth}px`);
  }, [accentColor, fontFamily, fontSize, lineHeight, maxWidth]);

  // Handle curated palette selection (clean data-palette attribute, preserving dark & light themes)
  const handleThemeSelect = (themeKey: string) => {
    setActiveTheme(themeKey);
    const root = document.documentElement;
    if (themeKey === "default") {
      root.removeAttribute("data-palette");
    } else {
      root.setAttribute("data-palette", themeKey);
    }
  };

  // Fetch repository structure
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to scan repository");
      const data: RepoScanResult = await res.json();
      setScanData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Global hotkey: Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // User selects a file: ALWAYS load in panel1 when split is closed!
  const handleSelectFile = useCallback((filePath: string) => {
    if (!isSplitOpen || activePanel === "panel1") {
      setPanel1File(filePath);
    } else {
      setPanel2File(filePath);
    }
  }, [isSplitOpen, activePanel]);

  // Listen for internal markdown link clicks from MarkdownRenderer
  useEffect(() => {
    const handleOpenFile = (e: CustomEvent<{ path: string }>) => {
      if (e.detail?.path) {
        handleSelectFile(e.detail.path);
      }
    };
    window.addEventListener("mdninja:open-file" as any, handleOpenFile as any);
    return () => window.removeEventListener("mdninja:open-file" as any, handleOpenFile as any);
  }, [handleSelectFile]);

  // Sidebar icon rail click: dynamic navigation to top doc in target directory
  const handleSelectTarget = (target: RailTarget) => {
    setActiveTarget(target);
    setTargetToFocus(target);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }

    const topDoc = getFirstDocInDirectory(target, scanData);
    if (topDoc) {
      handleSelectFile(topDoc);
    }
  };

  const handleOpenSettings = (tab?: SettingsTab) => {
    if (tab) {
      setSettingsTab(tab);
    }
    setIsSettingsOpen(true);
  };

  const currentActiveFile = (!isSplitOpen || activePanel === "panel1") ? panel1File : panel2File;

  return (
    <main className="app-container">
      {/* Icon Rail with collapse hover, directory navigation, theme toggle & avatar profile popover */}
      <IconRail
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        activeTarget={activeTarget}
        onSelectTarget={handleSelectTarget}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={handleOpenSettings}
        rootName={scanData?.rootName}
        canonName={scanData?.canonName}
      />

      {/* Collapsible Sidebar */}
      <aside className={`sidebar-panel ${isSidebarOpen ? "" : "collapsed"}`}>
        {/* Header matches 38px height with Project / Repo Picker */}
        <div className="sidebar-header">
          <ProjectPicker
            currentProject={scanData?.rootName || "mdninja"}
            onOpenGithubSettings={() => handleOpenSettings("github")}
          />
        </div>

        {/* Search Bar & Dynamic File Tree */}
        <FileTree
          scanData={scanData}
          activeFile={currentActiveFile}
          onSelectFile={handleSelectFile}
          targetToFocus={targetToFocus}
        />
      </aside>

      {/* Dual Equal Panel Workspace */}
      <SplitWorkspace
        panel1File={panel1File}
        panel2File={panel2File}
        setPanel1File={setPanel1File}
        setPanel2File={setPanel2File}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        isSplitOpen={isSplitOpen}
        setIsSplitOpen={setIsSplitOpen}
      />

      {/* Settings & Account Configurations Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
        accentColor={accentColor}
        onAccentChange={setAccentColor}
        fontFamily={fontFamily}
        onFontChange={setFontFamily}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
        maxWidth={maxWidth}
        onMaxWidthChange={setMaxWidth}
        activeTheme={activeTheme}
        onThemeSelect={handleThemeSelect}
      />
    </main>
  );
}
