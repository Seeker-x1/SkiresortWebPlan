"use client";

import type { KeyboardEvent } from "react";
import { featureAccentColor } from "./feature-colors";
import { isStoppedLift } from "./map-colors";
import type { MapFeature } from "./types";

export type LiftMarker = {
  id: string;
  label: string;
  source: string;
  path: string;
  stations: [number, number][];
};

type Props = {
  viewBox: string;
  lifts: LiftMarker[];
  statusById: Record<string, MapFeature | undefined>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  dimmed?: boolean;
};

export function LiftMarkers({
  viewBox,
  lifts,
  statusById,
  selectedId,
  onSelect,
  dimmed = false,
}: Props) {
  if (lifts.length === 0) return null;

  return (
    <svg
      viewBox={viewBox}
      className="absolute inset-0 h-full w-full touch-none select-none"
      aria-label="リフト位置"
    >
      {lifts.map((lift) => {
        const meta = statusById[lift.id];
        const label = meta?.label ?? lift.label;
        const color = featureAccentColor(lift.id, "lift");
        const stopped = isStoppedLift(lift.id, statusById);
        const selected = selectedId === lift.id;

        const onKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(lift.id);
          }
        };

        return (
          <g
            key={lift.id}
            role="button"
            tabIndex={0}
            aria-label={label}
            className="cursor-pointer outline-none"
            onClick={() => onSelect(lift.id)}
            onKeyDown={onKeyDown}
          >
            <path
              d={lift.path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
            />
            <path
              d={lift.path}
              fill="none"
              stroke={color}
              strokeWidth={selected ? 2.5 : 1.5}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeDasharray={stopped ? "6 4" : undefined}
              opacity={dimmed ? 0.35 : stopped ? 0.55 : 0.9}
            />
            {lift.stations.map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={selected ? 7 : 5}
                fill={color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
