import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  AccessFilterIcon,
  CameraFilterIcon,
  HomeFilterIcon,
  TodayFilterIcon,
} from "./MapFilterIcons";

const LINKS = [
  { href: "/" as const, navKey: "home" as const, Icon: HomeFilterIcon },
  { href: "/live-cams" as const, navKey: "liveCams" as const, Icon: CameraFilterIcon },
  { href: "/access" as const, navKey: "access" as const, Icon: AccessFilterIcon },
  { href: "/today" as const, navKey: "today" as const, Icon: TodayFilterIcon },
] as const;

export async function MapQuickNav() {
  const nav = await getTranslations("nav");
  const map = await getTranslations("map");

  return (
    <nav
      aria-label={map("aria.quickNav")}
      className="map-chrome grid shrink-0 grid-cols-4 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-md"
    >
      {LINKS.map(({ href, navKey, Icon }) => (
        <Link
          key={href}
          href={href}
          className="map-type-body flex min-h-11 flex-col items-center justify-center gap-1 border-r border-[color:var(--border)] px-2 py-2 text-[0.6875rem] font-semibold text-[color:var(--ink)] last:border-r-0 hover:bg-[color:var(--canvas)]"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{nav(navKey)}</span>
        </Link>
      ))}
    </nav>
  );
}
