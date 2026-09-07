"use client";

import React, { useState, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface BlockEditorProps {
  content: string;
  filePath?: string | null;
  isEditMode: boolean;
  onChange: (newContent: string) => void;
  onSave: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  filePath,
  isEditMode,
  onChange,
  onSave,
}) => {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      onSave();
    }
    // Allow Tab key indent
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextContent = localContent.substring(0, start) + "  " + localContent.substring(end);
      setLocalContent(nextContent);
      onChange(nextContent);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (isEditMode) {
    return (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
        <textarea
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            padding: "24px 32px",
            fontFamily: "var(--font-mono)",
            fontSize: "13.5px",
            lineHeight: "1.6",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            border: "none",
            outline: "none",
            resize: "none",
          }}
          value={localContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing markdown..."
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", overflowY: "auto" }}>
      <MarkdownRenderer content={localContent} filePath={filePath} />
    </div>
  );
};
