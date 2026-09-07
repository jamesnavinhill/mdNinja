"use client";

import React, { useState, useEffect, useMemo } from "react";
import { parseMarkdown } from "comark";
import type { MarkdownDocument as MarkdownDocumentType } from "comark";
import { MarkdownDocument } from "@comark/react";
import math from "@comark/react/plugins/math";
import mermaid from "@comark/react/plugins/mermaid";
import { Math } from "@comark/react/plugins/math";
import { MermaidViewer } from "../diagrams/MermaidViewer";

interface MarkdownRendererProps {
  content: string;
  filePath?: string | null;
}

/** Resolve a relative markdown href against the directory of the open document. */
function resolveRelativeHref(href: string, filePath?: string | null): string {
  const cleaned = href.replace(/^\.\//, "");
  // Absolute-in-repo (starts with a top-level dir) or no current file → use as-is.
  if (!filePath) return cleaned;
  const dir = filePath.includes("/") ? filePath.slice(0, filePath.lastIndexOf("/")) : "";
  if (!dir) return cleaned;
  // Walk up for each leading "../"; otherwise join onto the current directory.
  if (cleaned.startsWith("../")) {
    const dirParts = dir.split("/");
    let rest = cleaned;
    while (rest.startsWith("../")) {
      dirParts.pop();
      rest = rest.slice(3);
    }
    return [...dirParts, rest].filter(Boolean).join("/");
  }
  return `${dir}/${cleaned}`;
}

// Custom link component to intercept relative links.
// basePath is the directory of the currently-open document, so relative
// hrefs (e.g. "troubleshooting.md", "../mdninja/decisions/0001-….md") resolve to real repo paths.
const CustomLink = (basePath?: string | null) => {
  const LinkImpl = ({ href, children, ...props }: any) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href) return;

      // Intercept internal markdown and relative links
      if (
        !href.startsWith("http://") &&
        !href.startsWith("https://") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("#")
      ) {
        e.preventDefault();
        const resolved = resolveRelativeHref(href, basePath);
        window.dispatchEvent(new CustomEvent("mdninja:open-file", { detail: { path: resolved } }));
      }
    };

    return (
      <a href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  };
  return LinkImpl;
};

// Custom mermaid component using our existing MermaidViewer
const CustomMermaid = ({ content, ...props }: any) => {
  return (
    <div style={{ width: "100%", margin: "14px 0" }}>
      <MermaidViewer code={content} isStandalone={false} />
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  filePath,
}) => {
  // Check if content is pure mermaid diagram
  const isPureDiagram = useMemo(() => {
    const trimmed = content.trim();
    const mermaidMatch = trimmed.match(/^```mermaid\s*([\s\S]*?)```$/);
    return mermaidMatch !== null;
  }, [content]);

  // Extract pure mermaid code if applicable
  const pureCode = useMemo(() => {
    if (!isPureDiagram) return null;
    const match = content.trim().match(/^```mermaid\s*([\s\S]*?)```$/);
    return match ? match[1].trim() : null;
  }, [content, isPureDiagram]);

  // Parse markdown with comark
  const [doc, setDoc] = useState<MarkdownDocumentType | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function parse() {
      const parsed = await parseMarkdown(content, {
        plugins: [math(), mermaid()],
      });
      if (isCurrent) {
        setDoc(parsed);
      }
    }

    parse();

    return () => {
      isCurrent = false;
    };
  }, [content]);

  // If the document is solely a diagram, render it standalone
  if (isPureDiagram && pureCode) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flex: 1 }}>
        <MermaidViewer code={pureCode} />
      </div>
    );
  }

  // Wait for parsing to complete
  if (!doc) {
    return (
      <div className="markdown-body" style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        Loading...
      </div>
    );
  }

  // Custom component mapping
  const components = {
    a: CustomLink(filePath),
    mermaid: CustomMermaid,
    math: Math,
  };

  return (
    <div
      className="markdown-body"
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <MarkdownDocument
        value={doc}
        components={components}
      />
    </div>
  );
};
