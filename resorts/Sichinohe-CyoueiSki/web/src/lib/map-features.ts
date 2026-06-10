import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { MapFeature, MapStatusPayload } from "@/components/lift-map/types";
import { appendStatusAudit } from "@/lib/map-status-audit";

const MAP_DIR = path.join(process.cwd(), "data", "map");

export type FeatureManifestEntry = {
  id: string;
  type: "lift" | "trail";
  label: string;
  shortLabel?: string;
  difficulty?: string;
  meta?: Record<string, string | number>;
};

export type FeatureManifest = {
  schemaVersion: string;
  resortId: string;
  name: string;
  mapAsset: string;
  heroImage?: {
    src: string;
    width: number;
    height: number;
    viewBox: string;
    credit?: string;
    attribution?: string;
    projection?: string;
  };
  illustratedHero?: {
    src: string;
    width: number;
    height: number;
    viewBox: string;
    credit?: string;
    attribution?: string;
    projection?: string;
  };
  viewBox?: string;
  disclaimer: string;
  sources: string[];
  features: FeatureManifestEntry[];
};

export type StatusFile = {
  schemaVersion: string;
  resortId: string;
  updatedAt: string;
  features: Array<{ id: string; status: MapFeature["status"]; reason?: string }>;
};

async function readJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getFeatureManifest(): Promise<FeatureManifest | null> {
  noStore();
  return readJson<FeatureManifest>("features.manifest.json");
}

export async function getMapStatusPayload(): Promise<MapStatusPayload | null> {
  noStore();
  const [manifest, status] = await Promise.all([
    readJson<FeatureManifest>("features.manifest.json"),
    readJson<StatusFile>("status.json"),
  ]);
  if (!manifest || !status) return null;

  const statusById = new Map(status.features.map((f) => [f.id, f]));

  const features: MapFeature[] = manifest.features.map((entry) => {
    const live = statusById.get(entry.id);
    return {
      id: entry.id,
      type: entry.type,
      label: entry.label,
      shortLabel: entry.shortLabel,
      difficulty: entry.difficulty,
      status: live?.status ?? "unknown",
      reason: live?.reason ?? null,
      meta: entry.meta,
    };
  });

  return {
    schemaVersion: status.schemaVersion,
    resortId: status.resortId,
    updatedAt: status.updatedAt,
    features,
  };
}

export async function getStatusFile(): Promise<StatusFile | null> {
  noStore();
  return readJson<StatusFile>("status.json");
}

export async function updateMapStatusFile(
  features: StatusFile["features"],
): Promise<StatusFile> {
  noStore();
  const current = await readJson<StatusFile>("status.json");
  const manifest = await readJson<FeatureManifest>("features.manifest.json");
  if (!current || !manifest) {
    throw new Error("map_status_files_missing");
  }

  const allowedIds = new Set(manifest.features.map((f) => f.id));
  for (const f of features) {
    if (!allowedIds.has(f.id)) {
      throw new Error(`unknown_feature_id:${f.id}`);
    }
  }

  const changes: Array<{ id: string; from?: string; to: string }> = [];
  for (const f of features) {
    const prev = current.features.find((p) => p.id === f.id);
    if (prev?.status !== f.status) {
      changes.push({ id: f.id, from: prev?.status, to: f.status });
    }
  }

  const next: StatusFile = {
    ...current,
    updatedAt: new Date().toISOString(),
    features,
  };

  await fs.writeFile(
    path.join(MAP_DIR, "status.json"),
    `${JSON.stringify(next, null, 2)}\n`,
    "utf-8",
  );

  if (changes.length > 0) {
    await appendStatusAudit({
      at: new Date().toISOString(),
      source: "admin",
      updatedAt: next.updatedAt,
      changes,
    });
  }

  return next;
}
