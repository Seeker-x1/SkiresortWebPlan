import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AwardButton } from "@/components/AwardButton";

export async function PathMagnet() {
  const t = await getTranslations("home.pathMagnet");

  const paths = [
    {
      href: "/today" as const,
      label: t("todayLabel"),
      title: t("todayTitle"),
      span: "col-span-12 sm:col-span-8",
      tall: true,
    },
    {
      href: "/access" as const,
      label: t("accessLabel"),
      title: t("accessTitle"),
      span: "col-span-12 sm:col-span-4",
      tall: false,
    },
    {
      href: "/map" as const,
      label: t("mapLabel"),
      title: t("mapTitle"),
      span: "col-span-12 sm:col-span-8",
      tall: true,
    },
    {
      href: "/tickets-rental" as const,
      label: t("ticketsLabel"),
      title: t("ticketsTitle"),
      span: "col-span-12 sm:col-span-4",
      tall: false,
    },
  ];

  return (
    <section className="home-section">
      <div className="home-inner">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="heading-lg mt-4">{t("title")}</h2>

        <div className="mt-14 grid grid-cols-12 gap-3 sm:gap-4">
          {paths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className={`group relative overflow-hidden bg-white p-6 transition hover:shadow-[0_20px_48px_rgb(20_26_38_/8%)] sm:p-8 ${path.span} ${
                path.tall ? "min-h-[11rem] sm:min-h-[14rem]" : "min-h-[8rem]"
              }`}
            >
              <span className="eyebrow text-[color:var(--muted)] group-hover:text-[color:var(--accent)]">
                {path.label}
              </span>
              <span
                className={`mt-4 block font-semibold tracking-tight text-[color:var(--foreground)] ${
                  path.tall ? "text-2xl sm:text-3xl" : "text-xl"
                }`}
              >
                {path.title}
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-6 right-6 text-2xl font-light text-[color:var(--surface-border)] transition group-hover:translate-x-1 group-hover:text-[color:var(--accent)]"
              >
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-right">
          <AwardButton href="/faq" variant="ghost">
            {t("faqLink")}
          </AwardButton>
        </div>
      </div>
    </section>
  );
}
