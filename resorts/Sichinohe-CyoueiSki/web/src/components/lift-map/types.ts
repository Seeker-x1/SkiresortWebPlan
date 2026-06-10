export type FeatureType = "lift" | "trail";

export type LiftStatus = "operating" | "stopped" | "hold" | "unknown";
export type TrailStatus = "open" | "closed" | "partial" | "unknown";

export type MapFeatureStatus = LiftStatus | TrailStatus;

export interface MapFeature {
  id: string;
  type: FeatureType;
  status: MapFeatureStatus;
  label: string;
  shortLabel?: string;
  difficulty?: string;
  reason?: string | null;
  meta?: Record<string, string | number>;
}

export interface MapStatusPayload {
  schemaVersion: string;
  resortId: string;
  updatedAt: string;
  features: MapFeature[];
}

export { STATUS_COLORS } from "@/lib/status-colors";

/** Status badge labels: use `useMapStatusLabel()` + `messages/*.json` map.status */
