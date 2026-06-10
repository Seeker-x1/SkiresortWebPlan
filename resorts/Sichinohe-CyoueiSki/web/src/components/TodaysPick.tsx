import type { ResortData } from "@/lib/resort-data";
import { AwardButton } from "@/components/AwardButton";
import { SectionHeader } from "@/components/SectionHeader";

type TodaysPickProps = {
  news: ResortData["news"];
};

export function TodaysPick({ news }: TodaysPickProps) {
  const item = news.items[0];
  if (!item) return null;

  return (
    <section>
      <SectionHeader eyebrow="Today" title="今日のピックアップ" />
      <div className="surface-soft mt-6 p-6 sm:p-7">
        <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
        <p className="lead mt-4">{item.body}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AwardButton href="/news" variant="ghost" block className="sm:!w-auto">
            お知らせ一覧
          </AwardButton>
          <time className="muted-note text-sm" dateTime={item.date}>
            {item.date}
          </time>
        </div>
      </div>
    </section>
  );
}
