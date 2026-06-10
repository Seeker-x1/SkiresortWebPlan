"use client";

import { useTranslations } from "next-intl";

const STATUS_KEYS = [
  "operating",
  "open",
  "stopped",
  "closed",
  "hold",
  "partial",
  "unknown",
] as const;

export type MapStatusKey = (typeof STATUS_KEYS)[number];

export function isMapStatusKey(status: string): status is MapStatusKey {
  return (STATUS_KEYS as readonly string[]).includes(status);
}

/** Localized lift/trail status badge label */
export function useMapStatusLabel() {
  const t = useTranslations("map.status");
  return (status: string) =>
    isMapStatusKey(status) ? t(status) : status;
}
