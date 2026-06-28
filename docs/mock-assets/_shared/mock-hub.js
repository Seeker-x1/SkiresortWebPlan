/**
 * Hub index i18n — guides/hub/index.html → guides.japowserch.com/
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const SUPPORTED = ["ja", "en"];
  const DEFAULT = "ja";

  function getLocale() {
    const p = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.includes(p)) return p;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT;
  }

  function setLocale(locale) {
    localStorage.setItem(STORAGE_KEY, locale);
    const url = new URL(window.location.href);
    if (locale === DEFAULT) url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
    return init(locale);
  }

  function get(obj, path) {
    return path.split(".").reduce((a, k) => (a == null ? a : a[k]), obj);
  }

  function withCounts(text, vars) {
    if (text == null) return text;
    let out = String(text);
    for (const [key, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${key}}`, String(value));
    }
    return out;
  }

  function mapSet(mapsIndex) {
    return new Set((mapsIndex?.resortMaps || []).map((m) => m.id));
  }

  function apply(messages, registry, mapsIndex, locale) {
    const resortCount = registry.resorts.length;
    const mapCount = mapsIndex?.resortMaps?.length ?? resortCount;
    const areaMapCount = mapsIndex?.areaMaps?.length ?? 0;
    const counts = {
      count: resortCount,
      mapCount: locale === "en" ? String(mapCount) : `${mapCount}件`,
    };
    const hasResortMap = mapSet(mapsIndex);

    document.documentElement.lang = locale;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = withCounts(get(messages, el.dataset.i18n), counts);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = withCounts(get(messages, el.dataset.i18nHtml), counts);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, path] = pair.split(":").map((s) => s.trim());
        const v = withCounts(get(messages, path), counts);
        if (v != null) el.setAttribute(attr, v);
      });
    });

    const title = withCounts(get(messages, "meta.title"), counts);
    const desc = get(messages, "meta.description");
    if (title) document.title = title;
    if (desc) document.querySelector('meta[name="description"]')?.setAttribute("content", desc);

    const tbody = document.getElementById("resort-table-body");
    if (tbody) {
      tbody.innerHTML = "";
      const rows = [...registry.resorts].sort(
        (a, b) => (a.japowResortId ?? 9999) - (b.japowResortId ?? 9999),
      );
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        const lpHref = `${r.slug}/index.html${locale === "en" ? "?lang=en" : ""}`;
        const mapHref = `map.html?resort=${r.id}${locale === "en" ? "&lang=en" : ""}`;
        const idCell =
          r.japowResortId != null
            ? `<td class="hub-id">${r.japowResortId}</td>`
            : `<td class="hub-id hub-id--empty">—</td>`;
        const mapCell =
          hasResortMap.size === 0 || hasResortMap.has(r.id)
            ? `<a class="hub-link" href="${mapHref}">${get(messages, "table.map")}</a>`
            : `<span class="hub-empty">—</span>`;
        tr.innerHTML = `
          ${idCell}
          <td><strong>${r.name[locale]}</strong></td>
          <td>${r.region[locale]}</td>
          <td>${r.strategy[locale]}</td>
          <td><a class="hub-link" href="${lpHref}">${get(messages, "table.preview")}</a></td>
          <td>${mapCell}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    const areaBody = document.getElementById("area-map-table-body");
    const areaSection = document.getElementById("hub-area-maps-section");
    const areaMaps = mapsIndex?.areaMaps || [];
    if (areaBody && areaSection) {
      areaBody.innerHTML = "";
      if (areaMaps.length) {
        areaSection.hidden = false;
        const sorted = [...areaMaps].sort(
          (a, b) => (a.japowResortId ?? 9999) - (b.japowResortId ?? 9999),
        );
        sorted.forEach((m) => {
          const tr = document.createElement("tr");
          const areaHref = `area-map.html?resort=${m.resortId}${locale === "en" ? "&lang=en" : ""}`;
          const idCell =
            m.japowResortId != null
              ? `<td class="hub-id">${m.japowResortId}</td>`
              : `<td class="hub-id hub-id--empty">—</td>`;
          tr.innerHTML = `
            ${idCell}
            <td><strong>${m.name[locale]}</strong></td>
            <td>${m.region[locale]}</td>
            <td><a class="hub-link" href="${areaHref}">${get(messages, "table.areaMap")}</a></td>
          `;
          areaBody.appendChild(tr);
        });
      } else {
        areaSection.hidden = true;
      }
    }

    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      const active = btn.dataset.langSwitch === locale;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  async function init(locale) {
    const [messages, registry, mapsIndex] = await Promise.all([
      fetch(`messages/hub.${locale}.json`).then((r) => r.json()),
      fetch("registry.json").then((r) => r.json()),
      fetch("maps-index.json")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);
    apply(messages, registry, mapsIndex, locale);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.addEventListener("click", () => setLocale(btn.dataset.langSwitch));
    });
    init(getLocale());
  });
})();
