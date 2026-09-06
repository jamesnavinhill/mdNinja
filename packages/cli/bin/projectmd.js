#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Launching projectmd Living Canon viewer...");

// Resolve apps/web directory relative to this script
const webDir = path.resolve(__dirname, "../../apps/web");

const nextProcess = spawn("npx", ["next", "dev", "--port", "3000"], {
  cwd: webDir,
  stdio: "inherit",
  shell: true,
});

nextProcess.on("error", (err) => {
  console.error("Failed to start projectmd:", err);
});
