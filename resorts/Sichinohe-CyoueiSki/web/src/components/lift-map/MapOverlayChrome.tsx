"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapStaleBanner } from "./MapStaleBanner";
import { mapFocusRing } from "./map-focus";

type Props = {
  resortName: string;
  updatedLabel: string;
  onRefresh?: () => void;
  statusStale?: boolean;
  statusError?: string | null;
  statusRetrying?: boolean;
};

/** 埋め込み専用（G2 P2: リゾート名 + 全画面導線 + G3 stale）— フィルタはレールタブのみ */
export function MapOverlayChrome({
  resortName,
  updatedLabel,
  onRefresh,
  statusStale = false,
  statusError = null,
  statusRetrying = false,
}: Props) {
  const t = useTranslations("map");

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <header className="pointer-events-auto mx-3 mt-3 flex flex-wrap items-center gap-2 border border-[color:var(--map-rail-border)] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:mx-4">
        <div className="min-w-0 flex-1">
          <p className="map-type-display text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            {t("chrome.eyebrow")}
          </p>
          <h1 className="map-type-display truncate text-sm font-bold text-[color:var(--ink)] sm:text-base">
            {resortName}
          </h1>
          <p className="map-type-mono text-[0.625rem] text-[color:var(--muted)]">
            {t("chrome.lastUpdated", { time: updatedLabel })}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/map"
            className={`map-type-body rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-[0.625rem] font-semibold text-[color:var(--ink)] hover:bg-[color:var(--canvas)] ${mapFocusRing}`}
          >
            {t("chrome.openFull")}
          </Link>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className={`map-type-body rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-[0.625rem] font-semibold text-[color:var(--ink)] hover:bg-[color:var(--canvas)] ${mapFocusRing}`}
            >
              {t("chrome.refresh")}
            </button>
          ) : null}
        </div>
      </header>

      {statusStale ? (
        <div className="pointer-events-auto">
          <MapStaleBanner
            statusError={statusError}
            statusRetrying={statusRetrying}
            onRefresh={onRefresh}
          />
        </div>
      ) : null}
    </div>
  );
}
