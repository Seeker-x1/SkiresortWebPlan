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

  function apply(messages, registry, locale) {
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = get(messages, el.dataset.i18n);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = get(messages, el.dataset.i18nHtml);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, path] = pair.split(":").map((s) => s.trim());
        const v = get(messages, path);
        if (v != null) el.setAttribute(attr, v);
      });
    });
    const title = get(messages, "meta.title");
    const desc = get(messages, "meta.description");
    if (title) document.title = title;
    if (desc) document.querySelector('meta[name="description"]')?.setAttribute("content", desc);

    const tbody = document.getElementById("resort-table-body");
    if (tbody) {
      tbody.innerHTML = "";
      registry.resorts.forEach((r) => {
        const tr = document.createElement("tr");
        const href = `${r.slug}/index.html${locale === "en" ? "?lang=en" : ""}`;
        tr.innerHTML = `
          <td><strong>${r.name[locale]}</strong></td>
          <td>${r.region[locale]}</td>
          <td>${r.strategy[locale]}</td>
          <td>
            <a class="hub-link" href="${href}">${get(messages, "table.preview")}</a>
            · <a class="hub-link" href="map.html?resort=${r.id}${locale === "en" ? "&lang=en" : ""}">${get(messages, "table.map")}</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
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
    const [messages, registry] = await Promise.all([
      fetch(`messages/hub.${locale}.json`).then((r) => r.json()),
      fetch("registry.json").then((r) => r.json()),
    ]);
    apply(messages, registry, locale);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.addEventListener("click", () => setLocale(btn.dataset.langSwitch));
    });
    init(getLocale());
  });
})();
