import { NextResponse } from "next/server";
import { getResortData } from "@/lib/resort-data";

export const runtime = "nodejs";

export async function GET() {
  const data = await getResortData();
  const openStatus = data.today.snapshot.find((item) => item.key === "operations_summary.open_status");
  const snowStatus = data.today.snapshot.find((item) => item.key === "snow_conditions.reported_depth_cm");
  const liftStatus = data.today.snapshot.find((item) => item.key === "operations_summary.lift_summary");
  const nearestStation = data.access.cards.find((card) => card.k === "最寄り駅");
  const latestNews = data.news.items[0];

  return NextResponse.json({
    resortId: data.resort.id,
    slug: data.resort.slug,
    resortName: data.resort.name,
    area: data.resort.area,
    coordinates: data.resort.coordinates,
    updatedAt: data.updatedAt,
    status: {
      open: openStatus?.value ?? "要確認",
      snow: snowStatus?.value ?? "要確認",
      lift: liftStatus?.value ?? "要確認",
    },
    access: {
      nearestStation: nearestStation?.v ?? "要確認",
    },
    notice: data.today.notice,
    latestNews: latestNews
      ? {
          date: latestNews.date,
          title: latestNews.title,
          category: latestNews.category,
        }
      : null,
    links: {
      today: "/today",
      access: "/access",
      site: "/",
    },
  });
}
