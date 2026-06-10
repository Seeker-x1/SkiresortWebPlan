"use client";

import { useTranslations } from "next-intl";
import { LangSwitcher } from "@/components/LangSwitcher";
import { useMapStatusContext } from "./MapStatusContext";

export function MapTopBar() {
  const map = useTranslations("map");
  const { transport } = useMapStatusContext();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--border)] bg-white/90 px-4 py-2.5 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="map-type-display min-w-0 truncate text-sm font-bold text-[color:var(--ink)]">
          {map("chrome.fullTitle")}
        </p>
        {transport === "sse" ? (
          <span className="map-type-mono shrink-0 rounded-full bg-[color:var(--forest)] px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-white">
            {map("live.badge")}
          </span>
        ) : null}
      </div>
      <LangSwitcher />
    </header>
  );
}
