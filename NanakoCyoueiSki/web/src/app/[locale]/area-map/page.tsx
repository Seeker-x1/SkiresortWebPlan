import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AreaMapViewer } from "@/components/area-map/AreaMapViewer";
import { getAreaMapData } from "@/lib/area-map-data";

export const metadata: Metadata = {
  title: "周辺マップ",
  description:
    "七戸町営スキー場を起点に、新幹線駅・温泉・十和田湖方面の周辺スポットを地図で確認できます。",
};

export default async function AreaMapPage() {
  const data = await getAreaMapData();
  if (!data) notFound();

  const localeRaw = await getLocale();
  const locale = localeRaw === "en" ? "en" : "ja";

  return <AreaMapViewer data={data} locale={locale} />;
}
