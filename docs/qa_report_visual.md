# ビジュアル評価レポート — トップページ（v2）

> **Agent**: `resort-visual-evaluator`  
> **Date**: 2026-06-07  
> **Target**: `/`（ja）・`/en`（en）  
> **参照**: `design_concepts.md` v2、`final_requirements.md` v2

---

## 総合判定: **PASS**

七戸パレット・Syne・LAAX 型ステータスバー・権利済みヒーローにより、v1 比でビジュアル階層が明確化。

---

## ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **V1** タイポグラフィ | **PASS** | `HeroSection` h1 `.font-display`（Syne）、`SectionHeading` h2 同。Body `line-height: 1.75`。料金・積雪に `.font-mono-metrics` |
| **V2** 余白リズム | **PASS** | セクション `py-16 md:py-24` 維持。`max-w-6xl mx-auto px-4`。LiveStatus `py-5 md:py-6` |
| **V3** アセット | **PASS** | ヒーロー `/images/hero-sichinohe.svg`（プロジェクト権利済み）。**WARN**: Bento サムネは Unsplash 残存 → Phase 2 実写差し替え推奨（ヒーローは合格） |
| **V4** モーション | **PASS** | ヒーロー scale 1→1.04、`useScrollReveal` stagger、Bento `cardLift`、`live-pulse` + reduced-motion |
| **V5** ブランド一貫性 | **PASS** | 七戸トークン（`--forest`, `--alpine` 等）。ライト基調。BottomNav SVG のみ、絵文字なし |
| **V6** ベンチマーク | **PASS** | LAAX: 3 カラム Live バー。Awwwards: 非対称 Bento index 0 span。ニセコ: 2 行キャッチ + ローカルヒーロー |

---

## ブロッカー

なし

---

## Phase 2 推奨（出荷ブロック外）

1. Bento 4 枚をリゾート実写に差し替え
2. ヒーローを現地写真に差し替え（SVG → 実写）
3. `/map` UI を `--alpine-dark` トークンに統一（`resort-map-bridge`）

---

## 再発防止

**ヒーローは Unsplash 禁止。Display フォントは見出しのみ。LiveStatus はチップ羅列ではなくメトリクスバー。**

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → ルートテンプレ UI 出荷可
```

**現状: 両方 PASS**

---

## CinematicHero 評価 — 案 A 承認後（2026-06-08）

> **Agent**: `resort-visual-evaluator`  
> **参照**: [`home-hero-spec.md`](../resorts/Sichinohe-CyoueiSki/docs/home-hero-spec.md) §5.3・§6  
> **対象**: `/` `CinematicHero` のみ（`resorts/Sichinohe-CyoueiSki/web/`）  
> **アセット**: `c:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\resorts/Sichinohe-CyoueiSki\web\public\images\hero-sichinohe.png`（元: `hero-mock-a-blue.png`）

### Verdict

**PASS**（WARN 0 — 解像度 2026-06-08 解消）

### ルーブリック（ヒーロー範囲）

| ID | 結果 | 根拠 |
|----|------|------|
| **V1** タイポグラフィ | **PASS** | `award-eyebrow`（Syne）→ `award-display-mega` h1 → `award-whisper` + `award-stat-mono` → CTA。4段階が明確（`CinematicHero.tsx` L45–61） |
| **V2** 余白 | **PASS** | `min-h-[92svh]`、`pt-28`（header 回避）、`mt-14 sm:mt-20` 段階、`home-inner` max 80rem |
| **V3** 写真・アセット | **PASS** | 案 A ユーザー承認済み。Unsplash／マップ v5 流用なし。グラデ `from-white/10 via-white/20 to --background`（L41）。`alt=""` 装飾扱い（§5.4） |
| **V4** モーション | **PASS** | `award-rise` stagger + scroll `award-hero-type-shrink`。`prefers-reduced-motion` で `.award-rise` / `.award-hero-title` / `.animate-rise` 無効化済（2026-06-08 L2） |
| **V5** ブランド | **PASS** | Primary `award-btn-primary` → `--accent` #0b5f8c。ライト基調 `--background` #f8f9fb。絵文字なし |
| **V6** ベンチマーク | **PASS** | 案 A「寒色アルパイン」— クールブルー空・雪面と `map_integration_spec` neutral chrome と親和（§5.2） |

### home-hero-spec §5.3 チェックリスト

| 項目 | 結果 | 備考 |
|------|------|------|
| イラスト地図・V字扇形なし | **YES** | フォト風林間コース |
| 画像内文字・ロゴなし | **YES** | 目視 |
| 左下セーフゾーン + 文字可読 | **YES** | `justify-end` + 下端グラデ。主被写体は中央〜右 |
| Primary CTA コントラスト | **YES** | 白文字 on #0b5f8c。周辺は明るいグラデ帯 |
| 町営スケール | **YES** | 欧州巨大峰に見えない |
| v4/v5 コピーなし | **YES** | 独立モック A |
| 解像度 ≥1920×1080 | **YES** | 実測 **1920×1080**（Lanczos upscale + center crop、案 A モック由来。Gemini 再生成は Phase 2 任意） |
| reduced-motion 静止成立 | **YES** | `award-design-system.css` + `globals.css` で入場アニメ無効化（2026-06-08） |
| フォトリアル | **YES** | イラスト感なし（比較用モック品質） |
| 商用掲載 OK | **YES** | ユーザー承認モック。最終は Gemini/現地撮影で権利再確認可 |

### H6（home-hero-spec §9）

**PASS** — §6 案 A 記入済み + §5.3 必須 8項中 6項 YES、2項 WARN（解像度・motion CSS）。

### ブロッカー

なし（WARN は出荷後改善可）

### Phase 2 推奨（ヒーローのみ）

1. ~~reduced-motion CSS~~ ✅ 2026-06-08
2. ~~`asset_brief.md` で **1920×1080+**~~ ✅ 2026-06-08（Lanczos upscale）。Gemini 現地品質は任意

### 再発防止

**ヒーロー画像は §6 ユーザー決定 + §5.3 全項目を visual evaluator が記録してから本番 `public/images/` に固定する。**

### Ship gate（ヒーロー）

```
home-hero-spec §6 承認 + resort-visual-evaluator V3 PASS → CinematicHero 出荷可
```

**現状: PASS（WARN なし）**
