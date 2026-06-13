import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import type { LpHighlightCatalogItem } from "@/lib/resort-data";

type LpHighlightDuetProps = {
  highlights: LpHighlightCatalogItem[];
};

export async function LpHighlightDuet({ highlights }: LpHighlightDuetProps) {
  const t = await getTranslations("home.lpHighlights");

  const primary =
    highlights.find((item) => item.layout === "primary") ?? highlights[0];
  const secondary =
    highlights.find((item) => item.layout === "secondary") ?? highlights[1];

  if (!primary || !secondary) return null;

  return (
    <section className="home-section overflow-hidden">
      <div className="home-inner">
        <p className="award-eyebrow">{t("eyebrow")}</p>
        <h2 className="heading-lg mt-4">{t("title")}</h2>

        <div className="relative mt-16 lg:mt-20">
          <article className="relative z-10 w-full lg:w-[68%]">
            <div className="relative aspect-[16/11] overflow-hidden">
              <Image
                src={primary.image}
                alt={t(`items.${primary.id}.imageAlt`)}
                fill
                sizes="(max-width: 1024px) 100vw, 68vw"
                className="object-cover"
              />
            </div>
            <div className="mt-8 max-w-md">
              <h3 className="text-xl font-semibold tracking-tight">
                {t(`items.${primary.id}.title`)}
              </h3>
              <p className="lead mt-4">{t(`items.${primary.id}.body`)}</p>
              <AwardButton href={primary.href} variant="primary" className="mt-8">
                {t(`items.${primary.id}.cta`)}
              </AwardButton>
            </div>
          </article>

          <article className="relative z-20 -mt-10 ml-auto w-[82%] bg-white p-7 shadow-[0_24px_64px_rgb(20_26_38_/10%)] sm:p-9 lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[42%]">
            <h3 className="text-xl font-semibold tracking-tight">
              {t(`items.${secondary.id}.title`)}
            </h3>
            <p className="lead-whisper mt-4">{t(`items.${secondary.id}.body`)}</p>
            <AwardButton href={secondary.href} variant="ghost" className="mt-6">
              {t(`items.${secondary.id}.cta`)}
            </AwardButton>
          </article>
        </div>
      </div>
    </section>
  );
}
