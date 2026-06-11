import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AwardButton } from "@/components/AwardButton";
import type { AccessMapData } from "@/lib/resort-data";

type Props = {
  map: AccessMapData;
};

const SVG_W = 400;
const SVG_H = 300;
const PAD = 44;

function project(
  lat: number,
  lng: number,
  bounds: AccessMapData["bounds"],
): { x: number; y: number } {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const x =
    PAD + ((lng - minLng) / (maxLng - minLng)) * (SVG_W - PAD * 2);
  const y =
    SVG_H -
    PAD -
    ((lat - minLat) / (maxLat - minLat)) * (SVG_H - PAD * 2);
  return { x, y };
}

function GeneratedAccessSvg({
  map,
  ariaLabel,
  driveTimeLabel,
  northLabel,
  en,
}: {
  map: AccessMapData;
  ariaLabel: string;
  driveTimeLabel: string;
  northLabel: string;
  en: boolean;
}) {
  const transit = map.landmarks.find((l) => l.role === "transit");
  const resort = map.landmarks.find((l) => l.role === "destination");
  if (!transit || !resort) return null;

  const from = project(transit.lat, transit.lng, map.bounds);
  const to = project(resort.lat, resort.lng, map.bounds);
  const mid = { x: (from.x + to.x) / 2 + 18, y: (from.y + to.y) / 2 };
  const routePath = `M ${from.x} ${from.y} C ${from.x} ${from.y - 48}, ${to.x - 12} ${to.y + 40}, ${to.x} ${to.y}`;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="mx-auto block h-auto w-full max-w-lg"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="access-bg" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#e8f4fa" />
          <stop offset="100%" stopColor="#f7f9fb" />
        </linearGradient>
      </defs>
      <rect width={SVG_W} height={SVG_H} fill="url(#access-bg)" rx="8" />
      <path
        d={`M ${from.x - 6} ${SVG_H} L ${from.x} ${from.y} L ${to.x} ${to.y} L ${to.x + 8} 0`}
        fill="#dce8ee"
        opacity="0.45"
      />
      <path
        d={routePath}
        fill="none"
        stroke="#5eb8e8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 4"
      />
      <g transform={`translate(${SVG_W - PAD + 8}, ${PAD - 20})`}>
        <path d="M0 -14 L4 0 L0 -4 L-4 0 Z" fill="#64748b" />
        <text
          x="0"
          y="12"
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#64748b"
        >
          {northLabel}
        </text>
      </g>
      <rect
        x={mid.x - 36}
        y={mid.y - 11}
        width="72"
        height="22"
        rx="11"
        fill="#5eb8e8"
      />
      <text
        x={mid.x}
        y={mid.y + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#1c2434"
      >
        {driveTimeLabel}
      </text>
      <circle cx={from.x} cy={from.y} r="9" fill="#2d6b7a" />
      <circle cx={from.x} cy={from.y} r="4" fill="#fff" />
      <text
        x={from.x}
        y={from.y + 22}
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill="#1c2434"
      >
        {en ? transit.labelEn : transit.label}
      </text>
      <circle cx={to.x} cy={to.y} r="11" fill="#5eb8e8" stroke="#1c2434" strokeWidth="1.5" />
      <circle cx={to.x} cy={to.y} r="4" fill="#fff" />
      <text
        x={to.x}
        y={to.y - 16}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#1c2434"
      >
        {en ? resort.labelEn : resort.label}
      </text>
    </svg>
  );
}

export async function AccessTransitMap({ map }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("access.map");
  const en = locale === "en";

  const parkingLabel = en ? map.parkingEn : map.parking;
  const ariaLabel = t("ariaLabel", {
    from: en ? map.driveFromEn : map.driveFrom,
    minutes: map.driveMinutes,
  });
  const driveTimeLabel = t("driveTime", { minutes: map.driveMinutes });

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[color:var(--award-color-border)] bg-gradient-to-br from-[color:var(--award-color-accent-soft)] to-white"
      aria-labelledby="access-map-heading"
    >
      <div className="border-b border-[color:var(--award-color-border)] bg-white/80 px-5 py-4 backdrop-blur-sm">
        <h2
          id="access-map-heading"
          className="award-eyebrow text-[color:var(--award-color-muted)]"
        >
          {t("eyebrow")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--award-color-muted)]">
          {t("caption")}
        </p>
      </div>

      <div className="relative px-3 pb-2 pt-3">
        {map.illustrationSrc ? (
          <Image
            src={map.illustrationSrc}
            alt={ariaLabel}
            width={400}
            height={300}
            className="mx-auto block h-auto w-full max-w-lg rounded-lg"
            priority
          />
        ) : (
          <GeneratedAccessSvg
            map={map}
            ariaLabel={ariaLabel}
            driveTimeLabel={driveTimeLabel}
            northLabel={t("north")}
            en={en}
          />
        )}
      </div>

      <div className="space-y-3 border-t border-[color:var(--award-color-border)] bg-white/90 px-5 py-4">
        <p className="text-sm text-[color:var(--award-color-muted)]">
          <span className="font-semibold text-[color:var(--foreground)]">
            {t("parking")}:
          </span>{" "}
          {parkingLabel}
        </p>
        <p className="text-[0.6875rem] leading-relaxed text-[color:var(--award-color-muted)]">
          {t("sourceNote")}
        </p>
        <AwardButton href={map.mapUrl} variant="primary" external showArrow={false}>
          {t("openMaps")}
        </AwardButton>
      </div>
    </section>
  );
}
