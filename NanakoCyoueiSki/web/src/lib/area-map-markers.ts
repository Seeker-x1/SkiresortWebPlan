import type { DivIcon, Icon } from "leaflet";
import type { AreaFeature } from "@/lib/area-map-types";

type MarkerManifest = {
  markers?: Record<
    string,
    {
      color?: string;
      files?: Record<string, string>;
    }
  >;
  sichinoheAreaMapping?: Record<string, string>;
  bieiAreaMapping?: Record<string, string>;
};

const ICON_BASE = "/area-map/icons/";

let manifestCache: MarkerManifest | null = null;

export async function loadMarkerManifest(): Promise<MarkerManifest> {
  if (manifestCache) return manifestCache;
  const res = await fetch("/area-map/marker-icons.json");
  manifestCache = res.ok ? ((await res.json()) as MarkerManifest) : {};
  return manifestCache;
}

function markerKeyFor(feature: AreaFeature, manifest: MarkerManifest) {
  const mapping = manifest.sichinoheAreaMapping || manifest.bieiAreaMapping || {};
  if (feature.group === "food") return mapping.food || "food";
  if (feature.group === "onsen") return mapping.onsen || "onsen";
  return mapping[`anchor.${feature.id}`] || "food";
}

function iconAssetUrl(manifest: MarkerManifest, key: string, size: number) {
  const files = manifest.markers?.[key]?.files;
  if (!files) return null;
  const assetSize = size >= 48 ? "48" : "32";
  const svgKey = assetSize === "48" ? "svg48" : "svg32";
  if (files[svgKey]) return `${ICON_BASE}${files[svgKey]}`;
  const png = files[assetSize] || files["32"];
  return png ? `${ICON_BASE}${png}` : null;
}

function markerColor(manifest: MarkerManifest, key: string) {
  return manifest.markers?.[key]?.color ?? "#64748b";
}

export function markerSize(feature: AreaFeature, active: boolean) {
  if (active) return 48;
  if (feature.id === "ski") return 40;
  return 32;
}

export async function makeAreaMarkerIcon(
  L: typeof import("leaflet"),
  feature: AreaFeature,
  active: boolean,
): Promise<DivIcon | Icon> {
  const manifest = await loadMarkerManifest();
  const size = markerSize(feature, active);
  const key = markerKeyFor(feature, manifest);
  const url = iconAssetUrl(manifest, key, size);

  if (url) {
    return L.icon({
      iconUrl: url,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: active ? "area-pin area-pin--active" : "area-pin",
    });
  }

  const color = markerColor(manifest, key);
  const dotSize = active ? 12 : feature.id === "ski" ? 14 : 10;
  return L.divIcon({
    className: "",
    html: `<span class="area-pin-dot${active ? " area-pin-dot--active" : ""}" style="--pin-color:${color};--pin-size:${dotSize}px"></span>`,
    iconSize: [dotSize * 2, dotSize * 2],
    iconAnchor: [dotSize, dotSize],
  });
}
