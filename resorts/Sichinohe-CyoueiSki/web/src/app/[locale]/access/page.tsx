import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccessTransitMap } from "@/components/access/AccessTransitMap";
import { AccessTaxiBlock } from "@/components/access/AccessTaxiBlock";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("access");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AccessPage() {
  const data = await getResortData();
  const t = await getTranslations("access");
  const tMap = await getTranslations("access.map");
  const locale = await getLocale();
  const en = locale === "en";
  const fromStationIndex = data.access.cards.findIndex((c) =>
    en ? c.k === "From station" : c.k === "駅から",
  );

  return (
    <>
      {data.access.map ? <AccessTransitMap map={data.access.map} /> : null}

      <div className="award-section">
        <div className="award-inner">
          <div className="grid gap-0 border-t border-[color:var(--award-color-border)] md:grid-cols-3">
            {data.access.cards.map((item, index) => (
              <div
                key={item.k}
                className="border-b border-[color:var(--award-color-border)] py-7 md:border-b-0 md:border-r md:px-8 md:py-10 md:last:border-r-0"
              >
                <p className="award-eyebrow text-[color:var(--award-color-muted)]">
                  {item.k}
                </p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{item.v}</p>
                {data.access.taxi && index === fromStationIndex ? (
                  <AccessTaxiBlock
                    taxi={data.access.taxi}
                    en={en}
                    labels={{
                      eyebrow: tMap("taxiEyebrow"),
                      phoneLabel: tMap("taxiPhoneLabel"),
                      addressLabel: tMap("taxiAddressLabel"),
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <AwardFold title={t("foldTitle")}>
            <ul className="lead list-inside list-disc space-y-3">
              {data.access.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AwardFold>
        </div>
      </div>
    </>
  );
}
