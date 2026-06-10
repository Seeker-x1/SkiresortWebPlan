# アワード水準 タイポグラフィ・デザインシステム

**テーマ**: 七戸町営スキー場（町営スキー場テンプレートの基準案件）  
**目的**: Awwwards / FWA 級の視覚的インパクトとタイポグラフィ品質を、実装可能なトークンとして固定する。  
**実装CSS**: `web/src/styles/award-design-system.css`  
**完成プレイブック**: `agents/AWARD_COMPLETION_PLAYBOOK.md`

---

## ステップ1 — 3つのアプローチ比較

### A. タイポグラフィ主導・エディトリアル Alpine（推奨候補）

| 項目 | 内容 |
|------|------|
| コンセプト | Wallpaper* / Zermatt 系。巨大ディスプレイ文字＋贅沢な余白＋雪山写真が主役。 |
| 長所 | ジャンプ率で一瞬で差別化。日本語の改行制御と共存しやすい。町営の誠実さを損なわない。 |
| 短所 | 写真品質に依存。実装工数は中程度。 |

### B. ブルータリズム・スノーインダストリアル

| 項目 | 内容 |
|------|------|
| コンセプト | 太枠・モノスペース・高コントラスト。リフト券・標高数値を工業的に見せる。 |
| 長所 | 記憶に残る。データ（積雪・運行）の視認性が高い。 |
| 短所 | 公共・自治体文脈では攻撃的すぎる。高齢者・ファミリー層に不親切になりやすい。Awwardsは取れてもCVが下がるリスク。 |

### C. 超ミニマル・スノーホワイト

| 項目 | 内容 |
|------|------|
| コンセプト | 白95%・線1%・文字4%。LAAX に近い静謐さ。 |
| 長所 | 実装が速い。クリーンで信頼感。 |
| 短所 | AIテンプレと区別がつきにくい。「アワード級の驚き」に欠ける。差別化が弱い。 |

---

## ステップ2 — 選定アプローチ

**選定: A — タイポグラフィ主導・エディトリアル Alpine**

**理由**

1. **ジャンプ率**で Display/H1 と Body のコントラストを最大化でき、アワード審査で評価される「第一印象」に直結する。  
2. **和文の改行制御**（`EditorialTitle` / `displayLines`）と両立し、七戸案件で既に発生した「場」孤立問題を設計で防げる。  
3. Whistler / Zermatt が持つ「山のスケール感」を、黒ベースに頼らず**白＋写真＋巨大タイポ**で再現できる。  
4. B2C（地元・ファミリー）と訴求（トランジット・パウダー）の両方に、過度に尖りすぎず届く。

---

## ステップ3 — タイポグラフィ仕様書

### フォントペアリング（Google Fonts）

| 役割 | フォント | ウェイト | 用途 |
|------|----------|----------|------|
| **Display EN** | [Syne](https://fonts.google.com/specimen/Syne) | 600, 700, 800 | Eyebrow、英語見出し、ナビラベル、統計ラベル |
| **Body / Display JP** | [Noto Sans JP](https://fonts.google.com/specimen/Noto+Sans+JP) | 400, 500, 600, 700 | 和文見出し・本文・UI |
| **Data / Time** | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Sans+Mono) | 400, 500 | 積雪cm、更新時刻、気温（tabular nums） |

**ペアリング思想**: Syne の幾何学的な「山の稜線」感と、Noto Sans JP の可読性。データは Plex Mono で「計測値」の信頼感を付与。

### タイプスケール（モバイル基準 → `clamp` で拡張）

| トークン | size (clamp) | weight | line-height | letter-spacing | 用途 |
|----------|--------------|--------|-------------|----------------|------|
| `--text-display-mega` | `clamp(2.75rem, 11vw, 6rem)` | 600 | 1.0 | -0.045em | リゾート名 H1 |
| `--text-display-xl` | `clamp(2.125rem, 7vw, 4rem)` | 600 | 1.02 | -0.04em | セクション H2 |
| `--text-stat-mega` | `clamp(3.25rem, 16vw, 7.5rem)` | 500 | 0.92 | -0.05em | 営業状態・積雪 |
| `--text-heading-md` | `clamp(1.25rem, 3.5vw, 1.75rem)` | 600 | 1.15 | -0.025em | H3 |
| `--text-body` | `1rem` | 400 | 1.75 | 0.02em | 本文 |
| `--text-lead` | `clamp(0.9375rem, 2.5vw, 1.125rem)` | 400 | 1.85 | 0.01em | リード |
| `--text-whisper` | `0.8125rem` | 500 | 1.65 | 0.03em | ラベル・補足 |
| `--text-eyebrow` | `0.625rem` | 600 | 1.2 | 0.2em | EN eyebrow（Syne） |

### 和文改行ルール（必須）

- `line-break: strict` / `word-break: keep-all` / `text-wrap: balance`
- リゾート名は `resort.displayLines` で**意図的改行**（例: `["七戸町営", "スキー場"]`）
- **1文字ぶら下がり禁止**（`splitEditorialLines` / `EditorialTitle`）

### スペーシングスケール

| トークン | 値 | 用途 |
|----------|-----|------|
| `--space-section` | `clamp(5rem, 14vw, 9rem)` | セクション間 |
| `--space-block` | `clamp(2rem, 6vw, 4rem)` | ブロック間 |
| `--space-inline` | `clamp(1.25rem, 4vw, 3rem)` | 水平パディング |

### カラー（スノーホワイト基調）

| トークン | 値 |
|----------|-----|
| `--color-bg` | `#f8f9fb` |
| `--color-fg` | `#141a26` |
| `--color-muted` | `#64748b` |
| `--color-accent` | `#0b5f8c` |

### マイクロインタラクション（アワード演出・1案）

**スクロール連動タイポグラフィ・スケール**

- ヒーローの `.award-hero-title` がスクロールに応じて `scale(1 → 0.92)` と `letter-spacing` がわずかに締まる。
- CSS `animation-timeline: scroll()` + JS 不要の progressive enhancement。
- 非対応ブラウザでは静止表示（劣化なし）。

---

## ステップ4 — 実装マップ

| ファイル | 内容 |
|----------|------|
| `web/src/styles/award-design-system.css` | トークン・タイポ・余白・スクロール演出 |
| `web/src/components/EditorialTitle.tsx` | 和文見出し改行 |
| `web/src/lib/typography.ts` | 改行ロジック |
| `agents/13-*.prompt.md` | タイポグラフィ監修エージェント |
| `agents/14-*.prompt.md` | モーション・マイクロインタラクション |
| `agents/15-*.prompt.md` | ロールアウト・QA・完成判定 |

---

*本仕様はエージェント05（一般UI）よりタイポグラフィ面で優先される。色・アクセシビリティの最終判断は05と協議。*
