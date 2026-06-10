import { getTranslations } from "next-intl/server";
import type { ResortData } from "@/lib/resort-data";
import { AwardButton } from "@/components/AwardButton";

type NewsTeaserProps = {
  news: ResortData["news"];
};

export async function NewsTeaser({ news }: NewsTeaserProps) {
  const t = await getTranslations("home.news");
  const item = news.items[0];
  if (!item) return null;

  return (
    <section className="home-section">
      <div className="home-inner">
        <div className="flex flex-col gap-4 border-y border-[color:var(--surface-border)] py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <p className="mt-3 text-lg font-medium tracking-tight sm:text-xl">
              {item.title}
            </p>
          </div>
          <AwardButton href="/news" variant="ghost" className="shrink-0">
            {t("all")}
          </AwardButton>
        </div>
      </div>
    </section>
  );
}
