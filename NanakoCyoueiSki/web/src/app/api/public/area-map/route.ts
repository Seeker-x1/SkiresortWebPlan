import { NextResponse } from "next/server";
import { getAreaMapData } from "@/lib/area-map-data";

export const runtime = "nodejs";

export async function GET() {
  const data = await getAreaMapData();
  if (!data) {
    return NextResponse.json({ error: "Area map data not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
