import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardPageShell } from "@/components/AwardPageShell";
import { FreshnessBadge } from "@/components/FreshnessBadge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("today");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TodayPage() {
  const data = await getResortData();
  const hero = await getTranslations("home.hero");
  const t = await getTranslations("today");
  const todaySnapshot = data.today.snapshot;

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
      footer={
        <FreshnessBadge
          label={hero("freshnessLabel")}
          staffVerifiedLabel={hero("staffVerified")}
          updatedAt={data.today.lastUpdated}
          verified={data.today.lastUpdated !== t("prepLastUpdated")}
        />
      }
    >
      <p role="note" className="notice-banner">
        {data.today.notice}
      </p>

      <dl className="space-y-0">
        {todaySnapshot.map((item, index) => (
          <div
            key={item.key}
            className={`border-t border-[color:var(--award-color-border)] py-7 ${
              index === todaySnapshot.length - 1 ? "border-b" : ""
            }`}
          >
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {item.title}
            </dt>
            <dd className="award-stat-mono mt-3 text-[clamp(1.75rem,6vw,2.75rem)]">
              {item.value}
            </dd>
            <p className="award-lead mt-3 text-[color:var(--award-color-muted)]">
              {item.note}
            </p>
          </div>
        ))}
      </dl>
    </AwardPageShell>
  );
}
