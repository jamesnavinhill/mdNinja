import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getProjectRoot } from "@/lib/scanner";

function isSafePath(root: string, targetPath: string): boolean {
  const resolved = path.resolve(root, targetPath);
  return resolved.startsWith(root);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relPath = searchParams.get("path");

    if (!relPath) {
      return NextResponse.json({ error: "Missing 'path' parameter" }, { status: 400 });
    }

    const root = await getProjectRoot();
    if (!isSafePath(root, relPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    const fullPath = path.join(root, relPath);
    const content = await fs.readFile(fullPath, "utf8");
    const stats = await fs.stat(fullPath);

    return NextResponse.json({
      path: relPath,
      content,
      mtime: stats.mtimeMs,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: relPath, content } = body;

    if (!relPath || typeof content !== "string") {
      return NextResponse.json({ error: "Missing path or content" }, { status: 400 });
    }

    const root = await getProjectRoot();
    if (!isSafePath(root, relPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    const fullPath = path.join(root, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf8");
    const stats = await fs.stat(fullPath);

    return NextResponse.json({
      success: true,
      path: relPath,
      mtime: stats.mtimeMs,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
