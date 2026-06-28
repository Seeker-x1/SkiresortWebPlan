import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { AreaMapData } from "@/lib/area-map-types";

export type { AreaFeature, AreaMapData, LocalizedString } from "@/lib/area-map-types";
export {
  allAreaFeatures,
  appendVisibleFixedAnchors,
  districtLabel,
  featuresForBounds,
  googleMapsUrl,
  isFeatureOnMap,
  markersForRender,
  pickLocalized,
  resolveBoundsProfile,
  resolvedFixedAnchorIds,
  sortForList,
} from "@/lib/area-map-runtime";

const AREA_FILE = path.join(process.cwd(), "data", "map", "area.json");

export async function getAreaMapData(): Promise<AreaMapData | null> {
  noStore();
  try {
    const raw = await fs.readFile(AREA_FILE, "utf-8");
    return JSON.parse(raw) as AreaMapData;
  } catch {
    return null;
  }
}
