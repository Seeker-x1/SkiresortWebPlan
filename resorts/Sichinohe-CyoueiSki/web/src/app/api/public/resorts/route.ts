import { NextResponse } from "next/server";
import { getResortData } from "@/lib/resort-data";

export const runtime = "nodejs";

export async function GET() {
  const data = await getResortData();
  const openStatus = data.today.snapshot.find((item) => item.key === "operations_summary.open_status");
  const snowStatus = data.today.snapshot.find((item) => item.key === "snow_conditions.reported_depth_cm");

  return NextResponse.json({
    updatedAt: data.updatedAt,
    resorts: [
      {
        resortId: data.resort.id,
        slug: data.resort.slug,
        name: data.resort.name,
        area: data.resort.area,
        coordinates: data.resort.coordinates,
        status: {
          open: openStatus?.value ?? "要確認",
          snow: snowStatus?.value ?? "要確認",
        },
        links: {
          site: "/",
          popup: "/api/public/resort/popup",
          today: "/today",
          access: "/access",
        },
      },
    ],
  });
}
