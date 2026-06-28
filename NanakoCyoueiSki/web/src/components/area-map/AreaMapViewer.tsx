"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { AreaFeature, AreaMapData } from "@/lib/area-map-types";
import {
  DEFAULT_LAYERS,
  FALLBACK_CENTER,
  FALLBACK_ZOOM,
  LAYER_KEYS,
  allAreaFeatures,
  appendVisibleFixedAnchors,
  districtLabel,
  featuresForBounds,
  googleMapsUrl,
  isFeatureOnMap,
  markersForRender,
  pickLocalized,
  resolveBoundsProfile,
  resolvedFixedAnchorIds,
  sortForList,
  type LayerKey,
} from "@/lib/area-map-runtime";
import { makeAreaMarkerIcon } from "@/lib/area-map-markers";
import "leaflet/dist/leaflet.css";
import "./area-map.css";

type Props = {
  data: AreaMapData;
  locale: "ja" | "en";
};

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function AreaMapViewer({ data, locale }: Props) {
  const t = useTranslations("areaMap");
  const stageRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markerByIdRef = useRef<Map<string, Marker>>(new Map());
  const skipNextMoveEndRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(DEFAULT_LAYERS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fixedVisible, setFixedVisible] = useState<Record<string, boolean>>({
    ski: true,
    station: true,
  });

  const features = useMemo(() => allAreaFeatures(data), [data]);
  const fixedIds = useMemo(() => resolvedFixedAnchorIds(data, features), [data, features]);
  const featureById = useCallback((id: string) => features.find((f) => f.id === id), [features]);

  selectedIdRef.current = selectedId;

  const filteredFeatures = useMemo(
    () => features.filter((f) => activeLayers.has(f.group)),
    [features, activeLayers],
  );

  const listFeatures = useMemo(
    () => sortForList(filteredFeatures, fixedIds),
    [filteredFeatures, fixedIds],
  );

  const categoryLabel = useCallback(
    (feature: AreaFeature) => {
      const key = `category.${feature.category}`;
      if (t.has(key as "category.ski")) return t(key as "category.ski");
      return feature.category;
    },
    [t],
  );

  const buildPopupHtml = useCallback(
    (feature: AreaFeature) => {
      const name = pickLocalized(feature.label, locale);
      const cat = categoryLabel(feature);
      const district = districtLabel(feature, locale);
      const mapsUrl = googleMapsUrl(feature.mapsQuery || name);

      let html = `
      <div class="area-map-popup" role="dialog" aria-labelledby="area-popup-title-${esc(feature.id)}">
        <button type="button" class="area-map-popup__close" aria-label="${esc(t("popup.close"))}">×</button>
        <h3 class="area-map-popup__title" id="area-popup-title-${esc(feature.id)}">${esc(name)}</h3>
        <p class="area-map-popup__category">${esc(cat)}</p>`;

      if (district) {
        html += `<p class="area-map-popup__district">${esc(district)}</p>`;
      }
      if (feature.phone) {
        html += `<a class="area-map-popup__phone" href="tel:${esc(feature.phone)}" aria-label="${esc(t("popup.phoneAria", { phone: feature.phone }))}">${esc(feature.phone)}</a>`;
      }
      if (feature.website) {
        html += `<a class="area-map-popup__web" href="${esc(feature.website)}" target="_blank" rel="noopener noreferrer">${esc(t("popup.website"))} ↗</a>`;
      }

      html += `<a class="area-map-popup__cta" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t("popup.viewMapAria", { name }))}">${esc(t("popup.viewMap"))}</a>`;
      html += `</div>`;
      return html;
    },
    [categoryLabel, locale, t],
  );

  const fitMapToProfile = useCallback(
    async (animate: boolean, ensureIds: string[] = []) => {
      const map = mapInstance.current;
      if (!map) return;

      const L = (await import("leaflet")).default;
      const profile = resolveBoundsProfile(activeLayers);
      const feats = appendVisibleFixedAnchors(
        featuresForBounds(data, profile, filteredFeatures, ensureIds),
        fixedIds,
        fixedVisible,
        featureById,
      );
      const cfg = data.boundsProfiles?.[profile] || {};
      const anim = animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!feats.length) {
        skipNextMoveEndRef.current = true;
        map.setView(FALLBACK_CENTER, FALLBACK_ZOOM, { animate: anim });
        return;
      }

      const bounds = L.latLngBounds(feats.map((f) => [f.lat, f.lon] as [number, number]));
      skipNextMoveEndRef.current = true;
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: cfg.maxZoom ?? 13,
        animate: anim,
      });
    },
    [activeLayers, data, filteredFeatures, fixedIds, fixedVisible, featureById],
  );

  const closePopup = useCallback(() => {
    const id = selectedIdRef.current;
    if (id) markerByIdRef.current.get(id)?.closePopup();
    setSelectedId(null);
  }, []);

  const openPopupForFeature = useCallback(
    (feature: AreaFeature) => {
      const marker = markerByIdRef.current.get(feature.id);
      if (!marker) return;
      marker.setPopupContent(buildPopupHtml(feature));
      marker.openPopup();
    },
    [buildPopupHtml],
  );

  const selectFeatureRef = useRef<
    (id: string, options?: { fromList?: boolean }) => void | Promise<void>
  >(() => {});

  const renderMarkers = useCallback(async () => {
    const map = mapInstance.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    const L = (await import("leaflet")).default;
    markerLayer.clearLayers();
    markerByIdRef.current.clear();

    const visible = markersForRender(filteredFeatures, fixedIds, fixedVisible, featureById);

    for (const feature of visible) {
      if (!isFeatureOnMap(feature, activeLayers, fixedIds, fixedVisible)) continue;

      const active = feature.id === selectedIdRef.current;
      const icon = await makeAreaMarkerIcon(L, feature, active);
      const marker = L.marker([feature.lat, feature.lon], {
        icon,
        title: pickLocalized(feature.shortLabel ?? feature.label, locale),
      });

      marker.bindPopup(() => buildPopupHtml(feature), {
        className: "area-leaflet-popup",
        maxWidth: 300,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [32, 32],
        offset: [0, -12],
        closeButton: false,
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        void selectFeatureRef.current(feature.id, { fromList: false });
      });

      marker.on("popupclose", () => {
        if (selectedIdRef.current === feature.id) setSelectedId(null);
      });

      marker.addTo(markerLayer);
      markerByIdRef.current.set(feature.id, marker);
      marker.setZIndexOffset(active ? 1000 : feature.id === "ski" ? 500 : 0);
    }
  }, [
    activeLayers,
    buildPopupHtml,
    featureById,
    filteredFeatures,
    fixedIds,
    fixedVisible,
    locale,
  ]);

  const selectFeature = useCallback(
    async (id: string, options: { fromList?: boolean } = {}) => {
      const feature = featureById(id);
      if (!feature || !isFeatureOnMap(feature, activeLayers, fixedIds, fixedVisible)) return;

      const marker = markerByIdRef.current.get(id);
      if (selectedIdRef.current === id && marker?.isPopupOpen?.()) return;

      if (selectedIdRef.current && selectedIdRef.current !== id) {
        markerByIdRef.current.get(selectedIdRef.current)?.closePopup();
      }

      setSelectedId(id);
      await fitMapToProfile(true, [id]);
      openPopupForFeature(feature);

      if (options.fromList) {
        document
          .querySelector(`[data-feature-id="${id}"]`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [activeLayers, featureById, fitMapToProfile, fixedIds, fixedVisible, openPopupForFeature],
  );

  selectFeatureRef.current = async (id, options) => {
    await selectFeature(id, options);
    await renderMarkers();
  };

  useEffect(() => {
    if (!stageRef.current || mapInstance.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !stageRef.current) return;

      stageRef.current.replaceChildren();
      const wrap = document.createElement("div");
      wrap.className = "area-leaflet-wrap";
      const mapEl = document.createElement("div");
      mapEl.className = "area-leaflet-map";
      wrap.appendChild(mapEl);
      stageRef.current.appendChild(wrap);

      const map = L.map(mapEl, { zoomControl: true, attributionControl: true });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;

      map.getContainer().addEventListener("click", (ev) => {
        const target = ev.target as HTMLElement;
        if (target.closest(".area-map-popup__close")) {
          L.DomEvent.stop(ev);
          closePopup();
        }
      });

      map.on("click", () => closePopup());

      map.on("popupopen", (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        L.DomEvent.disableClickPropagation(popupEl);
        const inner = popupEl.querySelector(".area-map-popup");
        if (inner) L.DomEvent.disableClickPropagation(inner as HTMLElement);
      });

      await fitMapToProfile(false);
      await renderMarkers();
    })();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    void renderMarkers();
  }, [renderMarkers, selectedId, activeLayers, fixedVisible]);

  useEffect(() => {
    void fitMapToProfile(true);
  }, [activeLayers, fixedVisible, fitMapToProfile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closePopup]);

  const allLayersOn = LAYER_KEYS.every((l) => activeLayers.has(l));

  const toggleLayer = (layer: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
    closePopup();
  };

  const setAllLayers = (on: boolean) => {
    setActiveLayers(on ? new Set(LAYER_KEYS) : new Set());
    closePopup();
  };

  const listEyebrow = (feature: AreaFeature) => {
    const district = districtLabel(feature, locale);
    return district || categoryLabel(feature);
  };

  return (
    <div className="area-map-page area-map-page--site">
      <div className="area-shell">
        <div className="area-stage" ref={stageRef} aria-label={pickLocalized(data.name, locale)}>
          <div className="area-map-fixed-toggles" role="group" aria-label={t("fixedToggleGroup")}>
            {Array.from(fixedIds).map((id) => {
              const feature = featureById(id);
              if (!feature) return null;
              const label =
                id === "ski"
                  ? t("fixedSki")
                  : id === "station" || id === "biei-station"
                    ? t("fixedStation")
                    : pickLocalized(feature.shortLabel ?? feature.label, locale);
              return (
                <label key={id} className="area-map-fixed-toggle">
                  <input
                    type="checkbox"
                    checked={fixedVisible[id] !== false}
                    onChange={(e) => {
                      setFixedVisible((prev) => ({ ...prev, [id]: e.target.checked }));
                      if (!e.target.checked && selectedId === id) closePopup();
                    }}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <aside className="area-rail" aria-label={t("railLabel")}>
          <div className="area-rail-head">
            <h1 className="area-rail-title">{t("title")}</h1>
            <p className="area-rail-lead">{t("lead")}</p>
            <div className="area-filter" role="group" aria-label={t("filterLabel")}>
              <button
                type="button"
                className="area-filter-btn area-filter-btn--all"
                aria-pressed={allLayersOn}
                onClick={() => setAllLayers(true)}
              >
                {t("filterAll")}
              </button>
              {(["food", "onsen", "anchor"] as LayerKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="area-filter-btn"
                  aria-pressed={activeLayers.has(key)}
                  onClick={() => toggleLayer(key)}
                >
                  {key === "food" ? t("filterFood") : key === "onsen" ? t("filterOnsen") : t("filterAnchor")}
                </button>
              ))}
              <span className="area-filter-count">{t("spotCount", { n: listFeatures.length })}</span>
            </div>
            <p className="area-filter-hint">{t("filterHint")}</p>
          </div>

          <div className="area-list" role="list">
            {listFeatures.map((feature, i) => {
              const active = selectedId === feature.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  data-feature-id={feature.id}
                  className={`area-list-item${active ? " is-active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => void selectFeatureRef.current(feature.id, { fromList: true })}
                >
                  <span className="area-list-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="area-list-item__body">
                    <span className="area-list-item__eyebrow">{listEyebrow(feature)}</span>
                    <span className="area-list-item__title">
                      {pickLocalized(feature.label, locale)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="area-rail-foot">{pickLocalized(data.disclaimer, locale)}</div>
        </aside>
      </div>
    </div>
  );
}
