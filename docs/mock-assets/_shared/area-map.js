/**
 * Biei area map — food, onsen & anchor POIs (OpenStreetMap + public coordinates).
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const params = new URLSearchParams(location.search);
  const resortId = params.get("resort") || "biei";
  const embed = params.get("embed") === "1";
  const locale = params.get("lang") || localStorage.getItem(STORAGE_KEY) || "ja";

  const LAYER_KEYS = ["food", "onsen", "anchor"];

  const UI = {
    ja: {
      backHub: "← 索引",
      backLp: "← LPに戻る",
      title: "周辺マップ",
      lead: "飲食・温泉・拠点を重ねて、雪遊びと青い池の回遊を設計",
      filterAll: "全表示",
      filterFood: "飲食",
      filterOnsen: "温泉",
      filterAnchor: "拠点",
      filterHint: "飲食と温泉は同時表示できます",
      detailPick: "リストから選ぶか、地図のピンをタップ",
      openMaps: "Google Map",
      readGuide: "特集を読む",
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
    },
    en: {
      backHub: "← Index",
      backLp: "← Back to guide",
      title: "Area map",
      lead: "Layer food, onsen, and hubs to plan snow play and Blue Pond loops",
      filterAll: "Show all",
      filterFood: "Food",
      filterOnsen: "Onsen",
      filterAnchor: "Hubs",
      filterHint: "Food and onsen can be shown together",
      detailPick: "Pick from the list or tap a pin",
      openMaps: "Google Maps",
      readGuide: "Read guide",
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
    },
  };

  function t(key) {
    const parts = key.split(".");
    let val = UI[locale] || UI.ja;
    for (const p of parts) val = val?.[p];
    return val ?? key;
  }

  function pick(obj) {
    if (!obj) return "";
    return obj[locale] || obj.ja || obj.en || "";
  }

  function googleMapsUrl(query) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query)
    );
  }

  function parseLayers() {
    const raw = params.get("layers");
    if (!raw) return new Set(LAYER_KEYS);
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const valid = parts.filter((p) => LAYER_KEYS.includes(p));
    return valid.length ? new Set(valid) : new Set(LAYER_KEYS);
  }

  let mapData = null;
  let map = null;
  let markers = new Map();
  let selectedId = null;
  let activeLayers = parseLayers();

  const el = {
    stage: document.getElementById("area-stage"),
    list: document.getElementById("area-list"),
    detail: document.getElementById("area-detail"),
    title: document.getElementById("area-rail-title"),
    lead: document.getElementById("area-rail-lead"),
    resortName: document.getElementById("area-resort-name"),
    backLink: document.getElementById("area-back-link"),
    hubLink: document.getElementById("area-hub-link"),
    filters: document.getElementById("area-filters"),
    filterHint: document.getElementById("area-filter-hint"),
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

  function markerHtml(feature) {
    const cat = feature.category || "anchor";
    const cls =
      feature.group === "anchor"
        ? "area-marker-dot area-marker-dot--anchor"
        : `area-marker-dot area-marker-dot--${cat}`;
    return `<span class="${cls}" aria-hidden="true"></span>`;
  }

  function guideHref(feature) {
    const langQ = locale === "en" ? "?lang=en" : "";
    if (feature.group === "onsen") {
      return `${resortId}-lp/nearby-onsen.html#spot-${feature.id}${langQ}`;
    }
    if (feature.group === "food") {
      return `${resortId}-lp/nearby-food.html#spot-${feature.id}${langQ}`;
    }
    if (feature.id === "blue-pond") return `${resortId}-lp/blue-pond.html${langQ}`;
    if (feature.id === "ski") return `${resortId}-lp/snow-play.html${langQ}`;
    return `${resortId}-lp/${langQ}`;
  }

  function select(id) {
    selectedId = id;
    const feature = allFeatures().find((f) => f.id === id);
    if (!feature) return;

    markers.forEach((marker, mid) => {
      const node = marker.getElement();
      if (node) node.style.opacity = mid === id ? "1" : "0.72";
    });

    document.querySelectorAll(".area-list-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.featureId === id);
    });

    if (map) {
      map.panTo([feature.lat, feature.lon], { animate: true, duration: 0.35 });
      const marker = markers.get(id);
      if (marker) marker.openPopup();
    }

    renderDetail(feature);
  }

  function renderDetail(feature) {
    if (!el.detail) return;
    const catLabel = t(`category.${feature.category}`) || feature.category;
    const region = feature.region ? pick(feature.region) : "";
    const mapsQ = feature.mapsQuery || pick(feature.label);

    el.detail.innerHTML = `
      <h2 class="area-detail__title">${pick(feature.label)}</h2>
      <p class="area-detail__meta">${[region, catLabel, feature.source].filter(Boolean).join(" · ")}</p>
      <div class="area-detail__actions">
        <a href="${googleMapsUrl(mapsQ)}" target="_blank" rel="noopener noreferrer">${t("openMaps")} ↗</a>
        ${
          feature.group === "food" || feature.group === "onsen"
            ? `<a href="${guideHref(feature)}" class="area-link-ghost">${t("readGuide")}</a>`
            : ""
        }
      </div>
    `;
  }

  function listEyebrow(feature) {
    if (feature.region) return pick(feature.region);
    return t(`category.${feature.category}`) || feature.category;
  }

  function renderList() {
    if (!el.list) return;
    const items = filteredFeatures();
    el.list.innerHTML = items
      .map((f) => {
        return `
          <button type="button" class="area-list-item${selectedId === f.id ? " is-active" : ""}"
            data-feature-id="${f.id}">
            <span class="area-list-item__eyebrow">${listEyebrow(f)}</span>
            <span class="area-list-item__title">${pick(f.label)}</span>
          </button>`;
      })
      .join("");

    el.list.querySelectorAll("[data-feature-id]").forEach((btn) => {
      btn.addEventListener("click", () => select(btn.dataset.featureId));
    });
  }

  function layersQuery() {
    return [...activeLayers].join(",");
  }

  function syncUrlLayers() {
    if (embed && window.parent !== window) return;
    const u = new URL(location.href);
    if (activeLayers.size === LAYER_KEYS.length) u.searchParams.delete("layers");
    else u.searchParams.set("layers", layersQuery());
    window.history.replaceState({}, "", u);
  }

  function setAllLayers(on) {
    activeLayers = on ? new Set(LAYER_KEYS) : new Set();
    renderFilters();
    renderList();
    syncMarkerVisibility();
    syncUrlLayers();
    if (selectedId && !filteredFeatures().some((f) => f.id === selectedId)) {
      selectedId = null;
      if (el.detail) el.detail.innerHTML = `<p>${t("detailPick")}</p>`;
    }
  }

  function toggleLayer(layer) {
    if (activeLayers.has(layer)) activeLayers.delete(layer);
    else activeLayers.add(layer);
    renderFilters();
    renderList();
    syncMarkerVisibility();
    syncUrlLayers();
    if (selectedId && !filteredFeatures().some((f) => f.id === selectedId)) {
      selectedId = null;
      if (el.detail) el.detail.innerHTML = `<p>${t("detailPick")}</p>`;
    }
  }

  function renderFilters() {
    if (!el.filters) return;
    const allOn = activeLayers.size === LAYER_KEYS.length;
    const toggles = [
      ["food", t("filterFood")],
      ["onsen", t("filterOnsen")],
      ["anchor", t("filterAnchor")],
    ];
    el.filters.innerHTML = `
      <button type="button" class="area-filter-btn area-filter-btn--all" data-filter-all aria-pressed="${allOn}">
        ${t("filterAll")}
      </button>
      ${toggles
        .map(
          ([id, label]) =>
            `<button type="button" class="area-filter-btn" data-layer="${id}" aria-pressed="${activeLayers.has(id)}">${label}</button>`,
        )
        .join("")}
    `;

    el.filters.querySelector("[data-filter-all]")?.addEventListener("click", () => setAllLayers(true));

    el.filters.querySelectorAll("[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => toggleLayer(btn.dataset.layer));
    });

    if (el.filterHint) el.filterHint.textContent = t("filterHint");
  }

  function syncMarkerVisibility() {
    const visible = new Set(filteredFeatures().map((f) => f.id));
    markers.forEach((marker, id) => {
      if (visible.has(id)) marker.addTo(map);
      else map.removeLayer(marker);
    });
  }

  function initMap() {
    if (!window.L || !el.stage) return;

    const leafletRoot = document.createElement("div");
    leafletRoot.className = "area-leaflet";
    leafletRoot.id = "area-leaflet-root";
    el.stage.replaceChildren(leafletRoot);

    const disclaimer = document.createElement("p");
    disclaimer.className = "area-disclaimer";
    disclaimer.textContent = pick(mapData.disclaimer);
    el.stage.appendChild(disclaimer);

    map = L.map(leafletRoot, {
      zoomControl: !embed,
      attributionControl: true,
    }).setView(mapData.center || [43.52, 142.52], mapData.zoom || 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    allFeatures().forEach((feature) => {
      const icon = L.divIcon({
        className: "area-marker-wrap",
        html: markerHtml(feature),
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([feature.lat, feature.lon], { icon });
      const mapsQ = feature.mapsQuery || pick(feature.label);
      marker.bindPopup(`
        <p class="area-popup-title">${pick(feature.label)}</p>
        <a class="area-popup-link" href="${googleMapsUrl(mapsQ)}" target="_blank" rel="noopener noreferrer">${t("openMaps")} ↗</a>
      `);
      marker.on("click", () => select(feature.id));
      markers.set(feature.id, marker);
    });

    syncMarkerVisibility();

    const visible = filteredFeatures();
    if (visible.length) {
      const bounds = L.latLngBounds(visible.map((f) => [f.lat, f.lon]));
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.12), { animate: false });
    }

    const focus = params.get("focus");
    if (focus && markers.has(focus) && activeLayers.has(allFeatures().find((f) => f.id === focus)?.group)) {
      select(focus);
    }
  }

  function bindChrome() {
    if (el.title) el.title.textContent = t("title");
    if (el.lead) el.lead.textContent = t("lead");
    if (el.resortName) el.resortName.textContent = pick(mapData.name);

    const lpBack = `${resortId}-lp/${locale === "en" ? "?lang=en" : ""}`;
    if (el.backLink) {
      el.backLink.href = lpBack;
      el.backLink.textContent = t("backLp");
    }
    if (el.hubLink) {
      el.hubLink.href = `index.html${locale === "en" ? "?lang=en" : ""}`;
      el.hubLink.textContent = t("backHub");
    }

    if (el.detail && !selectedId) {
      el.detail.innerHTML = `<p>${t("detailPick")}</p>`;
    }
  }

  async function boot() {
    if (location.protocol === "file:") {
      if (el.stage) el.stage.innerHTML = `<p class="map-error">${t("needHttp")}</p>`;
      return;
    }

    try {
      const res = await fetch(`data/maps/${resortId}-area.json`);
      if (!res.ok) throw new Error(res.statusText);
      mapData = await res.json();
    } catch {
      if (el.stage) el.stage.innerHTML = `<p class="map-error">${t("loadError")}</p>`;
      return;
    }

    bindChrome();
    renderFilters();
    renderList();
    initMap();
  }

  if (embed) document.body.classList.add("area-map-page--embed");
  boot();
})();
