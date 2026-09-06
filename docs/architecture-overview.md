# projectmd Architecture Overview

## The Living Canon Principle

Traditional developer wikis suffer from context drift: documentation is hosted in SaaS silos, disconnected from the codebase, while AI coding agents struggle to parse outdated or unversioned wiki pages.

`projectmd` treats the Git repository as the **immutable source of truth**:
1. **Zero Database Silos:** Markdown files on disk *are* the database.
2. **Two-Way Git Synchronicity:** Local edits write directly to the filesystem (`fs.writeFile`), leaving Git status, diffs, and commits to your native version control.
3. **Equal Dual Panels:** Both panels in the split workspace are completely unconstrained—no artificial "primary vs context" restrictions.

## The AST Pipeline

Markdown documents are processed through a modern `unified` pipeline:
- `remark-parse` $\rightarrow$ parses raw Markdown into an AST (MDAST).
- `remark-gfm` $\rightarrow$ provides tables, checklists, and autolinks.
- `remark-math` $\rightarrow$ parses inline `$math$` and block `$$math$$` expressions.
- `remark-rehype` $\rightarrow$ converts MDAST into HAST for HTML rendering.
- `rehype-katex` $\rightarrow$ renders math formulas into crisp, zero-layout-shift typography.
- `rehype-highlight` $\rightarrow$ syntax highlights fenced code blocks.

## Diagram Magic

Code blocks tagged ````mermaid```` are intercepted by `projectmd` and converted into interactive SVG vectors:
- **Pan & Zoom:** Click and drag to pan across large architecture maps; scroll wheel to zoom in and out.
- **Unconstrained Canvas:** Standalone diagrams expand to fill the entire panel height.
- **Flip-to-Edit:** Click "Edit Code" in the diagram toolbar to immediately view and edit the raw Mermaid syntax.
