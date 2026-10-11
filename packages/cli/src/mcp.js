/**
 * mdNinja Model Context Protocol (MCP) Server
 * Exposes the Living Canon to AI Coding Assistants (Cursor, Claude Desktop, Windsurf, Antigravity)
 */

const fs = require("fs");
const path = require("path");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} = require("@modelcontextprotocol/sdk/types.js");

function findProjectRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, ".mdninja", "config.json"))) {
      return current;
    }
    if (fs.existsSync(path.join(current, "mdninja"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return process.cwd();
}

function getCanonConfig(projectRoot) {
  const configPath = path.join(projectRoot, ".mdninja", "config.json");
  let canonRel = "mdninja";
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (cfg.canon) {
        canonRel = cfg.canon.replace(/^\.\//, "");
      }
    } catch (e) {
      // fallback to default
    }
  }
  return {
    projectRoot,
    canonDir: path.join(projectRoot, canonRel),
    canonRel,
  };
}

function scanDirRecursive(dir, baseDir = dir) {
  const items = [];
  if (!fs.existsSync(dir)) return items;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      items.push({
        path: relPath,
        type: "directory",
        children: scanDirRecursive(fullPath, baseDir),
      });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".md", ".markdown", ".json", ".mmd", ".mermaid"].includes(ext)) {
        const stats = fs.statSync(fullPath);
        items.push({
          path: relPath,
          name: entry.name,
          type: "file",
          size: stats.size,
        });
      }
    }
  }
  return items;
}

function safeResolve(root, targetRel) {
  const resolved = path.resolve(root, targetRel);
  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error(`Security Exception: Path ${targetRel} traverses outside project root.`);
  }
  return resolved;
}

/**
 * AI-backed tools (suggest_adr, summarize_doc) call the Yrka Agency gateway —
 * OpenAI-compatible, free models only. The key comes from YRKA_GATEWAY_API_KEY
 * (or AGENCY_TOOLS_TOKEN fallback); tools fail with a clear message when unset.
 */
async function gatewayAiTool(name, args, canonDirAbs, projectRootAbs) {
  const apiKey = process.env.YRKA_GATEWAY_API_KEY || process.env.AGENCY_TOOLS_TOKEN;
  if (!apiKey) {
    return "AI tools are not configured: set YRKA_GATEWAY_API_KEY in your environment.";
  }
  const baseUrl = process.env.YRKA_GATEWAY_BASE_URL || "https://gateway.yrka.io/v1";
  const model = process.env.YRKA_MODEL || "nv-z-ai-glm-5-3-flash";

  let userContent;
  if (name === "summarize_doc") {
    const resolved = safeResolve(canonDirAbs, String(args.path || ""));
    if (!resolved) return `Invalid path: ${args.path}`;
    const fs = require("fs");
    if (!fs.existsSync(resolved)) return `Document not found: ${args.path}`;
    const doc = fs.readFileSync(resolved, "utf8");
    const maxWords = Number(args.maxWords) > 0 ? Number(args.maxWords) : 150;
    userContent = `Summarize this document in about ${maxWords} words (markdown, no preamble):

${doc.slice(0, 20000)}`;
  } else {
    const adrDir = require("path").join(canonDirAbs, "adr");
    const fs = require("fs");
    let styleSample = "";
    try {
      const existing = fs.readdirSync(adrDir).filter((f) => f.endsWith(".md")).slice(0, 1);
      if (existing.length) styleSample = fs.readFileSync(require("path").join(adrDir, existing[0]), "utf8").slice(0, 3000);
    } catch { /* no adr dir yet */ }
    userContent = `Draft an Architecture Decision Record titled "${args.title}".
Context and options:
${args.context}
${styleSample ? `Match the structure of this existing ADR:
${styleSample}` : "Use a standard ADR structure (Status/Context/Decision/Consequences)."}`;
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "x-agency-surface": "mdninja",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are the AI assistant embedded in the mdNinja canon MCP server. Be precise and terse." },
        { role: "user", content: userContent },
      ],
      max_tokens: 1200,
    }),
  });
  if (!res.ok) {
    return `Gateway request failed (${res.status}).`;
  }
  const data = await res.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return typeof content === "string" && content.trim() ? content : "Gateway returned no content.";
}

async function startMcpServer() {
  const projectRoot = findProjectRoot();
  const { canonDir, canonRel } = getCanonConfig(projectRoot);

  const server = new Server(
    {
      name: "mdninja-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_canon_structure",
          description:
            "Retrieve the complete hierarchy, file listing, and metadata of the mdNinja Living Canon.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "read_canon_doc",
          description:
            "Read a living canon markdown document, ADR, roadmap, or diagram specification.",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description:
                  "Relative file path from the project root (e.g., 'mdninja/roadmaps/roadmap.md' or 'mdninja/decisions/0001-living-canon-specification.md').",
              },
            },
            required: ["filePath"],
          },
        },
        {
          name: "write_canon_doc",
          description:
            "Write or update a document in the mdNinja Living Canon, automatically creating required subdirectories.",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Relative path inside the living canon or repository root.",
              },
              content: {
                type: "string",
                description: "Full markdown content to write.",
              },
            },
            required: ["filePath", "content"],
          },
        },
        {
          name: "list_adrs",
          description:
            "List all Architecture Decision Records (ADRs) recorded in mdninja/decisions/ with number, title, and status.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "create_adr",
          description:
            "Scaffold and create a new Architecture Decision Record in mdninja/decisions/ with sequential numbering and mandatory Agent Enforcement.",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the architecture decision (e.g. 'Model Context Protocol Stdio Server').",
              },
              status: {
                type: "string",
                enum: ["Proposed", "Accepted", "Superseded", "Deprecated"],
                default: "Accepted",
                description: "Decision status.",
              },
              context: {
                type: "string",
                description: "Context and problem statement.",
              },
              decision: {
                type: "string",
                description: "The architectural decision taken.",
              },
              consequences: {
                type: "string",
                description: "Consequences, trade-offs, and resulting state.",
              },
              enforcement: {
                type: "string",
                description: "Concrete rules for AI coding assistants to enforce.",
              },
            },
            required: ["title", "context", "decision"],
          },
        },
        {
          name: "get_roadmap",
          description:
            "Read and parse the current mdNinja Living Roadmap tasks and checklists.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "update_roadmap_task",
          description:
            "Toggle a checklist item in mdninja/roadmaps/roadmap.md as completed [x] or pending [ ].",
          inputSchema: {
            type: "object",
            properties: {
              taskQuery: {
                type: "string",
                description: "A substring identifying the task text to match.",
              },
              completed: {
                type: "boolean",
                description: "True to mark as [x], false to mark as [ ].",
              },
            },
            required: ["taskQuery", "completed"],
          },
        },
        {
          name: "suggest_adr",
          description:
            "Draft an Architecture Decision Record from a described decision, grounded in the repo's existing ADR style. Uses the Yrka Agency gateway (free models). Returns markdown ready for create_adr.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short decision title." },
              context: { type: "string", description: "The problem, forces, and options considered." },
            },
            required: ["title", "context"],
          },
        },
        {
          name: "summarize_doc",
          description:
            "Summarize a canon document via the Yrka Agency gateway (free models). Returns a short markdown summary.",
          inputSchema: {
            type: "object",
            properties: {
              path: { type: "string", description: "Canon-relative path of the document." },
              maxWords: { type: "number", description: "Approximate summary length (default 150)." },
            },
            required: ["path"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "get_canon_structure") {
        const structure = scanDirRecursive(canonDir, projectRoot);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  projectRoot,
                  canonPath: canonRel,
                  structure,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === "read_canon_doc") {
        const targetPath = safeResolve(projectRoot, args.filePath);
        if (!fs.existsSync(targetPath)) {
          throw new McpError(ErrorCode.InvalidRequest, `File not found: ${args.filePath}`);
        }
        const content = fs.readFileSync(targetPath, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      if (name === "write_canon_doc") {
        const targetPath = safeResolve(projectRoot, args.filePath);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, args.content, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: `Successfully wrote ${args.content.length} bytes to ${args.filePath}`,
            },
          ],
        };
      }

      if (name === "list_adrs") {
        const decisionsDir = path.join(canonDir, "decisions");
        if (!fs.existsSync(decisionsDir)) {
          return {
            content: [{ type: "text", text: "No decisions directory found at mdninja/decisions" }],
          };
        }

        const files = fs
          .readdirSync(decisionsDir)
          .filter((f) => f.endsWith(".md") && f !== "0000-template.md")
          .sort();

        const adrs = files.map((fileName) => {
          const content = fs.readFileSync(path.join(decisionsDir, fileName), "utf-8");
          const titleMatch = content.match(/^#\s+(?:ADR\s*\d+:\s*)?(.*)$/m);
          const statusMatch = content.match(/##\s+Status\s*\n+([^\n#]+)/i);
          return {
            file: fileName,
            path: path.join(canonRel, "decisions", fileName).replace(/\\/g, "/"),
            title: titleMatch ? titleMatch[1].trim() : fileName,
            status: statusMatch ? statusMatch[1].trim() : "Unknown",
          };
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(adrs, null, 2),
            },
          ],
        };
      }

      if (name === "create_adr") {
        const decisionsDir = path.join(canonDir, "decisions");
        fs.mkdirSync(decisionsDir, { recursive: true });

        const existing = fs
          .readdirSync(decisionsDir)
          .filter((f) => /^\d{4}-/.test(f))
          .map((f) => parseInt(f.slice(0, 4), 10));

        const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
        const numStr = String(nextNum).padStart(4, "0");
        const slug = args.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const fileName = `${numStr}-${slug}.md`;
        const filePath = path.join(decisionsDir, fileName);
        const dateStr = new Date().toISOString().split("T")[0];

        const adrContent = `# ADR ${numStr}: ${args.title}

## Status
${args.status || "Accepted"}

## Date
${dateStr}

## Context
${args.context}

## Decision
${args.decision}

## Consequences
${args.consequences || "No negative consequences identified."}

## 🤖 Agent Enforcement
${
  args.enforcement ||
  `- AI Coding Assistants must read this record before modifying related components.\n- Maintain architectural alignment as defined in this specification.`
}
`;

        fs.writeFileSync(filePath, adrContent, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: `Created Architecture Decision Record: ${path.join(canonRel, "decisions", fileName).replace(/\\/g, "/")}`,
            },
          ],
        };
      }

      if (name === "get_roadmap") {
        const roadmapPath = path.join(canonDir, "roadmaps", "roadmap.md");
        if (!fs.existsSync(roadmapPath)) {
          throw new McpError(ErrorCode.InvalidRequest, `Roadmap not found at ${roadmapPath}`);
        }
        const content = fs.readFileSync(roadmapPath, "utf-8");
        return {
          content: [{ type: "text", text: content }],
        };
      }

      if (name === "update_roadmap_task") {
        const roadmapPath = path.join(canonDir, "roadmaps", "roadmap.md");
        if (!fs.existsSync(roadmapPath)) {
          throw new McpError(ErrorCode.InvalidRequest, `Roadmap not found at ${roadmapPath}`);
        }
        let content = fs.readFileSync(roadmapPath, "utf-8");
        const lines = content.split("\n");
        let matched = false;

        const updatedLines = lines.map((line) => {
          if (line.includes(args.taskQuery)) {
            matched = true;
            if (args.completed) {
              return line.replace(/- \[[ xX]\]/, "- [x]");
            } else {
              return line.replace(/- \[[ xX]\]/, "- [ ]");
            }
          }
          return line;
        });

        if (!matched) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `No task matching query "${args.taskQuery}" found in roadmap.`
          );
        }

        fs.writeFileSync(roadmapPath, updatedLines.join("\n"), "utf-8");
        return {
          content: [
            {
              type: "text",
              text: `Updated roadmap task matching "${args.taskQuery}" to [${args.completed ? "x" : " "}]`,
            },
          ],
        };
      }

      if (name === "suggest_adr" || name === "summarize_doc") {
        const text = await gatewayAiTool(name, args, canonDir, projectRoot);
        return { content: [{ type: "text", text }] };
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    } catch (err) {
      if (err instanceof McpError) throw err;
      throw new McpError(ErrorCode.InternalError, err.message);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`mdNinja MCP Server running on stdio for root: ${projectRoot}\n`);
}

module.exports = { startMcpServer };
