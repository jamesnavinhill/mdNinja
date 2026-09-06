# ADR 0007: Model Context Protocol (MCP) Server and CLI Architecture

**Date:** 2026-09-06  
**Status:** Accepted  

## 1. Context

AI coding assistants (Cursor, Claude Desktop, Windsurf, Google Antigravity) are primary consumers and maintainers of repository living canons. Without a standardized interface, assistants must rely on raw, unrestricted shell and filesystem operations, leading to hallucinations, broken directory schemas, unindexed ADR numbers, and unverified roadmap edits.

Furthermore, developers need a fast, zero-configuration CLI runner to scaffold repository canons, run local workbenches, and expose MCP connectivity out of the box.

## 2. Decision

1. **Standalone CLI Runner (`@mdninja/cli`):**
   - Provide an npm executable `mdninja` (`npx @mdninja/cli`) built with `commander`.
   - Core subcommands:
     - `mdninja dev` (default): Launches the local visual living canon workbench.
     - `mdninja init`: Scaffolds `.mdninja/config.json` and standard `mdninja/` subdirectories (`decisions`, `roadmaps`, `diagrams`, `standards`, `audits`, `changelog`, `notes`, `research`).
     - `mdninja mcp`: Boots the native Model Context Protocol (MCP) server over `stdio`.
     - `mdninja build`: Syncs bundled canon data and executes Next.js production builds.

2. **Native Stdio MCP Server:**
   - Built on official `@modelcontextprotocol/sdk` utilizing `StdioServerTransport`.
   - Exposes dedicated tools designed for AI agent pairs:
     - `get_canon_structure`: Structured hierarchy, files, and metadata of the living canon.
     - `read_canon_doc`: Path-safe retrieval of living canon documents.
     - `write_canon_doc`: Path-safe updates and auto-creation of missing parent folders.
     - `list_adrs`: Parsed index of ADR numbers, titles, and lifecycle statuses.
     - `create_adr`: Sequential ADR scaffolding with mandatory `🤖 Agent Enforcement`.
     - `get_roadmap`: Real-time extraction of roadmap milestones and checklist states.
     - `update_roadmap_task`: Precise checkbox toggles (`[ ]` to `[x]`) in `roadmap.md`.

3. **Security and Sandboxing:**
   - Path traversal protections: All document read/write operations resolve strictly within the discovered repository project root.

## 3. Consequences

### Positive
* Instant zero-config integration for Claude Desktop, Cursor, and Windsurf via standard MCP config (`npx -y @mdninja/cli mcp`).
* AI agents reliably adhere to sequential ADR naming (`0001`, `0002`...) and roadmap task toggles without corrupting markdown structures.
* Developers can spin up the visual workbench in any repository with one command: `npx @mdninja/cli`.

### Negative
* Requires `@modelcontextprotocol/sdk` dependency inside `@mdninja/cli`.

## 4. 🤖 Agent Enforcement

* **DO:** When running as an MCP client or interacting with `@mdninja/cli`, use `mdninja mcp` as the stdio entrypoint.
* **DO:** Use `create_adr` tool or follow `0000-template.md` to ensure sequential ADR numbering and mandatory agent enforcement blocks.
* **DO NOT:** Permit file writes outside the detected living canon repository root.
* **DO NOT:** Reintroduce legacy command names or aliases.
