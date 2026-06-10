import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";

export async function AudienceDuet() {
  const t = await getTranslations("home.audience");

  return (
    <section className="home-section overflow-hidden">
      <div className="home-inner">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="heading-lg mt-4">{t("title")}</h2>

        <div className="relative mt-16 lg:mt-20">
          <article className="relative z-10 w-full lg:w-[68%]">
            <div className="relative aspect-[16/11] overflow-hidden">
              <Image
                src="/images/hero-groomed-monochrome.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 68vw"
                className="object-cover"
              />
            </div>
            <div className="mt-8 max-w-md">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("powderTitle")}
              </h3>
              <p className="lead mt-4">{t("powderBody")}</p>
              <AwardButton href="/plan/transit-powder" variant="primary" className="mt-8">
                {t("powderCta")}
              </AwardButton>
            </div>
          </article>

          <article className="relative z-20 -mt-10 ml-auto w-[82%] bg-white p-7 shadow-[0_24px_64px_rgb(20_26_38_/10%)] sm:p-9 lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[42%]">
            <h3 className="text-xl font-semibold tracking-tight">{t("familyTitle")}</h3>
            <p className="lead-whisper mt-4">{t("familyBody")}</p>
            <AwardButton href="/plan/beginners-hidden-gem" variant="ghost" className="mt-6">
              {t("familyCta")}
            </AwardButton>
          </article>
        </div>
      </div>
    </section>
  );
}
