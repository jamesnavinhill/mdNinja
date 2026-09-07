"use client";

import React, { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MermaidViewerProps {
  code: string;
  isStandalone?: boolean;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  code,
  isStandalone = true,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [themeMode, setThemeMode] = useState<string>("dark");
  // A render "tick" that forces a re-render of the diagram when the live accent
  // (an inline-style CSS var, NOT an attribute) changes. Attribute observers miss it.
  const [tick, setTick] = useState(0);

  // Resolve live CSS custom-property values (the real source of truth — honors
  // accent picker, reading palettes, and dark/light), not hardcoded hex.
  const cssVar = (name: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };

  // Whether the page is currently dark (used only to decide Mermaid's base engine).
  const isDarkNow = (): boolean => {
    if (typeof document === "undefined") return true;
    return (document.documentElement.getAttribute("data-theme") || "dark") !== "light";
  };

  // Track global theme, palette, AND inline accent changes (data-theme, data-palette, style).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const sync = () => {
      setThemeMode(document.documentElement.getAttribute("data-theme") || "dark");
      setTick((t) => t + 1); // accent/palette changes are inline-style; force re-render
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette", "style"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        setError(null);
        // Dynamically import mermaid in browser only
        const mermaid = (await import("mermaid")).default;
        const isLight = !isDarkNow();

        // Single source of truth: derive EVERY color from the live theme CSS vars.
        const bgSecondary = cssVar("--bg-secondary", isLight ? "#f8fafc" : "#10121a");
        const bgTertiary = cssVar("--bg-tertiary", isLight ? "#f1f5f9" : "#181b26");
        const textPrimary = cssVar("--text-primary", isLight ? "#0f172a" : "#f0f3fa");
        const accent = cssVar("--accent", "#6366f1");
        const accentSubtle = cssVar("--accent-subtle", "rgba(99,102,241,0.15)");
        const borderMedium = cssVar("--border-medium", isLight ? "#cbd5e1" : "#2d3348");
        const textSecondary = cssVar("--text-secondary", isLight ? "#475569" : "#9aa3ba");

        mermaid.initialize({
          startOnLoad: false,
          theme: isLight ? "default" : "dark",
          themeVariables: {
            darkMode: !isLight,
            background: bgSecondary,
            primaryColor: isLight ? accentSubtle : bgTertiary,
            primaryTextColor: textPrimary,
            primaryBorderColor: borderMedium,
            secondaryColor: isLight ? bgSecondary : bgTertiary,
            tertiaryColor: bgTertiary,
            lineColor: accent,
            textColor: textPrimary,
            mainBkg: bgTertiary,
            nodeBorder: borderMedium,
            clusterBkg: bgSecondary,
            clusterBorder: borderMedium,
            edgeLabelBackground: bgSecondary,
            titleColor: textPrimary,
            noteBkgColor: accentSubtle,
            noteTextColor: textPrimary,
            noteBorderColor: accent,
            labelTextColor: textSecondary,
            actorBkg: bgTertiary,
            actorBorder: borderMedium,
            actorTextColor: textPrimary,
            actorLineColor: accent,
            signalColor: accent,
            signalTextColor: textPrimary,
            sectionBkgColor: bgTertiary,
            sectionBkgColor2: bgSecondary,
            taskBkgColor: accentSubtle,
            taskTextColor: textPrimary,
            taskTextLightColor: textPrimary,
            taskTextOutsideColor: textPrimary,
            doneTaskBkgColor: accent,
            doneTaskBorderColor: accent,
            activeTaskBkgColor: accentSubtle,
            activeTaskBorderColor: accent,
            gridColor: borderMedium,
            critBkgColor: accentSubtle,
            critBorderColor: accent,
            todayLineColor: accent,
            pieSectionTextColor: textPrimary,
            pieTitleTextColor: textPrimary,
            pieLegendTextColor: textSecondary,
            pieStrokeColor: borderMedium,
            pieOuterStrokeColor: accent,
          },
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        });

        const renderId = `m${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
        const existing = document.getElementById(renderId) || document.getElementById(`d${renderId}`);
        if (existing) existing.remove();

        const { svg } = await mermaid.render(renderId, code);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, themeMode, tick]);

  // Embedded diagram in markdown: natural aspect ratio, full width, zero wasted void.
  // No floating "Edit Code" button — raw editing lives exclusively in the panel
  // toolbar (removes clutter over the focal content, per design principles).
  if (!isStandalone) {
    return (
      <div
        className="diagram-embedded"
        style={{
          width: "100%",
          position: "relative",
          margin: "12px 0 16px 0",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error ? (
          <div style={{ padding: "12px", color: "var(--danger)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            Failed to render diagram: {error}
          </div>
        ) : (
          <div
            className="embedded-mermaid-svg"
            style={{
              width: "100%",
              overflowX: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 0",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    );
  }

  // Standalone diagram: 100% full panel height with pan & zoom.
  // No floating "Edit Code" toggle over the focal content — edit/preview is one
  // source controlled by the panel toolbar. Zoom controls stay (they are the
  // diagram's primary interaction and have no toolbar equivalent).
  return (
    <div
      className="diagram-wrapper"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        flex: 1,
        position: "relative",
      }}
    >
      {error ? (
        <div style={{ padding: "16px", color: "var(--danger)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
          Failed to render diagram: {error}
        </div>
      ) : (
        <TransformWrapper initialScale={1} minScale={0.2} maxScale={4} centerOnInit>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flex: 1 }}>
              {/* Floating Zoom Controls — the only floating UI on a diagram (ADR 0010) */}
              <div className="diagram-floating-controls" style={{ bottom: "8px", right: "8px" }}>
                <button type="button" className="action-btn" onClick={() => zoomIn()} title="Zoom in">
                  <ZoomIn size={13} />
                </button>
                <button type="button" className="action-btn" onClick={() => zoomOut()} title="Zoom out">
                  <ZoomOut size={13} />
                </button>
                <button type="button" className="action-btn" onClick={() => resetTransform()} title="Reset zoom">
                  <RotateCcw size={13} />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%", flex: 1 }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <div
                  className="diagram-svg-container"
                  style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      )}
    </div>
  );
};
