# アワード水準デザイン — 完成までのプレイブック

七戸町営スキー場をパイロットに、**テンプレート横展開可能**なデザイン品質まで導く手順。

---

## フェーズ0 — 基盤（完了済み項目 ✓）

| 項目 | 状態 | 参照 |
|------|------|------|
| デザインシステム仕様 | ✓ | `AWARD_TYPOGRAPHY_DESIGN_SYSTEM.md` |
| CSSトークン | ✓ | `web/src/styles/award-design-system.css` |
| 和文改行 | ✓ | `EditorialTitle` + `displayLines` |
| トップ再設計 | ✓ | `home/CinematicHero` 他 |
| エージェント13〜15 | ✓ | 本ディレクトリ |

---

## フェーズ1 — タイポグラフィ統一（エージェント13）

**依頼例**: `REGISTRY 13 で today / tickets / access のタイポ監修とパッチ`

| # | タスク | 完了条件 |
|---|--------|----------|
| 1.1 | `layout.tsx` に Syne + IBM Plex Mono 読み込み | フォント変数がCSSで参照可能 |
| 1.2 | eyebrow を Syne に統一 | ENラベルがディスプレイフォント |
| 1.3 | 積雪・時刻を `.award-stat-mono` に | 数値のtabular感 |
| 1.4 | 下層ページの `dark:` クラス除去 | ライトのみ |
| 1.5 | 各ページ「主役1要素」定義 | 監修メモ1行/ページ |

---

## フェーズ2 — モーション（エージェント14）

**依頼例**: `REGISTRY 14 で hero スクロール演出を CinematicHero に適用`

| # | タスク | 完了条件 |
|---|--------|----------|
| 2.1 | `.award-hero-scroll` をヒーローに付与 | scroll() 対応ブラウザで動作 |
| 2.2 | `prefers-reduced-motion` でアニメ無効 | a11y OK |
| 2.3 | （任意）第2演出を1つのみ追加 | CLS < 0.1 維持 |

---

## フェーズ3 — 全ページロールアウト（エージェント15 + 06）

**依頼例**: `REGISTRY 15 で進捗表と次の3タスク`

```
優先順:
today → live-cams → faq → access → tickets-rental → courses → map → news → contact → plan/*
```

各ページで満たすこと:

- [ ] SectionHeader / EditorialTitle 使用
- [ ] 詳細は RevealPanel または details
- [ ] `--space-section` 相当の余白
- [ ] 均等カード羅列なし

---

## フェーズ4 — リリース判定

| チェック | 方法 |
|----------|------|
| ビルド | `cd web && npm run build` |
| Lint | `npm run lint` |
| 375px 改行 | 七戸町営 / スキー場 の2行表示 |
| Lighthouse | Performance 90+ / A11y 95+ |
| 実機 | iPhone Safari でヒーロー・折りたたみ |

---

## エージェント呼び出し早見

| 目的 | ID |
|------|-----|
| タイポ・余白・改行の監修 | **13** |
| スクロール演出・モーション | **14** |
| 全ページ適用・完成QA | **15** |
| コード実装 | **06** |
| コピー・多言語 | **03** |
| 一般UI・アクセシビリティ | **05**（13と競合時は13優先） |

---

## 並列例

- **13 + 03** — タイポ監修と英語コピー同時
- **14 + 06** — モーション実装（06がコード化）
- **15** — 各フェーズ末のゲートキーパー
