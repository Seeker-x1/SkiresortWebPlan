"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { MapFeatureDetail } from "./MapFeatureDetail";
import { MapLocationPanel } from "./MapLocationPanel";
import {
  DIFFICULTY_BUCKETS,
  featureMatchesDifficulty,
  type DifficultyBucket,
} from "./map-difficulty";
import { featureMatchesSearch } from "./map-search";
import type { MapFeature } from "./types";
import { featureAccentColor, featureListBadgeColor } from "./feature-colors";
import { useMapStatusLabel } from "./map-i18n";
import { mapFocusRing } from "./map-focus";

type ResortCenter = {
  lat: number;
  lng: number;
};

type Props = {
  features: MapFeature[];
  selectedId: string | null;
  selectedFeature: MapFeature | null;
  updatedAt?: string;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  filter: "all" | "lift" | "trail";
  onFilterChange?: (filter: "all" | "lift" | "trail") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  difficultyFilter: DifficultyBucket;
  onDifficultyChange: (bucket: DifficultyBucket) => void;
  resortCenter?: ResortCenter;
  className?: string;
};

export function MapStatusRail({
  features,
  selectedId,
  selectedFeature,
  updatedAt,
  onSelect,
  onDeselect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  resortCenter,
  className = "",
}: Props) {
  const t = useTranslations("map");
  const statusLabel = useMapStatusLabel();

  const visible = useMemo(() => {
    let list = features.filter((f) => filter === "all" || f.type === filter);
    if (searchQuery.trim()) {
      list = list.filter((f) => featureMatchesSearch(f, searchQuery));
    }
    if (difficultyFilter !== "all") {
      list = list.filter((f) => featureMatchesDifficulty(f, difficultyFilter));
    }
    return list;
  }, [features, filter, searchQuery, difficultyFilter]);

  if (features.length === 0) return null;

  const lifts = visible.filter((f) => f.type === "lift");
  const trails = visible.filter((f) => f.type === "trail");
  const groups =
    filter === "lift"
      ? [{ title: t("groups.lifts"), items: lifts }]
      : filter === "trail"
        ? [{ title: t("groups.trails"), items: trails }]
        : [
            { title: t("groups.lifts"), items: lifts },
            { title: t("groups.trails"), items: trails },
          ].filter((g) => g.items.length > 0);

  const showDifficulty = filter !== "lift";

  return (
    <div
      className={`map-chrome flex min-h-0 flex-col ${className}`.trim()}
      aria-label={t("aria.status")}
    >
      <div className="shrink-0 border-b border-[color:var(--map-rail-border)] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="map-type-display text-sm font-bold text-[color:var(--map-rail-text)]">
            {t("status.title")}
          </h2>
          {updatedAt ? (
            <p className="map-type-mono shrink-0 text-[0.625rem] text-[color:var(--map-rail-muted)]">
              {updatedAt}
            </p>
          ) : null}
        </div>
        <div
          className="mt-3 flex gap-4 border-b border-[color:var(--map-rail-border)]"
          role="tablist"
          aria-label={t("aria.status")}
        >
          {(
            [
              { id: "trail" as const, label: t("filters.trails") },
              { id: "lift" as const, label: t("filters.lifts") },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange?.(tab.id)}
                className={`map-type-body -mb-px border-b-2 pb-2 text-xs font-semibold transition ${mapFocusRing} ${
                  active
                    ? "border-[color:var(--map-rail-text)] text-[color:var(--map-rail-text)]"
                    : "border-transparent text-[color:var(--map-rail-muted)] hover:text-[color:var(--map-rail-text)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <label className="map-type-body mt-3 block">
          <span className="sr-only">{t("search.label")}</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.label")}
            className={`map-type-body w-full rounded-md border border-[color:var(--map-rail-border)] bg-[color:var(--canvas)] px-3 py-2 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--map-rail-muted)] ${mapFocusRing}`}
          />
        </label>
        {showDifficulty ? (
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("difficulty.label")}
          >
            {DIFFICULTY_BUCKETS.map((bucket) => {
              const active = difficultyFilter === bucket;
              const label =
                bucket === "all"
                  ? t("difficulty.all")
                  : t(`difficulty.${bucket}`);
              return (
                <button
                  key={bucket}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onDifficultyChange(bucket)}
                  className={`map-type-body rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition ${mapFocusRing} ${
                    active
                      ? "bg-[color:var(--canvas)] text-[color:var(--ink)] ring-1 ring-[color:var(--map-rail-border)]"
                      : "text-[color:var(--map-rail-muted)] hover:text-[color:var(--map-rail-text)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="map-type-body px-4 py-6 text-center text-sm text-[color:var(--map-rail-muted)]">
            {t("search.noResults")}
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.title}
              className="border-b border-[color:var(--map-rail-border)] last:border-b-0"
            >
              {filter === "all" ? (
                <h3 className="map-type-display px-4 pb-1 pt-3 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--map-rail-muted)]">
                  {group.title}
                </h3>
              ) : null}
              <ul className="px-2 pb-2">
                {group.items.map((feature) => {
                  const accent = featureAccentColor(feature.id, feature.type);
                  const badgeColor = featureListBadgeColor(
                    feature.id,
                    feature.type,
                    feature.status,
                  );
                  const selected = selectedId === feature.id;

                  return (
                    <li key={feature.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(feature.id)}
                        aria-pressed={selected}
                        className={`map-type-body flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${mapFocusRing} ${
                          selected
                            ? "bg-[color:var(--canvas)] ring-1 ring-[color:var(--map-rail-border)]"
                            : "hover:bg-[color:var(--canvas)]"
                        }`}
                        style={
                          selected
                            ? { boxShadow: `inset 3px 0 0 ${accent}` }
                            : undefined
                        }
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--map-rail-text)]">
                          {feature.label}
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold text-white"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {statusLabel(feature.status)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
      <MapLocationPanel resortCenter={resortCenter} />
      {selectedFeature ? (
        <MapFeatureDetail
          feature={selectedFeature}
          updatedAt={updatedAt}
          onDeselect={onDeselect}
        />
      ) : null}
    </div>
  );
}
