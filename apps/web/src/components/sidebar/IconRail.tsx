"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CheckSquare,
  BookOpen,
  Bot,
  FileCode,
  Sun,
  Moon,
  Settings,
  LogOut,
  Github,
  Plus,
  Folder,
} from "lucide-react";
import {
  IconPack,
  NavIconKey,
  getFolderIcon,
  loadIconPack,
  loadIconOverrides,
} from "@/lib/icons";
import {
  togglePinnedFromRail,
  peekOpen,
  type SidebarMode,
  type SidebarSettings,
} from "@/lib/sidebar";
import type { SettingsTab } from "@/components/modals/SettingsModal";

export type RailTarget =
  | "canon"
  | "mdninja"
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
  activeTarget: RailTarget | null;
  onSelectTarget: (target: RailTarget) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSettings: (tab?: SettingsTab) => void;
  rootName?: string;
  canonName?: string;
  sidebarMode: SidebarMode;
  sidebarSettings: SidebarSettings;
}

interface GitHubRepo {
  name: string;
  fullName: string;
  active: boolean;
  branch?: string;
  iconUrl?: string;
}

interface RailItemDef {
  key: RailTarget;
  label: string;
  icon: React.ReactNode;
}

export const IconRail: React.FC<IconRailProps> = ({
  activeTarget,
  onSelectTarget,
  theme,
  onToggleTheme,
  onOpenSettings,
  rootName,
  canonName = "mdninja",
  sidebarMode,
  sidebarSettings,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // GitHub repos for the projects strip
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [projectsOrder, setProjectsOrder] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadRepos = () => {
      try {
        const raw = localStorage.getItem("mdninja_repos");
        const repoList: GitHubRepo[] = raw ? JSON.parse(raw) : [];
        setRepos(repoList);

        const orderRaw = localStorage.getItem("mdninja_projects_order");
        const order: string[] = orderRaw ? JSON.parse(orderRaw) : [];
        setProjectsOrder(order);
      } catch {
        setRepos([]);
        setProjectsOrder([]);
      }
    };
    loadRepos();
    window.addEventListener("mdninja:projects-changed", loadRepos);
    window.addEventListener("mdninja:repos-changed", loadRepos);
    return () => {
      window.removeEventListener("mdninja:projects-changed", loadRepos);
      window.removeEventListener("mdninja:repos-changed", loadRepos);
    };
  }, []);

  // Real connected GitHub identity (browser-local, zero server retention — ADR 0004).
  const [ghUser, setGhUser] = useState<{ username: string; name: string; avatar: string } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("mdninja_gh_accounts");
        if (!raw) { setGhUser(null); return; }
        const accounts = JSON.parse(raw);
        const primary = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        setGhUser(primary ? { username: primary.username, name: primary.name || primary.username, avatar: primary.avatar || "" } : null);
      } catch {
        setGhUser(null);
      }
    };
    loadUser();
    // Refresh when OAuth completes, the profile opens, or storage changes.
    window.addEventListener("mdninja:gh-accounts-changed", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("mdninja:gh-accounts-changed", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("mdninja_gh_accounts");
      localStorage.removeItem("mdninja_repos");
    } catch {
      //
    }
    window.dispatchEvent(new Event("mdninja:gh-accounts-changed"));
    setGhUser(null);
    setIsProfileOpen(false);
  };

  // Avatar fallback: initials derived from the real name/username.
  const initials = ghUser
    ? (ghUser.name || ghUser.username)
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  // Icon engine: active pack + per-folder overrides (persisted).
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

  const navIcon = (key: NavIconKey) => {
    const Cmp = getFolderIcon(iconPack, key, iconOverrides);
    return <Cmp size={15} />;
  };

  const canonItems: RailItemDef[] = [
    { key: "canon", label: `${canonName}/`, icon: navIcon("folder") },
    { key: "audits", label: "audits", icon: navIcon("audits") },
    { key: "changelog", label: "changelog", icon: navIcon("changelog") },
    { key: "decisions", label: "decisions", icon: navIcon("decisions") },
    { key: "diagrams", label: "diagrams", icon: navIcon("diagrams") },
    { key: "notes", label: "notes", icon: navIcon("notes") },
    { key: "research", label: "research", icon: navIcon("research") },
    { key: "roadmaps", label: "roadmaps", icon: navIcon("roadmaps") },
    { key: "standards", label: "standards", icon: <CheckSquare size={15} /> },
  ];

  const otherItems: RailItemDef[] = [
    { key: "docs", label: "docs/", icon: <BookOpen size={15} /> },
    { key: "agents", label: ".agents/", icon: <Bot size={15} /> },
    { key: "root", label: rootName || "mdninja", icon: <FileCode size={15} /> },
  ];

  // Ordered repos for display
  const orderedRepos = React.useMemo(() => {
    if (projectsOrder.length === 0 || repos.length === 0) return repos;
    const indexed = new Map(repos.map((r) => [r.fullName, r]));
    const ordered: GitHubRepo[] = [];
    projectsOrder.forEach((fullName) => {
      const repo = indexed.get(fullName);
      if (repo) {
        ordered.push(repo);
        indexed.delete(fullName);
      }
    });
    indexed.forEach((repo) => ordered.push(repo));
    return ordered;
  }, [repos, projectsOrder]);

  // Drag-and-drop handlers for project chips
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...orderedRepos];
    const [draggedRepo] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedRepo);
    const newOrderNames = newOrder.map((r) => r.fullName);
    setProjectsOrder(newOrderNames);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      try {
        localStorage.setItem("mdninja_projects_order", JSON.stringify(projectsOrder));
        window.dispatchEvent(new Event("mdninja:projects-changed"));
      } catch {
        /* storage unavailable */
      }
    }
    setDraggedIndex(null);
  };

  const handleProjectClick = () => {
    togglePinnedFromRail();
  };

  const handleProjectHover = () => {
    if (sidebarSettings.hoverExpand && sidebarMode === "hidden") {
      setTimeout(() => {
        peekOpen();
      }, sidebarSettings.hoverInDelayMs);
    }
  };

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
          onClick={handleProjectClick}
          onMouseEnter={handleProjectHover}
          title="mdNinja"
          style={{ width: "30px", height: "30px", position: "relative" }}
        >
          {/* mdNinja custom SVG Logo */}
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
          {/* Pin indicator dot when pinned */}
          {sidebarMode === "pinned" && (
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
              }}
            />
          )}
        </button>
      </div>

      {/* Projects Strip - GitHub repos */}
      {orderedRepos.length > 1 && (
        <div className="rail-projects">
          {orderedRepos.map((repo, idx) => {
            const isActive = repo.active;
            return (
              <div
                key={repo.fullName}
                className={`rail-project-chip ${isActive ? "active" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                title={repo.fullName}
              >
                {repo.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={repo.iconUrl} alt={repo.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Folder size={14} />
                )}
              </div>
            );
          })}
          <button
            type="button"
            className="rail-project-chip add-project"
            onClick={() => onOpenSettings("github")}
            title="Add project"
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Directory Navigation Icons: starts right under header naturally */}
      <div className="rail-group rail-nav">
        {canonItems.map((item) => (
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
          title={ghUser ? `@${ghUser.username}` : "Account & Settings"}
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
              overflow: "hidden",
            }}
          >
            {ghUser?.avatar?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ghUser.avatar}
                alt={ghUser.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials ?? <Github size={14} />
            )}
          </div>
        </button>

        {/* Profile Popover Menu */}
        {isProfileOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "52px",
              width: "230px",
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
            {/* Account header (real GitHub identity, or signed-out state) */}
            {ghUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "11px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {ghUser.avatar?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ghUser.avatar}
                      alt={ghUser.username}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ghUser.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    @{ghUser.username}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-subtle)",
                  marginBottom: "4px",
                }}
              >
                Not signed in
              </div>
            )}

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

            {ghUser && (
              <button
                type="button"
                className="action-btn"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "6px 8px",
                  color: "var(--danger)",
                }}
                onClick={handleSignOut}
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
