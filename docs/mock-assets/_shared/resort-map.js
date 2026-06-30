/**
 * Illustrated resort map viewer — matches Sichinohe /map (hero image + hitbox overlay).
 */
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const params = new URLSearchParams(location.search);
  const resortId = params.get("resort") || "sichinohe";
  const locale = params.get("lang") || localStorage.getItem(STORAGE_KEY) || "ja";

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
  };

  const UI = {
    ja: {
      back: "← ガイドトップへ戻る",
      mapTitle: "ゲレンデマップ",
      fidelityNotice:
        "コース・リフトの配置は概略です。正確な滑走区域・運行状況は、ゲレンデの公式サイトと現地の案内を正としてください。",
      stageBadge: "概略",
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
    },
    en: {
      back: "← Back to guide home",
      mapTitle: "Resort map",
      fidelityNotice:
        "Trail and lift positions are approximate. For accurate runs and lift status, follow the resort’s official site and on-mountain signage.",
      stageBadge: "Overview",
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
    },
  };

  let mapData = null;
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
    return FEATURE_COLORS[id] || (type === "lift" ? "#1a1a1a" : "#2fa84a");
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
    try {
      const res = await fetch(`data/maps/${resortId}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      mapData = await res.json();
    } catch (e) {
      const hint = location.protocol === "file:" ? `<br><small>${t("loadFailedHint")}</small>` : "";
      el.stage.innerHTML = `<p class="map-error">${t("loadFailed")}<br><small>${e.message}</small>${hint}</p>`;
      return;
    }

    document.title = `${pick(mapData.name)} — ${t("mapTitle")}`;
    if (el.title) el.title.textContent = pick(mapData.name);
    if (el.updated) el.updated.textContent = formatUpdated(mapData.updatedAt);
    if (el.fidelity) el.fidelity.textContent = t("fidelityNotice");

    const registryRes = await fetch("registry.json").catch(() => null);
    if (registryRes?.ok && el.back) {
      const reg = await registryRes.json();
      const resort = reg.resorts.find((r) => r.id === resortId);
      if (resort) {
        el.back.href = `${resort.slug}/index.html${locale === "en" ? "?lang=en" : ""}`;
        el.back.textContent = t("back");
      }
    }

    renderStage();
    renderList();
    bindTabs();
    bindMobile();
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
          overlayPaths += `<path class="map-select-ring" d="${f.path}" stroke="#ffffff" pointer-events="none" />`;
        }
      }
    }

    el.stage.innerHTML = `
      <span class="map-stage-badge" aria-hidden="true">${t("stageBadge")}</span>
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
