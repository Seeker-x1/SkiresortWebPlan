import { featureAccentColor } from "./feature-colors";
import type { FeatureType, MapFeature } from "./types";
import { STATUS_COLORS } from "./types";

export function strokeForFeature(
  id: string,
  _statusById: Record<string, MapFeature | undefined>,
  kind: "lift" | "trail",
): string {
  return featureAccentColor(id, kind);
}

export function isStoppedLift(
  id: string,
  statusById: Record<string, MapFeature | undefined>,
): boolean {
  const status = statusById[id]?.status;
  return status === "stopped" || status === "closed";
}

export function trailOpacity(
  id: string,
  statusById: Record<string, MapFeature | undefined>,
): number {
  const status = statusById[id]?.status;
  if (status === "closed") return 0.35;
  if (status === "partial") return 0.65;
  return 0.9;
}

export type MapHighlightStyle = {
  show: boolean;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dasharray?: string;
};

/** A 方式: 焼き込み線の上に載せるハイライト（B6 停止リフト = グレー破線） */
export function mapHighlightStyle(
  id: string,
  type: FeatureType,
  statusById: Record<string, MapFeature | undefined>,
  selected: boolean,
  bakedLines: boolean,
): MapHighlightStyle {
  const accent = featureAccentColor(id, type);
  const status = statusById[id]?.status;

  if (type === "lift") {
    if (isStoppedLift(id, statusById)) {
      return {
        show: true,
        stroke: STATUS_COLORS.stopped,
        strokeWidth: selected ? 3 : 2,
        opacity: selected ? 0.95 : 0.72,
        dasharray: "6 4",
      };
    }
    if (status === "hold" || status === "unknown") {
      return {
        show: true,
        stroke: STATUS_COLORS.hold ?? STATUS_COLORS.unknown,
        strokeWidth: selected ? 3 : 2,
        opacity: selected ? 0.95 : 0.72,
        dasharray: "4 3",
      };
    }
    if (bakedLines) {
      return {
        show: selected,
        stroke: accent,
        strokeWidth: 3,
        opacity: 1,
      };
    }
    return {
      show: true,
      stroke: accent,
      strokeWidth: selected ? 3 : 1.5,
      opacity: 0.9,
    };
  }

  const closed = status === "closed";
  const partial = status === "partial";
  if (closed) {
    return {
      show: true,
      stroke: STATUS_COLORS.closed,
      strokeWidth: selected ? 3 : 2,
      opacity: trailOpacity(id, statusById),
      dasharray: "5 4",
    };
  }
  if (partial) {
    return {
      show: bakedLines ? selected : true,
      stroke: accent,
      strokeWidth: selected ? 3 : 1.5,
      opacity: trailOpacity(id, statusById),
      dasharray: "8 4",
    };
  }
  if (bakedLines) {
    return {
      show: selected,
      stroke: accent,
      strokeWidth: 3,
      opacity: 1,
    };
  }
  return {
    show: true,
    stroke: accent,
    strokeWidth: selected ? 3 : 1.5,
    opacity: trailOpacity(id, statusById),
  };
}
