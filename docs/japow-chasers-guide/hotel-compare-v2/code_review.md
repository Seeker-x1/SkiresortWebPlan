# Hotel Compare v2 — Code Review（P7 · code-reviewer）

**日付:** 2026-09-03  
**対象:**

- `docs/japow-chasers-guide/preview-kit/hotel-compare.html`
- `JAPOWSERCH/tools/hotel-compare/index.html`
- `JAPOWSERCH/tools/hotel-compare/discover-cars.json`（参照）

---

## 総合判定: **PASS**（Critical / High 0）

---

## Critical — なし

---

## High — なし

---

## Medium

### M1 — `initAff()` の fetch パスが preview-kit では常に 404

**場所:** L886–893（preview-kit）

```javascript
if (shortlistBase.startsWith("./") || shortlistBase.startsWith("../")) {
  fetch("./affiliate-config.json")
}
```

preview-kit の shortlist base は `../../../configs/...` のため条件に入り、`./affiliate-config.json`（preview-kit 直下）は存在しない → インライン `AFF` にフォールバック。**意図どおり動作**するが、preview でも本番 config を試すなら meta `hotel-compare-affiliate-config` を追加する余地あり。

**判定:** 許容（本番 JAPOW は `./affiliate-config.json` が存在 · `--sync` 済み）。

### M2 — `discoverCarsHref` の fallback `aAid`

**場所:** L643–647

`discoverCarsConfig` が null でも `Jaapowsearch` を fallback。mobility リンクは config 欠落時に出さないため **実害なし**。config 内 `aAid` を正とする設計は維持。

---

## Low

### L1 — JAPOW / preview 差分は head のみ（意図通り）

| 差分 | preview-kit | JAPOWSERCH |
|------|-------------|------------|
| GA | なし | `ga-config.js` · `analytics.js` |
| shortlist base | `../../../configs/affiliates/hotel-shortlists/` | `./shortlists/` |
| discover-cars | `../../../configs/affiliates/discover-cars.json` | `./discover-cars.json` |

body · style · script ロジックは同期済み（P6 トークン修正後）。

### L2 — `file://` プレビュー時の fetch

ローカル `file://` では shortlist / discover-cars の fetch が CORS で失敗する場合あり。**本番 `https://japowsearch.com/tools/hotel-compare` では問題なし**。開発時はローカル HTTP サーバー推奨。

### L3 — `--navy-light` 未使用

`:root` で定義（L26）するが CSS 内未参照。削除可能だが japow パレット保全のため残置可。

---

## セキュリティチェックリスト

| 項目 | 結果 | 根拠 |
|------|------|------|
| XSS / `innerHTML` | **PASS** | 宿データは `createElement` + `textContent` / `setAttribute` のみ |
| URL `encodeURIComponent` | **PASS** | `qs()` L574–578 |
| 空 `aid` / `cid` | **PASS** | `qs` が空値除外 · `if (AFF.agodaCid)` ガード |
| official / tripcom パラメータ | **PASS** | JSON URL をそのまま `href` に設定 |
| Discover Cars | **PASS** | `URL` API + `a_aid` のみ追加 |
| `rel="noopener noreferrer"` | **PASS** | 外部リンク全件（`makeExternalLink` L654–655 · bulk L451–456） |
| `target="_blank"` | **PASS** | 外部リンク統一 |

---

## アフィリエイト URL 検証（静的）

| 種別 | 検証 |
|------|------|
| Booking bulk（AFF 空） | `aid` クエリなし ✓ |
| Agoda bulk（AFF 空） | `cid` クエリなし ✓ |
| Discover Cars AKJ | `?a_aid=Jaapowsearch` ✓ |
| official（hakuba Maruishi） | クエリなし ✓ |
| tripcom | クエリなし ✓ |

---

## 日付・タイムゾーン

- デフォルト日付: `Date.UTC(2027, 0, 16)` — `<input type="date">` にはローカル TZ で表示されるが ISO 文字列は UTC 基準で一貫。**既知の軽微挙動**（v1 から継承）。

---

## 修正必須项

**なし** — P8 deploy 可。

---

## P6 連携メモ

P6 評価時に `--accent2-border` トークン化を実施（V3 PASS 化）。本レビュー時点で preview-kit / JAPOWSERCH 双方に反映済み。
