import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plan.transitPowder");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function TransitPowderPage() {
  const t = await getTranslations("plan.transitPowder");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      titleLines={t.raw("titleLines") as string[]}
      description={t("shellDescription")}
      footer={
        <div className="flex flex-wrap gap-4">
          <AwardButton href="/today" variant="primary">
            {t("ctaToday")}
          </AwardButton>
          <AwardButton href="/access" variant="ghost">
            {t("ctaAccess")}
          </AwardButton>
        </div>
      }
    >
      <p className="lead">{t("lead")}</p>
    </AwardPageShell>
  );
}
