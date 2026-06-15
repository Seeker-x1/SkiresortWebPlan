# 周辺エリアマップ — ビジュアル QA レポート

**Date:** 2026-06-14  
**Evaluator:** `resort-visual-evaluator` (L3)  
**対象:** `docs/mock-assets/area-map.html`（standalone + embed）、`_shared/area-map.css`  
**基準:** `area_map_requirements.md` §4（V1–V6）、`area_map_handoff_checklist.md` §3 トークン  
**ベンチマーク:** [BKKDW Organic Drop-off](https://bkkdw26.greydientlab.com/)

---

## Verdict

**PASS**

---

## ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **V1** タイポグラフィ階層 | **PASS** | popup タイトル `0.9375rem` / 700 + 2行 clamp（`.area-map-popup__title`）。カテゴリ・地区 `0.6875rem` / `--area-popup-muted`。リスト: IBM Plex Mono 番号 → Syne eyebrow → title（`.area-list-item__*`）。CTA: Syne uppercase + letter-spacing（`.area-map-popup__cta`）。 |
| **V2** 余白リズム | **PASS** | Desktop `≥1024px`: `.area-stage` `flex: 7 1 70%`、`min-height: min(72vh, 720px)`。レール `30%`。popup padding `0.75rem 1rem`、CTA 上 `0.75rem`。地図フレーム `2px solid var(--area-accent)` + `0.5rem` radius（スタンドアロンのみ）。padding/gap は 4px 倍数。 |
| **V3** 写真・ビジュアルアセット | **PASS** | Carto `light_all` 淡色タイル（`area-map.js` L639）。統一黒ドットのみ（`.area-dot-pin`）。ダーク popup `#1a1f26` / `#fafbfc`、幅 `min(280px, calc(100vw - 48px))`。Mapular PNG・標準 OSM カラータイルなし。 |
| **V4** マイクロインタラクション | **PASS** | active pin `scale(1.2)`、`transition: 0.15s`。レイヤー切替 `fitBounds` animate、`prefers-reduced-motion` 時無効。選択時 `flyTo` なし。ネオンフラッシュなし。 |
| **V5** ブランド一貫性 | **PASS** | トークン `--area-accent` / `--area-text` / `--area-bg` / `--area-popup-*` 凍結値一致。Primary CTA `--area-accent`、Secondary ghost border のみ。`#E2FC07` 未使用。絵文字ピンなし（`↗` `→` typographic suffix のみ）。フィルタ pressed `#1a2332` と popup ダーク同系統。 |
| **V6** ベンチマーク整合 | **PASS** | BKKDW 識別要素 5/5: (1) fitBounds 俯瞰 (2) 統一ドット (3) 地図上ダーク popup + VIEW MAP (4) 地図 ≥70% (5) 淡色タイル。 |

---

## レイアウト確認（ブレークポイント）

| BP | 地図 | レール | 結果 |
|----|------|--------|------|
| Desktop ≥1024px | 70% 幅 | 30% | PASS |
| Tablet 768–1023px | 上 65% | 下 35% | PASS |
| Mobile standalone | 60dvh | 下リスト max 42vh | PASS |
| Mobile embed | 100% 高 | FAB シート（リストのみ） | PASS |

---

## WARN（出荷ブロック外）

| ID | 内容 |
|----|------|
| W-V1 | food + onsen 同時表示で広域俯瞰のため町内ピンが視認しづらい（要件 §11・BKKDW 全市俯瞰と同型） |
| W-V3 | embed モードは親 `.map-embed` に枠委譲 — 二重枠回避済み（意図通り） |

---

## ブロッカー

なし（V1・V5 とも PASS）

---

## 再発防止

- カテゴリ PNG やネオン `#E2FC07` を「ベンチマーク参考」名目で再導入しない。ピンは `divIcon` のみ。

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → mock LP 周辺マップ v2 出荷可
```

**本レポート:** ✅ PASS — 両 L3 PASS 達成。mock LP 周辺マップ v2 出荷可。
