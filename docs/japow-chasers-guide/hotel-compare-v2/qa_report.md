# Hotel Compare v2 — QA Report（P5 · resort-qa-a11y）

**日付:** 2026-09-03  
**対象:** `docs/japow-chasers-guide/preview-kit/hotel-compare.html`  
**基準:** [final_requirements.md](./final_requirements.md) Q1–Q6 · 3 ハブ  
**評価回:** **2**（P4 修正後再実行）

---

## 総合判定: **PASS**

初回 FAIL（4 点差し戻し）→ P4 修正 → 再評価 **6/6 PASS**。

### P4 修正内容（再評価前）

| # | 修正 |
|---|------|
| 1 | `updateHubUi()` — 現在地 hub に `aria-current="page"` |
| 2 | `updateDateFieldState()` — invalid 時 `aria-invalid` + `aria-describedby="dates-error"` |
| 3 | `clearCitySearch()` — shortlist load 失敗時 city 段落・bulk リンクをリセット |
| 4 | `#mobility-error` — discover-cars fetch 失敗時（旭川/湯沢）`role="alert"` で通知 |

同期: `JAPOWSERCH/tools/hotel-compare/index.html`（GA + meta パス差分のみ）

---

## Q1 モバイル — **PASS**

| チェック | 結果 | 根拠 |
|----------|------|------|
| 横スクロール | PASS | `html, body { overflow-x: clip; }` |
| グリッド | PASS | `minmax(0, 1fr)` on `.date-grid` |
| Hub 1 行 | PASS | `white-space: nowrap` on hub links |
| 宿 chip 行 | PASS | flex-wrap · `aria-label` で SR 上の区別あり |

---

## Q2 キーボード — **PASS**

| チェック | 結果 | 根拠 |
|----------|------|------|
| Tab 順序 | PASS | header → hub → dates → city → entries → mobility → footer |
| `:focus-visible` | PASS | 全局 `a` · フォーム input/select |
| 無効リンク | PASS | `tabindex="-1"` + `aria-disabled="true"` when dates invalid |

---

## Q3 スクリーンリーダー — **PASS**

| チェック | 結果 | 根拠 |
|----------|------|------|
| フォーム label | PASS | 4 フィールドすべて `for`/`id` |
| セクション | PASS | `aria-labelledby` on all sections |
| 動的更新 | PASS | `#entries` `aria-live="polite"` · errors `role="alert"` |
| Hub 現在地 | PASS | `aria-current="page"` on current hub（L851–857） |
| 日付エラー | PASS | `aria-invalid="true"` + `aria-describedby="dates-error"` on checkin/checkout（L604–613） |
| 行リンク | PASS | `aria-label="Book {name} on …"` |
| Mobility エラー | PASS | `#mobility-error` `role="alert"` when config missing |

---

## Q4 コントラスト — **PASS**

| 組み合わせ | 比率 |
|------------|------|
| `#e8edf3` on `#0b1628` | 15.38:1 |
| `#8aa0b8` on `#0b1628` | 6.73:1 |
| `#4dd9c4` on `#0b1628` | 10.38:1 |
| `#f5a623` on `#0b1628` | 8.93:1 |

（初回 P5 と同じ Node 計算 · WCAG AA 充足）

---

## Q5 導線と状態 — **PASS**

| 状態 | 結果 | 根拠 |
|------|------|------|
| checkout ≤ checkin | PASS | `#dates-error` + disabled links + ARIA |
| shortlist fetch 失敗 | PASS | `#load-error` · `#entries` クリア · **`clearCitySearch()`**（L878） |
| discover-cars fetch 失敗 | PASS | 旭川/湯沢: `#mobility` 表示 · intro + **`#mobility-error`**（L795–800） |
| 白馬 mobility なし | PASS | `!spec` → `#mobility hidden` |

---

## Q6 アフィリエイトの誠実さ — **PASS**

| チェック | 結果 |
|----------|------|
| official / tripcom 無パラメータ | PASS |
| Agoda / Booking 空 CID/AID | PASS |
| Discover Cars `a_aid=Jaapowsearch` | PASS |
| 開示文・city 段落 | PASS |
| 捏造 stat | PASS（0） |

---

## ハブ別

| Hub | mobility | 備考 |
|-----|----------|------|
| asahikawa | AKJ + Station | config OK 時リンク 2 本 |
| hakuba | 非表示 | ユーザー決定どおり |
| yuzawa | 湯沢駅 1 本 | — |

---

## 次ステップ

→ **P6** resort-visual-evaluator  
→ **P7** code-reviewer  
→ **P8** sync / deploy（P6+P7 PASS 後）

---

## 履歴

| 回 | 判定 | 備考 |
|----|------|------|
| 1 | FAIL | Q3 · Q5 — 4 点差し戻し |
| 2 | **PASS** | 本レポート |
