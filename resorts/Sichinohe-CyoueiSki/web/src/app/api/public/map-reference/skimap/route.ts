import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SKIMAP_PATH = path.join(
  process.cwd(),
  "data",
  "map",
  "reference",
  "skimap-2012.jpg",
);

export async function GET() {
  try {
    const buf = await readFile(SKIMAP_PATH);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "skimap reference not found" }, { status: 404 });
  }
}
