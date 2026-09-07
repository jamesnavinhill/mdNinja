# CLI & MCP Reference

`@mdninja/cli` is a zero-dependency-to-run launcher. `npx` fetches it on demand; nothing is installed globally.

## Commands

| Command | What it does |
| :--- | :--- |
| `dev` (default) | Serve the visual workbench for the target directory. |
| `init` | Scaffold `.mdninja/config.json` + the canonical `mdninja/` layout. |
| `mcp` | Run the Model Context Protocol server over `stdio`. |
| `build` | Re-sync the bundled canon and build the production web bundle (monorepo only). |

### `dev` options

| Flag | Default | Behavior |
| :--- | :--- | :--- |
| `-p, --port <n>` | `3000` | Listening port. |
| `-d, --dir <path>` | current directory | Target repo to scan and serve. |
| `--no-open` | (opens) | Skip auto-opening the browser. |

Example:

```bash
npx @mdninja/cli dev -p 8080 -d ../other-repo --no-open
```

### `init` options

| Flag | Default | Behavior |
| :--- | :--- | :--- |
| `-d, --dir <path>` | current directory | Where to scaffold. |
| `-f, --force` | off | Overwrite an existing `.mdninja/config.json`. |

`init` writes exactly the fields the runtime reads (see [configuration guide](configuration-guide.md)): `$schema`, `name`, `canon`.

### `build`

Runs `sync-canon` then `next build` inside the mdNinja monorepo. It is a convenience for maintainers of **this** repo, intended to work from the installed package location. In a different repository use the monorepo's own `npm run build`.

## MCP Server

The `mcp` command speaks MCP over `stdio`, so any MCP-capable assistant can read and write your living canon without you copy-pasting paths.

### Wire it up

Claude Desktop (`claude_desktop_config.json`):

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

Cursor / Windsurf / other: add a stdio server with the same command and args.

### Tools

| Tool | Arguments | Output |
| :--- | :--- | :--- |
| `get_canon_structure` | — | Full hierarchy + metadata of the canon. |
| `read_canon_doc` | `filePath` | Markdown content of one document. |
| `write_canon_doc` | `filePath`, `content` | Writes the document, creating parent folders as needed. |
| `list_adrs` | — | Every ADR with number, title, status. |
| `create_adr` | `title`, `context`, `decision` (+ optional `status`, `consequences`, `enforcement`) | A new, sequentially-numbered ADR with a `🤖 Agent Enforcement` section. |
| `get_roadmap` | — | Parsed tasks and checklists from the roadmap. |
| `update_roadmap_task` | `taskQuery`, `completed` | Toggles the matching task between `[ ]` and `[x]`. |

All paths are relative to the root of the directory the server was started from.