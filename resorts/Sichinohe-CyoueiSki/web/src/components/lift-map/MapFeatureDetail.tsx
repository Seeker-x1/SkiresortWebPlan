"use client";

import { useTranslations } from "next-intl";
import type { MapFeature } from "./types";
import { featureAccentColor, featureListBadgeColor } from "./feature-colors";
import { useMapStatusLabel } from "./map-i18n";

type Props = {
  feature: MapFeature;
  updatedAt?: string;
  onDeselect?: () => void;
  compact?: boolean;
};

export function MapFeatureDetail({
  feature,
  updatedAt,
  onDeselect,
  compact = false,
}: Props) {
  const t = useTranslations("map");
  const statusLabel = useMapStatusLabel();
  const accent = featureAccentColor(feature.id, feature.type);
  const badgeColor = featureListBadgeColor(feature.id, feature.type, feature.status);

  return (
    <div
      className={`border-l-[3px] border-t border-[color:var(--map-rail-border)] bg-[color:var(--canvas)] ${compact ? "px-3 py-3" : "px-4 py-4"}`}
      style={{ borderLeftColor: accent }}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="map-type-display text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--map-rail-muted)]">
            {feature.type === "lift" ? t("groups.lift") : t("groups.trail")}
          </p>
          <p className="map-type-body mt-1 truncate text-sm font-semibold text-[color:var(--map-rail-text)]">
            {feature.label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="map-type-body rounded-full px-2 py-0.5 text-[0.625rem] font-semibold text-white"
            style={{ backgroundColor: badgeColor }}
          >
            {statusLabel(feature.status)}
          </span>
          {onDeselect ? (
            <button
              type="button"
              onClick={onDeselect}
              aria-label={t("aria.deselect")}
              className={`rounded-full px-2 py-0.5 text-[0.625rem] text-[color:var(--map-rail-muted)] hover:bg-[color:var(--canvas)] hover:text-[color:var(--map-rail-text)] map-focus-ring`}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {feature.reason ? (
        <p className="map-type-body mt-2 text-xs leading-relaxed text-[color:var(--map-rail-muted)]">
          {feature.reason}
        </p>
      ) : null}

      {feature.meta ? (
        <dl className="map-type-body mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {Object.entries(feature.meta).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[color:var(--map-rail-muted)]">{k}</dt>
              <dd className="font-medium text-[color:var(--map-rail-text)]">{String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {updatedAt ? (
        <p className="map-type-mono mt-2 text-[0.625rem] text-[color:var(--map-rail-muted)]">
          {t("detail.updated", { time: updatedAt })}
        </p>
      ) : null}
    </div>
  );
}
