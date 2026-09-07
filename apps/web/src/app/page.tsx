"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IconRail, RailTarget } from "@/components/sidebar/IconRail";
import { FileTree } from "@/components/sidebar/FileTree";
import { SplitWorkspace } from "@/components/workspace/SplitWorkspace";
import { SettingsModal, SettingsTab } from "@/components/modals/SettingsModal";
import { RepoScanResult, getFirstDocInDirectory } from "@/lib/types";
import {
  loadSidebarState,
  isPanelOpen,
  forceHide,
  togglePinnedFromRail,
  peekCloseOnIntentOut,
  SIDEBAR_EVENT,
  type SidebarMode,
} from "@/lib/sidebar";
import canonData from "@/lib/canon-data.json";

export default function WorkspacePage() {
  const [scanData, setScanData] = useState<RepoScanResult | null>(
    (canonData.scanResult as RepoScanResult) || null
  );
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("hidden");
  const [sidebarSettings, setSidebarSettings] = useState(() => loadSidebarState());
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

  // Subscribe to sidebar state changes
  useEffect(() => {
    const loadState = () => {
      const state = loadSidebarState();
      setSidebarMode(state.mode);
      setSidebarSettings(state);
    };
    loadState();
    window.addEventListener(SIDEBAR_EVENT, loadState);
    return () => window.removeEventListener(SIDEBAR_EVENT, loadState);
  }, []);

  // Global hotkey: Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isPanelOpen(sidebarMode)) {
          forceHide();
        } else {
          togglePinnedFromRail();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarMode]);

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

    const topDoc = getFirstDocInDirectory(target, scanData);
    if (topDoc) {
      handleSelectFile(topDoc);
    }
  };

  // Hover intent handlers for sidebar panel
  const [pointerTimerRef] = useState<{ current: NodeJS.Timeout | null }>({ current: null });

  const handlePointerEnter = () => {
    if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
  };

  const handlePointerLeave = () => {
    if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
    pointerTimerRef.current = setTimeout(() => {
      peekCloseOnIntentOut();
    }, sidebarSettings.hoverOutDelayMs);
  };

  const handleOpenSettings = (tab?: SettingsTab) => {
    if (tab) {
      setSettingsTab(tab);
    }
    setIsSettingsOpen(true);
  };

  const currentActiveFile = (!isSplitOpen || activePanel === "panel1") ? panel1File : panel2File;
  const isSidebarPanelOpen = isPanelOpen(sidebarMode);

  return (
    <main className="app-container">
      {/* Icon Rail + Sidebar Panel Wrapper for pointer-intent detection */}
      <div
        className="sidebar-wrapper"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {/* Icon Rail with projects strip, directory navigation, theme toggle & avatar profile popover */}
        <IconRail
          activeTarget={activeTarget}
          onSelectTarget={handleSelectTarget}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={handleOpenSettings}
          rootName={scanData?.rootName}
          canonName={scanData?.canonName}
          sidebarMode={sidebarMode}
          sidebarSettings={sidebarSettings}
        />

        {/* Collapsible Sidebar */}
        <aside className={`sidebar-panel ${isSidebarPanelOpen ? "" : "collapsed"}`}>
          {/* Dynamic File Tree with GitHub selector header + search */}
          <FileTree
            scanData={scanData}
            activeFile={currentActiveFile}
            onSelectFile={handleSelectFile}
            targetToFocus={targetToFocus}
            onSync={fetchFiles}
          />
        </aside>
      </div>

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
