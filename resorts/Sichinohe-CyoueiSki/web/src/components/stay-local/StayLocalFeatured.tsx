import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import type { StayLocalFeaturedSpot } from "@/lib/resort-data";

type StayLocalFeaturedProps = {
  spot: StayLocalFeaturedSpot;
};

export async function StayLocalFeatured({ spot }: StayLocalFeaturedProps) {
  const t = await getTranslations(`stayLocal.featured.${spot.id}`);
  const factKeys = ["location", "dayUse", "access", "phone"] as const;

  return (
    <section
      id={spot.id}
      className="scroll-mt-24 border-b border-[color:var(--award-color-border)] pb-16 pt-4"
      aria-labelledby={`${spot.id}-title`}
    >
      <div className="relative lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:items-start">
        <div className="relative lg:sticky lg:top-28">
          <div className="relative aspect-[16/11] overflow-hidden">
            <Image
              src={spot.image}
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          {spot.imageSecondary ? (
            <div className="relative z-10 -mt-12 ml-auto w-[78%] overflow-hidden shadow-[0_24px_64px_rgb(20_26_38_/12%)] sm:-mt-16 sm:w-[68%]">
              <div className="relative aspect-[16/11]">
                <Image
                  src={spot.imageSecondary}
                  alt={t("imageSecondaryAlt")}
                  fill
                  sizes="(max-width: 1024px) 78vw, 34vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-10 lg:mt-0">
          <p className="award-eyebrow">{t("eyebrow")}</p>
          <h2 id={`${spot.id}-title`} className="heading-lg mt-4">
            {t("title")}
          </h2>
          <p className="lead mt-6">{t("lead")}</p>
          <p className="lead-whisper mt-4">{t("history")}</p>

          <ul className="mt-8 space-y-3 border-t border-[color:var(--award-color-border)] pt-8">
            {(["spring", "baths", "nature"] as const).map((key) => (
              <li key={key} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--award-color-accent)]"
                  aria-hidden="true"
                />
                <span>{t(`highlights.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-14 grid gap-0 border-t border-[color:var(--award-color-border)] sm:grid-cols-2">
        {factKeys.map((key, index) => (
          <div
            key={key}
            className={`border-b border-[color:var(--award-color-border)] py-7 sm:px-8 sm:py-10 ${
              index % 2 === 0 ? "sm:border-r" : ""
            }`}
          >
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {t(`facts.${key}`)}
            </dt>
            <dd className="mt-3 text-base font-semibold tracking-tight sm:text-lg">
              {key === "phone" ? (
                <a
                  href={`tel:${spot.phone.replace(/-/g, "")}`}
                  className="underline decoration-[color:var(--award-color-border)] underline-offset-4 transition hover:decoration-[color:var(--award-color-accent)]"
                >
                  {t(`facts.${key}Value`)}
                </a>
              ) : (
                t(`facts.${key}Value`)
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p role="note" className="notice-banner mt-10 text-sm leading-relaxed">
        {t("disclaimer")}
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <AwardButton href={spot.officialUrl} external variant="primary">
          {t("ctaOfficial")}
        </AwardButton>
        {spot.dayUseUrl ? (
          <AwardButton href={spot.dayUseUrl} external variant="ghost">
            {t("ctaDayUse")}
          </AwardButton>
        ) : null}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[color:var(--award-color-muted)]">
        {t("sourceNote", { source: spot.officialSource })}
      </p>
    </section>
  );
}
