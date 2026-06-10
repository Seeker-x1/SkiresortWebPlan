import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function NewsPage() {
  const data = await getResortData();
  const t = await getTranslations("news");
  const newsItems = data.news.items;

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <div className="space-y-0 border-t border-[color:var(--award-color-border)]">
        {newsItems.map((item) => (
          <article
            key={item.id ?? `${item.date}-${item.title}`}
            className="border-b border-[color:var(--award-color-border)] py-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="award-eyebrow text-[color:var(--award-color-accent)]">
                {item.category}
              </span>
              <time
                className="text-sm text-[color:var(--award-color-muted)]"
                dateTime={item.date}
              >
                {item.date}
              </time>
            </div>
            <h2 className="heading-md mt-4">{item.title}</h2>
            <p className="lead mt-4">{item.body}</p>
          </article>
        ))}
      </div>
    </AwardPageShell>
  );
}
