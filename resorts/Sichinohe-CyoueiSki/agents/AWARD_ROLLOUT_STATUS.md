# AWARD ロールアウト進捗（REGISTRY 15）

最終更新: 2026-06-05

## サマリー

| 区分 | 状態 |
|------|------|
| ボタン（award-btn / AwardButton） | ✅ 完了 |
| 下層ページ AwardPageShell | ✅ 完了 |
| dark: 除去（公開ページ） | ✅ 完了 |
| 折りたたみ（AwardFold） | ✅ 完了 |
| ビルド・Lint | ✅ 完了 |

---

## ページ別チェックリスト

| ページ | SectionHeader | AwardFold | 非対称レイアウト | award-btn | dark:除去 |
|--------|:-------------:|:---------:|:----------------:|:---------:|:---------:|
| `/` トップ | ✅ | ✅ RevealPanel | ✅ | ✅ | ✅ |
| `/today` | ✅ | — | ✅ 縦スタック | — | ✅ |
| `/live-cams` | ✅ | — | ✅ | — | ✅ |
| `/faq` | ✅ | ✅ | ✅ | — | ✅ |
| `/access` | ✅ | ✅ | ✅ 縦スタック | — | ✅ |
| `/tickets-rental` | ✅ | ✅ 表3種 | ✅ | — | ✅ |
| `/courses` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/map` | ✅ | — | ✅ フルビュー | ✅ | ✅ |
| `/news` | ✅ | — | ✅ タイムライン | — | ✅ |
| `/contact` | ✅ | — | ✅ 縦スタック | — | ✅ |
| `/lessons-events` | ✅ | ✅ | ✅ | — | ✅ |
| `/stay-local` | ✅ | — | ✅ オフセット | — | ✅ |
| `/lift-deals` | ✅ | ✅ | ✅ | — | ✅ |
| `/plan/transit-powder` | ✅ | — | — | ✅ | ✅ |
| `/plan/beginners-hidden-gem` | ✅ | — | — | ✅ | ✅ |
| `/plan/transit-shinkansen` | ✅ | — | — | ✅ | ✅ |

---

## コンポーネント

| コンポーネント | 状態 | 備考 |
|----------------|------|------|
| `AwardButton` | ✅ | primary / secondary / ghost |
| `AwardPageShell` | ✅ | 下層ページ共通ラッパー |
| `AwardFold` | ✅ | details ベース折りたたみ |
| `award-design-system.css` | ✅ | ボタン・表・折りたたみ |
| `SiteHeader` nav | ✅ | award-btn-ghost |
| `home/*` | ✅ | AwardButton 置換済み |
| `LiftMapViewer` | ✅ | award トークン・dark:除去 |
| `FeatureSheet` | ✅ | award-btn-primary |

---

## 主役1要素（監修メモ）

| ページ | 主役 |
|--------|------|
| today | 積雪数値（award-stat-mono） |
| live-cams | メインカメラフレーム |
| faq | カテゴリ見出し + 折りたたみ |
| access | 交通カード縦リスト |
| tickets-rental | リフト券テーブル（折りたたみ内） |
| courses | コース名折りたたみ |
| map | インタラクティブ SVG |
| news | 最新1件のタイトル |
| contact | 電話番号 |
| plan/* | タイトル + CTA |

---

## 残タスク（フェーズ4）

- [ ] Lighthouse 実測（Performance 90+ / A11y 95+）
- [ ] iPhone Safari 実機確認
- [ ] `admin` / `AutoImageSlider` の dark:（管理画面・未使用なら後回し可）
- [ ] エージェント14: hero スクロール演出の最終調整（任意）

---

## 検証コマンド

```bash
cd web && npm run build && npm run lint
```
