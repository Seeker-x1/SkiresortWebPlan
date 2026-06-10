import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { CinematicHero } from "@/components/home/CinematicHero";
import { AsymmetricTransit } from "@/components/home/AsymmetricTransit";
import { ImmersiveLiveCam } from "@/components/home/ImmersiveLiveCam";
import { PathMagnet } from "@/components/home/PathMagnet";
import { AudienceDuet } from "@/components/home/AudienceDuet";
import { NewsTeaser } from "@/components/home/NewsTeaser";
import { GuidesReveal } from "@/components/home/GuidesReveal";

export default async function Home() {
  const data = await getResortData();
  const t = await getTranslations("home");

  return (
    <div className="home-canvas">
      <CinematicHero
        today={data.today}
        area={data.resort.area}
        resortName={data.resort.name}
        resortDisplayLines={data.resort.displayLines}
      />

      <AsymmetricTransit
        title={t("transitTitle")}
        body={t("transitBody")}
        todayLink={t("todayLink")}
        accessLink={t("accessLink")}
      />

      <ImmersiveLiveCam liveCams={data.liveCams} />

      <PathMagnet />

      <AudienceDuet />

      <NewsTeaser news={data.news} />

      <GuidesReveal sectionTitle={t("planTitle")} />
    </div>
  );
}
