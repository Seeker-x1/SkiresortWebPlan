import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage() {
  const data = await getResortData();
  const t = await getTranslations("contact");

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <section className="border-t border-[color:var(--award-color-border)] py-8">
        <h2 className="heading-md">{t("generalTitle")}</h2>
        <p className="lead mt-4">{data.contact.general.description}</p>
        <dl className="mt-6 space-y-5">
          <div>
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {t("phone")}
            </dt>
            <dd className="award-stat-inline mt-2 text-lg">
              {data.contact.general.phone}
            </dd>
          </div>
          <div>
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {t("hours")}
            </dt>
            <dd className="mt-2 font-medium">{data.contact.general.hours}</dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-[color:var(--award-color-border)] py-8">
        <h2 className="heading-md">{t("groupTitle")}</h2>
        <p className="lead mt-4">{data.contact.group.description}</p>
        <dl className="mt-6 space-y-5">
          <div>
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {t("email")}
            </dt>
            <dd className="mt-2 font-medium">{data.contact.group.email}</dd>
          </div>
          <div>
            <dt className="award-eyebrow text-[color:var(--award-color-muted)]">
              {t("form")}
            </dt>
            <dd className="mt-2 font-medium">{data.contact.group.form}</dd>
          </div>
        </dl>
      </section>
    </AwardPageShell>
  );
}
