"use client";

import React, { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, Code, Eye } from "lucide-react";

interface MermaidViewerProps {
  code: string;
  isStandalone?: boolean;
  onCodeChange?: (newCode: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  code,
  isStandalone = true,
  onCodeChange,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>(code);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    setRawText(code);
  }, [code]);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        setError(null);
        // Dynamically import mermaid in browser only
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#090a0f",
            primaryColor: "#6366f1",
            primaryTextColor: "#f0f3fa",
            lineColor: "#4f587d",
            secondaryColor: "#10121a",
            tertiaryColor: "#181b26",
          },
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        });

        const { svg } = await mermaid.render(uniqueId.current, rawText);
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
  }, [rawText]);

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setRawText(nextVal);
    onCodeChange?.(nextVal);
  };

  // Embedded diagram in markdown: natural aspect ratio, full width, zero wasted void
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
        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
          <button
            type="button"
            className={`action-btn ${isEditing ? "active" : ""}`}
            style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "View diagram" : "Edit diagram code"}
          >
            {isEditing ? <Eye size={13} /> : <Code size={13} />}
            <span>{isEditing ? "View" : "Edit Code"}</span>
          </button>
        </div>

        {isEditing ? (
          <textarea
            className="diagram-raw-editor"
            style={{ minHeight: "180px", width: "100%", borderRadius: "var(--radius-sm)" }}
            value={rawText}
            onChange={handleRawChange}
            placeholder="Enter Mermaid diagram syntax..."
          />
        ) : error ? (
          <div style={{ padding: "12px", color: "var(--danger)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            Failed to render diagram: {error}
          </div>
        ) : (
          <div
            ref={containerRef}
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

  // Standalone diagram: 100% full panel height with pan & zoom
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
      {/* Floating View/Edit toggle */}
      <div className="diagram-floating-top" style={{ top: "8px", right: "8px" }}>
        <button
          type="button"
          className={`action-btn ${isEditing ? "active" : ""}`}
          style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
          onClick={() => setIsEditing(!isEditing)}
          title={isEditing ? "View diagram" : "Edit diagram code"}
        >
          {isEditing ? <Eye size={13} /> : <Code size={13} />}
          <span>{isEditing ? "View" : "Edit Code"}</span>
        </button>
      </div>

      {isEditing ? (
        <textarea
          className="diagram-raw-editor"
          style={{ height: "100%" }}
          value={rawText}
          onChange={handleRawChange}
          placeholder="Enter Mermaid diagram syntax..."
        />
      ) : error ? (
        <div style={{ padding: "16px", color: "var(--danger)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
          Failed to render diagram: {error}
        </div>
      ) : (
        <TransformWrapper initialScale={1} minScale={0.2} maxScale={4} centerOnInit>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flex: 1 }}>
              {/* Floating Zoom Controls */}
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
                  ref={containerRef}
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
