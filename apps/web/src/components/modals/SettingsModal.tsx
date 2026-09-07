"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  GitBranch,
  Palette,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  IconPack,
  NavIconKey,
  getNavIcon,
  loadIconPack,
  saveIconPack,
  loadIconOverrides,
  saveIconOverrides,
} from "@/lib/icons";

export type SettingsTab = "github" | "themes";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  accentColor: string;
  onAccentChange: (color: string) => void;
  fontFamily: string;
  onFontChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (lh: number) => void;
  maxWidth: number;
  onMaxWidthChange: (width: number) => void;
  activeTheme: string;
  onThemeSelect: (themeKey: string) => void;
}

const CURATED_THEMES = [
  { key: "default", name: "mdNinja Default", darkBg: "#090a0f", lightBg: "#ffffff", accent: "#6366f1" },
  { key: "tokyo", name: "Tokyo Night", darkBg: "#1a1b26", lightBg: "#e6e7ed", accent: "#7aa2f7" },
  { key: "nord", name: "Nord Frost", darkBg: "#2e3440", lightBg: "#eceff4", accent: "#88c0d0" },
  { key: "github-dimmed", name: "GitHub Dimmed", darkBg: "#22272e", lightBg: "#ffffff", accent: "#539bf5" },
  { key: "sepia", name: "Paper Sepia", darkBg: "#1e1915", lightBg: "#fbf0d9", accent: "#8c6032" },
];

const FONTS = [
  { label: "System Sans", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Geist", value: "var(--font-geist-sans), sans-serif" },
  { label: "Outfit", value: "var(--font-outfit), sans-serif" },
  { label: "JetBrains Mono", value: "var(--font-jbmono), monospace" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "themes",
  accentColor,
  onAccentChange,
  fontFamily,
  onFontChange,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  maxWidth,
  onMaxWidthChange,
  activeTheme,
  onThemeSelect,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Client-isolated GitHub account state (never shared across users).
  // Empty by default — real accounts arrive only via OAuth (see GH_AUTH_SUCCESS).
  const [githubAccounts, setGithubAccounts] = useState<
    { username: string; name: string; avatar: string; connected: boolean }[]
  >([]);
  const [repos, setRepos] = useState<{ name: string; active: boolean; branch: string }[]>([]);

  // Load client-isolated accounts and repos from localStorage
  useEffect(() => {
    try {
      const savedAccounts = localStorage.getItem("mdninja_gh_accounts");
      if (savedAccounts) {
        setGithubAccounts(JSON.parse(savedAccounts));
      }
      const savedRepos = localStorage.getItem("mdninja_repos");
      if (savedRepos) {
        setRepos(JSON.parse(savedRepos));
      }
    } catch {
      //
    }
  }, []);

  // Listen for OAuth completion message from popup window
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      // Accept only messages from this application's own origin.
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GH_AUTH_SUCCESS" && event.data.account) {
        const { username, name, avatar, token } = event.data.account;

        setGithubAccounts((prev) => {
          const filtered = prev.filter((a) => a.username !== username);
          const next = [
            ...filtered,
            {
              username,
              name: name || username,
              avatar: avatar || username.slice(0, 2).toUpperCase(),
              connected: true,
            },
          ];
          localStorage.setItem("mdninja_gh_accounts", JSON.stringify(next));
          return next;
        });

        // Dynamically fetch user repositories using their access token
        if (token) {
          try {
            const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
              },
            });
            if (res.ok) {
              const fetched = await res.json();
              if (Array.isArray(fetched)) {
                setRepos((prev) => {
                  const newItems = fetched.map((r: any) => ({
                    name: r.name,
                    active: true,
                    branch: r.default_branch || "main",
                  }));
                  const existingNames = new Set(prev.map((p) => p.name));
                  const merged = [
                    ...prev,
                    ...newItems.filter((n: any) => !existingNames.has(n.name)),
                  ];
                  localStorage.setItem("mdninja_repos", JSON.stringify(merged));
                  return merged;
                });
              }
            }
          } catch (err) {
            console.error("Failed to fetch GitHub repos", err);
          }
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  const handleConnectGitHub = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      "/api/auth/github",
      "gh_oauth_popup",
      `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "820px",
          height: "560px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            zIndex: 10,
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
          title="Close Settings"
        >
          <X size={18} />
        </button>

        {/* Left Icon Rail Tabs (Circles, per sketch) */}
        <div
          style={{
            width: "60px",
            backgroundColor: "var(--bg-tertiary)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0",
            gap: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            title="GitHub configurations"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: activeTab === "github" ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
              backgroundColor: activeTab === "github" ? "var(--accent-subtle)" : "transparent",
              color: activeTab === "github" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {/* GitHub Octocat Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            title="styling and themes"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: activeTab === "themes" ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
              backgroundColor: activeTab === "themes" ? "var(--accent-subtle)" : "transparent",
              color: activeTab === "themes" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Palette size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* TAB: GitHub configurations */}
          {activeTab === "github" && (
            <div style={{ display: "flex", height: "100%", gap: "24px" }}>
              {/* Accounts & Repositories */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      GitHub Connections
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Connect an account to sync repositories
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectGitHub}
                    className="action-btn"
                    style={{ border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-hover)" }}
                  >
                    <Plus size={13} /> Add Account
                  </button>
                </div>

                {/* Connected accounts (empty-state when none) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {githubAccounts.length === 0 && (
                    <div
                      style={{
                        padding: "24px 14px",
                        textAlign: "center",
                        border: "1px dashed var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-muted)",
                        fontSize: "12.5px",
                      }}
                    >
                      No GitHub account connected yet.
                    </div>
                  )}
                  {githubAccounts.map((acc) => (
                    <div
                      key={acc.username}
                      style={{
                        padding: "10px 14px",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "var(--accent-subtle)",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "12px",
                            overflow: "hidden",
                          }}
                        >
                          {acc.avatar?.startsWith("http") ? (
                            <img src={acc.avatar} alt={acc.username} style={{ width: "100%", height: "100%" }} />
                          ) : (
                            acc.avatar || acc.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                            {acc.name || acc.username}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            @{acc.username}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multi-select for repos & Connected Repos list */}
                <div
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-tertiary)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                    CONNECTED REPOSITORIES
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                    {repos.length === 0 && (
                      <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                        {githubAccounts.length === 0
                          ? "Connect an account to list repositories."
                          : "No repositories loaded yet."}
                      </div>
                    )}
                    {repos.map((repo, idx) => (
                      <div
                        key={repo.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <GitBranch size={13} color="var(--accent)" />
                          <span style={{ fontSize: "12.5px", color: "var(--text-primary)", fontWeight: 500 }}>
                            {repo.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...repos];
                            updated[idx].active = !updated[idx].active;
                            setRepos(updated);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: repo.active ? "var(--success)" : "var(--text-muted)",
                          }}
                        >
                          {repo.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Styling and themes (Strictly matching user instructions!) */}
          {activeTab === "themes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Styling, Themes & Comfort
                </h3>
              </div>

              {/* Curated Themes (Swatches) */}
              <div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    CURATED READING PALETTES
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "8px" }}>
                  {CURATED_THEMES.map((th) => (
                    <button
                      key={th.key}
                      type="button"
                      onClick={() => onThemeSelect(th.key)}
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        border: activeTheme === th.key ? `2px solid ${th.accent}` : "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "transform 0.1s ease",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{th.name}</span>
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: th.darkBg,
                          border: "1px solid var(--border-medium)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Accent Color Picker (NO presets, as requested!) */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                  ACCENT COLOR PICKER (FULL SPECTRUM)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => onAccentChange(e.target.value)}
                    style={{
                      width: "48px",
                      height: "36px",
                      padding: 0,
                      border: "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                    }}
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => onAccentChange(e.target.value)}
                    className="search-input"
                    style={{ width: "120px", fontFamily: "var(--font-mono)", fontSize: "12px" }}
                  />
                </div>
              </div>

              {/* Icon Engine: pack picker + per-folder overrides */}
              <IconEngineEditor />

              {/* Typography & Comfort Sliders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    FONT FAMILY
                  </label>
                  <select
                    className="search-input"
                    value={fontFamily}
                    onChange={(e) => onFontChange(e.target.value)}
                    style={{ marginTop: "6px", width: "100%", padding: "8px 12px" }}
                  >
                    {FONTS.map((f) => (
                      <option key={f.label} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    FONT SIZE: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="13"
                    max="18"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    style={{ width: "100%", marginTop: "10px", accentColor: "var(--accent)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    LINE HEIGHT: {lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.4"
                    max="2.0"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => onLineHeightChange(Number(e.target.value))}
                    style={{ width: "100%", marginTop: "10px", accentColor: "var(--accent)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    DOCUMENT MAX WIDTH: {maxWidth}px
                  </label>
                  <input
                    type="range"
                    min="760"
                    max="1400"
                    step="40"
                    value={maxWidth}
                    onChange={(e) => onMaxWidthChange(Number(e.target.value))}
                    style={{ width: "100%", marginTop: "10px", accentColor: "var(--accent)" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   Icon Engine Editor
   Lets the user pick an icon pack (Lucide / Phosphor) and override the icon
   used for each living-canon folder in the sidebar rail + file tree.
--------------------------------------------------------------------------- */

const OVERRIDABLE_FOLDERS: NavIconKey[] = [
  "audits",
  "changelog",
  "decisions",
  "diagrams",
  "notes",
  "research",
  "roadmaps",
];

const NAV_ICON_KEYS: NavIconKey[] = [
  "folder",
  "file",
  "audits",
  "changelog",
  "decisions",
  "diagrams",
  "notes",
  "research",
  "roadmaps",
];

const IconEngineEditor: React.FC = () => {
  const [pack, setPack] = React.useState<IconPack>("lucide");
  const [overrides, setOverrides] = React.useState<Partial<Record<NavIconKey, NavIconKey>>>({});

  React.useEffect(() => {
    setPack(loadIconPack());
    setOverrides(loadIconOverrides());
  }, []);

  const notify = () => window.dispatchEvent(new Event("mdninja:icons-changed"));

  const handlePack = (p: IconPack) => {
    setPack(p);
    saveIconPack(p);
    notify();
  };

  const handleOverride = (folder: NavIconKey, icon: NavIconKey | "") => {
    const next = { ...overrides };
    if (icon === "") {
      delete next[folder];
    } else {
      next[folder] = icon;
    }
    setOverrides(next);
    saveIconOverrides(next);
    notify();
  };

  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
        ICON ENGINE
      </label>

      {/* Pack picker */}
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {(["lucide", "phosphor"] as IconPack[]).map((p) => {
          const Preview = getNavIcon(p, "decisions");
          const active = pack === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePack(p)}
              className="action-btn"
              style={{
                border: active ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
                backgroundColor: active ? "var(--accent-subtle)" : "var(--bg-tertiary)",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                padding: "8px 14px",
                textTransform: "capitalize",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Preview size={14} />
              {p}
            </button>
          );
        })}
      </div>

      {/* Per-folder icon overrides */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {OVERRIDABLE_FOLDERS.map((folder) => {
          const resolved = overrides[folder] ?? folder;
          const Current = getNavIcon(pack, resolved);
          return (
            <div
              key={folder}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-tertiary)",
              }}
            >
              <Current size={14} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", flex: 1 }}>
                {folder}
              </span>
              <select
                className="search-input"
                value={resolved}
                onChange={(e) => handleOverride(folder, e.target.value as NavIconKey | "")}
                style={{ padding: "4px 6px", fontSize: "11px", width: "110px" }}
              >
                {NAV_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
