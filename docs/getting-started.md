# Getting Started with mdNinja

Welcome to **mdNinja**—the zero-constraint visual Markdown workbench and living canon platform for modern engineering repositories and AI agent pairs.

---

## 1. Quick Start Options

### Option A: Zero-Install CLI Runner (Recommended)
Run mdNinja instantly in any repository without cloning:

```bash
# Launch the visual living canon workbench for the current directory
npx @mdninja/cli

# Or serve any other repo explicitly
npx @mdninja/cli --dir /path/to/any/repo

# Or scaffold a fresh Living Canon layout in the current directory
npx @mdninja/cli init
```

> `mdninja dev` (the default command) serves the repo named by `--dir`/`-d`, or the current directory if omitted — the workbench, MCP server, and scaffold all operate on the same target.

### Option B: Explore the Public Live Demo
Visit the production deployment at [mdninja.navinhill.com](https://mdninja.navinhill.com) to view the live open-source canon, roadmaps, architecture diagrams, and ADRs with zero install.

### Option C: Native Desktop App (Tauri 2.0)
mdNinja is built with Tauri 2.0 for a native, sub-20MB desktop experience with zero Electron memory bloat:

```bash
# Inside the mdNinja repository:
cd apps/web
npm run tauri dev
```

### Option D: Run Monorepo Locally
```bash
git clone https://github.com/jamesnavinhill/mdninja.git
cd mdninja
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. All local edits write directly to disk with zero lag.

---

## 2. CLI Command Reference (`@mdninja/cli`)

| Command | Description |
| :--- | :--- |
| `mdninja dev [options]` | Start the local visual workbench (default command). Options: `-p, --port <port>`, `--no-open`, `-d, --dir <path>`. |
| `mdninja init [options]` | Scaffold `.mdninja/config.json` and canonical directories (`mdninja/`). Options: `-f, --force`, `-d, --dir <path>`. |
| `mdninja mcp` | Launch the Model Context Protocol (MCP) server over `stdio` for AI assistants. |
| `mdninja build` | Sync living canon documents and generate production bundle. |

---

## 3. AI Assistant Integration (MCP)

Connect your favorite AI coding assistant (Cursor, Claude Desktop, Windsurf, Google Antigravity) directly to your project's Living Canon via the Model Context Protocol (MCP).

### Claude Desktop Configuration
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mdninja": {
      "command": "npx",
      "args": ["-y", "@mdninja/cli", "mcp"]
    }
  }
}
```

### Cursor / Windsurf Configuration
Configure an MCP stdio server with:
* **Command:** `npx`
* **Args:** `-y @mdninja/cli mcp`

### Available MCP Tools
* `get_canon_structure`: Structured file hierarchy and metadata of the living canon.
* `read_canon_doc`: Path-safe document reading.
* `write_canon_doc`: Path-safe document writing with automated folder scaffolding.
* `list_adrs`: Parsed summary of Architecture Decision Records.
* `create_adr`: Sequential ADR generator with mandatory `🤖 Agent Enforcement`.
* `get_roadmap`: Real-time milestone and task checklist retrieval.
* `update_roadmap_task`: Programmatic toggling of roadmap tasks (`[ ]` <-> `[x]`).

---

## 4. The Living Canon (`mdninja/`)

`mdNinja` surfaces a dedicated, structured home for your project's living history:

* `mdninja/decisions/`: Architecture Decision Records (ADRs) with AI agent enforcement directives.
* `mdninja/roadmaps/`: Living Gantt charts and progress tasklists.
* `mdninja/diagrams/`: Interactive Mermaid vector maps with smooth 60fps pan and zoom.
* `mdninja/research/`: Technical evaluations, benchmarks, and spikes.
* `mdninja/audits/`: Performance metrics, bundle sizes, and security audits.
* `mdninja/standards/`: Engineering guidelines, UI philosophy, and code conventions.
* `docs/`: Product, API, and user-facing documentation.
* `.agents/`: AI agent instructions, operational directives, and executable skills.

---

## 5. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd + \` / `Ctrl + \` | Toggle Equal Dual-Panel Split View |
| `Cmd + B` / `Ctrl + B` | Toggle File Explorer Sidebar |
| `Cmd + S` / `Ctrl + S` | Save active document directly to disk |
| `Double Click` | Activate inline block editor in preview mode |
