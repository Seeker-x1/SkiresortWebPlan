import skyticketConfig from "../../../configs/affiliates/skyticket-rentacar.json";

export type SkyticketRentacarAffiliate = {
  href: string;
  trackingPixel: string;
};

export type SkyticketRentacarDestinationId =
  keyof typeof skyticketConfig.destinations;

type Destination = (typeof skyticketConfig.destinations)[SkyticketRentacarDestinationId];

function buildReferralHref(skyticketUrl: string): string {
  const params = new URLSearchParams({
    sid: skyticketConfig.sid,
    pid: skyticketConfig.pid,
    vc_url: skyticketUrl,
  });
  return `${skyticketConfig.referralBase}?${params.toString()}`;
}

function buildTrackingPixel(): string {
  const params = new URLSearchParams({
    sid: skyticketConfig.sid,
    pid: skyticketConfig.pid,
  });
  return `${skyticketConfig.pixelBase}?${params.toString()}`;
}

/** Skyticket landing URL for locale (ValueCommerce vc_url). EN → /en/rentacar/... */
export function resolveSkyticketDestinationUrl(
  destination: Pick<Destination, "url"> & { urlEn?: string },
  locale: string,
): string {
  if (locale !== "en") return destination.url;
  if (destination.urlEn) return destination.urlEn;
  const parsed = new URL(destination.url);
  if (!parsed.pathname.startsWith("/en/")) {
    parsed.pathname = `/en${parsed.pathname}`;
  }
  return parsed.href;
}

/** Resolve a registry destination ID into ValueCommerce + Skyticket URLs. */
export function buildSkyticketRentacarAffiliate(
  destinationId: string,
  locale: string = "ja",
): SkyticketRentacarAffiliate | null {
  const destination =
    skyticketConfig.destinations[
      destinationId as SkyticketRentacarDestinationId
    ];
  if (!destination?.url) return null;
  const skyticketUrl = resolveSkyticketDestinationUrl(destination, locale);
  return {
    href: buildReferralHref(skyticketUrl),
    trackingPixel: buildTrackingPixel(),
  };
}
