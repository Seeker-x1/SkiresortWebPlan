"use client";

import { useEffect, useMemo, useState } from "react";
import { FeatureSheet } from "./FeatureSheet";
import { HeroMapCanvas } from "./HeroMapCanvas";
import { MapOverlayChrome } from "./MapOverlayChrome";
import { MapStatusRail } from "./MapStatusRail";
import type { MapFeature } from "./types";
import { useMapStatus } from "./useMapStatus";

type HeroImage = {
  src: string;
  width: number;
  height: number;
};

type MapApiResponse = {
  center: { name: string } | null;
  hero: HeroImage | null;
};

type StatusFilter = "all" | "lift" | "trail";

export function LiftMapViewer() {
  const { data, error, loading, refresh } = useMapStatus();
  const [mapBundle, setMapBundle] = useState<MapApiResponse | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/map", { cache: "no-store" });
        if (!res.ok) throw new Error(`map api ${res.status}`);
        const json = (await res.json()) as MapApiResponse;
        if (!cancelled) setMapBundle(json);
      } catch (e) {
        if (!cancelled) {
          setMapLoadError(e instanceof Error ? e.message : "map load failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusById = useMemo(() => {
    const map: Record<string, MapFeature> = {};
    data?.features.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [data]);

  const selected = selectedId ? (statusById[selectedId] ?? null) : null;

  const updatedLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  if (mapLoadError || !mapBundle?.hero) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 text-sm text-slate-600">
        マップデータを読み込めませんでした。
        {mapLoadError ? `（${mapLoadError}）` : null}
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] min-h-[480px] w-full">
      <HeroMapCanvas hero={mapBundle.hero} />

      <MapOverlayChrome
        resortName={mapBundle.center?.name ?? "七戸町営スキー場"}
        updatedLabel={updatedLabel}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => void refresh()}
      />

      {data?.features.length ? (
        <MapStatusRail
          features={data.features}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={statusFilter}
        />
      ) : null}

      {error ? (
        <p
          role="alert"
          className="pointer-events-auto absolute left-3 right-3 top-28 z-30 rounded-lg bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow"
        >
          運行状況の取得に失敗しました。（{error}）
          {loading ? " 再試行中…" : null}
        </p>
      ) : null}

      <FeatureSheet
        feature={selected}
        updatedAt={updatedLabel}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
