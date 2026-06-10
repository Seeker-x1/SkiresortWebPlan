"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { MapFeatureDetail } from "./MapFeatureDetail";
import type { MapFeature } from "./types";
import {
  featureAccentColor,
  featureListBadgeColor,
  statusBadgeUsesDarkText,
} from "./feature-colors";
import { useMapStatusLabel } from "./map-i18n";
import { mapFocusRing } from "./map-focus";

type Props = {
  features: MapFeature[];
  selectedId: string | null;
  selectedFeature: MapFeature | null;
  updatedAt?: string;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  filter: "all" | "lift" | "trail";
  onFilterChange?: (filter: "all" | "lift" | "trail") => void;
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
  className = "",
}: Props) {
  const t = useTranslations("map");
  const statusLabel = useMapStatusLabel();

  const visible = useMemo(
    () => features.filter((f) => filter === "all" || f.type === filter),
    [features, filter],
  );

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
              { id: "lift" as const, label: t("filters.lifts") },
              { id: "trail" as const, label: t("filters.trails") },
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
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <p className="map-type-body px-4 py-6 text-center text-sm text-[color:var(--map-rail-muted)]">
            {t("status.empty")}
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
                  const liveBadge = statusBadgeUsesDarkText(feature.status);

                  return (
                    <li key={feature.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(feature.id)}
                        aria-pressed={selected}
                        className={`map-type-body flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[0.8125rem] transition ${mapFocusRing} ${
                          selected
                            ? "bg-[color:var(--canvas)] outline outline-2 outline-[color:var(--alpine)] outline-offset-[-2px]"
                            : "hover:bg-[color:var(--canvas)]"
                        }`}
                      >
                        <span
                          className="h-[7px] w-[7px] shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate font-medium text-[color:var(--map-rail-text)]">
                          {feature.label}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.5rem] font-bold ${
                            liveBadge ? "text-[color:var(--ink)]" : "text-white"
                          }`}
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
