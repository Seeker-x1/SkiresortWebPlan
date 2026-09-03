# Hotel Compare v2 — Visual QA（P6 · resort-visual-evaluator）

**日付:** 2026-09-03  
**対象:** `docs/japow-chasers-guide/preview-kit/hotel-compare.html`  
**基準:** [final_requirements.md](./final_requirements.md) V1–V6 · hallmark slop-test gates  
**Macrostructure 指定:** **02 · Long Document**（Field Memo）

---

## 総合判定: **PASS**

P6 評価中に V3 トークン違反 1 件（`.link-chip--trip` の `:root` 外 `rgba`）を検出 → **`--accent2-border` トークン化で修正済み** → 再 grep PASS。

---

## Pre-emit critique スタンプ

```css
/* Hallmark · macrostructure: Long Document · genre: editorial · pre-emit critique: P5 H4 E5 S5 R5 V5 */
```

| 軸 | 目標 | 実装 | 判定 |
|----|------|------|------|
| P Philosophy | 5 | ガイド shortlist 予約メモ | ✓ |
| H Hierarchy | 4 | 日付 → city → 宿 → 移動 → 開示 | ✓ |
| E Execution | 5 | japow トークン · focus ring | ✓ |
| S Specificity | 5 | hub JSON / 白馬車省略 / honest OTA | ✓ |
| R Restraint | 5 | 無画像 · 無アニメ · 無 solid 大型 CTA | ✓ |
| V Variety | 5 | 旧 table+dashboard から Long Document へ転換 | ✓ |

---

## V1 Typography — **PASS**

| チェック | 結果 | 根拠 |
|----------|------|------|
| h1 のみ display face | PASS（意図的例外あり） | `h1` → `var(--font-display)`（L133–138）。`.brand` も display（L92）— **N1 wordmark + V6 japowsearch 連続性**として final_requirements で許容 |
| 見出し roman | PASS | `h1`, `h2`, `.hotel-entry__title` すべて `font-style: normal` |
| 2+1 フォント | PASS | Noto Sans + DM Serif Display のみ（Space Mono なし） |
| サイズ階層 | PASS | h1 `clamp` · h2 `1.05rem` · meta `0.75rem` uppercase · body `1rem` |

---

## V2 Spacing & Rhythm — **PASS**

| チェック | 結果 | 根拠 |
|----------|------|------|
| セクション余白 | PASS | `--space-section: 2rem` + hairline `--rule` 区切り（L170–174） |
| 読み幅 | PASS | `.lede`, entries, city, foot → `max-width: var(--measure)`（62ch） |
| AI 均一グリッド回避 | PASS | 3-column feature row なし · 単列 Long Document |
| 宿エントリ rhythm | PASS | 番号付き `ol` · エントリ間 `1.75rem` + hairline |

---

## V3 Token Purity — **PASS**

grep（`:root` 外の hex / rgb / font-family 直書き）:

```
--navy 〜 --rule, --font-* — すべて :root L23–38 のみ
```

修正: L340 `rgba(245,166,35,0.45)` → `var(--accent2-border)`（`:root` L33 で定義）。

---

## V4 Restraint — **PASS**

| 禁止项 | 結果 |
|--------|------|
| 背景グラデーション | なし |
| グロー / box-shadow | なし |
| 絵文字 | なし |
| 偽ブラウザ枠 | なし |
| solid 大型 CTA（旧 `.bulk`） | 削除済み · chip + underline link のみ |
| `transition-all` / hover scale | なし（color/border 0.15s のみ） |
| italic 見出し | なし |

Accent 面積: リンク · current hub · focus ring · OTA chip border —  viewport 3% 未満。

---

## V5 Structural Identity — **PASS**

| Long Document 要件 | 実装 |
|--------------------|------|
| マーケ hero → 3 feature → CTA リズム | **なし** |
| Inline section heads | `Your week` / `Search the city` / `Guide shortlist` / `Getting around` |
| Hairline divider | `.section { border-bottom: 1px solid var(--rule) }` |
| Typographic CTA | city search は underline link · 宿は outline chip |
| 番号 eyebrow 横並び（gate 54） | **なし** — 番号は宿タイトルのみ（`01. OMO7…`） |
| 画像 | なし |

現行 v1（pill tabs + table + solid bulk）との **構造的差分** 明確。

---

## V6 Brand Continuity — **PASS**

| チェック | 結果 |
|----------|------|
| `--navy` / `--accent` / `--text-dim` | `JAPOWSERCH/index.html` L33–34 と一致 |
| フォント | Noto Sans + DM Serif（hotel-compare 既存と同型） |
| canonical | `https://japowsearch.com/tools/hotel-compare` 維持 |
| top-bar wordmark | japowsearch サイトと同系 |

---

## slop-test 抜粋（該当 gate）

| Gate | 結果 |
|------|------|
| 3-equal-column feature grid | PASS（なし） |
| Hero 100vh centered | PASS（なし） |
| Hero → 3 features template | PASS（なし） |
| Invented metrics | PASS（なし） |
| Italic headers (38a) | PASS |
| Re-drawn UI chrome (47) | PASS |

---

## 次ステップ

P5 PASS · **P6 PASS** → P7 code review → P8 deploy
