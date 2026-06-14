/**
 * Biei area map — food, onsen & anchor POIs (Google Maps embed + list).
 * APIキー不要。リスト選択で該当スポットを Google マップにフォーカス。
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
      mapHint: "リストから選ぶと Google マップでその場所を表示",
      detailPick: "リストからスポットを選んでください",
      openMaps: "Google Mapで開く",
      readGuide: "特集を読む",
      spotCount: "{n}件",
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
      mapHint: "Pick from the list to show the spot in Google Maps",
      detailPick: "Select a spot from the list",
      openMaps: "Open in Google Maps",
      readGuide: "Read guide",
      spotCount: "{n} spots",
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

  function googleMapsUrl(query) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query)
    );
  }

  function googleEmbedUrl({ lat, lon, zoom, query, pin }) {
    const hl = locale === "en" ? "en" : "ja";
    const z = String(zoom);
    if (pin) {
      return `https://maps.google.com/maps?q=${lat},${lon}&hl=${hl}&z=${z}&output=embed`;
    }
    const q = query || `${lat},${lon}`;
    const text = typeof q === "string" ? q : `${lat},${lon}`;
    return (
      "https://maps.google.com/maps?q=" +
      encodeURIComponent(text) +
      `&ll=${lat},${lon}&hl=${hl}&z=${z}&output=embed`
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
  let googleFrame = null;
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
    mapHint: null,
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

  function viewportForLayers() {
    const v = mapData.viewports || {};
    const layers = [...activeLayers];
    if (layers.length === 1 && v[layers[0]]) return v[layers[0]];
    if (activeLayers.has("food") && activeLayers.has("onsen") && !activeLayers.has("anchor") && v.foodOnsen) {
      return v.foodOnsen;
    }
    return v.default || {
      lat: mapData.center?.[0] ?? 43.55,
      lon: mapData.center?.[1] ?? 142.55,
      zoom: mapData.zoom ?? 10,
      query: mapData.name,
    };
  }

  function viewForFeature(feature) {
    return {
      lat: feature.lat,
      lon: feature.lon,
      zoom: feature.zoom || 16,
      pin: true,
    };
  }

  function syncGoogleMap(feature) {
    if (!googleFrame) return;
    const view = feature ? viewForFeature(feature) : viewportForLayers();
    if (feature) {
      googleFrame.src = googleEmbedUrl(view);
      return;
    }
    const query = typeof view.query === "object" ? pick(view.query) : view.query;
    googleFrame.src = googleEmbedUrl({
      lat: view.lat,
      lon: view.lon,
      zoom: view.zoom,
      query: query || `${view.lat},${view.lon}`,
      pin: false,
    });
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

    document.querySelectorAll(".area-list-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.featureId === id);
      if (btn.dataset.featureId === id) btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    syncGoogleMap(feature);
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
      .map((f, i) => {
        return `
          <button type="button" class="area-list-item${selectedId === f.id ? " is-active" : ""}"
            data-feature-id="${f.id}">
            <span class="area-list-item__num">${String(i + 1).padStart(2, "0")}</span>
            <span class="area-list-item__body">
              <span class="area-list-item__eyebrow">${listEyebrow(f)}</span>
              <span class="area-list-item__title">${pick(f.label)}</span>
            </span>
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

  function afterLayerChange() {
    renderFilters();
    renderList();
    syncUrlLayers();

    const stillVisible = selectedId && filteredFeatures().some((f) => f.id === selectedId);
    if (!stillVisible) {
      selectedId = null;
      if (el.detail) el.detail.innerHTML = `<p>${t("detailPick")}</p>`;
      syncGoogleMap(null);
      return;
    }
    syncGoogleMap(allFeatures().find((f) => f.id === selectedId));
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

  function renderFilters() {
    if (!el.filters) return;
    const allOn = activeLayers.size === LAYER_KEYS.length;
    const count = filteredFeatures().length;
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
      <span class="area-filter-count">${t("spotCount", { n: count })}</span>
    `;

    el.filters.querySelector("[data-filter-all]")?.addEventListener("click", () => setAllLayers(true));

    el.filters.querySelectorAll("[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => toggleLayer(btn.dataset.layer));
    });

    if (el.filterHint) el.filterHint.textContent = t("filterHint");
  }

  function initGoogleMap() {
    if (!el.stage) return;

    el.stage.replaceChildren();

    const wrap = document.createElement("div");
    wrap.className = "area-google-wrap";

    googleFrame = document.createElement("iframe");
    googleFrame.className = "area-google-frame";
    googleFrame.title = pick(mapData.name) || t("title");
    googleFrame.loading = "lazy";
    googleFrame.referrerPolicy = "no-referrer-when-downgrade";
    googleFrame.allowFullscreen = true;
    wrap.appendChild(googleFrame);

    if (!embed) {
      const hint = document.createElement("p");
      hint.className = "area-map-hint";
      hint.textContent = t("mapHint");
      wrap.appendChild(hint);
    }

    el.stage.appendChild(wrap);

    if (!embed && mapData.disclaimer) {
      const disclaimer = document.createElement("p");
      disclaimer.className = "area-disclaimer";
      disclaimer.textContent = pick(mapData.disclaimer);
      el.stage.appendChild(disclaimer);
    }

    syncGoogleMap(null);
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
    initGoogleMap();

    const focus = params.get("focus");
    const focusFeature = focus && allFeatures().find((f) => f.id === focus);
    if (focusFeature && activeLayers.has(focusFeature.group)) {
      select(focus);
    }
  }

  if (embed) {
    document.documentElement.classList.add("area-map-embed-root");
    document.body.classList.add("area-map-page--embed");
  }
  boot();
})();
