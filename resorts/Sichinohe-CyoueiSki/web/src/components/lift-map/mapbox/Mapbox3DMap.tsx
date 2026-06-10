"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  INITIAL_CAMERA,
  liftMidpointMarkers,
  mergeStatusIntoGeoJson,
  type LineFeatureCollection,
} from "./constants";
import {
  addGsiElevRasterPreview,
  enableAtmosphere,
  enableMapboxTerrain,
} from "./terrain";

type MapBundle = {
  center: { lat: number; lng: number; elevationM?: { base: number; top: number } };
  lifts: LineFeatureCollection;
  trails: LineFeatureCollection;
};

type Props = {
  accessToken: string;
  mapData: MapBundle;
  statusById: Record<string, { status: string } | undefined>;
  onSelectFeature: (id: string) => void;
  className?: string;
};

const INTERACTIVE_LAYERS = ["lifts-line", "trails-line", "lifts-markers"] as const;

function addOverlayLayers(
  map: mapboxgl.Map,
  lifts: LineFeatureCollection,
  trails: LineFeatureCollection,
  markers: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: Record<string, unknown>;
      geometry: { type: "Point"; coordinates: [number, number] };
    }>;
  },
) {
  if (!map.getSource("lifts")) {
    map.addSource("lifts", { type: "geojson", data: lifts, lineMetrics: true });
    map.addSource("trails", { type: "geojson", data: trails, lineMetrics: true });
    map.addSource("lift-markers", { type: "geojson", data: markers });

    map.addLayer({
      id: "trails-line",
      type: "line",
      source: "trails",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": ["get", "lineColor"],
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 4, 16, 10],
        "line-opacity": 0.92,
        "line-emissive-strength": 0.35,
      },
    });

    map.addLayer({
      id: "lifts-line",
      type: "line",
      source: "lifts",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": ["get", "lineColor"],
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 5, 16, 12],
        "line-opacity": 1,
        "line-emissive-strength": 0.5,
      },
    });

    map.addLayer({
      id: "lifts-markers",
      type: "circle",
      source: "lift-markers",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 13, 6, 16, 11],
        "circle-color": ["get", "lineColor"],
        "circle-stroke-width": 2.5,
        "circle-stroke-color": "#ffffff",
        "circle-emissive-strength": 0.65,
      },
    });

    map.addLayer({
      id: "resort-label",
      type: "symbol",
      source: "lifts",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 12,
        "text-offset": [0, 1.2],
        "text-anchor": "top",
        "symbol-placement": "line-center",
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#0f172a",
        "text-halo-width": 1.5,
      },
    });
  } else {
    (map.getSource("lifts") as mapboxgl.GeoJSONSource).setData(lifts);
    (map.getSource("trails") as mapboxgl.GeoJSONSource).setData(trails);
    (map.getSource("lift-markers") as mapboxgl.GeoJSONSource).setData(markers);
  }
}

export function Mapbox3DMap({
  accessToken,
  mapData,
  statusById,
  onSelectFeature,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelectFeature);
  onSelectRef.current = onSelectFeature;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: INITIAL_CAMERA.center,
      zoom: INITIAL_CAMERA.zoom,
      pitch: INITIAL_CAMERA.pitch,
      bearing: INITIAL_CAMERA.bearing,
      antialias: true,
      maxPitch: 75,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      enableMapboxTerrain(map, 1.85);
      enableAtmosphere(map);
      addGsiElevRasterPreview(map);

      const lifts = mergeStatusIntoGeoJson(mapData.lifts, statusById);
      const trails = mergeStatusIntoGeoJson(mapData.trails, statusById);
      const markers = liftMidpointMarkers(mapData.lifts, statusById);
      addOverlayLayers(map, lifts, trails, markers);

      map.flyTo({
        center: [mapData.center.lng, mapData.center.lat],
        zoom: INITIAL_CAMERA.zoom,
        pitch: INITIAL_CAMERA.pitch,
        bearing: INITIAL_CAMERA.bearing,
        duration: 1200,
        essential: true,
      });
    });

    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [...INTERACTIVE_LAYERS],
      });
      const hit = features.find((f) => f.properties?.id);
      if (hit?.properties?.id) {
        onSelectRef.current(String(hit.properties.id));
      }
    });

    map.on("mouseenter", INTERACTIVE_LAYERS[0], () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", INTERACTIVE_LAYERS[0], () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", INTERACTIVE_LAYERS[1], () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", INTERACTIVE_LAYERS[1], () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; token/data patched in other effects
  }, [accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const lifts = mergeStatusIntoGeoJson(mapData.lifts, statusById);
      const trails = mergeStatusIntoGeoJson(mapData.trails, statusById);
      const markers = liftMidpointMarkers(mapData.lifts, statusById);
      addOverlayLayers(map, lifts, trails, markers);
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [mapData, statusById]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full"}
      role="application"
      aria-label="七戸町営スキー場 3D地形マップ"
    />
  );
}
