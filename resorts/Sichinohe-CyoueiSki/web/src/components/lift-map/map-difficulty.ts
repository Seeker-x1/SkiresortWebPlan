import type { MapFeature } from "./types";

export type DifficultyBucket = "all" | "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_BUCKETS: DifficultyBucket[] = [
  "all",
  "beginner",
  "intermediate",
  "advanced",
];

/** Trail difficulty from manifest → filter bucket */
export function featureMatchesDifficulty(
  feature: MapFeature,
  bucket: DifficultyBucket,
): boolean {
  if (bucket === "all") return true;
  if (feature.type === "lift") return true;

  const d = feature.difficulty ?? "";
  if (bucket === "beginner") return d === "beginner";
  if (bucket === "intermediate") {
    return d === "intermediate" || d === "intermediate-advanced";
  }
  if (bucket === "advanced") {
    return d === "advanced" || d === "intermediate-advanced";
  }
  return true;
}
