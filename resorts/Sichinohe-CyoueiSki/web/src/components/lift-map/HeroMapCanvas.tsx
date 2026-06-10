"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, type ReactNode } from "react";
import { MapHitboxes, type HitboxFeature } from "./MapHitboxes";
import { mapFocusOnDark, mapFocusRing } from "./map-focus";
import type { DifficultyBucket } from "./map-difficulty";
import type { MapFeature } from "./types";
import { usePanZoom } from "./usePanZoom";

type HeroConfig = {
  src: string;
  width: number;
  height: number;
  viewBox: string;
};

type Props = {
  hero: HeroConfig;
  hitboxes: HitboxFeature[];
  statusById: Record<string, MapFeature | undefined>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect?: () => void;
  statusFilter?: "all" | "lift" | "trail";
  difficultyFilter?: DifficultyBucket;
  railOverlay?: boolean;
};

export function HeroMapCanvas({
  hero,
  hitboxes,
  statusById,
  selectedId,
  onSelect,
  onDeselect,
  statusFilter = "all",
  difficultyFilter = "all",
  railOverlay = false,
}: Props) {
  const t = useTranslations("map");
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panZoom = usePanZoom({ containerRef, contentRef, railOverlay });
  const [imageReady, setImageReady] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[color:var(--map-stage-bg)]">
      <div
        ref={containerRef}
        className={`relative h-full w-full ${panZoom.canPan ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
        onWheel={panZoom.onWheel}
        onPointerDown={panZoom.onPointerDown}
        onPointerMove={panZoom.onPointerMove}
        onPointerUp={panZoom.onPointerUp}
        onPointerCancel={panZoom.onPointerUp}
      >
        <div
          ref={contentRef}
          className="absolute inset-0 transition-transform duration-75 will-change-transform"
          style={{
            transform: panZoom.transform,
            opacity: imageReady ? 1 : 0,
            transition: "opacity 0.5s ease, transform 75ms",
          }}
        >
          <img
            src={hero.src}
            alt={t("hero.alt")}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 block h-full w-full object-cover object-center"
            style={{ imageRendering: "auto" }}
            onLoad={() => setImageReady(true)}
          />
          {hitboxes.length > 0 ? (
            <MapHitboxes
              viewBox={hero.viewBox}
              features={hitboxes}
              statusById={statusById}
              selectedId={selectedId}
              onSelect={onSelect}
              onDeselect={onDeselect}
              statusFilter={statusFilter}
              difficultyFilter={difficultyFilter}
              bakedLines
            />
          ) : null}
        </div>
      </div>

      {!imageReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--map-stage-bg)]">
          <div className="h-10 w-10 animate-pulse rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className={`pointer-events-auto absolute top-1/2 flex -translate-y-1/2 flex-col gap-2 ${
            railOverlay ? "right-4 md:right-[19rem]" : "right-4"
          }`}
        >
          <MapFab label={t("fab.zoomIn")} onClick={panZoom.zoomIn}>
            +
          </MapFab>
          <MapFab label={t("fab.zoomOut")} onClick={panZoom.zoomOut}>
            −
          </MapFab>
          <MapFab label={t("fab.reset")} onClick={panZoom.resetView}>
            ⊡
          </MapFab>
        </div>
      </div>
    </div>
  );
}

function MapFab({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--map-rail-border)] bg-[color:var(--map-rail-bg)] text-lg font-medium text-[color:var(--map-rail-text)] shadow-lg backdrop-blur-md hover:bg-white ${mapFocusRing}`}
    >
      {children}
    </button>
  );
}
