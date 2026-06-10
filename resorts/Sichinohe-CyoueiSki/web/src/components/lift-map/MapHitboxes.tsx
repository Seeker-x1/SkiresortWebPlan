"use client";

import { useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";
import {
  featureMatchesDifficulty,
  type DifficultyBucket,
} from "./map-difficulty";
import { mapFocusOnDark } from "./map-focus";
import { mapHighlightStyle } from "./map-colors";
import type { MapFeature } from "./types";

export type HitboxFeature = {
  id: string;
  label: string;
  source: string;
  type: "lift" | "trail";
  path: string;
  stations: [number, number][];
};

type Props = {
  viewBox: string;
  features: HitboxFeature[];
  statusById: Record<string, MapFeature | undefined>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect?: () => void;
  statusFilter?: "all" | "lift" | "trail";
  difficultyFilter?: DifficultyBucket;
  /** A 方式: 線はイラスト焼き込み。選択時のみハイライト */
  bakedLines?: boolean;
};

function isDimmed(type: "lift" | "trail", filter: "all" | "lift" | "trail") {
  if (filter === "all") return false;
  return type !== filter;
}

export function MapHitboxes({
  viewBox,
  features,
  statusById,
  selectedId,
  onSelect,
  onDeselect,
  statusFilter = "all",
  difficultyFilter = "all",
  bakedLines = true,
}: Props) {
  const t = useTranslations("map");
  if (features.length === 0) return null;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full touch-none select-none"
      aria-label={t("aria.terrainMapLayer")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeselect?.();
      }}
    >
      {features.map((feature) => {
        const meta = statusById[feature.id];
        const label = meta?.label ?? feature.label;
        const selected = selectedId === feature.id;
        const dimmed =
          isDimmed(feature.type, statusFilter) ||
          (meta
            ? !featureMatchesDifficulty(meta, difficultyFilter)
            : feature.type === "trail" && difficultyFilter !== "all");
        const highlight = mapHighlightStyle(
          feature.id,
          feature.type,
          statusById,
          selected,
          bakedLines,
        );

        const onKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(feature.id);
          }
        };

        const showStroke = highlight.show;
        const strokeOpacity = dimmed ? Math.min(highlight.opacity, 0.35) : highlight.opacity;

        return (
          <g
            key={feature.id}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={selected}
            className={`cursor-pointer ${mapFocusOnDark}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(feature.id);
            }}
            onKeyDown={onKeyDown}
          >
            <path
              d={feature.path}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              pointerEvents="stroke"
            />
            {showStroke ? (
              <path
                d={feature.path}
                fill="none"
                stroke={highlight.stroke}
                strokeWidth={highlight.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={highlight.dasharray}
                opacity={strokeOpacity}
                pointerEvents="none"
              />
            ) : null}
            {feature.type === "lift" && selected
              ? feature.stations.map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill={highlight.stroke}
                    stroke="#fff"
                    strokeWidth={1.5}
                    pointerEvents="none"
                  />
                ))
              : null}
          </g>
        );
      })}
    </svg>
  );
}
