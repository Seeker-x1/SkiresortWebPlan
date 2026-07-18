#!/usr/bin/env node
/**
 * Build file://-friendly map viewer under maps/{id}/public/maps/index.html
 * Embeds map-viewer.json so fetch is not required.
 */
import fs from "node:fs";
import path from "node:path";
import { dataDir, parseArgs, publicMapsDir, readJson, writeText, ROOT } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const id = args.id;
if (!id) {
  console.error("Usage: --id <resort-id>");
  process.exit(1);
}

const mapData = readJson(path.join(dataDir(id), "map-viewer.json"));
if (!mapData) {
  console.error("Run map:promote first (missing map-viewer.json)");
  process.exit(1);
}

const css = fs.readFileSync(
  path.join(ROOT, "docs/mock-assets/_shared/resort-map.css"),
  "utf8",
);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${mapData.name?.ja || id} — ゲレンデマップ</title>
  <style>${css}
  .map-topbar a { pointer-events: none; opacity: .5; }
  </style>
</head>
<body class="map-page">
  <header class="map-topbar">
    <div>
      <a href="#" id="map-top-link">Map Factory</a>
      <span aria-hidden="true"> · </span>
      <span class="logo" id="map-resort-name">ゲレンデマップ</span>
    </div>
    <div class="map-topbar-actions">
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang-switch="ja">JA</button>
        <button type="button" data-lang-switch="en">EN</button>
      </div>
    </div>
  </header>
  <p id="map-fidelity-notice" class="map-fidelity-notice" role="note"></p>
  <div class="map-shell">
    <div class="map-stage" id="map-stage"><p class="map-error">読み込み中…</p></div>
    <aside class="map-rail" id="map-rail" aria-label="運行状況">
      <div class="map-rail-head">
        <h1 class="map-rail-title">運行状況</h1>
        <p class="map-rail-updated" id="map-updated">—</p>
        <div class="map-tabs" role="tablist">
          <button type="button" class="map-tab" role="tab" data-filter="trail" aria-selected="true">コース</button>
          <button type="button" class="map-tab" role="tab" data-filter="lift" aria-selected="false">リフト</button>
        </div>
      </div>
      <div class="map-list" id="map-list"></div>
      <div class="map-detail" id="map-detail"></div>
    </aside>
  </div>
  <button type="button" class="map-mobile-fab" id="map-fab">運行状況</button>
  <div class="map-sheet-backdrop" id="map-sheet-backdrop"></div>
  <aside class="map-sheet" id="map-sheet">
    <div class="map-rail-head" style="display:flex;justify-content:space-between;align-items:center">
      <h2 class="map-rail-title" style="margin:0">運行状況</h2>
      <button type="button" class="map-tab map-sheet-close">閉じる</button>
    </div>
    <div class="map-list" id="map-list-mobile"></div>
    <div class="map-detail" id="map-detail-mobile"></div>
  </aside>
  <script>
    window.__MAP_DATA__ = ${JSON.stringify(mapData)};
  </script>
  <script>
(function () {
  const STORAGE_KEY = "mock-lp-locale";
  const params = new URLSearchParams(location.search);
  const locale = params.get("lang") || localStorage.getItem(STORAGE_KEY) || "ja";
  const STATUS_COLORS = { operating: "#7ec8e3", open: "#7ec8e3", stopped: "#64748b", closed: "#64748b", hold: "#f59e0b", unknown: "#94a3b8" };
  const UI = {
    ja: { mapTitle: "ゲレンデマップ", fidelityNoticeCalibrated: "公式コースマップ上にヒット領域を校正済みです。運行状況の最終判断は公式サイトと現地案内を正としてください。", stageBadgeCalibrated: "校正済", status: "運行状況", lifts: "リフト", trails: "コース", operating: "運転中", open: "滑走可", stopped: "停止", closed: "閉鎖", hold: "確認中", zoomIn: "拡大", zoomOut: "縮小", reset: "表示をリセット" },
    en: { mapTitle: "Resort map", fidelityNoticeCalibrated: "Hit areas are calibrated on the official course map.", stageBadgeCalibrated: "Calibrated", status: "Operations", lifts: "Lifts", trails: "Trails", operating: "Running", open: "Open", stopped: "Stopped", closed: "Closed", hold: "Checking", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset view" },
  };
  const mapData = window.__MAP_DATA__;
  let selectedId = null;
  let filter = "trail";
  let scale = 1, panX = 0, panY = 0, imageReady = false;
  const el = {
    title: document.getElementById("map-resort-name"),
    stage: document.getElementById("map-stage"),
    list: document.getElementById("map-list"),
    detail: document.getElementById("map-detail"),
    updated: document.getElementById("map-updated"),
    fab: document.getElementById("map-fab"),
    sheet: document.getElementById("map-sheet"),
    backdrop: document.getElementById("map-sheet-backdrop"),
    fidelity: document.getElementById("map-fidelity-notice"),
  };
  function t(k) { return (UI[locale] || UI.ja)[k] || k; }
  function pick(o) { return !o ? "" : (o[locale] || o.ja || o); }
  function statusLabel(s) { return ({ operating: t("operating"), open: t("open"), stopped: t("stopped"), closed: t("closed"), hold: t("hold") })[s] || t("hold"); }
  function accent(f) {
    if (f.difficulty === "advanced") return "#1a1a1a";
    if (f.difficulty === "intermediate") return "#d62839";
    if (f.difficulty === "beginner") return "#2fa84a";
    if (f.status === "stopped" || f.status === "closed") return "#64748b";
    return f.type === "lift" ? "#1a1a1a" : "#2fa84a";
  }
  function isStopped(f) { return f.status === "stopped" || f.status === "closed"; }
  document.documentElement.lang = locale;
  document.title = pick(mapData.name) + " — " + t("mapTitle");
  if (el.title) el.title.textContent = pick(mapData.name);
  if (el.updated) el.updated.textContent = mapData.updatedAt ? new Date(mapData.updatedAt).toLocaleString("ja-JP") : "—";
  if (el.fidelity) el.fidelity.textContent = t("fidelityNoticeCalibrated");

  function renderStage() {
    const hero = mapData.hero;
    const vb = hero.viewBox || "0 0 1024 817";
    let overlay = "";
    for (const f of mapData.features) {
      if (!f.path) continue;
      const selected = selectedId === f.id;
      const dimmed = filter !== "all" && f.type !== (filter === "lift" ? "lift" : "trail");
      overlay += '<path class="map-hit' + (dimmed ? " is-dimmed" : "") + '" data-feature-id="' + f.id + '" d="' + f.path + '" />';
      if (f.type === "lift" && isStopped(f)) {
        overlay += '<path d="' + f.path + '" fill="none" stroke="' + STATUS_COLORS.stopped + '" stroke-width="' + (selected ? 3 : 2) + '" stroke-dasharray="6 4" stroke-opacity="0.85" pointer-events="none" />';
      }
      if (selected) {
        overlay += '<path class="map-select-ring map-select-ring--halo" d="' + f.path + '" />';
        overlay += '<path class="map-select-ring map-select-ring--core" d="' + f.path + '" />';
      }
    }
    el.stage.innerHTML = '<span class="map-stage-badge">' + t("stageBadgeCalibrated") + '</span><div class="map-canvas"><div class="map-canvas-content' + (imageReady ? " is-ready" : "") + '"><img class="map-hero" src="' + hero.src + '" alt="" width="' + hero.width + '" height="' + hero.height + '" /><svg class="map-overlay" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + overlay + '</svg></div><div class="map-zoom-fabs"><button type="button" class="map-zoom-btn" data-zoom="in">+</button><button type="button" class="map-zoom-btn" data-zoom="out">−</button><button type="button" class="map-zoom-btn" data-zoom="reset">⊡</button></div></div><p class="map-disclaimer">' + pick(mapData.disclaimer) + '</p>';
    const content = el.stage.querySelector(".map-canvas-content");
    content.style.transform = "translate(" + panX + "px," + panY + "px) scale(" + scale + ")";
    const img = el.stage.querySelector(".map-hero");
    img.onload = () => { imageReady = true; content.classList.add("is-ready"); };
    if (img.complete) { imageReady = true; content.classList.add("is-ready"); }
    el.stage.querySelectorAll("[data-feature-id]").forEach((n) => n.onclick = (e) => { e.stopPropagation(); select(n.dataset.featureId); });
    el.stage.querySelectorAll("[data-zoom]").forEach((btn) => {
      btn.onclick = () => {
        const a = btn.dataset.zoom;
        if (a === "in") scale = Math.min(scale * 1.25, 4);
        else if (a === "out") scale = Math.max(scale / 1.25, 1);
        else { scale = 1; panX = 0; panY = 0; }
        content.style.transform = "translate(" + panX + "px," + panY + "px) scale(" + scale + ")";
      };
    });
  }

  function select(id) {
    selectedId = selectedId === id ? null : id;
    renderStage();
    renderList();
    renderDetail();
  }

  function renderList() {
    const items = mapData.features.filter((f) => f.type === (filter === "lift" ? "lift" : "trail"));
    const html = items.map((f) => {
      const live = f.status === "operating" || f.status === "open";
      return '<button type="button" class="map-list-item' + (selectedId === f.id ? " is-selected" : "") + '" data-id="' + f.id + '"><span class="map-list-dot" style="background:' + accent(f) + '"></span><span class="map-list-label">' + pick(f.label) + '</span><span class="map-list-badge' + (live ? " is-live" : "") + '">' + statusLabel(f.status) + '</span></button>';
    }).join("");
    el.list.innerHTML = '<p class="map-group-title">' + (filter === "lift" ? t("lifts") : t("trails")) + '</p>' + html;
    const mobile = document.getElementById("map-list-mobile");
    if (mobile) mobile.innerHTML = el.list.innerHTML;
    document.querySelectorAll(".map-list-item").forEach((b) => b.onclick = () => select(b.dataset.id));
  }

  function renderDetail() {
    const f = mapData.features.find((x) => x.id === selectedId);
    const box = el.detail;
    const mobile = document.getElementById("map-detail-mobile");
    if (!f) {
      if (box) box.innerHTML = "";
      if (mobile) mobile.innerHTML = "";
      return;
    }
    let meta = "";
    const m = f.meta && (f.meta[locale] || f.meta.ja || f.meta);
    if (m && typeof m === "object") {
      meta = Object.entries(m).map(([k, v]) => "<div><strong>" + k + "</strong> " + v + "</div>").join("");
    }
    const html = '<div class="map-detail-card"><h2>' + pick(f.label) + '</h2><p>' + statusLabel(f.status) + '</p>' + meta + '</div>';
    if (box) box.innerHTML = html;
    if (mobile) mobile.innerHTML = html;
  }

  document.querySelectorAll(".map-tab[data-filter]").forEach((tab) => {
    tab.onclick = () => {
      filter = tab.dataset.filter;
      document.querySelectorAll(".map-tab[data-filter]").forEach((t2) => t2.setAttribute("aria-selected", t2 === tab ? "true" : "false"));
      renderList();
    };
  });
  if (el.fab) el.fab.onclick = () => { el.sheet.classList.add("is-open"); el.backdrop.classList.add("is-open"); };
  document.querySelectorAll(".map-sheet-close, #map-sheet-backdrop").forEach((n) => {
    n.onclick = () => { el.sheet.classList.remove("is-open"); el.backdrop.classList.remove("is-open"); };
  });
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.langSwitch === locale ? "true" : "false");
    btn.onclick = () => {
      const u = new URL(location.href);
      u.searchParams.set("lang", btn.dataset.langSwitch);
      localStorage.setItem(STORAGE_KEY, btn.dataset.langSwitch);
      location.href = u.toString();
    };
  });

  renderStage();
  renderList();
})();
  </script>
</body>
</html>
`;

const out = path.join(publicMapsDir(id), "index.html");
writeText(out, html);
console.log("wrote", out);
