import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lessonsEvents");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LessonsEventsPage() {
  const data = await getResortData();
  const t = await getTranslations("lessonsEvents");
  const lessons = data.lessonsEvents.items;

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <p role="note" className="notice-banner">
        {data.lessonsEvents.notice}
      </p>

      <div className="space-y-0">
        {lessons.map((lesson) => (
          <AwardFold key={lesson.name} title={lesson.name}>
            <span className="rounded-full bg-[color:var(--award-color-accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--award-color-accent)]">
              {lesson.status}
            </span>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
                  {t("time")}
                </dt>
                <dd className="mt-1 font-medium">{lesson.time}</dd>
              </div>
              <div>
                <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
                  {t("target")}
                </dt>
                <dd className="mt-1 font-medium">{lesson.target}</dd>
              </div>
            </dl>
            <p className="lead mt-4">{lesson.note}</p>
          </AwardFold>
        ))}
      </div>
    </AwardPageShell>
  );
}
