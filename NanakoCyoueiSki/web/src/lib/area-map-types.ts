export type LocalizedString = { ja: string; en: string };

export type AreaFeature = {
  id: string;
  group: "food" | "onsen" | "anchor";
  category: string;
  lat: number;
  lon: number;
  label: LocalizedString;
  shortLabel?: LocalizedString;
  district?: LocalizedString;
  region?: LocalizedString;
  phone?: string;
  website?: string;
  mapsQuery?: string;
  fixedOnMap?: boolean;
  listExclude?: boolean;
  type?: string;
  source?: string;
};

export type AreaMapData = {
  schemaVersion: string;
  id: string;
  resortId: string;
  name: LocalizedString;
  ui?: { title?: LocalizedString; lead?: LocalizedString };
  disclaimer: LocalizedString;
  updatedAt: string;
  sources?: string[];
  fixedAnchorIds?: string[];
  boundsProfiles?: Record<
    string,
    {
      includeGroups?: string[];
      excludeAnchorIds?: string[];
      excludeFoodIds?: string[];
      includeAnchorIds?: string[];
      maxZoom?: number;
    }
  >;
  anchors: AreaFeature[];
  food: AreaFeature[];
  onsen: AreaFeature[];
};
