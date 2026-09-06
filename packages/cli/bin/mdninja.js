#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Launching mdNinja Living Canon workbench...");

// Check if running from monorepo development
const monorepoWebDir = path.resolve(__dirname, "../../apps/web");

if (fs.existsSync(monorepoWebDir)) {
  const nextProcess = spawn("npx", ["next", "dev", "--port", "3000"], {
    cwd: monorepoWebDir,
    stdio: "inherit",
    shell: true,
  });

  nextProcess.on("error", (err) => {
    console.error("Failed to start mdNinja:", err);
  });
} else {
  console.log("ℹ️ Running mdNinja in standalone target directory:", process.cwd());
  console.log("To run local production server, visit: https://mdninja.navinhill.com");
}
