import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getProjectRoot } from "@/lib/scanner";

export async function POST() {
  try {
    const root = await getProjectRoot();

    // 1. Create .mdninja/config.json if missing
    const dotMdNinja = path.join(root, ".mdninja");
    await fs.mkdir(dotMdNinja, { recursive: true });
    const configPath = path.join(dotMdNinja, "config.json");
    try {
      await fs.access(configPath);
    } catch {
      const initialConfig = {
        "$schema": "https://mdninja.navinhill.com/schema.json",
        name: path.basename(root),
        canon: "./mdninja",
        include: ["mdninja/**/*.md", "docs/**/*.md", ".agents/**/*.md", "*.md"],
        exclude: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
        preferences: {
          defaultLayout: "single",
          pinned: ["mdninja/roadmaps/roadmap.md", "mdninja/diagrams/architecture.md"],
        },
      };
      await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2), "utf8");
    }

    // 2. Create mdninja/ canonical directories
    const dirs = ["decisions", "roadmaps", "diagrams", "research", "notes", "audits", "standards", "changelog"];
    for (const dir of dirs) {
      await fs.mkdir(path.join(root, "mdninja", dir), { recursive: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
