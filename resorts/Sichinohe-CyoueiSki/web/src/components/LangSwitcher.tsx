"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const LOCALE_CODES: AppLocale[] = ["ja", "en"];

export function LangSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const lang = useTranslations("lang");

  return (
    <div
      role="group"
      aria-label={lang("switch")}
      className="flex items-center gap-1 rounded-full border border-[color:var(--surface-border)] bg-white p-1"
    >
      {LOCALE_CODES.map((code) => {
        const isActive = locale === code;
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-wide transition ${
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
