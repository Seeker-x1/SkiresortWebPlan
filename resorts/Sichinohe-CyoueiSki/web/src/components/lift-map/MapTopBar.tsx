"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";
import {
  AccessFilterIcon,
  CameraFilterIcon,
  HomeFilterIcon,
  TodayFilterIcon,
} from "./MapFilterIcons";
import { mapFocusRing } from "./map-focus";
import { useMapStatusContext } from "./MapStatusContext";

const QUICK_LINKS = [
  { href: "/" as const, navKey: "home" as const, Icon: HomeFilterIcon },
  { href: "/live-cams" as const, navKey: "liveCams" as const, Icon: CameraFilterIcon },
  { href: "/access" as const, navKey: "access" as const, Icon: AccessFilterIcon },
  { href: "/today" as const, navKey: "today" as const, Icon: TodayFilterIcon },
] as const;

export function MapTopBar() {
  const map = useTranslations("map");
  const nav = useTranslations("nav");
  const { transport } = useMapStatusContext();

  return (
    <header className="map-chrome map-page-header flex h-11 shrink-0 items-center gap-1 border-b border-[color:var(--border)] bg-[color:var(--map-chrome-nav)] px-2 backdrop-blur-md sm:gap-2 sm:px-3 md:px-4">
      <div className="flex min-w-0 max-w-[32%] items-center gap-1 sm:max-w-[26%] md:max-w-[22%] md:shrink-0 lg:max-w-none">
        <p className="map-type-display truncate text-xs font-bold text-[color:var(--ink)] sm:text-sm">
          {map("chrome.fullTitle")}
        </p>
        {transport === "sse" ? (
          <span className="map-type-mono shrink-0 rounded-full bg-[color:var(--status-live-strong)] px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wide text-[color:var(--ink)] sm:px-2 sm:text-[0.625rem]">
            {map("live.badge")}
          </span>
        ) : null}
      </div>

      <nav
        aria-label={map("aria.quickNav")}
        className="flex min-w-0 flex-1 justify-center"
      >
        <ul className="flex items-center justify-center gap-0 sm:gap-0.5 md:gap-1">
          {QUICK_LINKS.map(({ href, navKey, Icon }) => {
            const label = nav(navKey);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  className={`map-type-body flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)] sm:min-w-0 sm:gap-1.5 sm:px-2.5 sm:text-[0.6875rem] sm:font-semibold md:px-3 ${mapFocusRing}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden max-w-[4.75rem] truncate sm:inline">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0">
        <LangSwitcher compact />
      </div>
    </header>
  );
}
