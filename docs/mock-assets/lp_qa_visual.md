# LP モック — ビジュアル QA レポート（テンプレート canonical）

**Date:** 2026-06-23  
**Evaluator:** `resort-visual-evaluator` (L3)  
**対象:** `docs/mock-assets/sichinohe-lp/mock.css`, `index.html`  
**基準:** [lp_mock_requirements.md](./lp_mock_requirements.md) LP-V1–V6  
**Canonical:** 他 `transit-onsen` 系 LP の複製元

---

## Verdict

**PASS**

---

## ルーブリック（LP-V1–V6）

| ID | 結果 | 根拠 |
|----|------|------|
| **LP-V1** タイポグラフィ階層 | **PASS** | `.hero-title` Syne + clamp。`.heading-lg` セクション統一。`.eyebrow` uppercase。`.font-mono` 積雪数値。 |
| **LP-V2** 余白リズム | **PASS** | `--section: clamp(5rem, 14vw, 9rem)`。`.inner` max-width 72rem。transit-grid / path-grid gap 一貫。 |
| **LP-V3** ビジュアルアセット | **PASS** | `lp-mock-powder-champion.png` 施設向け生成ヒーロー。`.hero-overlay` でコピー可読。transit 画像に i18n alt。 |
| **LP-V4** マイクロインタラクション | **PASS** | `.btn-primary:hover` translateY + shadow。`.path-tile` hover。`prefers-reduced-motion` で transition 抑制。 |
| **LP-V5** ブランド一貫性 | **PASS** | `:root` `--bg/#f8f9fb`, `--accent/#0b5f8c`, `--fg/#141a26`。CTA は `--fg` ベース。絵文字アイコンなし。ライト基調。 |
| **LP-V6** アーキタイプ整合 | **PASS** | `transit-onsen`: hero → transit → paths → highlights → onsen → guides。不要 live-strip なし。 |

---

## ブロッカー

なし（LP-V1・LP-V5 とも PASS）

---

## WARN

| 項目 | 内容 |
|------|------|
| W1 | 他アーキタイプ（`corridor-hub`, `live-dashboard` 等）は別 canonical で追加 L3 が必要 |

---

## Ship gate

```
resort-qa-a11y PASS (lp_qa_report.md)
  + resort-visual-evaluator PASS ← 本レポート
→ transit-onsen テンプレ複製・新規施設 LP 開始可
```

**本レポート:** ✅ PASS — LP テンプレート canonical ビジュアル監査完了
