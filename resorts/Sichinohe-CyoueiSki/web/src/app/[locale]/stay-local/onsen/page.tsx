import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardPageShell } from "@/components/AwardPageShell";
import { OnsenGuideBody } from "@/components/stay-local/OnsenGuideBody";
import { AwardButton } from "@/components/AwardButton";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onsenGuide");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OnsenGuidePage() {
  const data = await getResortData();
  const t = await getTranslations("onsenGuide");

  if (!data.onsenGuide) {
    notFound();
  }

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
      footer={
        <AwardButton href="/stay-local" variant="ghost">
          {t("backToStayLocal")}
        </AwardButton>
      }
    >
      <OnsenGuideBody guide={data.onsenGuide} tsutaSpot={data.stayLocal.featuredSpot} />
    </AwardPageShell>
  );
}
