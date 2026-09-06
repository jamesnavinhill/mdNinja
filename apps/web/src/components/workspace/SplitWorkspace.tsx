"use client";

import React, { useState, useEffect } from "react";
import { PanelGroup, Panel as ResizablePanel, PanelResizeHandle } from "react-resizable-panels";
import { Panel } from "./Panel";

interface SplitWorkspaceProps {
  panel1File: string | null;
  panel2File: string | null;
  setPanel1File: (file: string | null) => void;
  setPanel2File: (file: string | null) => void;
  activePanel: "panel1" | "panel2";
  setActivePanel: (panel: "panel1" | "panel2") => void;
  isSplitOpen: boolean;
  setIsSplitOpen: (open: boolean) => void;
}

export const SplitWorkspace: React.FC<SplitWorkspaceProps> = ({
  panel1File,
  panel2File,
  setPanel1File,
  setPanel2File,
  activePanel,
  setActivePanel,
  isSplitOpen,
  setIsSplitOpen,
}) => {
  // Global shortcut: Cmd+\ toggles split panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsSplitOpen(!isSplitOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSplitOpen, setIsSplitOpen]);

  // Ensure panel1 is always active when split panel is closed
  useEffect(() => {
    if (!isSplitOpen && activePanel !== "panel1") {
      setActivePanel("panel1");
    }
  }, [isSplitOpen, activePanel, setActivePanel]);

  const toggleSplit = () => {
    if (!isSplitOpen) {
      // If opening split and panel2 has no file, clone panel1 or open a default
      if (!panel2File) {
        setPanel2File(panel1File);
      }
      setIsSplitOpen(true);
    } else {
      setIsSplitOpen(false);
      setActivePanel("panel1");
    }
  };

  return (
    <div className="workspace-container">
      {isSplitOpen ? (
        <PanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={20}>
            <Panel
              panelId="panel1"
              filePath={panel1File}
              isSplitOpen={true}
              onToggleSplit={toggleSplit}
              isActive={activePanel === "panel1"}
              onFocus={() => setActivePanel("panel1")}
            />
          </ResizablePanel>

          <PanelResizeHandle className="panel-divider" />

          <ResizablePanel defaultSize={50} minSize={20}>
            <Panel
              panelId="panel2"
              filePath={panel2File}
              isSplitOpen={true}
              onToggleSplit={toggleSplit}
              onClosePanel={() => {
                setIsSplitOpen(false);
                setActivePanel("panel1");
              }}
              isActive={activePanel === "panel2"}
              onFocus={() => setActivePanel("panel2")}
            />
          </ResizablePanel>
        </PanelGroup>
      ) : (
        <Panel
          panelId="panel1"
          filePath={panel1File}
          isSplitOpen={false}
          onToggleSplit={toggleSplit}
          isActive={true}
          onFocus={() => setActivePanel("panel1")}
        />
      )}
    </div>
  );
};
