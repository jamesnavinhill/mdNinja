import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getProjectRoot } from "@/lib/scanner";

export async function POST() {
  try {
    const root = await getProjectRoot();

    // 1. Create .projectmd/config.json if missing
    const dotProjectMd = path.join(root, ".projectmd");
    await fs.mkdir(dotProjectMd, { recursive: true });
    const configPath = path.join(dotProjectMd, "config.json");
    try {
      await fs.access(configPath);
    } catch {
      const initialConfig = {
        "$schema": "https://projectmd.dev/schema.json",
        name: path.basename(root),
        canon: "./projectmd",
        include: ["projectmd/**/*.md", "docs/**/*.md", ".agents/**/*.md", "*.md"],
        exclude: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
        preferences: {
          defaultLayout: "single",
          pinned: ["projectmd/roadmaps/roadmap.md", "projectmd/diagrams/architecture.md"],
        },
      };
      await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2), "utf8");
    }

    // 2. Create projectmd/ canonical directories
    const dirs = ["decisions", "roadmaps", "diagrams", "research", "notes"];
    for (const dir of dirs) {
      await fs.mkdir(path.join(root, "projectmd", dir), { recursive: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
