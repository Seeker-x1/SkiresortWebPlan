"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const LOCALE_CODES: AppLocale[] = ["ja", "en"];

type LangSwitcherProps = {
  compact?: boolean;
};

export function LangSwitcher({ compact = false }: LangSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const lang = useTranslations("lang");

  const touchClass = compact
    ? "min-h-9 min-w-9 px-2 text-[0.6875rem]"
    : "min-h-11 min-w-11 px-3 text-xs";

  return (
    <div
      role="group"
      aria-label={lang("switch")}
      className={`flex items-center gap-0.5 rounded-full border border-[color:var(--surface-border)] bg-white ${compact ? "p-0.5" : "p-1"}`}
    >
      {LOCALE_CODES.map((code) => {
        const isActive = locale === code;
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition ${touchClass} ${
              isActive
                ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {lang(code)}
          </Link>
        );
      })}
    </div>
  );
}
