import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { ResortData } from "@/lib/resort-data";
import { AwardButton } from "@/components/AwardButton";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { RevealPanel } from "@/components/RevealPanel";
import { EditorialTitle } from "@/components/EditorialTitle";

type CinematicHeroProps = {
  today: ResortData["today"];
  area: string;
  resortName: string;
  resortDisplayLines?: string[];
};

export async function CinematicHero({
  today,
  area,
  resortName,
  resortDisplayLines,
}: CinematicHeroProps) {
  const t = await getTranslations("home.hero");
  const todayT = await getTranslations("today");
  const [primary, ...secondary] = today.snapshot;
  const primaryStat = primary ?? {
    key: "fallback",
    title: "営業",
    value: "—",
    note: "",
    wide: false,
  };

  return (
    <section className="award-hero-scroll relative isolate min-h-[92svh] w-full">
      <div className="absolute inset-0 -z-10 min-h-[92svh]">
        <Image
          src="/images/hero-sichinohe.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-[color:var(--background)]" />
      </div>

      <div className="home-inner relative z-10 flex min-h-[92svh] flex-col justify-end pb-10 pt-28 sm:pb-16">
        <p className="award-eyebrow award-rise">{area}</p>

        <EditorialTitle
          text={resortName}
          lines={resortDisplayLines}
          as="h1"
          className="award-hero-title award-display-mega award-rise award-rise-delay-1 mt-4"
        />

        <div className="award-rise award-rise-delay-2 mt-14 sm:mt-20">
          <p className="award-whisper">{primaryStat.title}</p>
          <p className="award-stat-mono mt-2">{primaryStat.value}</p>
        </div>

        <div className="animate-rise animate-rise-delay-3 mt-10 flex flex-wrap items-center gap-5">
          <AwardButton href="/today" variant="primary">
            {t("todayCta")}
          </AwardButton>
          <FreshnessBadge
            label={t("freshnessLabel")}
            staffVerifiedLabel={t("staffVerified")}
            updatedAt={today.lastUpdated}
            verified={today.lastUpdated !== todayT("prepLastUpdated")}
          />
        </div>

        <RevealPanel
          triggerLabel={t("revealLabel")}
          items={secondary.map((item) => ({
            id: item.key,
            label: item.title,
            value: item.value,
            note: item.note,
          }))}
          footer={
            today.notice ? (
              <p role="note" className="notice-banner">
                {today.notice}
              </p>
            ) : null
          }
        />
      </div>
    </section>
  );
}
