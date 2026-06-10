import type { FeatureType } from "./types";
import { STATUS_COLORS } from "./types";

/** layout-v4 イラスト焼き込み線と同系色 */
export const ILLUSTRATION_COLORS = {
  lift: "#1a1a1a",
  beginner: "#2fa84a",
  intermediate: "#d62839",
  advanced: "#6d28d9",
} as const;

/** 公式コース番号・イラスト色に対応（manifest id） */
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

/** リストのバッジ: 通常はコース/リフト色、停止・閉鎖時のみステータス色 */
export function featureListBadgeColor(
  id: string,
  type: FeatureType,
  status: string,
): string {
  if (status === "stopped" || status === "closed" || status === "hold" || status === "unknown") {
    return STATUS_COLORS[status] ?? STATUS_COLORS.unknown;
  }
  return featureAccentColor(id, type);
}
