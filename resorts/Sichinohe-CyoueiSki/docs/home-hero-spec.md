# トップヒーロー体験仕様 — `/` `CinematicHero`

> **L1 体験仕様** | 2026-06-09  
> **エージェント**: 01 `information-architecture` + 05 `design-accessibility`  
> **親 IA**: [`agents/SITE_SKELETON_AND_IA.md`](../agents/SITE_SKELETON_AND_IA.md)  
> **写真ブリーフ**: [`docs/asset_brief.md`](../../docs/asset_brief.md)  
> **マップ資産分離**: [`docs/map_integration_spec.md`](../../docs/map_integration_spec.md) §5  
> **マップ UI 正本**: [`map-interaction-spec-g6.md`](./map-interaction-spec-g6.md)（`/map` は別トラック）  
> **コード禁止。** 実装は `06-implementation-engineering` が **本書承認後** のみ。

---

## 0. スコープ

| 対象 | 本書で固定 | 対象外 |
|------|-----------|--------|
| トップ `/` ファーストビュー | `CinematicHero` の役割・CTA・画像採用基準 | `/map` レイアウト（G6） |
| サイト導線 | ヒーロー内 CTA と **/map への入口の役割分担** | PathMagnet 以下の全セクション詳細 |
| 背景画像 | 候補比較・採用 QA・資産パス | 画像の生成・差し替え作業そのもの |
| a11y | コントラスト・alt・動きの抑制 | 全ページ WCAG 監査 |

**IA 最優先（01 継承）**: ファーストビューは **「今日滑れるか」** を即答する。地形マップは **二次導線**（ヘッダー・PathMagnet 等）。

---

## 1. ヒーローの役割（情報優先度）

| 優先度 | ブロック | 内容 | 根拠（IA） |
|--------|----------|------|------------|
| **P0** | 背景画像 | 林間・町営スケールの **雰囲気**（地形の正確さは不要） | 信頼・現場感 |
| **P0** | `h1` リゾート名 | 七戸町営スキー場（`EditorialTitle`） | 公式識別 |
| **P1** | 今日サマリー 1 指標 | `today.snapshot[0]`（例: 積雪） | 「今日滑れるか」即答 |
| **P1** | プライマリ CTA | **今日の運営** → `/today` | コア KPI #1 |
| **P2** | `FreshnessBadge` | 最終更新時刻 | 信頼 |
| **P2** | `RevealPanel` | 運行・積雪の詳細（2 指標目以降） | 深掘り without 離脱 |
| **—** | `/map` への CTA | **ヒーロー内には置かない** | §4 |

**含めない（ヒーロー内）**

- ゲレンデマップ・コース図のプレビュー
- リフト/コースのインタラクティブ UI
- G3/G4 の検索・GPS・難易度フィルタ
- 6ピル型ナビ（`/map` 専用、`MapQuickNav` は別画面）

---

## 2. レイアウト契約（`CinematicHero`）

### 2.1 垂直構造

```
section.award-hero-scroll (min-h-[92svh])
├── 背景 Image (fill, object-cover, object-[center_35%])
│   └── グラデ overlay (上淡 → 下 background へ)
└── home-inner (justify-end, pt-28 pb-10)
    ├── eyebrow（エリア名）
    ├── h1 EditorialTitle
    ├── 主指標（title + mono value）
    ├── CTA 行（Primary + FreshnessBadge）
    └── RevealPanel（詳細アコーディオン）
```

| 項目 | 仕様 |
|------|------|
| 最小高 | `92svh`（モバイルでもファーストビューで h1 + 主指標 + CTA が視認） |
| ヘッダー | `SiteHeader` fixed — コンテンツは `pt-28` で被らない |
| 画像上の UI | 左下寄せ（`justify-end`）。右側は斜面被写体用に **テキストを載せない** |
| スクロール演出 | エージェント 14 仕様がある場合は従う。`prefers-reduced-motion` で無効化必須 |

### 2.2 実装参照（現行）

- コンポーネント: `web/src/components/home/CinematicHero.tsx`
- 画像パス（プレースホルダ）: `/images/hero-sichinohe.png`
- ページ: `web/src/app/[locale]/page.tsx`

---

## 3. CTA 階層

### 3.1 ヒーロー内（本書の正）

| 順位 | ラベル（ja） | 遷移先 | コンポーネント |  variant |
|------|-------------|--------|----------------|----------|
| **1（Primary）** | 今日の運営 | `/today` | `AwardButton` | `primary` |
| **2（Expand）** | 運行・積雪の詳細 | 同一ページ内展開 | `RevealPanel` | — |
| **3（Meta）** | 更新 | —（表示のみ） | `FreshnessBadge` | — |

**禁止**: ヒーロー Primary を `/map`・`/courses`・外部 URL にする（ユーザー承認 + 本書改訂まで）。

### 3.2 トップ全体での CTA 分担

| セクション | 主 CTA | 副 |
|------------|--------|-----|
| `CinematicHero` | `/today` | RevealPanel |
| `AsymmetricTransit` | `/access` 系 | today リンク |
| `PathMagnet` | Today / Access / **Map** / Tickets | FAQ ghost |
| `AudienceDuet` | 長尾 LP | — |
| `SiteHeader`（sm+） | **ゲレンデマップ** `/map` 他 | — |

**原則**: 「今日」の意思決定はヒーロー。「地形・コース」は **スクロール後 or ヘッダー**。

---

## 4. `/map` 導線（IA 固定）

### 4.1 入口一覧

| ID | 起点 | ラベル（ja） | 遷移先 | 優先度 |
|----|------|-------------|--------|--------|
| **M1** | `SiteHeader` nav | `nav.map`（ゲレンデマップ） | `/map` | 常時（sm+） |
| **M2** | `PathMagnet` | ゲレンデマップ | `/map` | トップ中段 |
| **M3** | `AudienceSplitCards` / LP | コース確認系 | `/map` | 文脈依存 |
| **M4** | `QuickActions`（ある場合） | マップ | `/map` | 補助 |
| **M5** | `/map` 自身 | `MapQuickNav` **A** | `/` | 逆導線（G6） |

### 4.2 リダイレクト・ラベル

| パス | 挙動 | ラベル |
|------|------|--------|
| `/courses` | **301/redirect → `/map`**（恒久） | 「コースガイド」は nav から削除 or `/map` と同義 |
| `/map` | G6 split rail 正本 | `map.chrome.fullTitle` |

**禁止**

- ヒーローに「コースを見る」Primary を追加して M1/M2 と競合させる
- `/courses` 独立ページを L1 なしで復活させる
- トップヒーロー背景に `sichinohe-hero.png` / `sichinohe-hero-v5.png` を使い **マップと同一画像** に見せる（§5）

### 4.3 ユーザーフロー（文章）

1. **初訪・モバイル**: ヒーローで積雪/運行を確認 → Primary で `/today`、必要なら RevealPanel。
2. **コースを知りたい**: ヘッダー or スクロール後 PathMagnet → `/map`（G6 UI）。
3. **embed 経由**: 現行は `/courses` → `/map` のみ。トップ embed は対象外。

---

## 5. 背景画像 — 候補と使い分け

### 5.1 資産の役割（厳守）

| 資産 | フルパス | 用途 | トップヒーロー |
|------|----------|------|----------------|
| **トップ用（本番）** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\images\hero-sichinohe.png` | `/` `CinematicHero` のみ | ✅ 本番候補 |
| **モック A** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-a-blue.png` | 比較・プレビューのみ | ⚠️ 承認前は本番不可 |
| **モック B** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-b-monochrome.png` | 比較・プレビューのみ | ⚠️ 承認前は本番不可 |
| **モック C** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-c-warm-editorial.png` | 比較・プレビューのみ | ⚠️ 暫定プレースホルダ元 |
| **3案比較 HTML** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-triptych.html` | ブラウザ比較（file:// 可） | — |
| **トップ全体モック** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\sichinohe-top-mock.html` | セクション全体プレビュー | — |
| **マップ v4** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\maps\sichinohe-hero.png` | `/map`・キャリブ・preview | ❌ **禁止** |
| **マップ v5** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\maps\sichinohe-hero-v5.png` | layout-v5 `/map` 候補 | ❌ **禁止** |
| **Earth Studio** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\maps\sichinohe-hero-earthstudio.png` | 内部キャリブ参照 | ❌ **禁止** |

根拠: [`map_integration_spec.md`](../../docs/map_integration_spec.md) §5 — マップイラストをトップに流用すると「公式地形図」と誤認される。

### 5.2 候補比較（モック 3 案）

プレビュー: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-triptych.html`

| 案 | フルパス | トーン | 向き（05） | UI 副作用 |
|----|----------|--------|------------|-----------|
| **A** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-a-blue.png` | クールブルー・寒色アルパイン | LAAX 系 neutral chrome と親和 | 現行グラデ・ダーク文字で可 |
| **B** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-b-monochrome.png` | 銀白×チャコール | Award タイポ・編集系 | **白文字＋text-shadow** へ切替要 |
| **C** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-c-warm-editorial.png` | 蜂蜜×クリーム朝光 | 町営・家族の信頼感 | 緑レール（`--alpine-dark`）とは別軸で整理 |

| 代替 | 説明 | 向き |
|------|------|------|
| **本番写真** | Gemini / 現地撮影（[`asset_brief.md`](../../docs/asset_brief.md)） | 最良。フォトリアル QA 必須 |
| **v5 マップ画像** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\maps\sichinohe-hero-v5.png` | **トップ不可** — `/map` 専用 |

### 5.3 採用基準（すべて YES でないと本番配置不可）

**共通（写真・モック問わず）**

- [ ] **イラスト地図・コース線・V字扇形**が写っていない（AI 典型失敗）
- [ ] 画像内に **読める文字・ロゴ・看板**がない
- [ ] 左下セーフゾーン（40%×35%）に主被写体がなく、**h1 + 主指標が読める**（実 HTML で確認）
- [ ] 下端グラデ重ね後も **Primary CTA コントラスト ≥ 4.5:1**（案 B は白 UI 必須）
- [ ] 欧州巨大リゾート・別国の山に見えない（町営スケール）
- [ ] `sichinohe-hero.png` / v5 を **コピーしていない**
- [ ] 解像度 **≥ 1920×1080**（16:9 想定）
- [ ] `prefers-reduced-motion` 時も静止画で体験が成立

**写真追加（`asset_brief.md` §9 継承）**

- [ ] フォトリアル（ベクター・イラスト感なし）
- [ ] 商用 Web 掲載 OK（権利・Gemini ポリシー）

**案 B 追加**

- [ ] `CinematicHero` を **明文字 UI** に切替済み（spec 承認 + L2）

### 5.4 alt 文言

| 状態 | `alt` |
|------|-------|
| 装飾のみ（テキストで十分） | `""`（現行）または `messages` の簡潔な情景説明 |
| 意味のある実写 | `hero.imageAlt` を ja/en で更新（03 連携） |

---

## 6. ユーザー決定欄（**記入済 — 案 A 採用**）

> L2 配置:  
> `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-a-blue.png`  
> → `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\images\hero-sichinohe.png`

| 項目 | 決定（記入） |
|------|-------------|
| **採用候補** | ☑ **案 A**　☐ 案 B　☐ 案 C　☐ 本番写真　☐ その他: — |
| **本番ファイル名** | `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\images\hero-sichinohe.png` |
| **元ソース** | ☑ A: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-a-blue.png` |
| **v5 マップ画像をトップに使うか** | ☑ **No** |
| **案 B 選択時: 白文字 UI 改修** | ☑ 不要（B 不採用） |
| **承認者** | ユーザー |
| **承認日** | 2026-06-08 |
| **メモ** | クールブルー・寒色アルパイン。現行 `CinematicHero` ダーク文字 UI のまま（§5.2）。高解像度再生成は [`asset_brief.md`](../../docs/asset_brief.md) で別途可。 |

---

## 7. アクセシビリティ（05）

| 項目 | 要件 |
|------|------|
| 見出し | `h1` はページに **1 つ**（`EditorialTitle`） |
| CTA | Primary は `AwardButton`（フォーカスリング `map-focus` 系または award トークン） |
| コントラスト | 主指標・CTA・eyebrow が背景上で WCAG AA（4.5:1 本文 / 3:1 大文字） |
| 動き | `award-rise` 等は `prefers-reduced-motion: reduce` で無効 |
| タッチ | CTA・RevealPanel トリガー **min 44×44px** |
| 画像 | 装飾なら `alt=""`；意味ある実写は適切な alt |

---

## 8. 禁止パターン

1. エージェントが **未承認モック** を本番 `public/images/` に置いたまま出荷
2. **マップイラスト**（v4/v5）をトップヒーローに流用
3. ヒーロー Primary を `/map` に変更（IA 逆転）
4. ヒーローに **凡例・コース色・リフトステータスオーバーレイ** を載せる
5. LAAX 比較用の **未承認色・6ピル** をトップに持ち込む
6. 案 B 採用時に **ダーク文字 UI のまま** 出荷

---

## 9. 受け入れ基準（Given / When / Then）

| # | Given | When | Then |
|---|--------|------|------|
| **H1** | `/` 375×812 | 初期表示 | h1 + 主指標 + 「今日の運営」が **1 画面内**に視認。`/map` CTA は **ない** |
| **H2** | `/` | Primary CTA タップ | `/today` へ遷移 |
| **H3** | `/` sm+ | ヘッダー「ゲレンデマップ」 | `/map` へ遷移（M1） |
| **H4** | `/` | PathMagnet「ゲレンデマップ」 | `/map` へ遷移（M2） |
| **H5** | ユーザー決定欄 **未記入** | 画像監査 | `hero-sichinohe.png` は **暫定** 扱い。visual evaluator は **WARN** 可、**最終 PASS 不可** |
| **H6** | ユーザー決定欄 **記入済（案 A）** | 画像監査 | **PASS**（2026-06-08）— §5.3 7/8 YES、WARN: 解像度のみ（[`qa_report_visual.md`](../../docs/qa_report_visual.md)） |
| **H7** | `prefers-reduced-motion` | `/` 表示 | ヒーローアニメなし。操作可能 |

---

## 10. エージェントパイプライン

```
01 + 05（本書）
  → ユーザー決定欄（§6）記入
    → 03（alt・ラベル必要時）
    → 06-implementation-engineering（パス・UI 分岐のみ）
      → 13/14（タイポ・モーション、競合時 13 優先）
      → resort-visual-evaluator（V3 ヒーロー画像）
```

**マップとの境界**: `/map` UI は G6 承認後に 16+18。トップと **並行可** だが資産パスは §5 で分離。

---

## 11. 参照

- モック比較 HTML: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\hero-mock-triptych.html`
- トップ全体モック: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\preview\sichinohe-top-mock.html`
- 写真生成: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\docs\asset_brief.md`
- マップ資産: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\data\map\sources.md`
- v5 レイアウト: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\docs\map-asset-layout-v5-spec.md`
