import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";

export async function NearbyOnsenTeaser() {
  const t = await getTranslations("home.nearbyOnsen");

  return (
    <section className="home-section border-t border-[color:var(--award-color-border)]">
      <div className="home-inner">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 lg:col-start-8 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
              <Image
                src="/images/tsuta-onsen-rotenburo.png"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <p className="award-eyebrow">{t("eyebrow")}</p>
            <h2 className="heading-lg mt-4">{t("title")}</h2>
            <p className="lead mt-6 max-w-lg">{t("body")}</p>
            <p className="lead-whisper mt-4 max-w-lg">{t("bodySecondary")}</p>
            <AwardButton href="/stay-local/onsen" variant="primary" className="mt-8">
              {t("cta")}
            </AwardButton>
          </div>
        </div>
      </div>
    </section>
  );
}
