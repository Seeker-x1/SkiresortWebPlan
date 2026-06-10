import { NextResponse } from "next/server";
import { getResortData } from "@/lib/resort-data";

export const runtime = "nodejs";

export async function GET() {
  const data = await getResortData();
  return NextResponse.json({
    updatedAt: data.updatedAt,
    resort: data.resort,
    today: data.today,
    access: data.access,
    courses: data.courses,
    ticketsRental: data.ticketsRental,
    lessonsEvents: data.lessonsEvents,
    stayLocal: data.stayLocal,
    news: data.news,
    liftDeals: data.liftDeals,
    liveCams: data.liveCams,
    faq: data.faq,
  });
}
