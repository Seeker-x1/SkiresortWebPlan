import { NextResponse } from "next/server";
import {
  getLiftGeoJson,
  getLiftMarkers,
  getMapCenter,
  getOverlayPaths,
  getTrailGeoJson,
} from "@/lib/map-data";
import { getFeatureManifest } from "@/lib/map-features";

export const runtime = "nodejs";

export async function GET() {
  const [center, lifts, trails, overlay, liftMarkers, manifest] = await Promise.all([
    getMapCenter(),
    getLiftGeoJson(),
    getTrailGeoJson(),
    getOverlayPaths(),
    getLiftMarkers(),
    getFeatureManifest(),
  ]);

  const liftMarkersOut =
    liftMarkers?.lifts?.map((l) => ({
      id: l.id,
      label: l.label,
      source: l.source,
      path: l.path,
      stations: l.stations,
      type: "lift" as const,
    })) ?? [];

  const trailMarkersOut =
    liftMarkers?.trails?.map((t) => ({
      id: t.id,
      label: t.label,
      source: t.source,
      path: t.path,
      stations: t.stations ?? [],
      type: "trail" as const,
    })) ?? [];

  const hitboxes = [...liftMarkersOut, ...trailMarkersOut];

  return NextResponse.json({
    center,
    lifts,
    trails,
    hero: manifest?.heroImage ?? overlay?.image ?? liftMarkers?.hero ?? null,
    liftMarkers: liftMarkersOut.length ? liftMarkersOut : null,
    hitboxes: hitboxes.length ? hitboxes : null,
    overlay,
    controlPoints: overlay?.controlPoints ?? null,
    disclaimer: manifest?.disclaimer ?? null,
    attribution: {
      osm: "© OpenStreetMap contributors (ODbL)",
      openskimap: "Skimap.org / SkiAreas/view/1345",
      hero: "パンフレット風俯瞰イラスト + OSM/skimap リフト",
    },
  });
}
