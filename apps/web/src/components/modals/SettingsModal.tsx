"use client";

import React, { useState } from "react";
import {
  X,
  Settings,
  GitBranch,
  Network,
  Palette,
  Plus,
  Check,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";

export type SettingsTab = "config" | "github" | "diagrams" | "themes";

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
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Geist", value: "'Geist', -apple-system, sans-serif" },
  { label: "Outfit", value: "'Outfit', sans-serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "config",
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

  // GitHub account mock data & state
  const [githubAccounts, setGithubAccounts] = useState([
    { username: "james", name: "James Hill", avatar: "JH", connected: true },
  ]);
  const [repos, setRepos] = useState([
    { name: "projectmd", active: true, branch: "main" },
    { name: "mdninja-web", active: true, branch: "main" },
    { name: "agent-skills-canon", active: false, branch: "dev" },
  ]);

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
            onClick={() => setActiveTab("config")}
            title="mdNinja config/settings"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: activeTab === "config" ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
              backgroundColor: activeTab === "config" ? "var(--accent-subtle)" : "transparent",
              color: activeTab === "config" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Settings size={18} />
          </button>

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
            onClick={() => setActiveTab("diagrams")}
            title="diagram settings"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: activeTab === "diagrams" ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
              backgroundColor: activeTab === "diagrams" ? "var(--accent-subtle)" : "transparent",
              color: activeTab === "diagrams" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Network size={18} />
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
          {/* TAB 1: mdNinja config/settings */}
          {activeTab === "config" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  mdNinja Configuration
                </h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Project-level settings stored in <code>.projectmd/config.json</code>
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    LIVING CANON ROOT DIRECTORY
                  </label>
                  <input
                    type="text"
                    defaultValue="./projectmd"
                    className="search-input"
                    style={{ marginTop: "6px", width: "100%", padding: "8px 12px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    DEFAULT WORKSPACE LAYOUT
                  </label>
                  <select
                    className="search-input"
                    defaultValue="single"
                    style={{ marginTop: "6px", width: "100%", padding: "8px 12px" }}
                  >
                    <option value="single">Single Panel Focus</option>
                    <option value="split">Equal Split Workspace (50 / 50)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    AUTOMATIC DISK PERSISTENCE
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <input type="checkbox" defaultChecked id="autosave-toggle" style={{ accentColor: "var(--accent)" }} />
                    <label htmlFor="autosave-toggle" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      Write directly to local filesystem on save (Cmd+S)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GitHub configurations (matching user wireframe layout) */}
          {activeTab === "github" && (
            <div style={{ display: "flex", height: "100%", gap: "24px" }}>
              {/* Left Column of GitHub Tab */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                    GitHub Connections
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Manage connected accounts and repositories
                  </p>
                </div>

                {/* Add GitHub account box */}
                <div
                  style={{
                    padding: "14px",
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
                      }}
                    >
                      JH
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>james</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Connected via GitHub OAuth</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="action-btn"
                    style={{ border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-hover)" }}
                  >
                    <Plus size={13} /> Add Account
                  </button>
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

              {/* Right Column of GitHub Tab (per wireframe: other settings / git hooks) */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    padding: "14px",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-tertiary)",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    GIT WORKFLOWS & HOOKS
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    Configure automatic git commits and PR synchronization
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                      Auto-stage markdown changes on save
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                      Enforce ADR status update in PR template
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    padding: "14px",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-tertiary)",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    SYNC PROTOCOL
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Standard two-way file reflection: Direct disk writes for local instances; GitHub Trees API for remote Hub.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: diagram settings */}
          {activeTab === "diagrams" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Diagram Engine Settings
                </h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Customize Mermaid.js rendering and interactive pan/zoom behavior
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    MERMAID THEME
                  </label>
                  <select className="search-input" defaultValue="dark" style={{ marginTop: "6px", width: "100%", padding: "8px 12px" }}>
                    <option value="dark">Dark (matches workspace)</option>
                    <option value="neutral">Neutral Slate</option>
                    <option value="forest">Forest</option>
                    <option value="default">Default</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    DEFAULT PAN/ZOOM SENSITIVITY
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    style={{ width: "100%", marginTop: "8px", accentColor: "var(--accent)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    CANVAS INTERACTION
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                      Auto-center and scale diagrams to fit viewport on load
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                      Show floating zoom and flip-to-edit controls on hover
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: styling and themes (Strictly matching user instructions!) */}
          {activeTab === "themes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Styling, Themes & Comfort
                </h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Tailor visual ergonomics for extended documentation reading and editing
                </p>
              </div>

              {/* Curated Themes (Swatches) */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
                    CURATED READING PALETTES
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Adapts to Dark & Light modes seamlessly
                  </span>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${th.darkBg} 50%, ${th.lightBg} 50%)`,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                          title="Dark & Light mode ready"
                        />
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: th.accent,
                          }}
                        />
                      </div>
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
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Live accent color for highlights, active links, and buttons
                  </span>
                </div>
              </div>

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

              {/* Icon Library Note & Primitive architecture */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: "var(--text-secondary)" }}>Icon Engine Architecture:</strong> mdNinja uses <code>lucide-react</code> as its high-performance vector primitive. Icons are rendered via an abstracted registry mapping, enabling drop-in catalog support for Phosphor, Radix, or Heroicons without touching core navigation components.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
