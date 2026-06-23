# LP モック — QA / a11y レポート（テンプレート canonical）

**Date:** 2026-06-23  
**Evaluator:** `resort-qa-a11y` (L3)  
**対象:** `docs/mock-assets/sichinohe-lp/`（`transit-onsen` アーキタイプの canonical テンプレ）  
**基準:** [lp_mock_requirements.md](./lp_mock_requirements.md) LP-Q1–Q6

---

## Verdict

**PASS**（テンプレート L3 ゲート達成 — 新規施設は本テンプレ PASS 後に複製）

---

## 機械検証

| スクリプト | 結果 |
|------------|------|
| `validate-mock-i18n.mjs` | exit 0（sichinohe-lp 51 keys） |
| `validate-mock-html-i18n.mjs` | exit 0（69 HTML keys） |
| `validate-mock-lp-shell.mjs` | exit 0（id=sichinohe, map link OK） |

---

## ルーブリック（LP-Q1–Q6）

| ID | 結果 | 根拠 |
|----|------|------|
| **LP-Q1** Mobile-first | **PASS** | `.btn` / lang-switch `min-height: 44px`。`.inner` + `clamp` 横 padding。ヒーロー `clamp` タイトル。 |
| **LP-Q2** Accessibility | **PASS** | `_shared/mock-i18n.css` に `a/button:focus-visible`。lang `aria-current`。`mock.css` `prefers-reduced-motion`。装飾ヒーロー `alt=""`、コンテンツ画像 `data-i18n-attr="alt:..."`。 |
| **LP-Q3** Strategy conversion | **PASS** | 戦略「新幹線10分・温泉」→ `transit` セクション + paths（今日/アクセス/マップ/温泉）。ヒーロー CTA「今日の運営」。 |
| **LP-Q4** i18n | **PASS** | 3 検証スクリプト exit 0。`data-mock-resort="sichinohe"`。HTML 直書きなし。 |
| **LP-Q5** Performance | **PASS** | ヒーロー `width`/`height` 指定。無限ループアニメなし。静的モックスコープ。 |
| **LP-Q6** Data separation | **PASS** | コピーは `messages/*.json`。施設名・住所は JSON のみ。`registry.json` strategy と整合。 |

---

## 修正ログ（テンプレートゲート設置時）

| 問題 | 修正 | 結果 |
|------|------|------|
| 共有 CSS に nav/CTA の focus-visible が無い | `_shared/mock-i18n.css` に global `a/button:focus-visible` 追加 | LP-Q2 **PASS** |

---

## WARN（出荷ブロック外）

| 項目 | 内容 |
|------|------|
| W1 | `messages` に 2 unused keys（予約キー — 許容） |
| W2 | モバイルで `.nav` 非表示 — 導線は paths タイルで補完（意図通り） |

---

## Ship gate

```
validate-mock-*.mjs exit 0
  + resort-qa-a11y PASS (LP-Q1–Q6)  ← 本レポート
  + resort-visual-evaluator PASS (lp_qa_visual.md)
  + Human Gate（公開前）
→ 新規 {id}-lp は sichinohe-lp 複製後、施設別レポート追記可
```

**本レポート:** ✅ PASS — LP テンプレート canonical 監査完了
