import { NextResponse } from "next/server";
import { getMapStatusPayload } from "@/lib/map-features";

export async function GET() {
  const payload = await getMapStatusPayload();
  if (!payload) {
    return NextResponse.json({ error: "map status unavailable" }, { status: 503 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
    },
  });
}
