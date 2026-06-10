import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";

export async function SiteHeader() {
  const meta = await getTranslations("meta");
  const nav = await getTranslations("nav");

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="home-inner flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.12em] uppercase text-[color:var(--foreground)] sm:text-sm"
        >
          {meta("siteName")}
        </Link>

        <nav aria-label={nav("ariaMain")} className="hidden items-center gap-6 sm:flex">
          <Link href="/map" className="award-btn-ghost">
            {nav("map")}
          </Link>
          <Link href="/today" className="award-btn-ghost">
            {nav("today")}
          </Link>
          <Link href="/live-cams" className="award-btn-ghost">
            {nav("liveCams")}
          </Link>
          <Link href="/access" className="award-btn-ghost">
            {nav("access")}
          </Link>
        </nav>

        <LangSwitcher />
      </div>
    </header>
  );
}
