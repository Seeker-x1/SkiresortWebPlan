import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { MapFeature, MapStatusPayload } from "@/components/lift-map/types";

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
  };
  viewBox?: string;
  disclaimer: string;
  sources: string[];
  features: FeatureManifestEntry[];
};

type StatusFile = {
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
