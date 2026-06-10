export type LineFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: { type: "LineString"; coordinates: [number, number][] };
  }>;
};

/** 七戸町営スキー場 — OpenSkiMap / center.json 基準 */
export const RESORT_CENTER: [number, number] = [141.0975, 40.69805];

export const INITIAL_CAMERA = {
  center: RESORT_CENTER,
  zoom: 14.8,
  pitch: 60,
  bearing: 25,
} as const;

export const STATUS_LINE_COLORS: Record<string, string> = {
  operating: "#22c55e",
  open: "#38bdf8",
  stopped: "#64748b",
  closed: "#64748b",
  hold: "#f59e0b",
  partial: "#fbbf24",
  unknown: "#94a3b8",
};

export function liftMidpointMarkers(
  lifts: LineFeatureCollection,
  statusById: Record<string, { status: string } | undefined>,
) {
  return {
    type: "FeatureCollection" as const,
    features: lifts.features.map((f) => {
      const coords = f.geometry.coordinates;
      const mid = coords[Math.floor(coords.length / 2)] ?? coords[0];
      const id = String(f.properties?.id ?? "");
      const status = statusById[id]?.status ?? "unknown";
      return {
        type: "Feature" as const,
        properties: {
          id,
          name: f.properties?.name,
          status,
          lineColor: STATUS_LINE_COLORS[status] ?? STATUS_LINE_COLORS.unknown,
        },
        geometry: { type: "Point" as const, coordinates: mid },
      };
    }),
  };
}

export function mergeStatusIntoGeoJson(
  collection: LineFeatureCollection,
  statusById: Record<string, { status: string } | undefined>,
): LineFeatureCollection {
  return {
    ...collection,
    features: collection.features.map((f) => {
      const id = String(f.properties?.id ?? "");
      const status = statusById[id]?.status ?? "unknown";
      return {
        ...f,
        properties: {
          ...f.properties,
          status,
          lineColor: STATUS_LINE_COLORS[status] ?? STATUS_LINE_COLORS.unknown,
        },
      };
    }),
  };
}
