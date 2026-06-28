import type { AreaFeature, AreaMapData, LocalizedString } from "@/lib/area-map-types";

export type LayerKey = "food" | "onsen" | "anchor";

export const LAYER_KEYS: LayerKey[] = ["food", "onsen", "anchor"];
export const DEFAULT_LAYERS: LayerKey[] = ["food", "anchor"];
export const FALLBACK_CENTER: [number, number] = [40.69839, 141.099714];
export const FALLBACK_ZOOM = 11;

export type BoundsProfileKey =
  | "skiFood"
  | "onsen"
  | "onsenAnchor"
  | "foodOnsen"
  | "anchorAll";

export function pickLocalized(obj: LocalizedString | undefined, locale: "ja" | "en") {
  if (!obj) return "";
  return locale === "en" ? obj.en || obj.ja : obj.ja || obj.en;
}

export function allAreaFeatures(data: AreaMapData): AreaFeature[] {
  return [
    ...data.anchors.map((f) => ({ ...f, group: "anchor" as const })),
    ...data.food.map((f) => ({ ...f, group: "food" as const })),
    ...data.onsen.map((f) => ({ ...f, group: "onsen" as const })),
  ];
}

export function resolvedFixedAnchorIds(data: AreaMapData, features: AreaFeature[]) {
  if (data.fixedAnchorIds?.length) {
    return new Set(data.fixedAnchorIds);
  }
  const ids = new Set<string>(["ski"]);
  if (features.some((f) => f.id === "biei-station")) ids.add("biei-station");
  if (features.some((f) => f.id === "station")) ids.add("station");
  return ids;
}

export function resolveBoundsProfile(activeLayers: Set<LayerKey>): BoundsProfileKey {
  const hasFood = activeLayers.has("food");
  const hasOnsen = activeLayers.has("onsen");
  const hasAnchor = activeLayers.has("anchor");
  if (hasFood && hasOnsen) return "foodOnsen";
  if (hasOnsen && !hasFood && !hasAnchor) return "onsen";
  if (hasOnsen && !hasFood && hasAnchor) return "onsenAnchor";
  if (hasAnchor && !hasFood && !hasOnsen) return "anchorAll";
  return "skiFood";
}

export function featuresForBounds(
  data: AreaMapData,
  profile: BoundsProfileKey,
  filtered: AreaFeature[],
  ensureIds: string[] = [],
) {
  const cfg = data.boundsProfiles?.[profile];
  const ensureSet = new Set(ensureIds);

  function passesFilter(f: AreaFeature) {
    if (!cfg) return true;
    if (cfg.includeGroups && !cfg.includeGroups.includes(f.group)) return false;
    if (
      cfg.excludeFoodIds &&
      f.group === "food" &&
      cfg.excludeFoodIds.includes(f.id) &&
      !ensureSet.has(f.id)
    ) {
      return false;
    }
    if (cfg.excludeAnchorIds && f.group === "anchor" && cfg.excludeAnchorIds.includes(f.id)) {
      return false;
    }
    if (cfg.includeAnchorIds && f.group === "anchor" && !cfg.includeAnchorIds.includes(f.id)) {
      return false;
    }
    return true;
  }

  const result = filtered.filter(passesFilter);
  for (const id of ensureIds) {
    if (result.some((f) => f.id === id)) continue;
    const extra = filtered.find((f) => f.id === id);
    if (extra) result.push(extra);
  }
  return result;
}

export function appendVisibleFixedAnchors(
  feats: AreaFeature[],
  fixedIds: Set<string>,
  fixedVisible: Record<string, boolean>,
  featureById: (id: string) => AreaFeature | undefined,
) {
  const result = [...feats];
  const ids = new Set(result.map((f) => f.id));
  for (const id of fixedIds) {
    if (fixedVisible[id] === false || ids.has(id)) continue;
    const f = featureById(id);
    if (f) result.push(f);
  }
  return result;
}

export function isFeatureOnMap(
  feature: AreaFeature,
  activeLayers: Set<LayerKey>,
  fixedIds: Set<string>,
  fixedVisible: Record<string, boolean>,
) {
  if (activeLayers.has(feature.group)) return true;
  return fixedIds.has(feature.id) && fixedVisible[feature.id] !== false;
}

export function markersForRender(
  filtered: AreaFeature[],
  fixedIds: Set<string>,
  fixedVisible: Record<string, boolean>,
  featureById: (id: string) => AreaFeature | undefined,
) {
  const visible = [...filtered];
  const ids = new Set(visible.map((f) => f.id));
  for (const id of fixedIds) {
    if (fixedVisible[id] === false || ids.has(id)) continue;
    const f = featureById(id);
    if (f) visible.push(f);
  }
  return visible;
}

export function sortForList(items: AreaFeature[], fixedIds: Set<string>) {
  return items.filter((f) => !fixedIds.has(f.id) && !f.listExclude);
}

export function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function districtLabel(feature: AreaFeature, locale: "ja" | "en") {
  const district = pickLocalized(feature.district, locale);
  if (district) return district;
  return pickLocalized(feature.region, locale);
}
