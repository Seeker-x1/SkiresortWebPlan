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
  operating: "#7ec8e3",
  open: "#7ec8e3",
  stopped: "#64748b",
  closed: "#64748b",
  hold: "#f59e0b",
  partial: "#f59e0b",
  unknown: "#94a3b8",
};

export const STATUS_LABELS: Record<string, string> = {
  operating: "運転中",
  open: "滑走可",
  stopped: "停止",
  closed: "閉鎖",
  hold: "確認中",
  partial: "一部",
  unknown: "確認中",
};
