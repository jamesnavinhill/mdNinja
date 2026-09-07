# ADR 0011: Markdown Rendering Migrated to comark

**Date:** 2026-09-07
**Status:** Implemented & verified

## 1. Context

The markdown preview was rendered by a hand-rolled pipeline in `MarkdownRenderer.tsx`: a regex split mermaid blocks out of the source, then a separate `unified()` run (remark-parse → remark-gfm → remark-math → remark-rehype → rehype-katex → rehype-highlight → rehype-stringify) per remaining segment, string-concatenated and injected with `dangerouslySetInnerHTML`. This was the exact "regex-to-extract-blocks + per-segment re-parse" anti-pattern: fragile under any construct that isn't trivial, impossible to stream, and a fork of a problem already solved better upstream.

## 2. Decision

Parse and render ALL markdown with **comark** (`comark` core + `@comark/react` renderer, both v0.6.x from npm). One parse produces a compact serializable document; one renderer emits it. This replaces — and deletes — the entire regex-split + per-segment unified pipeline from the rendering path.

- **Math:** comark's `math` plugin + `@comark/react`'s `Math` component (KaTeX).
- **Mermaid:** comark's `mermaid` plugin tokenizes fenced ```mermaid blocks; we map that token to the existing local `MermaidViewer` component, which keeps its live-theme derivation and pan/zoom viewport (ADR 0009/0010). comark's own `beautiful-mermaid`-based component is installed (the plugin's renderer dependency) but is not used for display.
- **Relative links:** custom `a` component intercepts non-external hrefs and dispatches the `mdninja:open-file` event, exactly as before.
- **Code highlighting:** comark's rendering; KaTeX CSS and `.markdown-body` styling (`markdown.css`) apply unchanged.

## 3. Consequences

**Dependencies removed:** `unified`, `remark-parse`, `remark-gfm`, `remark-math`, `remark-rehype`, `rehype-katex`, `rehype-highlight`, `rehype-stringify`.
**Dependencies added:** `comark@^0.6.2`, `@comark/react@^0.6.2`, `beautiful-mermaid@^1.1.3` (the mermaid plugin's renderer dependency). `katex` bumped to `^0.17.0` to satisfy `@comark/react`'s peerOptional `katex@^0.17.0`.

Unblocks streaming rendering (`MarkdownLive`) for the Phase-5 AI agent with no additional parser work. `BlockEditor` keeps its plain textarea edit mode and is otherwise untouched — the render path and the edit path stay decoupled.

**Bug fixed in the same pass (pre-existing):** relative markdown links were dispatched to `mdninja:open-file` as a bare filename (`troubleshooting.md`), 404-ing because no document directory was known. `filePath` is now threaded `Panel → BlockEditor → MarkdownRenderer`, and relative hrefs resolve against the open document's directory (`docs/architecture-overview.md` + `troubleshooting.md` → `docs/troubleshooting.md`; leading `../` walks up). Verified end-to-end in the browser.

## 4. 🤖 Agent Enforcement

* The preview render path is comark end-to-end. Do NOT reintroduce a unified/remark/rehype pipeline or a regex-based mermaid split for rendering.
* Render diagrams through `MermaidViewer` (theme + pan/zoom are its job); do not swap in comark's default mermaid component for display.
* Preserve the `mdninja:open-file` relative-link contract and the `filePath`-relative resolution.
* Open-environment note: shiki highlighting is not yet wired (comark renders code plainly); adding `@comark/react/plugins/shiki` + the `shiki` package is the intended upgrade.
