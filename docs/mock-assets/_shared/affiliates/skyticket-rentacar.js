/**
 * Skyticket rentacar affiliate (ValueCommerce) — mock LP fleet.
 * Config: ./_shared/affiliates/skyticket-rentacar.json
 * Resort destination: registry.json → affiliates.rentacar
 *
 * Locale: EN LP → skyticket.jp/en/rentacar/... (same ValueCommerce sid/pid)
 */
(function () {
  const CONFIG_PATH = "../_shared/affiliates/skyticket-rentacar.json";
  const REGISTRY_PATH = "../registry.json";
  const LINK_SELECTOR = "[data-skyticket-rentacar-link]";
  const BLOCK_SELECTOR = "[data-skyticket-rentacar-block]";
  const PIXEL_SELECTOR = "[data-skyticket-rentacar-pixel]";
  const LOCALE_STORAGE_KEY = "mock-lp-locale";

  let cachedData = null;

  function detectLocale() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "ja") return fromUrl;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "en" || stored === "ja") return stored;
    } catch (_) {
      /* private mode */
    }
    const htmlLang = document.documentElement.lang;
    return htmlLang === "en" ? "en" : "ja";
  }

  /**
   * @param {{ url: string, urlEn?: string }} destination
   * @param {"ja"|"en"|string} locale
   */
  function resolveSkyticketDestinationUrl(destination, locale) {
    if (!destination?.url) return null;
    if (locale !== "en") return destination.url;
    if (destination.urlEn) return destination.urlEn;
    try {
      const parsed = new URL(destination.url);
      if (!parsed.pathname.startsWith("/en/")) {
        parsed.pathname = `/en${parsed.pathname}`;
      }
      return parsed.href;
    } catch {
      return destination.url;
    }
  }

  function buildReferralHref(config, skyticketUrl) {
    const params = new URLSearchParams({
      sid: config.sid,
      pid: config.pid,
      vc_url: skyticketUrl,
    });
    return `${config.referralBase}?${params.toString()}`;
  }

  function buildPixelSrc(config) {
    const params = new URLSearchParams({
      sid: config.sid,
      pid: config.pid,
    });
    return `${config.pixelBase}?${params.toString()}`;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  async function loadData(resortId) {
    if (cachedData?.resortId === resortId) return cachedData;
    const [config, registry] = await Promise.all([
      fetchJson(CONFIG_PATH),
      fetchJson(REGISTRY_PATH),
    ]);
    cachedData = { resortId, config, registry };
    return cachedData;
  }

  function applyAffiliate({ config, resort }, locale) {
    const destinationId = resort?.affiliates?.rentacar;
    const blocks = document.querySelectorAll(BLOCK_SELECTOR);

    if (!destinationId) {
      blocks.forEach((block) => {
        block.hidden = true;
      });
      return;
    }

    const destination = config.destinations?.[destinationId];
    const skyticketUrl = resolveSkyticketDestinationUrl(destination, locale);
    if (!skyticketUrl) {
      console.error("[skyticket-rentacar] unknown destination:", destinationId);
      blocks.forEach((block) => {
        block.hidden = true;
      });
      return;
    }
    if (locale === "en" && !destination.urlEn) {
      console.warn(
        "[skyticket-rentacar] missing urlEn for",
        destinationId,
        "— run sync-skyticket-rentacar-i18n.mjs",
      );
    }

    const href = buildReferralHref(config, skyticketUrl);
    const pixel = buildPixelSrc(config);

    document.querySelectorAll(LINK_SELECTOR).forEach((link) => {
      link.href = href;
      const pixelEl = link.querySelector(PIXEL_SELECTOR);
      if (pixelEl) pixelEl.setAttribute("src", pixel);
    });

    blocks.forEach((block) => {
      block.hidden = false;
    });
  }

  async function refresh(locale) {
    const resortId = document.documentElement.dataset.mockResort;
    if (!resortId) return;
    const data = await loadData(resortId);
    const resort = data.registry.resorts.find((entry) => entry.id === resortId);
    applyAffiliate({ config: data.config, resort }, locale || detectLocale());
  }

  window.addEventListener("mock-i18n-ready", (event) => {
    refresh(event.detail?.locale).catch((err) => {
      console.error("[skyticket-rentacar]", err);
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    refresh(detectLocale()).catch((err) => {
      console.error("[skyticket-rentacar]", err);
    });
  });
})();
