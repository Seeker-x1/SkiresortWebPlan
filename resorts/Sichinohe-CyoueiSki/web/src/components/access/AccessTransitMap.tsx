import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { googleMapsPlaceUrl } from "@/lib/access-deep-links";
import type { AccessMapData } from "@/lib/resort-data";
import type { SignLink } from "./AccessMapSigns";
import { AccessMapHeroShell } from "./AccessMapHeroShell";

type Props = {
  map: AccessMapData;
};

export async function AccessTransitMap({ map }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("access.map");
  const en = locale === "en";
  const minutes = map.taxiMinutes ?? map.driveMinutes;

  const signLinks: SignLink[] = map.landmarks
    .filter((l) => l.role === "transit" || l.role === "destination")
    .map((landmark) => ({
      landmark,
      href: googleMapsPlaceUrl({
        lat: landmark.lat,
        lng: landmark.lng,
        label: en ? landmark.labelEn : landmark.label,
      }),
      ariaLabel: t("signOpenMaps", {
        place: en ? landmark.labelEn : landmark.label,
      }),
    }));

  return (
    <AccessMapHeroShell
      map={map}
      en={en}
      signLinks={signLinks}
      labels={{
        heroEyebrow: t("heroEyebrow"),
        heroHeadline: t("heroHeadline", { minutes }),
        heroSub: t("heroSub"),
        navFromHere: t("navFromHere"),
        navApple: t("navApple"),
        openGoTaxi: t("openGoTaxi"),
        goTaxiNote: t("goTaxiNote"),
        parking: t("parking"),
        parkingValue: en ? map.parkingEn : map.parking,
        sourceNote: t("sourceNote"),
      }}
    />
  );
}
