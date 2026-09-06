/**
 * mdNinja Command-Line Interface (Commander)
 */

const { Command } = require("commander");
const { startServer } = require("./server.js");
const { initCanon } = require("./init.js");
const { startMcpServer } = require("./mcp.js");
const path = require("path");
const { spawn } = require("child_process");

function createProgram() {
  const program = new Command();

  program
    .name("mdninja")
    .description("🥷 mdNinja - Zero-constraint living canon visual workbench & MCP assistant")
    .version("1.0.0");

  program
    .command("dev", { isDefault: true })
    .description("Start the mdNinja visual living canon workbench")
    .option("-p, --port <number>", "Port to run the server on", "3000")
    .option("-d, --dir <path>", "Target project directory", process.cwd())
    .option("--no-open", "Do not automatically open browser")
    .action(async (options) => {
      await startServer({
        port: parseInt(options.port, 10),
        targetDir: options.dir,
        open: options.open,
      });
    });

  program
    .command("init")
    .description("Scaffold the .mdninja config and canonical mdninja/ directory layout")
    .option("-d, --dir <path>", "Target directory to initialize", process.cwd())
    .option("-f, --force", "Overwrite existing configuration", false)
    .action(async (options) => {
      await initCanon(options.dir, { force: options.force });
    });

  program
    .command("mcp")
    .description("Launch the Model Context Protocol (MCP) server over stdio for AI assistants")
    .action(async () => {
      await startMcpServer();
    });

  program
    .command("build")
    .description("Sync living canon documents and build the production bundle")
    .action(() => {
      const rootDir = path.resolve(__dirname, "../../");
      console.log("Syncing living canon...");
      const syncProc = spawn("npm", ["run", "sync-canon"], {
        cwd: path.join(rootDir, "apps", "web"),
        stdio: "inherit",
        shell: true,
      });
      syncProc.on("close", (code) => {
        if (code === 0) {
          console.log("Building Next.js application...");
          spawn("npm", ["run", "build"], {
            cwd: path.join(rootDir, "apps", "web"),
            stdio: "inherit",
            shell: true,
          });
        }
      });
    });

  return program;
}

module.exports = { createProgram };
