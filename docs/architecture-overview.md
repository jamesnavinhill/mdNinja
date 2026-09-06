# Architecture Overview

## 1. The Living Canon Principle

Traditional developer wikis suffer from context drift: documentation is hosted in external SaaS silos disconnected from the codebase, while AI coding agents struggle to parse outdated or unversioned pages.

`mdNinja` treats the Git repository as the **immutable source of truth**:
1. **Zero Database Silos:** Markdown files on disk *are* the database.
2. **Two-Way Git Synchronicity:** Local edits write directly to the filesystem (`fs.writeFile`), leaving Git status, diffs, and commits to your native version control.
3. **Equal Dual Panels:** Both panels in the split workspace are completely unconstrained—no artificial "primary vs context" restrictions.

---

## 2. The AST Pipeline

Markdown documents are processed through a modern `unified` pipeline:
- `remark-parse` $\rightarrow$ parses raw Markdown into an AST (MDAST).
- `remark-gfm` $\rightarrow$ provides tables, checklists, strikethrough, and autolinks.
- `remark-math` $\rightarrow$ parses inline `$math$` and block `$$math$$` expressions.
- `remark-rehype` $\rightarrow$ converts MDAST into HAST for HTML rendering.
- `rehype-katex` $\rightarrow$ renders math formulas into crisp, zero-layout-shift typography.
- `rehype-highlight` $\rightarrow$ syntax highlights fenced code blocks.
- `rehype-stringify` $\rightarrow$ emits optimized HTML string output.

---

## 3. Diagram Magic & Viewport Engine

Code blocks tagged ````mermaid```` are intercepted by `mdNinja` and converted into interactive SVG vectors:
- **60fps Pan & Zoom:** Click and drag to pan across large architecture maps; scroll wheel to zoom in and out smoothly via GPU transforms.
- **Unconstrained Canvas:** Standalone diagrams expand to fill 100% of panel height without nested padding boxes or unnecessary titles.
- **Flip-to-Edit:** Click "Edit Code" in the diagram toolbar to immediately view and edit the raw Mermaid syntax.

---

## 4. Zero-Leak Multi-User Isolation

To support public hosted deployments (like `mdninja.navinhill.com`) while allowing users to connect their personal GitHub accounts:
- **Ephemeral Token Exchange:** The server exchanges OAuth codes ephemerally in `/api/auth/callback/github` and passes the user account directly to the client via `postMessage`.
- **Pure Browser-Local Storage:** All tokens, user profiles, and repository configurations reside strictly in that visitor's private browser `localStorage`.
- **Zero Server-Side Retention:** No tokens or private repository lists are ever written to server memory, disk, or databases (see [ADR 0004](file:///c:/Users/james/projects/projectmd/projectmd/decisions/0004-zero-leak-multi-user-isolation.md)).

---

## 5. Bundled Canon for Serverless Deployments

In local development, `mdNinja` dynamically scans the repository on disk. When deployed to serverless environments (e.g. Vercel) where root monorepo files exist outside the serverless function root, `mdNinja` seamlessly falls back to a build-time bundled canon index ([ADR 0005](file:///c:/Users/james/projects/projectmd/projectmd/decisions/0005-bundled-canon-fallback.md)), ensuring zero 404s and instant page loads.
