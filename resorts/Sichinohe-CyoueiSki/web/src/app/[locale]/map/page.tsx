import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LiftMapViewer } from "@/components/lift-map/LiftMapViewer";
import { MapPageShell } from "@/components/lift-map/MapPageShell";
import { MapQuickNav } from "@/components/lift-map/MapQuickNav";
import { MapStatusProvider } from "@/components/lift-map/MapStatusContext";
import { MapTopBar } from "@/components/lift-map/MapTopBar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("map.page");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function MapPage() {
  return (
    <MapStatusProvider>
      <MapPageShell
        header={
          <>
            <MapTopBar />
            <MapQuickNav />
          </>
        }
      >
        <LiftMapViewer />
      </MapPageShell>
    </MapStatusProvider>
  );
}
