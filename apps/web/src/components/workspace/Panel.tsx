"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Code, Save, Columns, Check, Loader2 } from "lucide-react";
import { BlockEditor } from "../editor/BlockEditor";
import canonData from "@/lib/canon-data.json";

interface PanelProps {
  panelId: "panel1" | "panel2";
  filePath: string | null;
  isSplitOpen: boolean;
  onToggleSplit: () => void;
  isActive: boolean;
  onFocus: () => void;
}

export const Panel: React.FC<PanelProps> = ({
  panelId,
  filePath,
  isSplitOpen,
  onToggleSplit,
  isActive,
  onFocus,
}) => {
  const fallback = filePath ? (canonData.contents as Record<string, string>)[filePath] || "" : "";
  const [content, setContent] = useState<string>(fallback);
  const [originalContent, setOriginalContent] = useState<string>(fallback);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const savedToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!fallback && !!filePath);
  const [error, setError] = useState<string | null>(null);

  // Flash a "saved" confirmation that auto-hides after a short delay.
  const flashSaved = useCallback(() => {
    setShowSavedToast(true);
    if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
    savedToastTimer.current = setTimeout(() => setShowSavedToast(false), 1600);
  }, []);

  useEffect(() => {
    return () => {
      if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
    };
  }, []);

  // Load file content whenever filePath changes
  useEffect(() => {
    if (!filePath) {
      setContent("");
      setOriginalContent("");
      return;
    }

    const initial = (canonData.contents as Record<string, string>)[filePath];
    if (initial !== undefined) {
      setContent(initial);
      setOriginalContent(initial);
    }

    let isMounted = true;
    if (!initial) {
      setIsLoading(true);
    }
    setError(null);

    fetch(`/api/content?path=${encodeURIComponent(filePath)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load file");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setContent(data.content);
          setOriginalContent(data.content);
          setSaveStatus("saved");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  // Handle Save
  const handleSave = useCallback(async () => {
    if (!filePath || saveStatus === "saving") return;

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setOriginalContent(content);
      setSaveStatus("saved");
      flashSaved();
    } catch (err) {
      setSaveStatus("unsaved");
      setError("Failed to save changes to disk");
    }
  }, [filePath, content, saveStatus, flashSaved]);

  // Listen for Cmd+S shortcut globally when panel is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleContentChange = (newText: string) => {
    setContent(newText);
    if (newText !== originalContent) {
      setSaveStatus("unsaved");
    } else {
      setSaveStatus("saved");
    }
  };

  const breadcrumbParts = filePath ? filePath.split("/") : [];

  return (
    <div
      className="workspace-panel"
      onClick={onFocus}
      style={{
        outline: isActive ? "1px solid var(--accent-subtle)" : "none",
        outlineOffset: "-1px",
      }}
    >
      <div className="panel-toolbar">
        <div className="breadcrumb">
          {breadcrumbParts.length > 0 ? (
            breadcrumbParts.map((part, i) => (
              <React.Fragment key={i}>
                <span className={i === breadcrumbParts.length - 1 ? "breadcrumb-active" : ""}>
                  {part}
                </span>
                {i < breadcrumbParts.length - 1 && <span>/</span>}
              </React.Fragment>
            ))
          ) : (
            <span style={{ fontStyle: "italic" }}>No document open</span>
          )}
        </div>

        <div className="panel-actions">
          {filePath && (
            <>
              {saveStatus === "saving" ? (
                <span className="status-pill status-unsaved" style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Loader2 size={10} className="spin" /> saving
                </span>
              ) : saveStatus === "unsaved" ? (
                <button type="button" className="action-btn" onClick={handleSave} title="Save to disk (Cmd+S)">
                  <Save size={12} color="var(--warning)" />
                  <span className="status-pill status-unsaved">Save</span>
                </button>
              ) : showSavedToast ? (
                <span className="status-pill status-saved save-toast" style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Check size={10} /> saved
                </span>
              ) : null}

              <button
                type="button"
                className={`action-btn ${isEditMode ? "active" : ""}`}
                onClick={() => setIsEditMode(!isEditMode)}
                title={isEditMode ? "Switch to Preview View" : "Edit Raw Markdown"}
              >
                {isEditMode ? <Eye size={13} /> : <Code size={13} />}
              </button>
            </>
          )}

          <button
            type="button"
            className="action-btn"
            onClick={onToggleSplit}
            title={isSplitOpen ? "Single Panel Mode (Cmd+\\)" : "Split into Two Equal Panels (Cmd+\\)"}
          >
            <Columns size={13} />
          </button>
        </div>
      </div>

      <div className="panel-content">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--text-muted)" }}>
            Loading document...
          </div>
        ) : error ? (
          <div style={{ padding: "32px", color: "var(--danger)", textAlign: "center" }}>
            {error}
          </div>
        ) : filePath ? (
          <BlockEditor
            content={content}
            isEditMode={isEditMode}
            onChange={handleContentChange}
            onSave={handleSave}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--text-muted)", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: 500 }}>Select a file from the explorer</span>
            <span style={{ fontSize: "12px" }}>Open in this panel or split side-by-side</span>
          </div>
        )}
      </div>
    </div>
  );
};
