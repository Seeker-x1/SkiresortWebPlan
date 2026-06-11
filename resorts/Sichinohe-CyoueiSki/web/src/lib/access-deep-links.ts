/** アクセスヒーロー用 — 外部マップ／配車アプリのディープリンク */

export type NavPoint = {
  lat: number;
  lng: number;
  label: string;
  labelEn?: string;
};

/** 地点ピン表示（ルート・起点なし） */
export function googleMapsPlaceUrl(point: NavPoint): string {
  const params = new URLSearchParams({
    api: "1",
    query: `${point.lat},${point.lng}`,
  });
  return `https://www.google.com/maps/search/?${params}`;
}

/** 現在地 → 目的地の Google Maps ナビ（アプリ優先） */
export function googleMapsNavigateUrl(destination: NavPoint): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
    dir_action: "navigate",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

/** Apple Maps — 現在地から目的地（daddr のみ） */
export function appleMapsNavigateUrl(destination: NavPoint): string {
  const params = new URLSearchParams({
    daddr: `${destination.lat},${destination.lng}`,
    dirflg: "d",
  });
  return `https://maps.apple.com/?${params}`;
}

/** 駅など指定起点 → ゲレンデ（ルートプレビュー） */
export function googleMapsRouteUrl(origin: NavPoint, destination: NavPoint): string {
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export type MobilePlatform = "ios" | "android" | "other";

export function detectMobilePlatform(): MobilePlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/**
 * GO（旧 JapanTaxi）— 公式の外部ディープリンクは未公開のため、
 * インストール済みならストア／公式へ。ユーザーがアプリ内で乗車地を指定。
 */
export function goTaxiAppUrl(platform: MobilePlatform): string {
  switch (platform) {
    case "ios":
      return "https://apps.apple.com/jp/app/id1254341709";
    case "android":
      return "https://play.google.com/store/apps/details?id=com.dena.automotive.taxibell&hl=ja";
    default:
      return "https://go.goinc.jp/";
  }
}
