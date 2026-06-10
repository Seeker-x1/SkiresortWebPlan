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

export const STATUS_COLORS: Record<string, string> = {
  operating: "#16a34a",
  open: "#16a34a",
  stopped: "#64748b",
  closed: "#64748b",
  hold: "#f59e0b",
  partial: "#f59e0b",
  unknown: "#94a3b8",
};

/** Status badge labels: use `useMapStatusLabel()` + `messages/*.json` map.status */
