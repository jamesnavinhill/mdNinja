import { NextResponse } from "next/server";
import { getProjectRoot } from "@/lib/scanner";
import { initCanon } from "@mdninja/canon";

/**
 * Scaffold the living canon from within the running web app.
 * Delegates to the shared `@mdninja/canon` contract so the config shape and the
 * canonical directory layout are identical to the CLI (`mdninja init`) — no
 * per-consumer fork, no drift.
 */
export async function POST() {
  try {
    const root = await getProjectRoot();
    const { createdConfig, createdDirs } = await initCanon(root);
    return NextResponse.json({ success: true, createdConfig, createdDirs });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
