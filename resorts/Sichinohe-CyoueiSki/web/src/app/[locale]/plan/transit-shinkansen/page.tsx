import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plan.transitShinkansen");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function TransitShinkansenPage() {
  const t = await getTranslations("plan.transitShinkansen");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      titleLines={t.raw("titleLines") as string[]}
      description={t("shellDescription")}
      footer={
        <div className="flex flex-wrap gap-4">
          <AwardButton href="/access" variant="primary">
            {t("ctaAccess")}
          </AwardButton>
          <AwardButton href="/today" variant="ghost">
            {t("ctaToday")}
          </AwardButton>
        </div>
      }
    >
      <p className="lead">{t("lead")}</p>
    </AwardPageShell>
  );
}
