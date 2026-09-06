import { NextResponse } from "next/server";
import { scanRepository } from "@/lib/scanner";

export async function GET() {
  try {
    const result = await scanRepository();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
