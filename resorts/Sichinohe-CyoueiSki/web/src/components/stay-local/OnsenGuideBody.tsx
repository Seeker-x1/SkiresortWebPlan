import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import type { OnsenGuideData, StayLocalFeaturedSpot } from "@/lib/resort-data";

type OnsenGuideBodyProps = {
  guide: OnsenGuideData;
  tsutaSpot?: StayLocalFeaturedSpot;
};

const SPRING_KEYS = ["moor", "alkaline", "flow"] as const;
const TIP_KEYS = ["price", "shower", "fresh", "hopping"] as const;

export async function OnsenGuideBody({ guide, tsutaSpot }: OnsenGuideBodyProps) {
  const t = await getTranslations("onsenGuide");
  const tsuta =
    tsutaSpot && tsutaSpot.id === "tsuta-onsen"
      ? await getTranslations("stayLocal.featured.tsuta-onsen")
      : null;

  return (
    <>
      <div className="relative aspect-[21/9] max-h-[28rem] overflow-hidden">
        <Image
          src={guide.heroImage}
          alt={t("heroImageAlt")}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      <p role="note" className="notice-banner">
        {t("notice")}
      </p>

      <section aria-labelledby="onsen-intro-title">
        <h2 id="onsen-intro-title" className="heading-md">
          {t("introTitle")}
        </h2>
        <p className="lead mt-6 max-w-3xl">{t("introLead")}</p>
        <p className="lead-whisper mt-4 max-w-3xl">{t("introBody")}</p>
      </section>

      <section
        className="border-t border-[color:var(--award-color-border)] pt-12"
        aria-labelledby="onsen-spring-title"
      >
        <p className="award-eyebrow">{t("springEyebrow")}</p>
        <h2 id="onsen-spring-title" className="heading-md mt-3">
          {t("springTitle")}
        </h2>
        <p className="lead mt-6 max-w-3xl">{t("springLead")}</p>
        <ul className="mt-8 space-y-4 border-t border-[color:var(--award-color-border)] pt-8">
          {SPRING_KEYS.map((key) => (
            <li key={key} className="max-w-2xl">
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                {t(`springItems.${key}.title`)}
              </h3>
              <p className="lead-whisper mt-2">{t(`springItems.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="border-t border-[color:var(--award-color-border)] pt-12"
        aria-labelledby="onsen-local-title"
      >
        <p className="award-eyebrow">{t("localEyebrow")}</p>
        <h2 id="onsen-local-title" className="heading-md mt-3">
          {t("localTitle")}
        </h2>
        <p className="lead mt-6 max-w-3xl">{t("localLead")}</p>

        <dl className="mt-10 grid gap-0 border-t border-[color:var(--award-color-border)] sm:grid-cols-2">
          {TIP_KEYS.map((key, index) => (
            <div
              key={key}
              className={`border-b border-[color:var(--award-color-border)] py-7 sm:px-8 sm:py-10 ${
                index % 2 === 0 ? "sm:border-r" : ""
              }`}
            >
              <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
                {t(`localTips.${key}.label`)}
              </dt>
              <dd className="mt-3 text-base leading-relaxed sm:text-lg">
                {t(`localTips.${key}.body`)}
              </dd>
            </div>
          ))}
        </dl>

        <p className="lead-whisper mt-8 max-w-3xl">{t("localClosing")}</p>
      </section>

      <section className="border-t border-[color:var(--award-color-border)] pt-12">
        <h2 className="heading-md">{t("mapsTitle")}</h2>
        <p className="lead mt-4 max-w-2xl">{t("mapsBody")}</p>
        <AwardButton href={guide.mapsUrl} external variant="primary" className="mt-8">
          {t("mapsCta")}
        </AwardButton>
      </section>

      {tsutaSpot && tsuta ? (
        <section
          id="tsuta-onsen-spotlight"
          className="scroll-mt-24 border-t border-[color:var(--award-color-border)] pt-12"
          aria-labelledby="tsuta-spotlight-title"
        >
          <p className="award-eyebrow">{t("tsutaEyebrow")}</p>
          <h2 id="tsuta-spotlight-title" className="heading-md mt-3">
            {t("tsutaTitle")}
          </h2>
          <p className="lead mt-6 max-w-3xl">{t("tsutaLead")}</p>

          <article className="mt-10 grid gap-8 border border-[color:var(--award-color-border)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:min-h-[18rem]">
              <Image
                src={tsutaSpot.imageSecondary ?? tsutaSpot.image}
                alt={tsuta("imageSecondaryAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9">
              <h3 className="text-xl font-semibold tracking-tight">{tsuta("title")}</h3>
              <p className="lead-whisper mt-4">{t("tsutaBody")}</p>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--award-color-muted)]">
                {tsuta("history")}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <AwardButton href="/stay-local#tsuta-onsen" variant="primary">
                  {t("tsutaCtaDetail")}
                </AwardButton>
                <AwardButton href={tsutaSpot.officialUrl} external variant="ghost">
                  {tsuta("ctaOfficial")}
                </AwardButton>
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </>
  );
}
