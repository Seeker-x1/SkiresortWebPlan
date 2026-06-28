/**
 * Biei area map — Leaflet POI map v2 (fitBounds overview + Mapular pins + map popup).
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const FALLBACK_CENTER = [43.5897, 142.4449];
  const FALLBACK_ZOOM = 12;
  const ICON_BASE = "_shared/icons/";

  const params = new URLSearchParams(location.search);
  const resortId = params.get("resort") || "biei";
  const embed = params.get("embed") === "1";
  const locale = params.get("lang") || localStorage.getItem(STORAGE_KEY) || "ja";

  const LAYER_KEYS = ["food", "onsen", "anchor"];
  const DEFAULT_LAYERS = ["food", "anchor"];
  const FIXED_ANCHOR_IDS = new Set(["ski", "biei-station"]);

  const UI = {
    ja: {
      backTop: "← トップに戻る",
      title: "周辺マップ",
      lead: "町民スキー場を起点に、周辺の飲食・温泉・拠点を重ねて回遊を設計",
      filterAll: "全表示",
      filterFood: "飲食",
      filterOnsen: "温泉",
      filterAnchor: "拠点",
      filterLabel: "レイヤーフィルタ",
      filterHint:
        "表示中のスポットがすべて地図に収まります。温泉のみのときは白金方面に切り替わります",
      mapHint: "ピンをタップすると地図上に詳細が表示されます",
      spotCount: "{n}件",
      popup: {
        close: "ポップアップを閉じる",
        viewMap: "Google マップで開く →",
        viewMapAria: "{name}を Google マップで開く",
        readGuide: "特集を読む",
        readGuideAria: "{name}の特集記事を読む",
        website: "公式サイト",
        phoneAria: "電話 {phone} に発信",
        hubBadge: "拠点",
      },
      fixedToggleGroup: "地図の表示",
      fixedSki: "スキー場",
      fixedStation: "駅",
      category: {
        anchor: "拠点",
        dairy: "乳製品",
        wagyu: "和牛",
        bakery: "パン・菓子",
        western: "洋食",
        burger: "バーガー",
        cafe: "カフェ",
        "fine-dining": "フレンチ",
        ramen: "ラーメン",
        "onsen-hotel": "温泉ホテル",
        "onsen-day": "日帰り温泉",
        "onsen-ryokan": "高級旅館",
        "onsen-public": "公衆浴場",
        "onsen-mountain": "山の温泉",
        "onsen-sauna": "サウナ",
        "onsen-roten": "野湯・露天",
        ski: "スキー場",
        transit: "駅",
        view: "絶景",
      },
      loadError: "マップデータを読み込めませんでした。",
      needHttp:
        "file:// では動きません。npx serve docs/mock-assets -p 3456 を実行してください。",
      leafletError: "地図ライブラリを読み込めませんでした。",
      embedListFab: "スポット一覧",
      embedListFabClose: "一覧を閉じる",
      railLabel: "周辺スポット",
    },
    en: {
      backTop: "← Back to top",
      title: "Area map",
      lead: "Layer food, onsen, and hubs around Biei Town Ski Area",
      filterAll: "Show all",
      filterFood: "Food",
      filterOnsen: "Onsen",
      filterAnchor: "Hubs",
      filterLabel: "Layer filters",
      filterHint:
        "All visible spots fit on the map. Onsen-only snaps to Shirogane area",
      mapHint: "Tap a pin to see details on the map",
      spotCount: "{n} spots",
      popup: {
        close: "Close popup",
        viewMap: "Open in Google Maps →",
        viewMapAria: "Open {name} in Google Maps",
        readGuide: "Read guide",
        readGuideAria: "Read the guide for {name}",
        website: "Official site",
        phoneAria: "Call {phone}",
        hubBadge: "Hub",
      },
      fixedToggleGroup: "Map overlays",
      fixedSki: "Ski area",
      fixedStation: "Station",
      category: {
        anchor: "Hub",
        dairy: "Dairy",
        wagyu: "Wagyu",
        bakery: "Bakery",
        western: "Western",
        burger: "Burger",
        cafe: "Café",
        "fine-dining": "French",
        ramen: "Ramen",
        "onsen-hotel": "Onsen hotel",
        "onsen-day": "Day bath",
        "onsen-ryokan": "Ryokan",
        "onsen-public": "Public bath",
        "onsen-mountain": "Mountain onsen",
        "onsen-sauna": "Sauna",
        "onsen-roten": "Wild roten",
        ski: "Ski area",
        transit: "Station",
        view: "View",
      },
      loadError: "Could not load map data.",
      needHttp: "Run npx serve docs/mock-assets -p 3456 (file:// will not work).",
      leafletError: "Could not load the map library.",
      embedListFab: "Spot list",
      embedListFabClose: "Close list",
      railLabel: "Nearby spots",
    },
  };

  function t(key, vars) {
    const parts = key.split(".");
    let val = UI[locale] || UI.ja;
    for (const p of parts) val = val?.[p];
    let out = val ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replace(`{${k}}`, String(v));
      }
    }
    return out;
  }

  function pick(obj) {
    if (!obj) return "";
    return obj[locale] || obj.ja || obj.en || "";
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function googleMapsUrl(query) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query)
    );
  }

  function parseLayers() {
    const raw = params.get("layers");
    if (!raw) return new Set(DEFAULT_LAYERS);
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const valid = parts.filter((p) => LAYER_KEYS.includes(p));
    return valid.length ? new Set(valid) : new Set(DEFAULT_LAYERS);
  }

  function featureById(id) {
    return allFeatures().find((f) => f.id === id);
  }

  let mapData = null;
  let markerManifest = null;
  let leafletMap = null;
  let markerLayer = null;
  const markerById = new Map();
  let selectedId = null;
  let activeLayers = parseLayers();
  let skipNextMoveEnd = false;
  let embedRailOpen = false;
  let embedMobileMq = null;
  let fixedAnchorVisible = { ski: true, "biei-station": true };

  const el = {
    shell: document.querySelector(".area-shell"),
    stage: document.getElementById("area-stage"),
    list: document.getElementById("area-list"),
    rail: document.querySelector(".area-rail"),
    embedListFab: null,
    title: document.getElementById("area-rail-title"),
    lead: document.getElementById("area-rail-lead"),
    resortName: document.getElementById("area-resort-name"),
    topLink: document.getElementById("area-top-link"),
    filters: document.getElementById("area-filters"),
    filterHint: document.getElementById("area-filter-hint"),
    disclaimer: document.getElementById("area-disclaimer"),
  };

  function allFeatures() {
    const anchors = (mapData.anchors || []).map((f) => ({ ...f, group: "anchor" }));
    const food = (mapData.food || mapData.pois || []).map((f) => ({
      ...f,
      group: f.group || "food",
    }));
    const onsen = (mapData.onsen || []).map((f) => ({ ...f, group: "onsen" }));
    return [...anchors, ...food, ...onsen];
  }

  function filteredFeatures() {
    return allFeatures().filter((f) => activeLayers.has(f.group));
  }

  function isFixedAnchor(id) {
    return FIXED_ANCHOR_IDS.has(id);
  }

  function isFixedAnchorVisible(id) {
    if (embed) return true;
    return fixedAnchorVisible[id] !== false;
  }

  function isFeatureOnMap(feature) {
    if (!feature) return false;
    if (activeLayers.has(feature.group)) return true;
    return isFixedAnchor(feature.id) && isFixedAnchorVisible(feature.id);
  }

  function markersForRender() {
    const visible = filteredFeatures();
    const ids = new Set(visible.map((f) => f.id));
    for (const id of FIXED_ANCHOR_IDS) {
      if (!isFixedAnchorVisible(id) || ids.has(id)) continue;
      const f = featureById(id);
      if (f) visible.push(f);
    }
    return visible;
  }

  function appendVisibleFixedAnchors(feats) {
    const result = [...feats];
    const ids = new Set(result.map((f) => f.id));
    for (const id of FIXED_ANCHOR_IDS) {
      if (!isFixedAnchorVisible(id) || ids.has(id)) continue;
      const f = featureById(id);
      if (f) result.push(f);
    }
    return result;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function syncDocumentLang() {
    document.documentElement.lang = locale === "en" ? "en" : "ja";
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      const on = btn.dataset.langSwitch === locale;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function scrollBehavior() {
    return prefersReducedMotion() ? "auto" : "smooth";
  }

  function popupOffset() {
    return embed && embedMobileMq?.matches ? [0, -52] : [0, -12];
  }

  function popupAutoPanPadding() {
    if (isEmbedMobile()) return [56, 56];
    if (embed) return [48, 48];
    return [32, 32];
  }

  function markerKeyFor(feature) {
    if (!markerManifest) return feature.group === "food" ? "food" : feature.group;
    const mapping = markerManifest.bieiAreaMapping || {};
    if (feature.group === "food") return mapping.food || "food";
    if (feature.group === "onsen") return mapping.onsen || "onsen";
    return mapping[`anchor.${feature.id}`] || "food";
  }

  function iconPath(key, size) {
    const files = markerManifest?.markers?.[key]?.files;
    const file = files?.[size] || files?.["32"];
    return file ? `${ICON_BASE}${file}` : null;
  }

  function markerSize(feature, active) {
    if (active) return 48;
    if (feature.id === "ski") return 40;
    return 32;
  }

  function makeIcon(feature, active) {
    const size = markerSize(feature, active);
    const key = markerKeyFor(feature);
    const assetSize = size >= 48 || (feature.id === "ski" && !active) ? "48" : "32";
    const url = iconPath(key, assetSize);
    if (!url || !window.L) return null;

    if (isEmbedMobile()) {
      const hitSize = active ? 52 : 48;
      const activeClass = active ? " area-pin--active" : "";
      const html = `<span class="area-pin-hit" aria-hidden="true"><img class="area-pin-img${activeClass}" src="${esc(url)}" width="${size}" height="${size}" alt="" draggable="false" /></span>`;
      return window.L.divIcon({
        html,
        className: `area-pin area-pin--touch${active ? " area-pin--active" : ""}`,
        iconSize: [hitSize, hitSize],
        iconAnchor: [hitSize / 2, hitSize / 2],
      });
    }

    return window.L.icon({
      iconUrl: url,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: active ? "area-pin area-pin--active" : "area-pin",
    });
  }

  function resolveBoundsProfile() {
    const hasFood = activeLayers.has("food");
    const hasOnsen = activeLayers.has("onsen");
    const hasAnchor = activeLayers.has("anchor");
    if (hasFood && hasOnsen) return "foodOnsen";
    if (hasOnsen && !hasFood && !hasAnchor) return "onsen";
    if (hasOnsen && !hasFood && hasAnchor) return "onsenAnchor";
    if (hasAnchor && !hasFood && !hasOnsen) return "anchorAll";
    return "skiFood";
  }

  function isEmbedMobile() {
    return embed && embedMobileMq?.matches;
  }

  function setEmbedRailOpen(open) {
    if (!embed) return;
    embedRailOpen = open;
    document.body.classList.toggle("area-embed-rail-open", open);
    if (el.embedListFab) {
      el.embedListFab.setAttribute("aria-expanded", open ? "true" : "false");
      el.embedListFab.textContent = open ? t("embedListFabClose") : t("embedListFab");
    }
    requestAnimationFrame(() => leafletMap?.invalidateSize());
  }

  function initEmbedMobileRail() {
    if (!embed || !el.stage) return;

    embedMobileMq = window.matchMedia("(max-width: 768px)");

    function syncFab() {
      if (!embedMobileMq.matches) {
        setEmbedRailOpen(false);
        el.embedListFab?.remove();
        el.embedListFab = null;
        return;
      }
      if (el.embedListFab) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "area-embed-list-fab";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "area-list");
      btn.textContent = t("embedListFab");
      btn.addEventListener("click", () => setEmbedRailOpen(!embedRailOpen));
      el.stage.appendChild(btn);
      el.embedListFab = btn;
    }

    embedMobileMq.addEventListener("change", () => {
      syncFab();
      if (leafletMap) {
        const refocus = selectedId ? featureById(selectedId) : null;
        renderMarkers();
        if (refocus) openPopupForFeature(refocus);
      }
    });
    syncFab();
  }

  function initFixedAnchorToggles() {
    if (embed || !el.stage) return;

    el.stage.querySelector(".area-map-fixed-toggles")?.remove();

    const bar = document.createElement("div");
    bar.className = "area-map-fixed-toggles";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", t("fixedToggleGroup"));

    for (const id of FIXED_ANCHOR_IDS) {
      if (!featureById(id)) continue;
      const label = document.createElement("label");
      label.className = "area-map-fixed-toggle";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.fixedAnchor = id;
      input.checked = isFixedAnchorVisible(id);

      const span = document.createElement("span");
      span.textContent = id === "ski" ? t("fixedSki") : t("fixedStation");

      input.addEventListener("change", () => {
        fixedAnchorVisible[id] = input.checked;
        if (!input.checked && selectedId === id) closePopup();
        renderMarkers();
        fitMapToProfile(true);
      });

      label.append(input, span);
      bar.appendChild(label);
    }

    el.stage.appendChild(bar);
  }

  function featuresForBounds(profile, ensureIds = []) {
    const cfg = mapData.boundsProfiles?.[profile];
    const visible = filteredFeatures();
    const ensureSet = new Set(ensureIds);

    function passesFilter(f) {
      if (!cfg) return true;
      if (cfg.includeGroups && !cfg.includeGroups.includes(f.group)) return false;
      if (
        cfg.excludeFoodIds &&
        f.group === "food" &&
        cfg.excludeFoodIds.includes(f.id) &&
        !ensureSet.has(f.id)
      ) {
        return false;
      }
      if (cfg.excludeAnchorIds && f.group === "anchor" && cfg.excludeAnchorIds.includes(f.id)) {
        return false;
      }
      if (cfg.includeAnchorIds && f.group === "anchor" && !cfg.includeAnchorIds.includes(f.id)) {
        return false;
      }
      return true;
    }

    const result = visible.filter(passesFilter);
    for (const id of ensureIds) {
      if (result.some((f) => f.id === id)) continue;
      const extra = visible.find((f) => f.id === id);
      if (extra) result.push(extra);
    }
    return result;
  }

  function fitMapToProfile(animate, ensureIds = []) {
    if (!leafletMap) return;
    const profile = resolveBoundsProfile();
    const feats = appendVisibleFixedAnchors(featuresForBounds(profile, ensureIds));
    const cfg = mapData.boundsProfiles?.[profile] || {};
    const anim = !!animate && !prefersReducedMotion();

    if (!feats.length) {
      skipNextMoveEnd = true;
      leafletMap.setView(FALLBACK_CENTER, FALLBACK_ZOOM, { animate: anim });
      return;
    }

    const bounds = window.L.latLngBounds(feats.map((f) => [f.lat, f.lon]));
    const pad = embed ? [32, 32] : [48, 48];
    skipNextMoveEnd = true;
    leafletMap.fitBounds(bounds, {
      padding: pad,
      maxZoom: cfg.maxZoom ?? 13,
      animate: anim,
    });
  }

  function districtLabel(feature) {
    const d = pick(feature.district);
    if (d) return d;
    return pick(feature.region);
  }

  function categoryLabel(feature) {
    return t(`category.${feature.category}`) || feature.category;
  }

  function guideHref(feature) {
    const langQ = locale === "en" ? "?lang=en" : "";
    if (feature.group === "onsen") {
      return `${resortId}-lp/nearby-onsen.html#entry-${feature.id}${langQ}`;
    }
    if (feature.group === "food") {
      return `${resortId}-lp/nearby-food.html#entry-${feature.id}${langQ}`;
    }
    if (feature.id === "blue-pond") return `${resortId}-lp/blue-pond.html${langQ}`;
    if (feature.id === "ski") return `${resortId}-lp/snow-play.html${langQ}`;
    return `${resortId}-lp/${langQ}`;
  }

  function buildPopupHtml(feature) {
    const name = pick(feature.label);
    const cat = categoryLabel(feature);
    const district = districtLabel(feature);
    const mapsQ = feature.mapsQuery || name;
    const mapsUrl = googleMapsUrl(mapsQ);

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

    if (feature.group === "food" || feature.group === "onsen") {
      html += `<a class="area-map-popup__guide" href="${esc(guideHref(feature))}" aria-label="${esc(t("popup.readGuideAria", { name }))}">${esc(t("popup.readGuide"))}</a>`;
    }

    html += `</div>`;
    return html;
  }

  function syncMarkerStyles() {
    markerById.forEach((marker, id) => {
      const feature = featureById(id);
      if (!feature || !isFeatureOnMap(feature)) return;
      const active = id === selectedId;
      const icon = makeIcon(feature, active);
      if (icon) marker.setIcon(icon);
      marker.setZIndexOffset(active ? 1000 : feature.id === "ski" ? 500 : 0);
    });
  }

  function syncListActive() {
    document.querySelectorAll(".area-list-item").forEach((btn) => {
      const on = btn.dataset.featureId === selectedId;
      btn.classList.toggle("is-active", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  function closePopup() {
    if (selectedId) {
      markerById.get(selectedId)?.closePopup();
    }
    selectedId = null;
    syncMarkerStyles();
    syncListActive();
    notifyParentFocus(null);
  }

  function openPopupForFeature(feature) {
    const marker = markerById.get(feature.id);
    if (!marker) return;
    marker.setPopupContent(buildPopupHtml(feature));
    marker.openPopup();
  }

  function renderMarkers() {
    if (!leafletMap || !markerLayer) return;
    markerLayer.clearLayers();
    markerById.clear();

    const visible = markersForRender();
    for (const f of visible) {
      const icon = makeIcon(f, f.id === selectedId);
      if (!icon) continue;
      const marker = window.L.marker([f.lat, f.lon], {
        icon,
        title: pick(f.shortLabel) || pick(f.label),
      });

      marker.bindPopup(() => buildPopupHtml(f), {
        className: "area-leaflet-popup",
        maxWidth: 300,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: popupAutoPanPadding(),
        offset: popupOffset(),
        closeButton: false,
      });

      marker.on("click", (e) => {
        window.L.DomEvent.stopPropagation(e);
        select(f.id);
      });

      marker.on("popupclose", () => {
        if (selectedId === f.id) {
          selectedId = null;
          syncMarkerStyles();
          syncListActive();
        }
      });

      marker.addTo(markerLayer);
      markerById.set(f.id, marker);
    }
    syncMarkerStyles();
  }

  function select(id, options = {}) {
    const { fromList = false } = options;
    const feature = featureById(id);
    if (!feature || !isFeatureOnMap(feature)) return;

    const marker = markerById.get(id);
    if (selectedId === id && marker?.isPopupOpen?.()) {
      notifyParentFocus(id);
      return;
    }

    if (selectedId && selectedId !== id) {
      markerById.get(selectedId)?.closePopup();
    }

    selectedId = id;
    syncMarkerStyles();
    syncListActive();

    if (fromList) {
      document.querySelectorAll(".area-list-item").forEach((btn) => {
        if (btn.dataset.featureId === id) {
          btn.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
        }
      });
    }

    fitMapToProfile(true, [id]);
    openPopupForFeature(feature);
    notifyParentFocus(id);
    if (isEmbedMobile() && fromList) setEmbedRailOpen(false);
  }

  function notifyParentFocus(id) {
    if (!embed || window.parent === window) return;
    window.parent.postMessage(
      { source: "area-map", type: "focus", id: id || null },
      location.origin,
    );
  }

  function listEyebrow(feature) {
    const district = districtLabel(feature);
    if (district) return district;
    return categoryLabel(feature);
  }

  function listTitle(feature) {
    if (embed) return pick(feature.shortLabel) || pick(feature.label);
    return pick(feature.label);
  }

  function sortForList(items) {
    return items.filter((f) => !FIXED_ANCHOR_IDS.has(f.id));
  }

  function renderList() {
    if (!el.list) return;
    const items = sortForList(filteredFeatures());
    el.list.innerHTML = items
      .map((f, i) => {
        const active = selectedId === f.id;
        return `
          <button type="button" class="area-list-item${active ? " is-active" : ""}"
            data-feature-id="${f.id}" role="listitem"${active ? ' aria-current="true"' : ""}>
            <span class="area-list-item__num">${String(i + 1).padStart(2, "0")}</span>
            <span class="area-list-item__body">
              <span class="area-list-item__eyebrow">${esc(listEyebrow(f))}</span>
              <span class="area-list-item__title">${esc(listTitle(f))}</span>
            </span>
          </button>`;
      })
      .join("");

    el.list.querySelectorAll("[data-feature-id]").forEach((btn) => {
      btn.addEventListener("click", () => select(btn.dataset.featureId, { fromList: true }));
    });
  }

  function layersQuery() {
    return [...activeLayers].join(",");
  }

  function syncUrlLayers() {
    if (embed && window.parent !== window) return;
    const u = new URL(location.href);
    const isDefault =
      DEFAULT_LAYERS.every((l) => activeLayers.has(l)) &&
      activeLayers.size === DEFAULT_LAYERS.length;
    if (isDefault) u.searchParams.delete("layers");
    else u.searchParams.set("layers", layersQuery());
    window.history.replaceState({}, "", u);
  }

  function afterLayerChange() {
    closePopup();
    if (!embed) renderFilters();
    renderList();
    syncUrlLayers();
    renderMarkers();
    fitMapToProfile(true);
  }

  function setAllLayers(on) {
    activeLayers = on ? new Set(LAYER_KEYS) : new Set();
    afterLayerChange();
  }

  function toggleLayer(layer) {
    if (activeLayers.has(layer)) activeLayers.delete(layer);
    else activeLayers.add(layer);
    afterLayerChange();
  }

  function renderFilters(target) {
    const node = target || el.filters;
    if (!node) return;
    const allOn = activeLayers.size === LAYER_KEYS.length;
    const count = sortForList(filteredFeatures()).length;
    const toggles = [
      ["food", t("filterFood")],
      ["onsen", t("filterOnsen")],
      ["anchor", t("filterAnchor")],
    ];
    node.innerHTML = `
      <button type="button" class="area-filter-btn area-filter-btn--all" data-filter-all aria-pressed="${allOn}">
        ${t("filterAll")}
      </button>
      ${toggles
        .map(
          ([id, label]) =>
            `<button type="button" class="area-filter-btn" data-layer="${id}" aria-pressed="${activeLayers.has(id)}">${label}</button>`,
        )
        .join("")}
      <span class="area-filter-count">${t("spotCount", { n: count })}</span>
    `;

    node.querySelector("[data-filter-all]")?.addEventListener("click", () => setAllLayers(true));

    node.querySelectorAll("[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => toggleLayer(btn.dataset.layer));
    });

    if (!target && el.filterHint && !embed) el.filterHint.textContent = t("filterHint");
    node.setAttribute("aria-label", t("filterLabel"));
  }

  function initLeafletMap() {
    if (!el.stage || !window.L) return;

    el.stage.replaceChildren();

    const wrap = document.createElement("div");
    wrap.className = "area-leaflet-wrap";

    const mapEl = document.createElement("div");
    mapEl.className = "area-leaflet-map";
    mapEl.id = "area-leaflet-map";
    wrap.appendChild(mapEl);

    el.stage.appendChild(wrap);

    if (!embed && mapData.disclaimer && el.rail) {
      let foot = el.rail.querySelector(".area-rail-foot");
      if (!foot) {
        foot = document.createElement("div");
        foot.className = "area-rail-foot";
        el.rail.appendChild(foot);
      }
      foot.textContent = pick(mapData.disclaimer);
    }

    leafletMap = window.L.map(mapEl, {
      zoomControl: !embed,
      attributionControl: !embed,
    });

    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: embed
        ? ""
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(leafletMap);

    markerLayer = window.L.layerGroup().addTo(leafletMap);

    leafletMap.getContainer().addEventListener("click", (ev) => {
      const closeBtn = ev.target.closest(".area-map-popup__close");
      if (!closeBtn || !window.L) return;
      window.L.DomEvent.stop(ev);
      closePopup();
    });

    leafletMap.on("click", () => closePopup());

    leafletMap.on("popupopen", (e) => {
      const popupEl = e.popup.getElement();
      if (!popupEl || !window.L) return;
      window.L.DomEvent.disableClickPropagation(popupEl);
      const inner = popupEl.querySelector(".area-map-popup");
      if (inner) window.L.DomEvent.disableClickPropagation(inner);
    });

    leafletMap.on("moveend", () => {
      if (skipNextMoveEnd) {
        skipNextMoveEnd = false;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopup();
    });

    renderMarkers();
    fitMapToProfile(false);
    requestAnimationFrame(() => {
      leafletMap.invalidateSize();
      setTimeout(() => leafletMap?.invalidateSize(), 120);
    });

    if (!embed) {
      initFixedAnchorToggles();
    } else {
      el.embedListFab = null;
      initEmbedMobileRail();
    }
  }

  function applyLayersFromParent(layers) {
    const next = new Set(layers.filter((l) => LAYER_KEYS.includes(l)));
    if (!next.size) return;
    const same =
      next.size === activeLayers.size && [...next].every((l) => activeLayers.has(l));
    if (same) return;
    activeLayers = next;
    afterLayerChange();
  }

  function initEmbedMessaging() {
    if (!embed) return;

    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin) return;
      const data = e.data;
      if (!data || data.source !== "map-embed-layers") return;
      if (Array.isArray(data.layers)) applyLayersFromParent(data.layers);
      if ("focus" in data) {
        if (data.focus) {
          const feature = featureById(data.focus);
          if (feature && isFeatureOnMap(feature)) {
            select(data.focus);
          }
        } else {
          closePopup();
        }
      }
    });

    window.parent.postMessage({ source: "area-map", type: "ready" }, location.origin);
  }

  function bindChrome() {
    if (el.title) el.title.textContent = t("title");
    if (el.lead) el.lead.textContent = t("lead");
    if (el.resortName) el.resortName.textContent = pick(mapData.name);

    const lpTop = `${resortId}-lp/${locale === "en" ? "?lang=en" : ""}`;
    if (el.topLink) {
      el.topLink.href = lpTop;
      el.topLink.textContent = t("backTop");
    }
    if (el.rail) el.rail.setAttribute("aria-label", t("railLabel"));
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function boot() {
    if (location.protocol === "file:") {
      if (el.stage) el.stage.innerHTML = `<p class="map-error">${t("needHttp")}</p>`;
      return;
    }

    try {
      const [areaRes, iconRes] = await Promise.all([
        fetch(`data/maps/${resortId}-area.json`),
        fetch(`${ICON_BASE}marker-icons.json`),
      ]);
      if (!areaRes.ok) throw new Error(areaRes.statusText);
      mapData = await areaRes.json();
      if (iconRes.ok) markerManifest = await iconRes.json();
    } catch {
      if (el.stage) el.stage.innerHTML = `<p class="map-error">${t("loadError")}</p>`;
      return;
    }

    if (!window.L) {
      try {
        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
      } catch {
        if (el.stage) el.stage.innerHTML = `<p class="map-error">${t("leafletError")}</p>`;
        return;
      }
    }

    bindChrome();
    syncDocumentLang();
    if (!embed) renderFilters();
    renderList();
    initLeafletMap();
    initEmbedMessaging();

    const focus = params.get("focus");
    const focusFeature = focus && featureById(focus);
    if (focusFeature && isFeatureOnMap(focusFeature)) {
      requestAnimationFrame(() => {
        select(focus);
        leafletMap?.invalidateSize();
      });
    }
  }

  if (embed) {
    document.documentElement.classList.add("area-map-embed-root");
    document.body.classList.add("area-map-page--embed");
  }
  boot();
})();
