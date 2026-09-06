import fs from "fs/promises";
import path from "path";
import { FileItem, RepoScanResult } from "./types";
import canonData from "./canon-data.json";

export * from "./types";

/**
 * Finds the project root by walking upwards looking for .mdninja or mdninja.
 *
 * Upstream contract: when the CLI launches the workbench against an explicit
 * directory (`mdninja dev --dir <path>`), it sets TARGET_CANON_DIR. Honor that
 * first so the workbench serves the requested repo; otherwise fall back to the
 * conventional walk-up from the process cwd.
 */
export async function getProjectRoot(): Promise<string> {
  const target = process.env.TARGET_CANON_DIR;
  if (target) {
    try {
      const resolved = path.resolve(target);
      const stat = await fs.stat(resolved);
      if (stat.isDirectory()) {
        return resolved;
      }
    } catch {
      // Not a valid directory — fall through to cwd-based detection.
    }
  }

  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    try {
      const entries = await fs.readdir(current);
      if (entries.includes(".mdninja") || entries.includes("mdninja")) {
        return current;
      }
      if (entries.includes("package.json") && entries.includes("apps") && entries.includes("packages")) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    } catch {
      break;
    }
  }
  return process.cwd();
}

/**
 * Loads project configuration from .mdninja/config.json
 */
export async function getProjectConfig(root: string): Promise<{ canon?: string; name?: string; preferences?: { pinned?: string[] } } | null> {
  const configLocation = path.join(root, ".mdninja", "config.json");
  try {
    const data = await fs.readFile(configLocation, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Recursively scans a directory for markdown and diagram files, sorted naturally
 */
async function scanDir(baseDir: string, subDir: string): Promise<FileItem[]> {
  const fullPath = path.join(baseDir, subDir);
  const items: FileItem[] = [];

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
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") continue;

      const relPath = path.join(subDir, entry.name).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const children = await scanDir(baseDir, relPath);
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

export async function scanRepository(): Promise<RepoScanResult> {
  const root = await getProjectRoot();
  const config = await getProjectConfig(root);
  const rootName = config?.name || path.basename(root);

  // Determine canon directory (check config or default to mdninja)
  const canonDirName = config?.canon ? config.canon.replace(/^\.\//, "") : "mdninja";

  // 1. Living Canon (mdninja/)
  const canon = await scanDir(root, canonDirName);

  // 2. docs/
  let docs = await scanDir(root, "docs");
  if (docs.length === 0) {
    docs = await scanDir(root, "doc");
  }

  // 3. .agents/
  const agents = await scanDir(root, ".agents");

  // 4. Root markdown files
  const rootFiles: FileItem[] = [];
  try {
    const rootEntries = await fs.readdir(root, { withFileTypes: true });
    rootEntries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of rootEntries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".markdown"))
      ) {
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

  // If disk has files, use live filesystem
  if (canon.length > 0 || docs.length > 0 || rootFiles.length > 0) {
    return {
      rootName,
      canonName: canonDirName,
      canon,
      docs,
      agents,
      rootFiles,
    };
  }

  // Fallback to build-time bundled canon (for serverless environments like Vercel)
  return canonData.scanResult as RepoScanResult;
}
