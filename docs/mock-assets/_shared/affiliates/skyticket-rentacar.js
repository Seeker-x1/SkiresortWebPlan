/**
 * Skyticket rentacar affiliate (ValueCommerce) — mock LP fleet.
 * Config: ./_shared/affiliates/skyticket-rentacar.json
 * Resort destination: registry.json → affiliates.rentacar
 *
 * Skyticket rentacar is Japanese-only; link copy is JA on all LP locales.
 */
(function () {
  const CONFIG_PATH = "../_shared/affiliates/skyticket-rentacar.json";
  const REGISTRY_PATH = "../registry.json";
  const LINK_SELECTOR = "[data-skyticket-rentacar-link]";
  const BLOCK_SELECTOR = "[data-skyticket-rentacar-block]";
  const PIXEL_SELECTOR = "[data-skyticket-rentacar-pixel]";

  let cachedData = null;

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

  function applyAffiliate({ config, resort }) {
    const destinationId = resort?.affiliates?.rentacar;
    const blocks = document.querySelectorAll(BLOCK_SELECTOR);

    if (!destinationId) {
      blocks.forEach((block) => {
        block.hidden = true;
      });
      return;
    }

    const destination = config.destinations?.[destinationId];
    const skyticketUrl = destination?.url;
    if (!skyticketUrl) {
      console.error("[skyticket-rentacar] unknown destination:", destinationId);
      blocks.forEach((block) => {
        block.hidden = true;
      });
      return;
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

  async function refresh() {
    const resortId = document.documentElement.dataset.mockResort;
    if (!resortId) return;
    const data = await loadData(resortId);
    const resort = data.registry.resorts.find((entry) => entry.id === resortId);
    applyAffiliate({ config: data.config, resort });
  }

  document.addEventListener("DOMContentLoaded", () => {
    refresh().catch((err) => {
      console.error("[skyticket-rentacar]", err);
    });
  });
})();
