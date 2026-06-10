import { getTranslations } from "next-intl/server";
import type { LiveCamsData } from "@/lib/resort-data";
import { AwardButton } from "@/components/AwardButton";
import { LiveCamFrame } from "@/components/live-cam/LiveCamFrame";
import { SectionHeader } from "@/components/SectionHeader";

type LiveCamPreviewProps = {
  liveCams: LiveCamsData;
};

export async function LiveCamPreview({ liveCams }: LiveCamPreviewProps) {
  const t = await getTranslations("liveCams");
  const statusLabels = {
    preparing: t("status.preparing"),
    offline: t("status.offline"),
    live: t("status.live"),
  } as const;
  const main = liveCams.items[0];
  if (!main) return null;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("previewTitle")}
          description={liveCams.notice}
        />
        <AwardButton
          href="/live-cams"
          variant="ghost"
          className="shrink-0 self-start sm:self-auto"
        >
          {t("viewAll")}
        </AwardButton>
      </div>
      <div className="mt-6">
        <LiveCamFrame
          camera={main}
          priority
          aspect="video"
          statusLabels={statusLabels}
          iframeTitleSuffix={t("iframeTitle")}
          altPreparingSuffix={t("altPreparing")}
          defaultPlaceholder={t("defaultPlaceholder")}
        />
      </div>
    </section>
  );
}
