import { getTranslations } from "next-intl/server";
import type { LiveCamsData } from "@/lib/resort-data";
import { LiveCamFrame } from "@/components/live-cam/LiveCamFrame";

type LiveCamGridProps = {
  liveCams: LiveCamsData;
};

export async function LiveCamGrid({ liveCams }: LiveCamGridProps) {
  const t = await getTranslations("liveCams");
  const statusLabels = {
    preparing: t("status.preparing"),
    offline: t("status.offline"),
    live: t("status.live"),
  } as const;

  return (
    <div className="flex flex-col gap-8">
      {liveCams.items.map((camera, index) => (
        <LiveCamFrame
          key={camera.id}
          camera={camera}
          priority={index === 0}
          aspect="video"
          statusLabels={statusLabels}
          iframeTitleSuffix={t("iframeTitle")}
          altPreparingSuffix={t("altPreparing")}
          defaultPlaceholder={t("defaultPlaceholder")}
        />
      ))}
    </div>
  );
}
