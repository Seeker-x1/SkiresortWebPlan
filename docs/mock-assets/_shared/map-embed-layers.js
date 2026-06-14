/**
 * Layer toggles + spot focus for embedded area-map iframes on LP detail pages.
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
      (root.dataset.defaultLayers || "food,onsen,anchor")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    let focusId = spotIdFromHash();

    function sync() {
      iframe.src = buildMapSrc([...active], focusId);
      toggles.forEach((btn) => {
        btn.setAttribute("aria-pressed", active.has(btn.dataset.mapLayer) ? "true" : "false");
      });
    }

    function focusSpot(id, scrollToMap) {
      focusId = id;
      sync();
      if (scrollToMap) {
        const section = document.getElementById("food-map") || document.getElementById("onsen-map");
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

      document.querySelectorAll(".food-spot__map-link").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const u = new URL(a.getAttribute("href"), location.href);
          const id = u.searchParams.get("focus");
          if (!id) return;
          history.replaceState(null, "", `#spot-${id}`);
          focusSpot(id, true);
        });
      });

      window.addEventListener("hashchange", () => {
        const id = spotIdFromHash();
        if (id) focusSpot(id, false);
      });
    }

    root._mapEmbedSync = sync;
    root._mapEmbedFocus = focusSpot;
    sync();
  }

  function boot() {
    document.querySelectorAll("[data-map-embed]").forEach(initMapEmbed);
  }

  boot();
  window.addEventListener("mock-i18n-ready", boot);
})();
