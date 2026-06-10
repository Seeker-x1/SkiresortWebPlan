import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardPageShell } from "@/components/AwardPageShell";
import { LiveCamGrid } from "@/components/live-cam/LiveCamGrid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("liveCams");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LiveCamsPage() {
  const data = await getResortData();
  const t = await getTranslations("liveCams");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <p role="note" className="notice-banner">
        {data.liveCams.notice}
      </p>
      <LiveCamGrid liveCams={data.liveCams} />
    </AwardPageShell>
  );
}
