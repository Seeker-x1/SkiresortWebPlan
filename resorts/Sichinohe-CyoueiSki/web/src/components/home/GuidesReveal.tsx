"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { AwardButton } from "@/components/AwardButton";

type GuidesRevealProps = {
  sectionTitle: string;
};

export function GuidesReveal({ sectionTitle }: GuidesRevealProps) {
  const t = useTranslations("home.guides");
  const [active, setActive] = useState<string | null>(null);

  const guides = useMemo(
    () =>
      [
        {
          slug: "transit-powder",
          href: "/plan/transit-powder" as const,
          title: t("transitPowderTitle"),
          summary: t("transitPowderSummary"),
        },
        {
          slug: "transit-shinkansen",
          href: "/plan/transit-shinkansen" as const,
          title: t("transitShinkansenTitle"),
          summary: t("transitShinkansenSummary"),
        },
        {
          slug: "beginners",
          href: "/plan/beginners-hidden-gem" as const,
          title: t("beginnersTitle"),
          summary: t("beginnersSummary"),
        },
      ] as const,
    [t],
  );

  return (
    <section className="home-section border-t border-[color:var(--surface-border)]">
      <div className="home-inner">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="heading-lg mt-4">{sectionTitle}</h2>

        <ul className="mt-14 space-y-0">
          {guides.map((guide) => {
            const isOpen = active === guide.slug;
            return (
              <li
                key={guide.slug}
                className="border-t border-[color:var(--surface-border)] last:border-b"
              >
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-6 py-7 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setActive(isOpen ? null : guide.slug)}
                >
                  <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {guide.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-lg font-light text-[color:var(--muted)]"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div className="pb-8">
                    <p className="lead max-w-lg">{guide.summary}</p>
                    <AwardButton href={guide.href} variant="ghost" className="mt-5">
                      {t("read")}
                    </AwardButton>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
