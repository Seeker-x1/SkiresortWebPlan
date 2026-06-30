import type { FeatureType } from "./types";
import { STATUS_COLORS } from "./types";

export const ILLUSTRATION_COLORS = {
  lift: "#1a1a1a",
  beginner: "#2fa84a",
  intermediate: "#d62839",
  advanced: "#6d28d9",
} as const;

export const FEATURE_COLORS: Record<string, string> = {
  "lift-pair": ILLUSTRATION_COLORS.lift,
  "lift-pony": ILLUSTRATION_COLORS.lift,
  "trail-intermediate": ILLUSTRATION_COLORS.beginner,
  "trail-upper": ILLUSTRATION_COLORS.intermediate,
  "trail-champion": ILLUSTRATION_COLORS.advanced,
  "trail-forest": ILLUSTRATION_COLORS.beginner,
  "trail-pony": ILLUSTRATION_COLORS.beginner,
};

export function featureAccentColor(id: string, type: FeatureType): string {
  return FEATURE_COLORS[id] ?? (type === "lift" ? ILLUSTRATION_COLORS.lift : ILLUSTRATION_COLORS.beginner);
}

export function featureListBadgeColor(
  id: string,
  type: FeatureType,
  status: string,
): string {
  if (status === "operating" || status === "open") {
    return STATUS_COLORS[status];
  }
  if (status === "stopped" || status === "closed" || status === "hold" || status === "unknown") {
    return STATUS_COLORS[status] ?? STATUS_COLORS.unknown;
  }
  return featureAccentColor(id, type);
}
