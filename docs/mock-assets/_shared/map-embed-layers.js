/**
 * Layer toggles for embedded area-map iframes on LP detail pages.
 */
(function () {
  function buildMapSrc(basePath, layers, lang) {
    const u = new URL(basePath, location.href);
    u.searchParams.set("resort", "biei");
    u.searchParams.set("embed", "1");
    u.searchParams.set("layers", layers.join(","));
    if (lang === "en") u.searchParams.set("lang", "en");
    return u.pathname + u.search;
  }

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function initMapEmbed(root) {
    const iframe = root.querySelector(".map-embed iframe");
    const toggles = root.querySelectorAll("[data-map-layer]");
    if (!iframe || !toggles.length) return;

    let active = new Set(
      (root.dataset.defaultLayers || "food,onsen,anchor")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    function sync() {
      iframe.src = buildMapSrc("/area-map.html", [...active], lang());
      toggles.forEach((btn) => {
        btn.setAttribute("aria-pressed", active.has(btn.dataset.mapLayer) ? "true" : "false");
      });
    }

    if (!root.dataset.mapEmbedInit) {
      root.dataset.mapEmbedInit = "1";
      toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
          const layer = btn.dataset.mapLayer;
          if (active.has(layer)) active.delete(layer);
          else active.add(layer);
          sync();
        });
      });
    }

    root._mapEmbedSync = sync;
    sync();
  }

  document.querySelectorAll("[data-map-embed]").forEach(initMapEmbed);

  window.addEventListener("mock-i18n-ready", () => {
    document.querySelectorAll("[data-map-embed]").forEach((root) => {
      if (root._mapEmbedSync) root._mapEmbedSync();
    });
  });
})();
