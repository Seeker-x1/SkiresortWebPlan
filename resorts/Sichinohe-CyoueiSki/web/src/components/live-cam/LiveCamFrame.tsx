import Image from "next/image";
import type { LiveCamItem } from "@/lib/resort-data";

type LiveCamFrameProps = {
  camera: LiveCamItem;
  priority?: boolean;
  aspect?: "video" | "thumb";
  statusLabels: Record<LiveCamItem["status"], string>;
  iframeTitleSuffix: string;
  altPreparingSuffix: string;
  defaultPlaceholder: string;
};

export function LiveCamFrame({
  camera,
  priority = false,
  aspect = "video",
  statusLabels,
  iframeTitleSuffix,
  altPreparingSuffix,
  defaultPlaceholder,
}: LiveCamFrameProps) {
  const isLive = camera.status === "live" && Boolean(camera.streamUrl);
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-[4/3]";

  return (
    <figure className="overflow-hidden rounded-sm bg-white shadow-[0_24px_80px_rgb(20_26_38_/10%)]">
      <div className={`relative ${aspectClass} w-full bg-[color:var(--accent-soft)]`}>
        {isLive ? (
          <iframe
            src={camera.streamUrl!}
            title={`${camera.name} ${iframeTitleSuffix}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <>
            {camera.thumbnailUrl ? (
              <Image
                src={camera.thumbnailUrl}
                alt={`${camera.name}${altPreparingSuffix}`}
                fill
                priority={priority}
                sizes={aspect === "video" ? "100vw" : "200px"}
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/72 px-6 text-center backdrop-blur-[2px]">
              <span className="rounded-full bg-[color:var(--accent-soft)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--accent)]">
                {statusLabels[camera.status]}
              </span>
              <p className="max-w-xs text-sm leading-relaxed text-[color:var(--muted)]">
                {camera.placeholderMessage ?? defaultPlaceholder}
              </p>
            </div>
          </>
        )}
      </div>
      <figcaption className="flex flex-col gap-1 px-5 py-4">
        <span className="font-semibold tracking-tight">{camera.name}</span>
        {camera.description ? (
          <span className="muted-note text-sm">{camera.description}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
