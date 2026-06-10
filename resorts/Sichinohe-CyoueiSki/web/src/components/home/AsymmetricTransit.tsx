import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import { EditorialTitle } from "@/components/EditorialTitle";

type AsymmetricTransitProps = {
  title: string;
  body: string;
  todayLink: string;
  accessLink: string;
};

export async function AsymmetricTransit({
  title,
  body,
  todayLink,
  accessLink,
}: AsymmetricTransitProps) {
  const t = await getTranslations("home");
  return (
    <section className="home-section">
      <div className="home-inner">
        <div className="relative grid items-center gap-0 lg:grid-cols-12 lg:gap-6">
          <div className="relative lg:col-span-7 lg:col-start-1">
            <div className="relative aspect-[4/5] w-[88%] overflow-hidden sm:aspect-[3/4] lg:w-full">
              <Image
                src="/images/hero-train.png"
                alt={t("transitImageAlt")}
                fill
                sizes="(max-width: 1024px) 88vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 -mt-16 ml-[12%] w-[88%] bg-white p-8 shadow-[0_24px_64px_rgb(20_26_38_/8%)] sm:p-10 lg:col-span-6 lg:col-start-7 lg:-mt-0 lg:ml-0 lg:-translate-y-12 lg:p-12">
            <p className="eyebrow">{t("transitEyebrow")}</p>
            <EditorialTitle text={title} as="h2" className="heading-lg mt-5" />
            <p className="lead mt-6 max-w-md">{body}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <AwardButton href="/today" variant="primary">
                {todayLink}
              </AwardButton>
              <AwardButton href="/access" variant="ghost">
                {accessLink}
              </AwardButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
