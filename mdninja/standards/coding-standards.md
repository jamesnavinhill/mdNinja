# Engineering Standards & Living Canon Guidelines

This document codifies the core engineering principles, design standards, and operational guidelines for **mdNinja**.

---

## 1. UI Philosophy: Zero Slop & Maximum Canvas

* **Zero Wasted Space:** The UI exists solely to view, edit, and navigate documentation and diagrams. Avoid gratuitous headers, jumbo hero widgets, or bloated decorative frames eating vertical screen real estate.
* **Maximum Vertical Height:** Panels should span the full available height. Diagrams and canvas views must expand to occupy the entire panel canvas without artificial nesting.
* **Clean, Natural Labels:** Use exact directory and file names (e.g. `roadmaps`, `decisions`, `docs/`, `.agents/`). Never clutter the navigation with marketing fluff, synthetic tags, or redundant parenthetical descriptions.
* **Typographic Hierarchy:** Leverage crisp, high-readability typography (system font stack, Inter, Geist, JetBrains Mono for code). Use subtle borders, harmonious dark/light color tokens, and muted accents.

---

## 2. Architecture Principles: The Dumb App That Reads and Writes

* **No Proprietary Database Silos:** The Git repository and filesystem *are* the database. Never introduce an external relational, document, or vector database for documentation storage.
* **Zero Synchronization Lag:** Local edits write directly to disk via standard filesystem APIs (`fs.writeFile`). Remote edits leverage the official GitHub REST API.
* **Two Equal Panels:** Never impose artificial "primary vs context" constraints. Both panels in the split workspace must have 100% identical capabilities—rendering Markdown, KaTeX, interactive diagrams, and raw block editing.
* **Battle-Tested Primitives Over Handrolling:**
  * Layout: `react-resizable-panels`
  * Markdown & Math: `unified`, `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-highlight`
  * Diagrams: `@mermaid-js/mermaid`, `@excalidraw/excalidraw`, `react-zoom-pan-pinch`

---

## 3. Security & Zero-Leak Multi-User Isolation

* **Ephemeral Server Handshakes:** All OAuth flows must exchange tokens ephemerally in the callback handler and pass the result directly to the client via `postMessage`.
* **Zero Shared State:** Never store user GitHub tokens, session identifiers, or private repository lists in server memory, shared cache, or disk on hosted deployments.
* **Client-Isolated Storage:** User credentials and selected repository states reside strictly within the visitor's local browser `localStorage` (`mdninja_gh_accounts`, `mdninja_repos`).

---

## 4. Monorepo Hygiene & Dependency Boundaries

* **Clear Workspace Separation:**
  * `apps/web`: Next.js 15 App Router visual frontend and serverless API handlers.
  * `packages/cli`: Standalone CLI launcher for local execution (`npx mdninja`).
  * `mdninja/`: First-class living canon directory containing active engineering context.
  * `.mdninja/`: Hidden configuration root (`config.json`).
* **Vulnerability Zero-Tolerance:** All dependencies must pass `npm audit` with 0 vulnerabilities. Use workspace overrides in root `package.json` when upstream patches require explicit pinning.

---

## 5. 🤖 AI Agent Rules of Engagement

* **Living Canon Mandate:** Every significant architectural decision must be codified as an ADR in `mdninja/decisions/` following `0000-template.md`.
* **Roadmap Verification:** When completing multi-step initiatives, verify implementation and update `mdninja/roadmaps/roadmap.md` checklist items (`[x]`).
* **Clean Commits:** Never commit build artifacts (`.next/`, `dist/`, `node_modules/`) or secrets (`.env`, `.env.local`) to version control.
