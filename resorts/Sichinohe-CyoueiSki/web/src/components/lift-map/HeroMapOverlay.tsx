"use client";

import type { KeyboardEvent, ReactNode } from "react";
import type { MapFeature } from "./types";
import { isStoppedLift, strokeForFeature, trailOpacity } from "./map-colors";

export type OverlayFeature = {
  type: "lift" | "trail";
  strokeWidth: number;
  path: string;
  markers?: [number, number][];
};

type Props = {
  viewBox: string;
  features: Record<string, OverlayFeature>;
  statusById: Record<string, MapFeature | undefined>;
  selectedId: string | null;
  showLifts: boolean;
  showTrails: boolean;
  onSelect: (id: string) => void;
};

function InteractivePath({
  id,
  label,
  feature,
  statusById,
  selectedId,
  onSelect,
  children,
}: {
  id: string;
  label: string;
  feature: OverlayFeature;
  statusById: Record<string, MapFeature | undefined>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      data-feature-id={id}
      aria-label={label}
      className="cursor-pointer outline-none"
      onClick={() => onSelect(id)}
      onKeyDown={onKeyDown}
    >
      {children}
    </g>
  );
}

export function HeroMapOverlay({
  viewBox,
  features,
  statusById,
  selectedId,
  showLifts,
  showTrails,
  onSelect,
}: Props) {
  return (
    <svg
      viewBox={viewBox}
      className="absolute inset-0 h-full w-full touch-none select-none"
      aria-hidden={false}
    >
      <defs>
        <filter id="lift-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="trail-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="trail-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Object.entries(features).map(([id, feature]) => {
        const meta = statusById[id];
        const label = meta?.label ?? id;
        const isLift = feature.type === "lift";
        if (isLift && !showLifts) return null;
        if (!isLift && !showTrails) return null;

        const stroke = strokeForFeature(id, statusById, isLift ? "lift" : "trail");
        const stopped = isLift && isStoppedLift(id, statusById);
        const selected = selectedId === id;
        const width = feature.strokeWidth * (selected ? 1.15 : 1);

        return (
          <InteractivePath
            key={id}
            id={id}
            label={label}
            feature={feature}
            statusById={statusById}
            selectedId={selectedId}
            onSelect={onSelect}
          >
            <path
              d={feature.path}
              fill="none"
              stroke="transparent"
              strokeWidth={width + 18}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={feature.path}
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={stopped ? "10 8" : undefined}
              opacity={
                feature.type === "trail"
                  ? trailOpacity(id, statusById)
                  : stopped
                    ? 0.65
                    : 0.95
              }
              filter={isLift ? "url(#lift-glow)" : "url(#trail-glow)"}
              style={{
                transition: "stroke 0.35s ease, opacity 0.35s ease, stroke-width 0.2s ease",
              }}
            />
            {selected ? (
              <path
                d={feature.path}
                fill="none"
                stroke="#ffffff"
                strokeWidth={width + 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
            ) : null}
            {feature.markers?.map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={selected ? 11 : 8}
                fill={stroke}
                stroke="#fff"
                strokeWidth={2.5}
                filter="url(#lift-glow)"
              />
            ))}
          </InteractivePath>
        );
      })}
    </svg>
  );
}
