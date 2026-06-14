/**
 * Static LP mock i18n — docs/mock-assets/_shared/mock-i18n.js
 * See docs/mock-assets/i18n_spec.md
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const SUPPORTED = ["ja", "en"];
  const DEFAULT = "ja";

  function getLocaleFromUrl() {
    const p = new URLSearchParams(window.location.search).get("lang");
    return SUPPORTED.includes(p) ? p : null;
  }

  function getLocale() {
    return getLocaleFromUrl() || localStorage.getItem(STORAGE_KEY) || DEFAULT;
  }

  function setLocale(locale) {
    if (!SUPPORTED.includes(locale)) return;
    localStorage.setItem(STORAGE_KEY, locale);
    const url = new URL(window.location.href);
    if (locale === DEFAULT) url.searchParams.delete("lang");
    else url.searchParams.set("lang", locale);
    window.history.replaceState({}, "", url);
    return loadAndApply(locale);
  }

  function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        out[key] = deepMerge(out[key] || {}, val);
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  async function loadMessages(locale) {
    const resortId = document.documentElement.dataset.mockResort;
    if (!resortId) throw new Error("Missing data-mock-resort on <html>");

    const [ui, resort] = await Promise.all([
      fetchJson(`../_shared/messages/ui.${locale}.json`),
      fetchJson(`messages/${locale}.json`),
    ]);
    return deepMerge(ui, resort);
  }

  function applyMessages(messages) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = getByPath(messages, el.dataset.i18n);
      if (val != null && val !== "") el.textContent = val;
      else if (val === "") el.hidden = true;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = getByPath(messages, el.dataset.i18nHtml);
      if (val != null && val !== "") {
        el.innerHTML = val;
        el.hidden = false;
      } else {
        el.innerHTML = "";
        el.hidden = true;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el.dataset.i18nAttr.split(";").map((s) => s.trim());
      pairs.forEach((pair) => {
        const [attr, path] = pair.split(":").map((s) => s.trim());
        const val = getByPath(messages, path);
        if (val != null) el.setAttribute(attr, val);
      });
    });

    const title = getByPath(messages, "meta.title");
    const desc = getByPath(messages, "meta.description");
    if (title) document.title = title;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", desc);
    }
  }

  function updateLangButtons(locale) {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      const btnLocale = btn.dataset.langSwitch;
      const active = btnLocale === locale;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
      btn.classList.toggle("is-active", active);
    });
  }

  async function loadAndApply(locale) {
    document.documentElement.lang = locale;
    const messages = await loadMessages(locale);
    applyMessages(messages);
    updateLangButtons(locale);
    window.dispatchEvent(new CustomEvent("mock-i18n-ready", { detail: { locale, messages } }));
  }

  function initLangSwitchers() {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.addEventListener("click", () => setLocale(btn.dataset.langSwitch));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLangSwitchers();
    loadAndApply(getLocale()).catch((err) => {
      console.error("[mock-i18n]", err);
    });
  });
})();
