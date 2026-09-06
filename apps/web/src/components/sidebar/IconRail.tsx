"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  ShieldCheck,
  History,
  GitFork,
  Network,
  StickyNote,
  Compass,
  Milestone,
  CheckSquare,
  BookOpen,
  Bot,
  FileCode,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export type RailTarget =
  | "projectmd"
  | "audits"
  | "changelog"
  | "decisions"
  | "diagrams"
  | "notes"
  | "research"
  | "roadmaps"
  | "standards"
  | "docs"
  | "agents"
  | "root";

interface IconRailProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTarget: RailTarget | null;
  onSelectTarget: (target: RailTarget) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSettings: (tab?: "config" | "github" | "diagrams" | "themes") => void;
  rootName?: string;
}

interface RailItemDef {
  key: RailTarget;
  label: string;
  icon: React.ReactNode;
}

const PROJECTMD_ITEMS: RailItemDef[] = [
  { key: "projectmd", label: "projectmd/", icon: <Folder size={15} /> },
  { key: "audits", label: "audits", icon: <ShieldCheck size={15} /> },
  { key: "changelog", label: "changelog", icon: <History size={15} /> },
  { key: "decisions", label: "decisions", icon: <GitFork size={15} /> },
  { key: "diagrams", label: "diagrams", icon: <Network size={15} /> },
  { key: "notes", label: "notes", icon: <StickyNote size={15} /> },
  { key: "research", label: "research", icon: <Compass size={15} /> },
  { key: "roadmaps", label: "roadmaps", icon: <Milestone size={15} /> },
  { key: "standards", label: "standards", icon: <CheckSquare size={15} /> },
];

export const IconRail: React.FC<IconRailProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  activeTarget,
  onSelectTarget,
  theme,
  onToggleTheme,
  onOpenSettings,
  rootName,
}) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const otherItems: RailItemDef[] = [
    { key: "docs", label: "docs/", icon: <BookOpen size={15} /> },
    { key: "agents", label: ".agents/", icon: <Bot size={15} /> },
    { key: "root", label: rootName || "projectmd", icon: <FileCode size={15} /> },
  ];

  // Close profile popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  return (
    <aside className="icon-rail">
      {/* Top 38px Header matching page header height */}
      <div className="rail-header">
        <button
          type="button"
          className="rail-btn"
          onClick={onToggleSidebar}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{ width: "30px", height: "30px" }}
        >
          {isLogoHovered ? (
            isSidebarOpen ? (
              <PanelLeftClose size={16} color="var(--accent)" />
            ) : (
              <PanelLeftOpen size={16} color="var(--accent)" />
            )
          ) : (
            // mdNinja custom SVG Logo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
                fill="var(--accent)"
                stroke="var(--accent)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.2" fill="var(--bg-secondary)" />
            </svg>
          )}
        </button>
      </div>

      {/* Directory Navigation Icons: starts right under header naturally */}
      <div className="rail-group rail-nav">
        {PROJECTMD_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`rail-btn ${activeTarget === item.key ? "active" : ""}`}
            onClick={() => onSelectTarget(item.key)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}

        <div className="rail-separator" />

        {otherItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`rail-btn ${activeTarget === item.key ? "active" : ""}`}
            onClick={() => onSelectTarget(item.key)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Bottom Group: Theme Toggle & Profile Avatar */}
      <div className="rail-group rail-bottom" ref={profileRef}>
        <button
          type="button"
          className="rail-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Avatar Profile Button */}
        <button
          type="button"
          className="rail-btn"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          title="Account & Configurations"
          style={{ position: "relative" }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "10.5px",
              fontWeight: 700,
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            }}
          >
            MD
          </div>
        </button>

        {/* Profile Popover Menu */}
        {isProfileOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "52px",
              width: "220px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              padding: "6px",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                James Hill
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                james@github &bull; Pro
              </div>
            </div>

            <button
              type="button"
              className="action-btn"
              style={{ justifyContent: "flex-start", width: "100%", padding: "6px 8px" }}
              onClick={() => {
                setIsProfileOpen(false);
                onOpenSettings();
              }}
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>

            <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

            <button
              type="button"
              className="action-btn"
              style={{ justifyContent: "flex-start", width: "100%", padding: "6px 8px", color: "var(--danger)" }}
              onClick={() => setIsProfileOpen(false)}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
