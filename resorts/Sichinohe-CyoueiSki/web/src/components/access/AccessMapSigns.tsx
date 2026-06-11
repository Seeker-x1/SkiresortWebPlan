import type { CSSProperties } from "react";
import type { AccessLandmark, AccessMapData } from "@/lib/resort-data";

export type SignLink = {
  landmark: AccessLandmark;
  href: string;
  ariaLabel: string;
};

type Props = {
  bounds: AccessMapData["bounds"];
  signLinks: SignLink[];
  en?: boolean;
};

function landmarkShortLabel(landmark: AccessLandmark, en: boolean): string {
  if (en) return landmark.shortLabelEn ?? landmark.labelEn;
  return landmark.shortLabel ?? landmark.label;
}

function projectSignX(lng: number, bounds: AccessMapData["bounds"]): number {
  const geoX = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);
  return 14 + geoX * 72;
}

type SignSlot = {
  x: number;
  y: number;
  labelBelow: boolean;
};

function signSlotForRole(
  lat: number,
  lng: number,
  bounds: AccessMapData["bounds"],
  role: AccessLandmark["role"],
): SignSlot {
  const geoY = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  const x = projectSignX(lng, bounds);

  if (role === "destination") {
    const band = { min: 16, max: 28 };
    return { x, y: band.min + geoY * (band.max - band.min), labelBelow: true };
  }

  const band = { min: 72, max: 84 };
  return { x, y: band.min + geoY * (band.max - band.min), labelBelow: false };
}

function SignMarker({
  label,
  isDestination,
  labelBelow,
}: {
  label: string;
  isDestination: boolean;
  labelBelow: boolean;
}) {
  const pillClass = isDestination
    ? "rounded-full bg-white px-3 py-1.5 text-center text-[0.6875rem] font-semibold leading-tight text-[color:var(--award-color-fg)] shadow-[0_8px_24px_rgb(20_26_38_/16%)] transition-transform duration-200 ease-[var(--ease-award)] motion-safe:group-hover:scale-[1.03] sm:text-xs"
    : "rounded-full border border-[color:var(--award-color-border)] bg-white/95 px-3 py-1.5 text-center text-[0.6875rem] font-medium leading-tight text-[color:var(--award-color-muted)] shadow-[0_6px_20px_rgb(20_26_38_/10%)] transition-transform duration-200 ease-[var(--ease-award)] motion-safe:group-hover:scale-[1.03] sm:text-xs";

  const dotClass = isDestination
    ? "h-2.5 w-2.5 rounded-full bg-[color:var(--award-color-accent)] ring-2 ring-white"
    : "h-2 w-2 rounded-full bg-[color:var(--award-color-muted)] ring-2 ring-white";

  const pill = (
    <div className={`max-w-[8.5rem] whitespace-nowrap sm:max-w-[9.5rem] ${pillClass}`}>
      {label}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {!labelBelow ? pill : null}
      <span className={dotClass} aria-hidden={true} />
      {labelBelow ? pill : null}
    </div>
  );
}

function SignLinkAnchor({
  link,
  en,
  className,
  style,
  centerX = true,
}: {
  link: SignLink;
  en: boolean;
  className: string;
  style?: CSSProperties;
  centerX?: boolean;
}) {
  const isDestination = link.landmark.role === "destination";
  const labelBelow = isDestination;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.ariaLabel}
      className={`group map-focus-ring pointer-events-auto flex min-h-11 min-w-11 items-center justify-center ${centerX ? "-translate-x-1/2" : ""} ${className}`}
      style={style}
    >
      <SignMarker
        label={landmarkShortLabel(link.landmark, en)}
        isDestination={isDestination}
        labelBelow={labelBelow}
      />
    </a>
  );
}

/** 地図上のフローティングサイン（タップで Google マップの地点表示） */
export function AccessMapSigns({ bounds, signLinks, en = false }: Props) {
  const destination = signLinks.find((l) => l.landmark.role === "destination");
  const transit = signLinks.find((l) => l.landmark.role === "transit");

  return (
    <>
      <div
        className="absolute inset-y-0 z-[5] hidden md:block md:left-[var(--access-sign-zone-left,45%)] md:right-0"
        role="group"
        aria-label={en ? "Locations on map" : "地図上の地点"}
      >
        {destination ? (() => {
          const slot = signSlotForRole(
            destination.landmark.lat,
            destination.landmark.lng,
            bounds,
            "destination",
          );
          return (
            <SignLinkAnchor
              link={destination}
              en={en}
              className="absolute"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            />
          );
        })() : null}
        {transit ? (() => {
          const slot = signSlotForRole(
            transit.landmark.lat,
            transit.landmark.lng,
            bounds,
            "transit",
          );
          return (
            <SignLinkAnchor
              link={transit}
              en={en}
              className="absolute -translate-y-full"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            />
          );
        })() : null}
      </div>

      <div
        className="absolute inset-0 z-[5] md:hidden"
        role="group"
        aria-label={en ? "Locations on map" : "地図上の地点"}
      >
        {destination ? (
          <SignLinkAnchor
            link={destination}
            en={en}
            centerX={false}
            className="absolute right-4 top-[var(--access-sign-inset-y,12%)]"
          />
        ) : null}
        {transit ? (
          <SignLinkAnchor
            link={transit}
            en={en}
            centerX={false}
            className="absolute bottom-[var(--access-sign-inset-y,12%)] right-4"
          />
        ) : null}
      </div>
    </>
  );
}
