import type { MapFeature } from "./types";

/** G3: sidebar text filter — label, shortLabel, id (case-insensitive) */
export function featureMatchesSearch(feature: MapFeature, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    feature.label,
    feature.shortLabel,
    feature.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
