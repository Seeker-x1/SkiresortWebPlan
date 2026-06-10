import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  getResortData,
  updateResortData,
  type ResortData,
} from "@/lib/resort-data";

export const runtime = "nodejs";

type Body = {
  patch?: Partial<ResortData>;
};

const ALLOWED_PATCH_KEYS: Array<keyof ResortData> = [
  "resort",
  "today",
  "access",
  "courses",
  "ticketsRental",
  "lessonsEvents",
  "stayLocal",
  "news",
  "contact",
  "liftDeals",
  "liveCams",
  "faq",
];

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const data = await getResortData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[admin-resort] read failed:", error);
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.patch || typeof body.patch !== "object") {
    return NextResponse.json({ error: "invalid_patch" }, { status: 400 });
  }

  const patchKeys = Object.keys(body.patch);
  const hasUnknownKey = patchKeys.some(
    (key) => !ALLOWED_PATCH_KEYS.includes(key as keyof ResortData),
  );
  if (hasUnknownKey) {
    return NextResponse.json(
      { error: "invalid_patch_key", allowed: ALLOWED_PATCH_KEYS },
      { status: 400 },
    );
  }

  try {
    const next = await updateResortData(body.patch);
    return NextResponse.json(next);
  } catch (error) {
    console.error("[admin-resort] write failed:", error);
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
