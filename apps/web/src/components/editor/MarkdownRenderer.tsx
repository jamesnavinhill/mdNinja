"use client";

import React, { useEffect, useState, useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { MermaidViewer } from "../diagrams/MermaidViewer";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  // Extract mermaid code blocks
  const { segments } = useMemo(() => {
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
    const blocks: { id: string; code: string }[] = [];
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    const segs: { type: "markdown" | "mermaid"; content: string; id?: string }[] = [];
    let counter = 0;

    while ((match = mermaidRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        if (textBefore.trim().length > 0) {
          segs.push({
            type: "markdown",
            content: textBefore,
          });
        }
      }
      const id = `mermaid-seg-${counter++}`;
      const code = match[1].trim();
      blocks.push({ id, code });
      segs.push({ type: "mermaid", content: code, id });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      if (textAfter.trim().length > 0) {
        segs.push({
          type: "markdown",
          content: textAfter,
        });
      }
    }

    return { segments: segs, mermaidBlocks: blocks };
  }, [content]);

  // If the document is solely a diagram
  const isPureDiagram = segments.length === 1 && segments[0].type === "mermaid";

  const [processedSegments, setProcessedSegments] = useState<
    { type: "markdown" | "mermaid"; html?: string; code?: string; id?: string }[]
  >([]);

  useEffect(() => {
    let isCurrent = true;

    async function processAll() {
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeHighlight)
        .use(rehypeStringify);

      const results = await Promise.all(
        segments.map(async (seg) => {
          if (seg.type === "markdown") {
            try {
              const file = await processor.process(seg.content);
              return { type: "markdown" as const, html: String(file) };
            } catch (err) {
              return { type: "markdown" as const, html: `<p>Error rendering markdown</p>` };
            }
          } else {
            return { type: "mermaid" as const, code: seg.content, id: seg.id };
          }
        })
      );

      if (isCurrent) {
        setProcessedSegments(results);
      }
    }

    processAll();

    return () => {
      isCurrent = false;
    };
  }, [segments]);

  if (isPureDiagram && segments[0].content) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flex: 1 }}>
        <MermaidViewer code={segments[0].content} />
      </div>
    );
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest("a");
    if (!target) return;
    const href = target.getAttribute("href");
    if (!href) return;

    // Intercept internal markdown and relative links
    if (
      !href.startsWith("http://") &&
      !href.startsWith("https://") &&
      !href.startsWith("mailto:") &&
      !href.startsWith("#")
    ) {
      const cleaned = href.replace(/^\.\//, "");
      window.dispatchEvent(new CustomEvent("mdninja:open-file", { detail: { path: cleaned } }));
    }
  };

  return (
    <div
      className="markdown-body"
      onClick={handleContainerClick}
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      {processedSegments.map((seg, idx) => {
        if (seg.type === "markdown") {
          return (
            <div
              key={idx}
              className="markdown-segment"
              dangerouslySetInnerHTML={{ __html: seg.html || "" }}
            />
          );
        } else if (seg.type === "mermaid" && seg.code) {
          return (
            <div key={seg.id || idx} style={{ width: "100%", margin: "14px 0" }}>
              <MermaidViewer code={seg.code} isStandalone={false} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
