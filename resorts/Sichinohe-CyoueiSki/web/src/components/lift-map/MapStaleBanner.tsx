"use client";

import { useTranslations } from "next-intl";
import { mapFocusRing } from "./map-focus";

type Props = {
  statusError?: string | null;
  statusRetrying?: boolean;
  onRefresh?: () => void;
};

export function MapStaleBanner({
  statusError = null,
  statusRetrying = false,
  onRefresh,
}: Props) {
  const t = useTranslations("map");

  return (
    <div
      role="alert"
      className="map-chrome flex shrink-0 flex-wrap items-center gap-2 border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-950"
    >
      <span className="map-type-body min-w-0 flex-1 font-medium">
        {t("stale.banner")}
        {statusError ? ` (${statusError})` : null}
        {statusRetrying ? ` ${t("status.retrying")}` : null}
      </span>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className={`map-type-body shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900 hover:bg-amber-50 ${mapFocusRing}`}
        >
          {t("stale.retry")}
        </button>
      ) : null}
    </div>
  );
}
