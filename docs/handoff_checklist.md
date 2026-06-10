# 実装チェックリスト — Alpine Clarity+ v2（七戸）

> **resort-spec-handoff** | 2026-06-07  
> 入力: `final_requirements.md` v2, `design_concepts.md` v2  
> 実装者: `resort-template-implementer`

---

## エージェントチェーン

| 段階 | エージェント | 状態 |
|------|-------------|------|
| L1 | resort-ux-designer | ✅ design_concepts.md v2 |
| L1 | resort-design-director | ✅ final_requirements.md v2 |
| 承認 | ユーザー | ✅ パイプライン依頼により承認 |
| L1→L2 | resort-spec-handoff | ✅ 本ファイル |
| L2 | resort-template-implementer | ✅ 完了 |
| L3 | resort-qa-a11y | ✅ PASS — `docs/qa_report.md` |
| L3 | resort-visual-evaluator | ✅ PASS — `docs/qa_report_visual.md` |

---

## 変更ファイル

| パス | 内容 |
|------|------|
| `public/images/hero-sichinohe.svg` | 権利済みヒーローイラスト |
| `src/app/globals.css` | 七戸トークン、`.font-display`、`.live-pulse`、`hero-gradient` |
| `src/app/[locale]/layout.tsx` | Syne + IBM Plex Mono |
| `src/app/[locale]/page.tsx` | `main id="main-content"`、スキップリンク用 |
| `src/components/layout/SiteHeader.tsx` | スキップリンク（任意） |
| `src/components/sections/HeroSection.tsx` | `.font-display`、tagline |
| `src/components/sections/LiveStatusStrip.tsx` | LAAX 型 3 カラムバー |
| `src/components/ui/SectionHeading.tsx` | `.font-display` on h2 |
| `src/components/ui/AnimatedCounter.tsx` | mono フォント |
| `src/data/resort-template.ts` | ヒーロー SVG パス、slug |
| `messages/ja.json`, `messages/en.json` | 七戸町営コピー |

## 対象外

- `resorts/Sichinohe-CyoueiSki/web/` マップ UI（別艦隊）
- Bento 画像の実写差し替え（Phase 2）
- LAAX 3D マップ

---

## 受け入れ基準

### Q1–Q6（resort-qa-a11y）

- [ ] タッチ 44px、safe-area、375px 横スクロールなし
- [ ] フォーカスリング維持
- [ ] reduced-motion 維持
- [ ] i18n 維持
- [ ] `npm run build` PASS

### V1–V6（resort-visual-evaluator）

- [ ] V1: Syne on H1/H2、ジャンプ率
- [ ] V2: `py-16`/`py-24` 統一
- [ ] V3: ヒーロー `/images/hero-sichinohe.svg`（Unsplash 不使用）
- [ ] V4: motion spec 維持
- [ ] V5: トークン色のみ、絵文字なし
- [ ] V6: LAAX バー + 非対称 Bento + 微ズームが説明可能

---

## 完了時

```
Invoke: resort-qa-a11y AND resort-visual-evaluator
Do not self-approve.
```
