import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("access");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AccessPage() {
  const data = await getResortData();
  const t = await getTranslations("access");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <div className="space-y-0 border-t border-[color:var(--award-color-border)]">
        {data.access.cards.map((item) => (
          <div
            key={item.k}
            className="border-b border-[color:var(--award-color-border)] py-7"
          >
            <p className="award-eyebrow text-[color:var(--award-color-muted)]">
              {item.k}
            </p>
            <p className="mt-3 text-xl font-semibold tracking-tight">{item.v}</p>
          </div>
        ))}
      </div>

      <AwardFold title={t("foldTitle")}>
        <ul className="lead list-inside list-disc space-y-3">
          {data.access.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </AwardFold>
    </AwardPageShell>
  );
}
