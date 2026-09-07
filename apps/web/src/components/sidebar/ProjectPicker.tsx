"use client";

import React, { useState, useRef, useEffect } from "react";
import { Folder, ChevronDown, Check, Plus, ExternalLink } from "lucide-react";

interface ProjectPickerProps {
  currentProject: string;
  onOpenGithubSettings: () => void;
}

export const ProjectPicker: React.FC<ProjectPickerProps> = ({
  currentProject,
  onOpenGithubSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const projects = [
    { name: currentProject, active: true, branch: "main" },
  ];

  return (
    <div style={{ position: "relative", width: "100%" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 8px",
          backgroundColor: isOpen ? "var(--bg-tertiary)" : "transparent",
          border: "1px solid",
          borderColor: isOpen ? "var(--border-medium)" : "transparent",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-primary)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "7px", overflow: "hidden" }}>
          <Folder size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentProject}
          </span>
        </div>
        <ChevronDown
          size={12}
          color="var(--text-muted)"
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "34px",
            left: 0,
            width: "230px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            padding: "6px",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div
            style={{
              padding: "4px 8px 6px 8px",
              fontSize: "10.5px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Repositories
          </div>

          {projects.map((proj) => (
            <button
              key={proj.name}
              type="button"
              onClick={() => setIsOpen(false)}
              className="action-btn"
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "6px 8px",
                backgroundColor: proj.active ? "var(--accent-subtle)" : "transparent",
                color: proj.active ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Folder size={12} />
                <span style={{ fontSize: "12px", fontWeight: proj.active ? 600 : 400 }}>
                  {proj.name}
                </span>
              </div>
              {proj.active && <Check size={12} color="var(--accent)" />}
            </button>
          ))}

          <div
            style={{
              height: "1px",
              backgroundColor: "var(--border-subtle)",
              margin: "4px 0",
            }}
          />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenGithubSettings();
            }}
            className="action-btn"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              padding: "6px 8px",
              color: "var(--text-primary)",
            }}
          >
            <Plus size={13} color="var(--accent)" />
            <span style={{ fontSize: "11.5px" }}>Connect Repository...</span>
          </button>
        </div>
      )}
    </div>
  );
};
