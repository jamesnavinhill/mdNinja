/**
 * mdNinja Workbench Server Runner
 * Boots local Next.js living canon workbench or serves static distribution
 */

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const open = require("open");
const pc = require("picocolors");

async function startServer(options = {}) {
  const port = options.port || 3000;
  const targetDir = path.resolve(options.targetDir || process.cwd());
  const openBrowser = options.open !== false;

  console.log(pc.cyan(`\n🥷 mdNinja Living Canon Workbench`));
  console.log(pc.dim(`Target directory: ${targetDir}`));
  console.log(pc.dim(`Port: ${port}\n`));

  // Determine monorepo or installed package location
  const monorepoWebDir = path.resolve(__dirname, "../../apps/web");
  const isMonorepo = fs.existsSync(path.join(monorepoWebDir, "package.json"));

  if (isMonorepo) {
    console.log(pc.green(`✓ Monorepo web application detected at ${monorepoWebDir}`));
    console.log(pc.yellow(`Starting Next.js development server on http://localhost:${port}...`));

    const nextBin = path.join(monorepoWebDir, "node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");
    const cmd = fs.existsSync(nextBin) ? nextBin : "npx";
    const args = fs.existsSync(nextBin) ? ["dev", "-p", String(port)] : ["next", "dev", "-p", String(port)];

    const serverProc = spawn(cmd, args, {
      cwd: monorepoWebDir,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PORT: String(port),
        TARGET_CANON_DIR: targetDir,
      },
    });

    serverProc.on("error", (err) => {
      console.error(pc.red(`Failed to start server:`), err);
    });

    if (openBrowser) {
      setTimeout(() => {
        const url = `http://localhost:${port}`;
        console.log(pc.blue(`Opening browser at ${url}...`));
        open(url).catch(() => {});
      }, 3000);
    }

    process.on("SIGINT", () => {
      serverProc.kill("SIGINT");
      process.exit(0);
    });
  } else {
    // Standalone distribution
    console.log(pc.cyan(`ℹ️ Standalone mdNinja CLI mode.`));
    console.log(pc.green(`Living Canon located at: ${targetDir}`));
    console.log(pc.yellow(`Connect your AI coding assistants directly via MCP:`));
    console.log(pc.bold(`  npx @mdninja/cli mcp`));
    console.log(pc.dim(`Or visit the public cloud workbench at https://mdninja.navinhill.com\n`));

    if (openBrowser) {
      open("https://mdninja.navinhill.com").catch(() => {});
    }
  }
}

module.exports = { startServer };
