export interface FileItem {
  name: string;
  relativePath: string;
  isDirectory: boolean;
  children?: FileItem[];
  mtime?: number;
}

export interface RepoScanResult {
  rootName: string;
  projectmd: FileItem[];
  docs: FileItem[];
  agents: FileItem[];
  rootFiles: FileItem[];
}

/**
 * Finds the top/first markdown document in a target directory dynamically
 */
export function getFirstDocInDirectory(target: string, scanData: RepoScanResult | null): string | null {
  if (!scanData) return null;

  function findFirstFile(items: FileItem[]): string | null {
    for (const item of items) {
      if (!item.isDirectory) return item.relativePath;
      if (item.children && item.children.length > 0) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  if (target === "docs") return findFirstFile(scanData.docs);
  if (target === "agents") return findFirstFile(scanData.agents);
  if (target === "root") return findFirstFile(scanData.rootFiles);
  if (target === "projectmd") return findFirstFile(scanData.projectmd);

  // Inside projectmd, find directory matching the target name
  const matchedDir = scanData.projectmd.find(
    (item) => item.isDirectory && item.name.toLowerCase() === target.toLowerCase()
  );
  if (matchedDir) {
    return findFirstFile([matchedDir]);
  }

  return null;
}
