import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function FaqPage() {
  const data = await getResortData();
  const t = await getTranslations("faq");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <p role="note" className="notice-banner">
        {data.faq.notice}
      </p>

      <div className="space-y-14">
        {data.faq.categories.map((category) => (
          <section key={category.id}>
            <h2 className="heading-md">{category.title}</h2>
            <div className="mt-6">
              {category.items.map((item) => (
                <AwardFold key={item.id} title={item.question}>
                  <p className="lead">{item.answer}</p>
                </AwardFold>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AwardPageShell>
  );
}
