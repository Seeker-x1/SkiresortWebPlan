# P1 — ポップアップ UI・クローズ・CTA 文言（エージェント引き渡し）

**Date:** 2026-06-15  
**Author:** L1 横断（ユーザー報告 + BKKDW ベンチマーク照合）  
**Implementer:** `@resort-template-implementer`  
**L3 再評価:** `area_map_ux_eval.md` に **P1** 行追加  
**参照:** [BKKDW Coffee Ground Zero マップ](https://bkkdw26.greydientlab.com/)（ボタン形状・細枠・角丸なし）  
**前提:** `area_map_m1_a1_handoff.md`（M1/A1）と併行可

**対象**

- `docs/mock-assets/_shared/area-map.js`
- `docs/mock-assets/_shared/area-map.css`
- `area_map_ux_spec.md` §5.2 の **配色トークン更新**（黒カード → 白カードへユーザー指示で差し替え）

---

## 優先度

| ID | 内容 | 優先 |
|----|------|------|
| **P1-a** | クローズボタン（×）が効かない | **P0** |
| **P1-b** | ポップアップ：白地・黒枠 | **P0** |
| **P1-c** | CTA／サブボタン：細い・角張り（BKKDW 型） | **P1** |
| **P1-d** | 外部リンク文言は **Google Map** 明示 | **P1** |
| **P1-e** | ボタン配色のコントラスト設計 | **P1** |

---

## P1-a — クローズボタンが機能しない

### 症状

ピンタップでポップアップは開くが、右上 **×** を押しても閉じない（地図空白クリック / Esc は要確認）。

### 想定根因

1. `popupopen` で `e.popup.getElement()` にリスナーを付けているが、**Leaflet の DOM 再生成**や **地図 `click` との競合**でハンドラが効かない
2. ポップアップ内クリックが地図にバブリングし、`leafletMap.on("click", closePopup)` と競合
3. `closeButton: false` 時のカスタム × に `pointer-events` / `z-index` 問題

### 実装方針（必須）

#### A. イベント委譲（推奨）

`initLeafletMap` 内で **1 回だけ**:

```js
leafletMap.getContainer().addEventListener("click", (ev) => {
  const closeBtn = ev.target.closest(".area-map-popup__close");
  if (!closeBtn) return;
  L.DomEvent.stop(ev);
  closePopup();
});
```

`popupopen` 毎の `addEventListener` は **削除**（重複登録防止）。

#### B. バブリング遮断

`popupopen` 時:

```js
const content = e.popup.getContent(); // element or string
const el = typeof content === "string" ? e.popup.getElement()?.querySelector(".area-map-popup") : content;
if (el) L.DomEvent.disableClickPropagation(el);
```

ラッパー `.leaflet-popup-content-wrapper` にも `disableClickPropagation` を検討。

#### C. `closePopup()` の契約

- `marker.closePopup()` を呼ぶ
- `selectedId = null` → `syncMarkerStyles` / `syncListActive` / `notifyParentFocus(null)`
- リスト active と親 LP `.is-map-focused` が残らないこと

### 完了条件

| # | 操作 | 期待 |
|---|------|------|
| 1 | ピンタップ → × | ポップアップ閉じ、active ピン解除 |
| 2 | 同上（embed iframe） | 同上 + 親リスト focus 解除 |
| 3 | キーボード Tab → × → Enter | 閉じる |
| 4 | Esc | 閉じる |
| 5 | 地図空白クリック | 閉じる（× と両立） |

---

## P1-b — ポップアップ配色（白・黒枠）

### ユーザー指示

現行の **黒カード（`#1a1f26`）は廃止**。ポップアップ本体は **白背景 + 黒枠**。

### CSS トークン（`:root` で上書き）

```css
--area-popup-bg: #ffffff;
--area-popup-fg: #1a1f26;
--area-popup-border: #1a1f26;
--area-popup-muted: #5c6570;
```

### `.area-map-popup`

| プロパティ | 値 |
|------------|-----|
| `background` | `var(--area-popup-bg)` |
| `color` | `var(--area-popup-fg)` |
| `border` | `1.5px solid var(--area-popup-border)` |
| `border-radius` | `0`（角張り。BKKDW 型） |
| `box-shadow` | `0 4px 16px rgba(26, 31, 38, 0.12)`（軽い影のみ） |

### Leaflet ラッパー

```css
.area-leaflet-popup .leaflet-popup-content-wrapper {
  background: transparent;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
}
.area-leaflet-popup .leaflet-popup-tip {
  background: var(--area-popup-bg);
  border: 1px solid var(--area-popup-border);
  box-shadow: none;
}
```

`area_map_ux_spec.md` §5.2 の「背景 `#1a1f26`」記述は **本 handoff で supersede**。

---

## P1-c — ボタン形状（BKKDW：細く・角張り）

参考: BKKDW マップポップアップの **VIEW MAP →** — 全幅だが **低い・細枠・角丸なし・大文字ラベル**。

### 共通ルール

- `border-radius: 0`（ピル型 `999px` / `0.35rem` は **禁止**）
- 高さ: `min-height: 36px`（タップ 44px は **padding で確保**、見た目は細く）
- `font-family: Syne, sans-serif`
- `font-size: 0.625rem`–`0.6875rem`
- `font-weight: 700`
- `letter-spacing: 0.12em`
- `text-transform: uppercase`

### Primary CTA（Google Map）

```css
.area-map-popup__cta {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.55rem 0.75rem;
  min-height: 36px;
  border: 1.5px solid var(--area-popup-cta-border);
  border-radius: 0;
  background: var(--area-popup-cta-bg);
  color: var(--area-popup-cta-fg);
  text-decoration: none;
  text-align: center;
}
```

### Secondary（特集を読む）

```css
.area-map-popup__guide {
  /* ghost: 白地・黒枠・黒文字 */
  background: #ffffff;
  border: 1px solid #1a1f26;
  color: #1a1f26;
  border-radius: 0;
  margin-top: 0.5rem;
}
```

### クローズ ×

- 角張りヒット領域 `32×32px`（`min-width/height` で 44px タップ可）
- `border: 1px solid #1a1f26` または枠なし + `color: #1a1f26`
- `border-radius: 0`
- ホバー: `background: #f4f6f8`

---

## P1-d — CTA 文言は Google Map 明示

### 問題

現行 `popup.viewMap` = 「地図で開く →」/ `VIEW MAP →` は **Google Maps へのリンク**なのにサービス名が不明。

### i18n 変更（`area-map.js` UI ブロック）

| key | ja（確定） | en（確定） |
|-----|------------|------------|
| `popup.viewMap` | **Google マップで開く →** | **Open in Google Maps →** |
| `popup.viewMapAria` | **{name}を Google マップで開く** | **Open {name} in Google Maps** |

「マップで見る」「地図で開く」単体表記は **禁止**（Google 名義なし）。

リンク先は現行維持:

`https://www.google.com/maps/search/?api=1&query=…`

---

## P1-e — ボタン配色（可読性）

白ポップアップ上での **最低コントラスト**（WCAG AA 目安）:

| 要素 | 背景 | 文字/枠 | 用途 |
|------|------|---------|------|
| Primary CTA | `#1a1f26` | `#ffffff` | メイン外部遷移（Google Map） |
| Primary hover | `#2a3344` | `#ffffff` | hover/focus |
| Secondary guide | `#ffffff` | `#1a1f26` + `1px` border | 内部 LP へ |
| Secondary hover | `#f4f6f8` | `#1a1f26` | |
| Close × | transparent | `#1a1f26` | 閉じる |
| Category 行 | — | `#5c6570` | 補助テキスト |

**禁止**

- 白ポップアップ上に `--area-accent`（`#5a6f85`）単色 CTA → コントラスト不足で見づらい
- 黒ポップアップ前提の `#fff` outline（白カードでは見えない）

`:root` にトークン化:

```css
--area-popup-cta-bg: #1a1f26;
--area-popup-cta-fg: #ffffff;
--area-popup-cta-border: #1a1f26;
```

---

## ファイル別チェックリスト

### `area-map.js`

- [ ] P1-a 委譲 + `disableClickPropagation`
- [ ] P1-d `popup.viewMap` / `viewMapAria` 文言更新
- [ ] `buildPopupHtml` — CTA class 維持、構造変更なし可

### `area-map.css`

- [ ] P1-b 白カード + 黒枠 + `border-radius: 0`
- [ ] P1-c ボタン角張り・細身
- [ ] P1-e トークン表どおり配色
- [ ] `.leaflet-popup-tip` を白+枠に合わせる

### ドキュメント

- [ ] `area_map_ux_spec.md` §5.2 トークン表を白カード版に更新
- [ ] `area_map_ux_eval.md` に P1 ジャーニー行追加

---

## L3 完了条件

| # | 確認 |
|---|------|
| 1 | standalone + embed で × が毎回閉じる |
| 2 | ポップアップが白地・1.5px 黒枠・角丸なし |
| 3 | CTA ラベルに「Google マップ」/「Google Maps」が含まれる |
| 4 | CTA は黒地白字・secondary は白地黒枠で 375px でも読める |
| 5 | BKKDW と並べて **細い角張りボタン**（スクリーンショット添付推奨） |

```bash
cd guides && node scripts/sync.mjs && npm run dev
# /area-map.html?resort=biei&layers=food,anchor
# /biei/nearby-food.html
```

---

## 依頼文（コピペ）

### L2 Implementer

```
@resort-template-implementer
docs/mock-assets/area_map_p1_popup_handoff.md に従いポップアップを修正してください。

P0: × クローズが効かない（イベント委譲 + disableClickPropagation）。
P0: ポップアップを白地・黒枠・角丸なしに変更。
P1: CTA/サブボタンを BKKDW 型の細い角張りボタンに。文言は「Google マップで開く →」に統一。配色は handoff のコントラスト表どおり。

完了後 guides/scripts/sync.mjs、area_map_ux_spec.md §5.2、area_map_ux_eval.md を更新。
```

### L3 評価

```
area_map_p1_popup_handoff.md の L3 完了条件 1–5 を guides.japowserch.com で実機確認し、area_map_ux_eval.md に P1 PASS/FAIL を記録。× が1回でも効かなければ FAIL。
```
