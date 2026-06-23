import skyticketConfig from "../../../data/affiliates/skyticket-rentacar.json";

export type SkyticketRentacarAffiliate = {
  href: string;
  trackingPixel: string;
};

export type SkyticketRentacarDestinationId =
  keyof typeof skyticketConfig.destinations;

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

/** Resolve a registry destination ID into ValueCommerce + Skyticket URLs. */
export function buildSkyticketRentacarAffiliate(
  destinationId: string,
): SkyticketRentacarAffiliate | null {
  const destination =
    skyticketConfig.destinations[
      destinationId as SkyticketRentacarDestinationId
    ];
  if (!destination?.url) return null;
  return {
    href: buildReferralHref(destination.url),
    trackingPixel: buildTrackingPixel(),
  };
}
