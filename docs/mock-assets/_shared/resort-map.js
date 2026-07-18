/**
 * Illustrated resort map viewer — matches Sichinohe /map (hero image + hitbox overlay).
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  /**
   * Resolve resort id. Do NOT silently fall back to sichinohe when the query
   * was lost (e.g. serve cleanUrls 301 /map.html?resort=x → /map).
   * Also recover mangled forms like ?resort%3Dsapporo-kokusai
   */
  function resolveResortId() {
    // 1) Hard-pinned pages (no query string needed)
    if (typeof window.__RESORT_ID__ === "string" && window.__RESORT_ID__) {
      return window.__RESORT_ID__;
    }
    const pinned = document.body?.dataset?.resort;
    if (pinned) return pinned;

    // 2) Query ?resort=
    const params = new URLSearchParams(location.search);
    let id = params.get("resort");
    if (id) return id;
    for (const [k, v] of params.entries()) {
      if (k.startsWith("resort=") && !v) return k.slice("resort=".length);
      if (k === "resort" && v) return v;
    }
    const m = location.search.match(/[?&]resort=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
    const mangled = location.search.match(/resort%3D([^&]+)/i);
    if (mangled) return decodeURIComponent(mangled[1]);

    // 3) Filename map-{id}.html / {id}-map.html
    const file = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "");
    const fileMap = file.match(/^map-(.+)$/) || file.match(/^(.+)-map$/);
    if (fileMap) return fileMap[1];

    return null;
  }
  const resortId = resolveResortId();
  const locale =
    new URLSearchParams(location.search).get("lang") ||
    localStorage.getItem(STORAGE_KEY) ||
    "ja";

  const STATUS_COLORS = {
    operating: "#7ec8e3",
    open: "#7ec8e3",
    stopped: "#64748b",
    closed: "#64748b",
    hold: "#f59e0b",
    partial: "#f59e0b",
    unknown: "#94a3b8",
  };

  const FEATURE_COLORS = {
    "lift-pair": "#1a1a1a",
    "lift-pony": "#1a1a1a",
    "lift-single": "#1a1a1a",
    "lift-rope": "#1a1a1a",
    "lift-ropeway": "#1a1a1a",
    "lift-1": "#1a1a1a",
    "lift-2": "#1a1a1a",
    "tow-1": "#1a1a1a",
    "tow-2": "#1a1a1a",
    "trail-intermediate": "#2fa84a",
    "trail-upper": "#d62839",
    "trail-champion": "#6d28d9",
    "trail-forest": "#2fa84a",
    "trail-pony": "#2fa84a",
    "trail-main": "#d62839",
    "trail-salmon": "#6d28d9",
    "trail-center": "#d62839",
    "trail-karamatsu": "#2fa84a",
    "trail-advanced": "#6d28d9",
    "trail-base": "#2fa84a",
    "trail-okhotsk": "#6d28d9",
    "trail-a": "#d62839",
    "trail-b": "#d62839",
    "trail-c": "#2fa84a",
    "trail-xc-main": "#7c3aed",
    "trail-roller": "#7c3aed",
    "trail-hike": "#6d28d9",
    "trail-xc": "#7c3aed",
    "trail-forest-oto": "#d62839",
    "trail-sub": "#6d28d9",
    "trail-gs": "#6d28d9",
    "trail-sl": "#6d28d9",
    "trail-sled": "#64748b",
    "trail-1": "#2fa84a",
    "trail-2": "#d62839",
    "trail-3": "#d62839",
    "trail-4": "#d62839",
    "trail-5": "#d62839",
    "trail-6": "#64748b",
    "lift-sky-cabin-8": "#1a1a1a",
    "lift-marchen-quad": "#1a1a1a",
    "lift-echo-quad": "#1a1a1a",
    "lift-woody-pair": "#1a1a1a",
    "lift-snow-escalator": "#64748b",
    "trail-downhill": "#1a1a1a",
    "trail-echo": "#1a1a1a",
    "trail-swing": "#d62839",
    "trail-forest": "#2fa84a",
    "trail-woody": "#d62839",
    "trail-family": "#d62839",
    "trail-marchen": "#2fa84a",
  };

  const UI = {
    ja: {
      back: "← ガイドトップへ戻る",
      mapTitle: "ゲレンデマップ",
      fidelityNotice:
        "コース・リフトの配置は概略です。正確な滑走区域・運行状況は、ゲレンデの公式サイトと現地の案内を正としてください。",
      fidelityNoticeCalibrated:
        "公式コースマップ上にヒット領域を校正済みです。運行状況の最終判断は公式サイトと現地案内を正としてください。",
      stageBadge: "概略",
      stageBadgeCalibrated: "校正済",
      status: "運行状況",
      lifts: "リフト",
      trails: "コース",
      operating: "運転中",
      open: "滑走可",
      stopped: "停止",
      closed: "閉鎖",
      hold: "確認中",
      loadFailed: "マップデータを読み込めませんでした。",
      loadFailedHint:
        "file:// では動きません。npx serve docs/mock-assets -p 3456 を実行し http://localhost:3456/map.html?resort=… で開いてください。",
      deselect: "選択解除",
      zoomIn: "拡大",
      zoomOut: "縮小",
      reset: "表示をリセット",
      legend: "凡例",
      legendBeginner: "初級",
      legendIntermediate: "中級",
      legendAdvanced: "上級",
      close: "閉じる",
      loading: "読み込み中…",
    },
    en: {
      back: "← Back to guide home",
      mapTitle: "Resort map",
      fidelityNotice:
        "Trail and lift positions are approximate. For accurate runs and lift status, follow the resort's official site and on-mountain signage.",
      fidelityNoticeCalibrated:
        "Hit areas are calibrated on the official course map. For final operating status, follow the resort's official site and on-mountain signage.",
      stageBadge: "Overview",
      stageBadgeCalibrated: "Calibrated",
      status: "Operations",
      lifts: "Lifts",
      trails: "Trails",
      operating: "Running",
      open: "Open",
      stopped: "Stopped",
      closed: "Closed",
      hold: "Checking",
      loadFailed: "Could not load map data.",
      loadFailedHint:
        "Run npx serve docs/mock-assets -p 3456 then open http://localhost:3456/map.html?resort=…",
      deselect: "Clear selection",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      reset: "Reset view",
      legend: "Legend",
      legendBeginner: "Beginner",
      legendIntermediate: "Intermediate",
      legendAdvanced: "Advanced",
      close: "Close",
      loading: "Loading…",
    },
  };

  let mapData = null;
  let mapMode = "schematic";
  let selectedId = null;
  let filter = "trail";
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let imageReady = false;

  const el = {
    title: document.getElementById("map-resort-name"),
    back: document.getElementById("map-top-link"),
    stage: document.getElementById("map-stage"),
    list: document.getElementById("map-list"),
    detail: document.getElementById("map-detail"),
    updated: document.getElementById("map-updated"),
    fab: document.getElementById("map-fab"),
    sheet: document.getElementById("map-sheet"),
    backdrop: document.getElementById("map-sheet-backdrop"),
    tabs: document.querySelectorAll(".map-tab[data-filter]"),
    fidelity: document.getElementById("map-fidelity-notice"),
  };

  function t(key) {
    return (UI[locale] || UI.ja)[key] || key;
  }

  function pick(obj) {
    if (!obj) return "";
    return obj[locale] || obj.ja || "";
  }

  function statusLabel(status) {
    return (
      {
        operating: t("operating"),
        open: t("open"),
        stopped: t("stopped"),
        closed: t("closed"),
        hold: t("hold"),
      }[status] || t("hold")
    );
  }

  function accentColor(id, type) {
    if (FEATURE_COLORS[id]) return FEATURE_COLORS[id];
    const f = mapData?.features?.find((x) => x.id === id);
    if (f?.difficulty === "advanced") return "#1a1a1a";
    if (f?.difficulty === "intermediate") return "#d62839";
    if (f?.difficulty === "beginner") return "#2fa84a";
    return type === "lift" ? "#1a1a1a" : "#2fa84a";
  }

  function isStoppedLift(id) {
    const s = mapData.features.find((f) => f.id === id)?.status;
    return s === "stopped" || s === "closed";
  }

  function highlightStyle(feature, selected) {
    const { id, type, status } = feature;
    const accent = accentColor(id, type);
    const baked = mapData.bakedLines !== false;

    if (type === "lift") {
      if (isStoppedLift(id)) {
        return { show: true, stroke: STATUS_COLORS.stopped, width: selected ? 3 : 2, opacity: selected ? 0.95 : 0.72, dash: "6 4" };
      }
      if (status === "hold") {
        return { show: true, stroke: STATUS_COLORS.hold, width: selected ? 3 : 2, opacity: selected ? 0.95 : 0.72, dash: "4 3" };
      }
      // 焼き込みリフト: イラストの線をそのまま表示（色線オーバーレイで内側が黒く見えるのを防ぐ）
      if (baked) {
        return { show: false };
      }
      if (status === "operating") {
        return { show: true, stroke: STATUS_COLORS.operating, width: selected ? 3.5 : 2.5, opacity: selected ? 0.98 : 0.72 };
      }
      return { show: true, stroke: accent, width: selected ? 3 : 1.5, opacity: 1 };
    }

    if (status === "closed") {
      return { show: true, stroke: STATUS_COLORS.closed, width: selected ? 3 : 2, opacity: 0.35, dash: "5 4" };
    }
    if (status === "partial") {
      return { show: !baked || selected, stroke: accent, width: selected ? 3 : 1.5, opacity: 0.65, dash: "8 4" };
    }
    // 焼き込みコース: 通常時はオーバーレイなし（ループ内が黒く塗られるのを防ぐ）
    if (baked) {
      return { show: false };
    }
    if (status === "open") {
      return { show: true, stroke: STATUS_COLORS.open, width: selected ? 3.5 : 2.5, opacity: selected ? 0.98 : 0.72 };
    }
    return { show: true, stroke: accent, width: selected ? 3 : 1.5, opacity: 1 };
  }

  function formatUpdated(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  function applyTransform() {
    const content = el.stage?.querySelector(".map-canvas-content");
    if (content) {
      content.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }
  }

  async function init() {
    document.documentElement.lang = locale;
    if (!resortId) {
      el.stage.innerHTML = `<p class="map-error">${t("loadFailed")}<br><small>resort パラメータがありません。<code>map.html?resort=sapporo-kokusai</code> のように指定してください（URLから resort が消えると別施設のマップが出ます）。</small></p>`;
      return;
    }
    try {
      const res = await fetch(`data/maps/${resortId}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} data/maps/${resortId}.json`);
      mapData = await res.json();
      if (mapData.id && mapData.id !== resortId) {
        throw new Error(`JSON id mismatch: expected ${resortId}, got ${mapData.id}`);
      }
    } catch (e) {
      const hint = location.protocol === "file:" ? `<br><small>${t("loadFailedHint")}</small>` : "";
      el.stage.innerHTML = `<p class="map-error">${t("loadFailed")}<br><small>${e.message}</small>${hint}</p>`;
      return;
    }

    document.title = `${pick(mapData.name)} — ${t("mapTitle")}`;
    if (el.title) el.title.textContent = pick(mapData.name);
    if (el.updated) el.updated.textContent = formatUpdated(mapData.updatedAt);
    mapMode =
      mapData.mapMode || (mapData.mapFactory ? "calibrated" : "schematic");
    if (el.fidelity) {
      el.fidelity.textContent =
        mapMode === "calibrated"
          ? t("fidelityNoticeCalibrated")
          : t("fidelityNotice");
    }

    const registryRes = await fetch("registry.json").catch(() => null);
    if (registryRes?.ok && el.back) {
      const reg = await registryRes.json();
      const resort = reg.resorts.find((r) => r.id === resortId);
      if (resort) {
        el.back.href = `${resort.slug}/index.html${locale === "en" ? "?lang=en" : ""}`;
        el.back.textContent = t("back");
      }
    }

    applyChromeI18n();
    renderStage();
    renderList();
    bindTabs();
    bindMobile();
  }

  /** Update static HTML chrome (rail titles / tabs / legend) for locale. */
  function applyChromeI18n() {
    document.querySelectorAll(".map-rail-title").forEach((node) => {
      node.textContent = t("status");
    });
    document.querySelectorAll(".map-tab[data-filter='trail']").forEach((node) => {
      node.textContent = t("trails");
    });
    document.querySelectorAll(".map-tab[data-filter='lift']").forEach((node) => {
      node.textContent = t("lifts");
    });
    document.querySelectorAll(".map-sheet-close").forEach((node) => {
      node.textContent = t("close");
    });
    const legendStrong = document.querySelector(".map-legend > strong");
    if (legendStrong) legendStrong.textContent = t("legend");
    const swatches = document.querySelectorAll(".map-legend-row > span");
    if (swatches[0]) swatches[0].lastChild.textContent = t("legendBeginner");
    if (swatches[1]) swatches[1].lastChild.textContent = t("legendIntermediate");
    if (swatches[2]) swatches[2].lastChild.textContent = t("legendAdvanced");
    if (swatches[3]) swatches[3].lastChild.textContent = t("lifts");
    const rail = document.getElementById("map-rail");
    if (rail) rail.setAttribute("aria-label", t("status"));
  }

  function renderStage() {
    const hero = mapData.hero;
    if (!hero?.src) {
      el.stage.innerHTML = `<p class="map-error">${t("loadFailed")}<br><small>hero image missing</small></p>`;
      return;
    }

    const vb = hero.viewBox || mapData.viewBox || "0 0 1024 1024";
    const alt = pick(mapData.name);
    const interactive = mapData.features.some((f) => f.path);
    const baked = mapData.bakedLines !== false;

    let overlayPaths = "";
    if (interactive) {
      for (const f of mapData.features) {
        if (!f.path) continue;
        const selected = selectedId === f.id;
        const dimmed = filter !== "all" && f.type !== (filter === "lift" ? "lift" : "trail");
        const hl = highlightStyle(f, selected);

        overlayPaths += `<path class="map-hit${dimmed ? " is-dimmed" : ""}" data-feature-id="${f.id}" d="${f.path}" />`;

        if (hl.show) {
          const dash = hl.dash ? ` stroke-dasharray="${hl.dash}"` : "";
          overlayPaths += `<path class="map-status-line map-status-line--${f.type}${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}" d="${f.path}" stroke="${hl.stroke}" stroke-width="${hl.width}" stroke-opacity="${hl.opacity}" stroke-linecap="round" stroke-linejoin="round"${dash} pointer-events="none" />`;
        }

        if (selected && baked) {
          // Dark halo + amber core — readable on white snow (avoid pure white ring)
          overlayPaths += `<path class="map-select-ring map-select-ring--halo" d="${f.path}" />`;
          overlayPaths += `<path class="map-select-ring map-select-ring--core" d="${f.path}" />`;
        }
      }
    }

    const badge =
      mapMode === "calibrated" ? t("stageBadgeCalibrated") : t("stageBadge");
    el.stage.innerHTML = `
      <span class="map-stage-badge" aria-hidden="true">${badge}</span>
      <div class="map-canvas">
        <div class="map-canvas-content${imageReady ? " is-ready" : ""}">
          <img class="map-hero" src="${hero.src}" alt="${alt}" width="${hero.width || 1024}" height="${hero.height || 1024}" decoding="async" fetchpriority="high" />
          ${interactive ? `<svg class="map-overlay" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${overlayPaths}</svg>` : ""}
        </div>
        ${!imageReady ? '<div class="map-loading" aria-hidden="true"></div>' : ""}
        <div class="map-zoom-fabs">
          <button type="button" class="map-zoom-btn" data-zoom="in" aria-label="${t("zoomIn")}">+</button>
          <button type="button" class="map-zoom-btn" data-zoom="out" aria-label="${t("zoomOut")}">−</button>
          <button type="button" class="map-zoom-btn" data-zoom="reset" aria-label="${t("reset")}">⊡</button>
        </div>
      </div>
    `;

    const disclaimer = document.createElement("p");
    disclaimer.className = "map-disclaimer";
    disclaimer.textContent = pick(mapData.disclaimer);
    el.stage.appendChild(disclaimer);

    const img = el.stage.querySelector(".map-hero");
    img.addEventListener("load", () => {
      imageReady = true;
      el.stage.querySelector(".map-canvas-content")?.classList.add("is-ready");
      el.stage.querySelector(".map-loading")?.remove();
    });
    if (img.complete) {
      imageReady = true;
      el.stage.querySelector(".map-canvas-content")?.classList.add("is-ready");
      el.stage.querySelector(".map-loading")?.remove();
    }

    applyTransform();

    el.stage.querySelectorAll("[data-feature-id]").forEach((node) => {
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        select(node.dataset.featureId);
      });
    });

    el.stage.querySelectorAll("[data-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.zoom;
        if (action === "in") scale = Math.min(scale * 1.25, 4);
        else if (action === "out") scale = Math.max(scale / 1.25, 1);
        else {
          scale = 1;
          panX = 0;
          panY = 0;
        }
        applyTransform();
      });
    });
  }

  function listItem(f) {
    const sel = selectedId === f.id ? " is-selected" : "";
    const dotColor = accentColor(f.id, f.type);
    const badge = statusLabel(f.status);
    const live = f.status === "operating" || f.status === "open";
    return `<button type="button" class="map-list-item${sel}" data-id="${f.id}">
      <span class="map-list-dot" style="background:${dotColor}"></span>
      <span class="map-list-label">${pick(f.label)}</span>
      <span class="map-list-badge${live ? " is-live" : ""}">${badge}</span>
    </button>`;
  }

  function renderList() {
    if (!el.list) return;
    const items = mapData.features.filter((f) => filter === "all" || f.type === (filter === "lift" ? "lift" : "trail"));
    const lifts = items.filter((f) => f.type === "lift");
    const trails = items.filter((f) => f.type === "trail");

    let html = "";
    if (lifts.length) {
      html += `<p class="map-group-title">${t("lifts")}</p>`;
      html += lifts.map((f) => listItem(f)).join("");
    }
    if (trails.length) {
      html += `<p class="map-group-title">${t("trails")}</p>`;
      html += trails.map((f) => listItem(f)).join("");
    }
    el.list.innerHTML = html;
    const mobileList = document.getElementById("map-list-mobile");
    if (mobileList) mobileList.innerHTML = html;

    const bind = (root) => {
      root?.querySelectorAll(".map-list-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          select(btn.dataset.id);
          closeSheet();
        });
      });
    };
    bind(el.list);
    bind(mobileList);
    renderDetail();
  }

  function renderDetail() {
    const targets = [el.detail, document.getElementById("map-detail-mobile")].filter(Boolean);
    const f = mapData.features.find((x) => x.id === selectedId);
    if (!f) {
      targets.forEach((node) => {
        node.innerHTML = "";
      });
      return;
    }
    const meta = f.meta?.[locale] || f.meta?.ja || {};
    const rows = Object.entries(meta)
      .map(([k, v]) => `<li><strong>${k}</strong><span>${v}</span></li>`)
      .join("");
    const html = `
      <h3>${pick(f.label)}</h3>
      <p class="map-detail-status">${statusLabel(f.status)} · ${f.type === "lift" ? t("lifts") : t("trails")}</p>
      ${rows ? `<ul class="map-detail-meta">${rows}</ul>` : ""}
      <button type="button" class="map-tab" data-deselect>${t("deselect")}</button>
    `;
    targets.forEach((node) => {
      node.innerHTML = html;
    });
    document.querySelectorAll("[data-deselect]").forEach((btn) => {
      btn.addEventListener("click", () => select(null));
    });
  }

  function select(id) {
    selectedId = id;
    renderStage();
    renderList();
  }

  function bindTabs() {
    el.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filter = tab.dataset.filter;
        el.tabs.forEach((x) => x.setAttribute("aria-selected", x === tab ? "true" : "false"));
        renderList();
      });
    });
  }

  function bindMobile() {
    if (!el.fab || !el.sheet || !el.backdrop) return;
    el.fab.textContent = t("status");
    el.fab.addEventListener("click", () => {
      el.sheet.classList.add("is-open");
      el.backdrop.classList.add("is-open");
    });
    el.backdrop.addEventListener("click", closeSheet);
    el.sheet.querySelector(".map-sheet-close")?.addEventListener("click", closeSheet);
  }

  function closeSheet() {
    el.sheet?.classList.remove("is-open");
    el.backdrop?.classList.remove("is-open");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
