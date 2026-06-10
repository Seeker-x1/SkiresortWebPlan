"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { HeroMapCanvas } from "./HeroMapCanvas";
import { MapOverlayChrome } from "./MapOverlayChrome";
import { MapStaleBanner } from "./MapStaleBanner";
import { MapStatusRail } from "./MapStatusRail";
import type { HitboxFeature } from "./MapHitboxes";
import type { DifficultyBucket } from "./map-difficulty";
import type { MapFeature } from "./types";
import { mapFocusOnDark, mapFocusRing } from "./map-focus";
import { useMapStatusContext } from "./MapStatusContext";

type HeroImage = {
  src: string;
  width: number;
  height: number;
  viewBox: string;
};

type MapCenter = {
  name: string;
  center?: { lat: number; lng: number };
};

type MapApiResponse = {
  center: MapCenter | null;
  hero: HeroImage | null;
  hitboxes: HitboxFeature[] | null;
};

type StatusFilter = "all" | "lift" | "trail";

type Props = {
  variant?: "full" | "embed";
};

export function LiftMapViewer({ variant = "full" }: Props) {
  const isEmbed = variant === "embed";
  const t = useTranslations("map");
  const locale = useLocale();
  const { data, error, loading, refresh } = useMapStatusContext();
  const [mapBundle, setMapBundle] = useState<MapApiResponse | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    isEmbed ? "all" : "trail",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyBucket>("all");
  const [mobileStatusOpen, setMobileStatusOpen] = useState(false);

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

  const dateLocale = locale === "ja" ? "ja-JP" : "en-US";
  const updatedLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString(dateLocale, {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const shellClass = isEmbed
    ? "map-chrome relative h-[min(60dvh,640px)] min-h-[50dvh] w-full md:min-h-[480px]"
    : "map-chrome relative h-full min-h-0 w-full";

  const hasStatusRail = Boolean(data?.features.length);
  const resortCenter = mapBundle?.center?.center;

  if (mapLoadError || !mapBundle?.hero) {
    return (
      <div
        className={`map-chrome map-type-body ${isEmbed ? "min-h-[50dvh]" : "h-full min-h-0"} flex items-center justify-center px-6 text-sm text-[color:var(--muted)]`}
      >
        {t("errors.mapLoadFailed")}
        {mapLoadError ? ` (${mapLoadError})` : null}
      </div>
    );
  }

  const railProps = {
    features: data?.features ?? [],
    selectedId,
    selectedFeature: selected,
    updatedAt: updatedLabel,
    onSelect: setSelectedId,
    onDeselect: () => setSelectedId(null),
    filter: statusFilter,
    onFilterChange: setStatusFilter,
    searchQuery,
    onSearchChange: setSearchQuery,
    difficultyFilter,
    onDifficultyChange: setDifficultyFilter,
    resortCenter,
  };

  const splitRail = hasStatusRail && !isEmbed;

  const mapStage = (
    <div className="relative h-full min-h-0 min-w-0 flex-1">
      <HeroMapCanvas
        hero={mapBundle.hero}
        hitboxes={mapBundle.hitboxes ?? []}
        statusById={statusById}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDeselect={() => setSelectedId(null)}
        statusFilter={statusFilter}
        difficultyFilter={difficultyFilter}
        railOverlay={!splitRail && hasStatusRail}
      />

      {isEmbed ? (
        <MapOverlayChrome
          resortName={mapBundle.center?.name ?? t("resortFallback")}
          updatedLabel={updatedLabel}
          onRefresh={() => void refresh()}
          statusStale={Boolean(error)}
          statusError={error}
          statusRetrying={loading}
        />
      ) : null}

      {hasStatusRail ? (
        <button
          type="button"
          onClick={() => setMobileStatusOpen(true)}
          className={`map-type-body pointer-events-auto absolute bottom-4 left-4 z-20 border border-[color:var(--map-rail-border)] bg-[color:var(--map-rail-bg)] px-4 py-2.5 text-xs font-semibold text-[color:var(--map-rail-text)] shadow-sm md:hidden ${mapFocusRing}`}
        >
          {t("status.title")}
        </button>
      ) : null}

      {hasStatusRail && !splitRail ? (
        <aside className="pointer-events-auto absolute inset-y-0 right-0 z-20 hidden w-72 flex-col border-l border-[color:var(--map-rail-border)] bg-[color:var(--map-rail-bg)] md:flex">
          <MapStatusRail {...railProps} className="h-full" />
        </aside>
      ) : null}
    </div>
  );

  return (
    <div className={shellClass}>
      <div
        className={
          isEmbed
            ? "relative h-full min-h-0 w-full"
            : "flex h-full min-h-0 w-full flex-col"
        }
      >
        {!isEmbed && error ? (
          <MapStaleBanner
            statusError={error}
            statusRetrying={loading}
            onRefresh={() => void refresh()}
          />
        ) : null}
        <div
          className={
            splitRail
              ? "flex min-h-0 flex-1 w-full"
              : "relative min-h-0 flex-1 w-full"
          }
        >
          {mapStage}
          {splitRail ? (
            <aside className="hidden w-80 shrink-0 flex-col border-l border-[color:var(--map-rail-border)] bg-[color:var(--map-rail-bg)] md:flex">
              <MapStatusRail {...railProps} className="h-full min-h-0" />
            </aside>
          ) : null}
        </div>
      </div>

      {hasStatusRail ? (
        <>
          {mobileStatusOpen ? (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                type="button"
                aria-label={t("aria.close")}
                className={`absolute inset-0 bg-black/50 ${mapFocusOnDark}`}
                onClick={() => setMobileStatusOpen(false)}
              />
              <aside className="absolute inset-x-0 bottom-0 flex max-h-[min(70dvh,520px)] flex-col border-t border-[color:var(--map-rail-border)] bg-[color:var(--map-rail-bg)] shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--map-rail-border)] px-4 py-3">
                  <p className="map-type-display text-sm font-semibold text-[color:var(--map-rail-text)]">
                    {t("status.title")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileStatusOpen(false)}
                    className={`map-type-body rounded-full px-3 py-1 text-xs font-medium text-[color:var(--map-rail-muted)] hover:bg-[color:var(--canvas)] ${mapFocusRing}`}
                  >
                    {t("aria.close")}
                  </button>
                </div>
                <MapStatusRail {...railProps} className="min-h-0 flex-1" />
              </aside>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
