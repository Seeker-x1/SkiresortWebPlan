"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { mapFocusRing } from "./map-focus";

type ResortCenter = {
  lat: number;
  lng: number;
};

type Props = {
  resortCenter?: ResortCenter;
};

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type LocateState = "idle" | "loading" | "ok" | "denied" | "unsupported";

export function MapLocationPanel({ resortCenter }: Props) {
  const t = useTranslations("map.location");
  const [state, setState] = useState<LocateState>("idle");
  const [km, setKm] = useState<number | null>(null);

  const onLocate = useCallback(() => {
    if (!resortCenter) return;
    if (!navigator.geolocation) {
      setState("unsupported");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = haversineKm(
          pos.coords.latitude,
          pos.coords.longitude,
          resortCenter.lat,
          resortCenter.lng,
        );
        setKm(Math.round(distance * 10) / 10);
        setState("ok");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  }, [resortCenter]);

  if (!resortCenter) return null;

  return (
    <div className="shrink-0 border-t border-[color:var(--map-rail-border)] px-4 py-3">
      <p className="map-type-display text-xs font-semibold text-[color:var(--map-rail-text)]">
        {t("title")}
      </p>
      <p className="map-type-body mt-1 text-[0.6875rem] leading-relaxed text-[color:var(--map-rail-muted)]">
        {t("hint")}
      </p>
      {state === "ok" && km !== null ? (
        <p className="map-type-mono mt-2 text-xs text-[color:var(--map-rail-text)]">
          {t("distance", { km })}
        </p>
      ) : state === "denied" ? (
        <p className="map-type-body mt-2 text-xs text-[color:var(--map-rail-muted)]">
          {t("denied")}
        </p>
      ) : state === "unsupported" ? (
        <p className="map-type-body mt-2 text-xs text-[color:var(--map-rail-muted)]">
          {t("unsupported")}
        </p>
      ) : (
        <button
          type="button"
          onClick={onLocate}
          disabled={state === "loading"}
          className={`map-type-body mt-2 text-xs font-semibold text-[color:var(--map-rail-text)] underline-offset-2 hover:underline disabled:opacity-60 ${mapFocusRing}`}
        >
          {state === "loading" ? t("loading") : t("action")}
        </button>
      )}
    </div>
  );
}
