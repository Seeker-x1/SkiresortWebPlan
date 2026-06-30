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
  bakedLines?: boolean;
  onSelect: (id: string) => void;
};

function shouldDrawStatusLine(
  id: string,
  feature: OverlayFeature,
  statusById: Record<string, MapFeature | undefined>,
  selectedId: string | null,
  bakedLines: boolean,
): boolean {
  if (!bakedLines) return true;

  const selected = selectedId === id;
  if (selected) return false;

  const status = statusById[id]?.status;
  if (feature.type === "lift") {
    return isStoppedLift(id, statusById) || status === "hold";
  }

  return status === "closed" || status === "partial";
}

function InteractivePath({
  id,
  label,
  onSelect,
  children,
}: {
  id: string;
  label: string;
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
  bakedLines = false,
  onSelect,
}: Props) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full touch-none select-none"
      aria-hidden={false}
    >
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
        const drawLine = shouldDrawStatusLine(
          id,
          feature,
          statusById,
          selectedId,
          bakedLines,
        );

        return (
          <InteractivePath
            key={id}
            id={id}
            label={label}
            onSelect={onSelect}
          >
            <path
              d={feature.path}
              fill="none"
              stroke="transparent"
              strokeWidth={width + 18}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-auto"
            />
            {drawLine ? (
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
                style={{
                  transition: "stroke 0.35s ease, opacity 0.35s ease, stroke-width 0.2s ease",
                }}
              />
            ) : null}
            {selected ? (
              <path
                d={feature.path}
                fill="none"
                stroke={bakedLines ? stroke : "#ffffff"}
                strokeWidth={bakedLines ? 4 : width + 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={bakedLines ? 1 : 0.85}
                style={
                  bakedLines
                    ? {
                        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.95))",
                      }
                    : undefined
                }
              />
            ) : null}
            {!bakedLines && selected
              ? feature.markers?.map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={11}
                    fill={stroke}
                    stroke="#fff"
                    strokeWidth={2.5}
                  />
                ))
              : null}
          </InteractivePath>
        );
      })}
    </svg>
  );
}
