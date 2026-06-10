import { NextResponse } from "next/server";
import type { MapFeature } from "@/components/lift-map/types";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  getFeatureManifest,
  getStatusFile,
  updateMapStatusFile,
  type StatusFile,
} from "@/lib/map-features";
import { readRecentStatusAudit } from "@/lib/map-status-audit";

export const runtime = "nodejs";

type AdminMapStatusRow = {
  id: string;
  type: "lift" | "trail";
  label: string;
  shortLabel?: string;
  status: MapFeature["status"];
  reason?: string;
};

type PostBody = {
  features?: StatusFile["features"];
};

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [manifest, status] = await Promise.all([
    getFeatureManifest(),
    getStatusFile(),
  ]);
  if (!manifest || !status) {
    return NextResponse.json({ error: "map_data_unavailable" }, { status: 503 });
  }

  const statusById = new Map(status.features.map((f) => [f.id, f]));
  const rows: AdminMapStatusRow[] = manifest.features.map((entry) => {
    const live = statusById.get(entry.id);
    return {
      id: entry.id,
      type: entry.type,
      label: entry.label,
      shortLabel: entry.shortLabel,
      status: live?.status ?? "unknown",
      reason: live?.reason,
    };
  });

  const audit = await readRecentStatusAudit(8);

  return NextResponse.json({
    updatedAt: status.updatedAt,
    resortId: status.resortId,
    features: rows,
    audit,
  });
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.features || !Array.isArray(body.features) || body.features.length === 0) {
    return NextResponse.json({ error: "invalid_features" }, { status: 400 });
  }

  try {
    const next = await updateMapStatusFile(body.features);
    return NextResponse.json({
      ok: true,
      updatedAt: next.updatedAt,
      features: next.features,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "write_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
