import type { ResortData } from "@/lib/resort-data";

type SkiResortJsonLdProps = {
  data: ResortData;
  siteUrl: string;
};

export function SkiResortJsonLd({ data, siteUrl }: SkiResortJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SkiResort",
    name: data.resort.name,
    description:
      "青森県七戸町の町営スキー場。東北新幹線七戸十和田駅からアクセスしやすいトランジット・リゾート。",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: "七戸町",
      addressRegion: "青森県",
      addressCountry: "JP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: data.resort.coordinates.lat,
      longitude: data.resort.coordinates.lng,
    },
    touristType: ["Family", "SkiingEnthusiast"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
