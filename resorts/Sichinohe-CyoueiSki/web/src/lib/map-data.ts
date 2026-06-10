import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

type LiftFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string>;
    geometry: {
      type: "LineString";
      coordinates: Array<[number, number]>;
    };
  }>;
};

type MapCenter = {
  resortId: string;
  name: string;
  center: { lat: number; lng: number };
  elevationM: { base: number; top: number };
};

const MAP_DIR = path.join(process.cwd(), "data", "map");

export async function getMapCenter(): Promise<MapCenter | null> {
  noStore();
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, "center.json"), "utf-8");
    return JSON.parse(raw) as MapCenter;
  } catch {
    return null;
  }
}

export async function getLiftGeoJson(): Promise<LiftFeatureCollection | null> {
  noStore();
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, "lifts.geojson"), "utf-8");
    return JSON.parse(raw) as LiftFeatureCollection;
  } catch {
    return null;
  }
}

export async function getTrailGeoJson(): Promise<LiftFeatureCollection | null> {
  noStore();
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, "trails.geojson"), "utf-8");
    return JSON.parse(raw) as LiftFeatureCollection;
  } catch {
    return null;
  }
}

export type OverlayPathsFile = {
  viewBox: string;
  projection?: string;
  bbox?: { west: number; east: number; south: number; north: number };
  image?: { width: number; height: number; src: string };
  controlPoints?: Record<
    string,
    { lng: number; lat: number; pixel?: [number, number]; role?: string }
  >;
  features: Record<
    string,
    {
      type: "lift" | "trail";
      strokeWidth: number;
      path: string;
      markers?: [number, number][];
      source?: string;
    }
  >;
};

export type LiftMarkersFile = {
  hero: { src: string; width: number; height: number; viewBox: string };
  gsiReference?: {
    src: string;
    width: number;
    height: number;
    viewBox: string;
    bbox?: { west: number; east: number; south: number; north: number };
  };
  lifts: Array<{
    id: string;
    label: string;
    source: string;
    path: string;
    gsiPath?: string;
    stations: [number, number][];
    gsiStations?: [number, number][];
  }>;
  trails?: Array<{
    id: string;
    label: string;
    source: string;
    path: string;
    stations?: [number, number][];
  }>;
};

export async function getLiftMarkers(): Promise<LiftMarkersFile | null> {
  noStore();
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, "lift-markers.json"), "utf-8");
    return JSON.parse(raw) as LiftMarkersFile;
  } catch {
    return null;
  }
}

export async function getOverlayPaths(): Promise<OverlayPathsFile | null> {
  noStore();
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, "overlay-paths.json"), "utf-8");
    return JSON.parse(raw) as OverlayPathsFile;
  } catch {
    return null;
  }
}
