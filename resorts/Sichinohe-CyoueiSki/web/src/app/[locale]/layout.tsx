import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_JP, Syne } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SkiResortJsonLd } from "@/components/SkiResortJsonLd";
import { getResortData } from "@/lib/resort-data";
import "../globals.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("siteName"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("defaultDescription"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const footer = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const a11y = await getTranslations({ locale, namespace: "a11y" });
  const data = await getResortData();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return (
    <html
      lang={locale}
      className={`${notoSans.variable} ${syne.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="award-root flex min-h-full flex-col">
        <SkiResortJsonLd data={data} siteUrl={siteUrl} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--accent)] focus:px-4 focus:py-2 focus:text-white"
        >
          {a11y("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 pt-16 outline-none">
            {children}
          </main>
          <footer className="border-t border-[color:var(--surface-border)] bg-white py-10">
            <div className="mx-auto flex max-w-[42rem] flex-col gap-4 px-5 text-sm text-[color:var(--muted)] sm:px-7">
              <p>{footer("copyright")}</p>
              <div className="flex flex-wrap gap-6">
                <Link href="/news" className="hover:underline">
                  {nav("news")}
                </Link>
                <Link href="/faq" className="hover:underline">
                  {nav("faq")}
                </Link>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
