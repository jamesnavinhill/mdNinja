import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve monorepo root
async function findRoot() {
  let cur = path.resolve(__dirname, "..");
  for (let i = 0; i < 5; i++) {
    try {
      const entries = await fs.readdir(cur);
      if (entries.includes("projectmd") || entries.includes(".projectmd")) {
        return cur;
      }
    } catch {
      //
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return path.resolve(__dirname, "../..");
}

async function scanDirectory(baseDir, subDir) {
  const fullPath = path.join(baseDir, subDir);
  const items = [];

  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    // Sort: directories first, then alphabetical
    entries.sort((a, b) => {
      if (a.isDirectory() === b.isDirectory()) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory() ? -1 : 1;
    });

    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".agents") continue;
      if (["node_modules", ".next", "dist", "build"].includes(entry.name)) continue;

      const relPath = path.join(subDir, entry.name).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const children = await scanDirectory(baseDir, relPath);
        items.push({
          name: entry.name,
          relativePath: relPath,
          isDirectory: true,
          children,
        });
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".markdown") || entry.name.endsWith(".excalidraw"))
      ) {
        const stats = await fs.stat(path.join(baseDir, relPath));
        items.push({
          name: entry.name,
          relativePath: relPath,
          isDirectory: false,
          mtime: stats.mtimeMs,
        });
      }
    }
  } catch {
    // Directory might not exist
  }

  return items;
}

async function collectAllFiles(items, baseDir, contentMap) {
  for (const item of items) {
    if (item.isDirectory && item.children) {
      await collectAllFiles(item.children, baseDir, contentMap);
    } else if (!item.isDirectory) {
      try {
        const fullPath = path.join(baseDir, item.relativePath);
        const text = await fs.readFile(fullPath, "utf8");
        contentMap[item.relativePath] = text;
      } catch (err) {
        console.warn("Could not read file for bundling:", item.relativePath, err);
      }
    }
  }
}

async function main() {
  const root = await findRoot();
  console.log(`[sync-canon] Scanning repository at: ${root}`);

  const projectmd = await scanDirectory(root, "projectmd");
  let docs = await scanDirectory(root, "docs");
  if (docs.length === 0) docs = await scanDirectory(root, "doc");
  const agents = await scanDirectory(root, ".agents");

  const rootFiles = [];
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".markdown"))) {
        const stats = await fs.stat(path.join(root, entry.name));
        rootFiles.push({
          name: entry.name,
          relativePath: entry.name,
          isDirectory: false,
          mtime: stats.mtimeMs,
        });
      }
    }
  } catch {
    //
  }

  const scanResult = {
    rootName: "projectmd",
    projectmd,
    docs,
    agents,
    rootFiles,
  };

  const contents = {};
  await collectAllFiles(projectmd, root, contents);
  await collectAllFiles(docs, root, contents);
  await collectAllFiles(agents, root, contents);
  await collectAllFiles(rootFiles, root, contents);

  const outData = {
    generatedAt: new Date().toISOString(),
    scanResult,
    contents,
  };

  const outPath = path.resolve(__dirname, "../src/lib/canon-data.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(outData, null, 2), "utf8");

  console.log(`[sync-canon] Successfully bundled ${Object.keys(contents).length} documents into ${outPath}`);
}

main().catch((err) => {
  console.error("[sync-canon] Error syncing canon:", err);
  process.exit(1);
});
