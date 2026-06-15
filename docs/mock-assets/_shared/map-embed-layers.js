/**
 * Layer toggles + spot focus for embedded area-map iframes on LP detail pages.
 * Uses postMessage after first load to avoid iframe reload + page scroll jumps.
 */
(function () {
  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function spotIdFromHash() {
    const m = location.hash.match(/^#spot-(.+)$/);
    return m ? m[1] : null;
  }

  function buildMapSrc(layers, focus) {
    const u = new URL("/area-map.html", location.href);
    u.searchParams.set("resort", "biei");
    u.searchParams.set("embed", "1");
    u.searchParams.set("layers", layers.join(","));
    if (focus) u.searchParams.set("focus", focus);
    if (lang() === "en") u.searchParams.set("lang", "en");
    return u.pathname + u.search;
  }

  function initMapEmbed(root) {
    const iframe = root.querySelector(".map-embed iframe");
    const toggles = root.querySelectorAll("[data-map-layer]");
    if (!iframe || !toggles.length) return;

    let active = new Set(
      (root.dataset.defaultLayers || "food,anchor")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    let focusId = spotIdFromHash();
    let mapReady = false;

    function postToMap(payload) {
      if (!mapReady || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        { source: "map-embed-layers", ...payload },
        location.origin,
      );
    }

    function syncIframeSrc() {
      iframe.src = buildMapSrc([...active], focusId);
    }

    function syncLive() {
      toggles.forEach((btn) => {
        btn.setAttribute("aria-pressed", active.has(btn.dataset.mapLayer) ? "true" : "false");
      });
      if (mapReady) {
        postToMap({ layers: [...active], focus: focusId || null });
      } else {
        syncIframeSrc();
      }
    }

    function ensureLayersForSpot(id) {
      if (!id) return;
      const foodIds = new Set([
        "junpei",
        "biei-farm",
        "aruno",
        "chiyoda",
        "ferme",
        "between",
        "gosh",
        "asperge",
        "sabo",
        "santouka",
      ]);
      const onsenIds = new Set([
        "ao-no-bi-yuyu",
        "park-hills",
        "tsuewasure",
        "mori-no-ryotei",
        "mori-no-shizuku",
        "kokumin",
        "ryounkaku",
        "hakuginso",
        "fukiage-roten",
        "yukoma",
      ]);
      if (foodIds.has(id)) {
        active.add("food");
        active.add("anchor");
      } else if (onsenIds.has(id)) {
        active.add("onsen");
        active.add("anchor");
      }
    }

    function focusSpot(id, nudgeMap) {
      if (id) {
        ensureLayersForSpot(id);
        focusId = id;
        history.replaceState(null, "", `#spot-${id}`);
      }
      syncLive();
      if (!nudgeMap) return;
      const embed = root.querySelector(".map-embed");
      embed?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    }

    if (!root.dataset.mapEmbedInit) {
      root.dataset.mapEmbedInit = "1";

      iframe.addEventListener("load", () => {
        mapReady = true;
        postToMap({ layers: [...active], focus: focusId || null });
      });

      window.addEventListener("message", (e) => {
        if (e.origin !== location.origin) return;
        if (e.data?.source === "area-map" && e.data?.type === "ready") {
          mapReady = true;
          postToMap({ layers: [...active], focus: focusId || null });
        }
      });

      toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
          const layer = btn.dataset.mapLayer;
          if (active.has(layer)) active.delete(layer);
          else active.add(layer);
          focusId = null;
          syncLive();
        });
      });

      document.querySelectorAll(".food-spot__map-link").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const u = new URL(a.getAttribute("href"), location.href);
          const id = u.searchParams.get("focus");
          if (!id) return;
          focusSpot(id, true);
        });
      });

      window.addEventListener("hashchange", () => {
        const id = spotIdFromHash();
        if (id) focusSpot(id, false);
      });
    }

    root._mapEmbedSync = syncLive;
    root._mapEmbedFocus = focusSpot;
    syncLive();
  }

  function boot() {
    document.querySelectorAll("[data-map-embed]").forEach(initMapEmbed);
  }

  boot();
  window.addEventListener("mock-i18n-ready", boot);
})();
