import { getTranslations } from "next-intl/server";
import { getResortData, resolveLpFeatured } from "@/lib/resort-data";
import { CinematicHero } from "@/components/home/CinematicHero";
import { AsymmetricTransit } from "@/components/home/AsymmetricTransit";
import { ImmersiveLiveCam } from "@/components/home/ImmersiveLiveCam";
import { PathMagnet } from "@/components/home/PathMagnet";
import { LpHighlightDuet } from "@/components/home/LpHighlightDuet";
import { NewsTeaser } from "@/components/home/NewsTeaser";
import { GuidesReveal } from "@/components/home/GuidesReveal";
import { NearbyOnsenTeaser } from "@/components/home/NearbyOnsenTeaser";

export default async function Home() {
  const data = await getResortData();
  const lpFeatured = resolveLpFeatured(data);
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

      {lpFeatured.length >= 2 ? <LpHighlightDuet highlights={lpFeatured} /> : null}

      <NearbyOnsenTeaser />

      <NewsTeaser news={data.news} />

      <GuidesReveal sectionTitle={t("planTitle")} />
    </div>
  );
}
