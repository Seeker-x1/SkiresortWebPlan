# スキー場Webテンプレート — 最終実装要件

> **resort-design-director** | v2: 2026-06-07  
> 入力: `docs/design_concepts.md` v2（ベンチマーク 3 + 七戸パレット）  
> 出力: フロントエンド実装エージェント向け確定仕様  
> **ユーザー承認**: 本 v2 をパイプライン実行の承認基準とする

---

## Self-Critique（自己批評）

### 案A「Avalanche Immersion」の批評

**美しさ**: シネマティックヒーローと雪粒子は感情喚起力が高く、アワード審査の「第一印象」では最も強い。  
**モバイルUX**: 全画面動画・パララックスはデータ通信量とGPU負荷が大きく、地方の電波不安定エリアでは体験が破綻する。ボトムナビ＋全画面ヒーローの組み合わせはスクロール量が増え、チケット導線が3タップを超えやすい。  
**汎用性**: 映像素材の質に強く依存。写真1枚の小規模ゲレンデでは「盛っただけ」に見える。全国テンプレートとしての再現性が低い。

**判定**: 没入感の**要素だけ**を採用し、構造全体は採用しない。

---

### 案B「Alpine Clarity」の批評

**美しさ**: 編集デザイン・余白・タイポグラフィの三位一体は、LAAX / スイス系リゾートサイトと同系統の「信頼できる美しさ」を担保する。派手さは控えめだが、アワードでは情報設計部門で高評価を得やすい。  
**モバイルUX**: Bentoグリッド＋ステータスチップ＋2列CTAは、親指ゾーン内で主要アクションを完結できる。LCP・CLS・INP すべて良好な設計。  
**汎用性**: データ差し替えだけで小〜大規模リゾートに対応可能。色トークンと写真の差し替えでブランド個性を出せる。

**判定**: **ベース構造として採用**。

---

### 案C「Powder Pulse」の批評

**美しさ**: SNS世代向けには刺さるが、ネオングラデ＋ガラスモーフィズムは2024–2025のトレンド追随に留まり、5年後のテンプレートとして陳腐化リスクが高い。  
**モバイルUX**: スナップスクロールは発見性に優れる一方、料金表・アクセスなど「探す」情報の発見コストが上がる。WCAG AA 達成に追加コストがかかる。  
**汎用性**: ブランドトーンのミスマッチが最も起きやすい。家族向け・教育旅行向けゲレンデには不向き。

**判定**: 不採用。ライブカウンターの**数値アニメーション**のみ案Bに移植。

---

## 最終決定: 「Alpine Clarity+」v2（七戸エディション）

**案Bを骨格とし、v2 ベンチマーク（LAAX / ニセコ / Awwwards）から以下を追加:**

| v2 追加 | 根拠サイト | 実装 |
|---------|-----------|------|
| ライブステータス 3 カラムバー | LAAX | `LiveStatusStrip` リデザイン |
| Syne ディスプレイフォント | Awwwards 系 | 見出しのみ `next/font` |
| IBM Plex Mono 数値 | Awwwards 系 | 積雪・料金 |
| 七戸パレット | 七戸町営 | `globals.css` トークン差し替え |
| 権利済みヒーロー SVG | ニセコ（実写原則） | `/images/hero-sichinohe.svg` |

**案Bを骨格とし、案Aから以下のみ借用するハイブリッド:**

| 借用要素（案A） | 適用方法 |
|----------------|----------|
| ヒーロー微ズーム | `scale 1→1.04`、12s ease-out、**一方向のみ**（往復・ループ禁止） |
| 雪の奥行き感 | CSSグラデーションオーバーレイ（粒子は `prefers-reduced-motion` 時無効） |
| セクション入場 | Framer Motion stagger fade-up |

**案Cから借用:**

| 借用要素（案C） | 適用方法 |
|----------------|----------|
| 数値カウントアップ | 積雪cm・来場者数（任意）に `useSpring` |

---

## 技術スタック（確定）

| レイヤ | 選定 | バージョン目安 |
|--------|------|----------------|
| フレームワーク | Next.js App Router | 16.x |
| UI | React | 19.x |
| スタイル | Tailwind CSS | 4.x |
| アニメーション | Framer Motion | 11.x |
| 言語 | TypeScript | 5.x |
| フォント | Syne（display）+ DM Sans + Noto Sans JP + IBM Plex Mono（数値） | — |

---

## ディレクトリ構成（確定）

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト・フォント・メタ
│   ├── page.tsx            # トップページ（セクション組み立て）
│   └── globals.css         # デザイントークン・Tailwind
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   └── MobileBottomNav.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── LiveStatusStrip.tsx
│   │   ├── PrimaryCtaBand.tsx
│   │   ├── BentoExploreGrid.tsx
│   │   ├── TicketPricing.tsx
│   │   ├── NewsSection.tsx
│   │   └── AccessSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── SectionHeading.tsx
│       └── AnimatedCounter.tsx
├── data/
│   └── resort-template.ts  # ★ 全リゾートデータ（差し替えポイント）
├── lib/
│   └── motion.ts           # 共通アニメーションバリアント
└── types/
    └── resort.ts           # データ型定義
```

---

## デザイントークン（確定）

```css
/* 七戸町営スキー場 v2 — design_concepts.md 参照 */
--canvas: #F7F9FB;
--ink: #1C2434;
--slate: #5A6578;
--forest: #2D5A4A;
--alpine: #2D6B7A;
--alpine-soft: #E8F3F0;
--alpine-dark: #1A4D42;
--gold: #B8862B;
--success: #2D8F5E;
--danger: #C0392B;
--border: #E2E8F0;
```

### 角丸・シャドウ
- カード: `rounded-2xl`（16px）
- ボタン: `rounded-xl`（12px）
- シャドウ: `shadow-sm` 通常 / `shadow-md` ホバー

### スペーシング
- セクション縦: `py-16` モバイル / `py-24` デスクトップ
- コンテナ: `max-w-6xl mx-auto px-4`

---

## ページ構成（トップ）

1. **SiteHeader** — スティッキー、ロゴ＋モバイルメニュー
2. **HeroSection** — 65dvh、リゾート名・キャッチ・微ズーム背景
3. **LiveStatusStrip** — LAAX 型 3 カラムメトリクスバー（`--alpine-soft` 背景、Live ラベル）
4. **PrimaryCtaBand** — 「チケット購入」「本日の運行」2列
5. **BentoExploreGrid** — コース/レッスン/宿泊/イベント 2×2
6. **TicketPricing** — 3プラン縦カード＋比較
7. **NewsSection** — 最新3件
8. **AccessSection** — 住所・営業時間・地図リンク
9. **SiteFooter** — リンク・SNS・コピーライト
10. **MobileBottomNav** — モバイルのみ固定5アイコン

---

## データ契約（`ResortTemplateData`）

各スキー場は `src/data/resort-template.ts` をコピーして差し替える。

```typescript
interface ResortTemplateData {
  meta: { name, slug, tagline, description }
  hero: { imageUrl, imageAlt, overlayLines[] }
  liveStatus: { snowDepthCm, weather, liftsOpen, liftsTotal, updatedAt }
  ctas: { primary, secondary }  // label + href
  explore: BentoItem[]          // 4件
  tickets: TicketPlan[]         // 3件
  news: NewsItem[]              // 3件
  access: { address, hours, mapUrl, transitNote }
  nav: NavItem[]
  footer: { links[], social[] }
}
```

---

## アニメーション仕様（Framer Motion）

| コンポーネント | variant | reduced-motion |
|----------------|---------|----------------|
| セクション全体 | `fadeUp` y:24→0, opacity | 即時表示 |
| Bentoカード | `staggerChildren: 0.08` | なし |
| AnimatedCounter | spring stiffness:100 | 静的数値 |
| ヒーロー背景 | CSS transform only | 静止 |

---

## アクセシビリティ要件

- [ ] すべてのインタラクティブ要素にフォーカスリング
- [ ] 画像に `alt`（データから供給）
- [ ] `prefers-reduced-motion: reduce` でアニメーション無効
- [ ] カラーコントラスト AA 準拠
- [ ] ボトムナビに `aria-current="page"`

---

## 改善点（実装時に反映）

1. **ヒーロー画像**: Unsplash の雪山プレースホルダーを使用。本番は各リゾートの写真に差し替え。
2. **i18n**: テンプレート初版は日本語固定。`next-intl` 統合は Phase 2。
3. **ダークモード**: 初版はライトのみ。スキー場は日中閲覧が主のため優先度低。
4. **地図**: `/map` 連携は既存 `resorts/Sichinohe-CyoueiSki` 側。テンプレートでは `mapUrl` リンクのみ。

---

## ビジュアル受け入れ基準（V1–V5）— `resort-visual-evaluator` 用

> 2026-06-07 追記。`resort-qa-a11y`（Q1–Q6）と **両方 PASS** でルート UI 出荷可。

### V1 タイポグラフィ

| 要素 | 仕様 |
|------|------|
| Display / H1 | `text-4xl md:text-5xl lg:text-6xl`, `font-semibold`, `tracking-tight` |
| H2（セクション） | `SectionHeading` 統一。ページ内 1 スタイル |
| Body | `text-base` / `line-height: 1.75` |
| Display フォント | 見出し・H1 に **Syne**（`.font-display`） |
| 数値 | **IBM Plex Mono** + `tabular-nums`（積雪・料金） |
| 禁止 | 全要素 `text-sm font-medium` の BBS 羅列、1 文字ぶら下がり見出し |

### V2 余白

- セクション: `py-16`（モバイル）/ `py-24`（`md+`）
- コンテナ: `max-w-6xl mx-auto px-4`
- Bento gap: `gap-4` 統一

### V3 アセット

- 七戸 v2: **`/public/images/hero-sichinohe.svg`**（プロジェクト権利済みイラスト）
- Bento サムネ: Phase 2 で実写差し替え（v2 では Unsplash 可・WARN）
- **本番出荷**: ヒーローが汎用 Unsplash のまま → **FAIL**
- ヒーロー: `hero-gradient` オーバーレイ必須、文字コントラスト AA

### V4 モーション

- スクロール reveal: `y: 24→0`, ease `[0.22, 1, 0.36, 1]`, stagger `0.08s`
- ヒーロー背景: `scale 1→1.04`, 12s ease-out、一方向（reduced-motion で停止）
- Bento hover: `y: -4`（reduced-motion で無効）

### V5 ブランド

- 色は `globals.css` トークンのみ（`--alpine`, `--gold`, `--canvas`）
- **絵文字 UI アイコン禁止**（ナビ・フィルタ・ステータス）
- トップはライト基調（`--canvas` 背景）。黒ベース全面 UI 禁止

### V6 ベンチマーク（推奨）

- `design_concepts.md` の参照 3 サイトから採用要素が 3 点以上画面で説明できること

---

## 完了条件

- [x] Self-Critique 完了
- [x] 最終案「Alpine Clarity+」決定
- [x] V1–V5 ビジュアル受け入れ基準（evaluator 用）
- [ ] `src/` 配下に全コンポーネント配置
- [x] `npm run build` が通る
- [x] `resort-qa-a11y` + `resort-visual-evaluator` 両方 PASS（2026-06-07 v2）
