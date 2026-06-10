import { getTranslations } from "next-intl/server";
import type { LiveCamsData } from "@/lib/resort-data";
import { AwardButton } from "@/components/AwardButton";
import { LiveCamFrame } from "@/components/live-cam/LiveCamFrame";

type ImmersiveLiveCamProps = {
  liveCams: LiveCamsData;
};

export async function ImmersiveLiveCam({ liveCams }: ImmersiveLiveCamProps) {
  const t = await getTranslations("home.liveCam");
  const cam = await getTranslations("liveCams");
  const statusLabels = {
    preparing: cam("status.preparing"),
    offline: cam("status.offline"),
    live: cam("status.live"),
  } as const;
  const main = liveCams.items[0];
  if (!main) return null;

  return (
    <section className="home-section bg-white">
      <div className="home-inner mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="display-xl mt-4">{t("title")}</h2>
        </div>
        <AwardButton href="/live-cams" variant="ghost" className="shrink-0 pb-1">
          {t("allCams")}
        </AwardButton>
      </div>

      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 sm:px-8">
        <LiveCamFrame
          camera={main}
          priority
          aspect="video"
          statusLabels={statusLabels}
          iframeTitleSuffix={cam("iframeTitle")}
          altPreparingSuffix={cam("altPreparing")}
          defaultPlaceholder={cam("defaultPlaceholder")}
        />
        <p className="lead-whisper mx-auto mt-6 max-w-xl text-center">
          {liveCams.notice}
        </p>
      </div>
    </section>
  );
}
