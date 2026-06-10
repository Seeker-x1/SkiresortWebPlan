import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("liftDeals");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LiftDealsPage() {
  const data = await getResortData();
  const t = await getTranslations("liftDeals");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <p role="note" className="notice-banner">
        {data.liftDeals.notice}
      </p>

      <div className="space-y-0">
        {data.liftDeals.sections.map((section) => (
          <AwardFold key={section.title} title={section.title}>
            <p className="lead">{section.body}</p>
          </AwardFold>
        ))}
      </div>
    </AwardPageShell>
  );
}
