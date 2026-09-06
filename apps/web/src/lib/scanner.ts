import fs from "fs/promises";
import path from "path";
import { FileItem, RepoScanResult } from "./types";
import canonData from "./canon-data.json";

export * from "./types";

/**
 * Finds the project root by walking upwards looking for .projectmd or projectmd
 */
export async function getProjectRoot(): Promise<string> {
  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    try {
      const entries = await fs.readdir(current);
      if (entries.includes(".projectmd") || entries.includes("projectmd")) {
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
  const rootName = path.basename(root);

  // 1. projectmd/
  const projectmd = await scanDir(root, "projectmd");

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
  if (projectmd.length > 0 || docs.length > 0 || rootFiles.length > 0) {
    return {
      rootName,
      projectmd,
      docs,
      agents,
      rootFiles,
    };
  }

  // Fallback to build-time bundled canon (for serverless environments like Vercel)
  return canonData.scanResult as RepoScanResult;
}
