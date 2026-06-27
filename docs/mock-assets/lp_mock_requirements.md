# LP モック — 最終要件・L3 評価基準

**Date:** 2026-06-23  
**Author:** L1 凍結（LP Factory）  
**対象:** `docs/mock-assets/{id}-lp/` 静的ガイド LP（`guides.japowserch.com` 配信）  
**参照テンプレ:** `sichinohe-lp`（`transit-onsen` アーキタイプの canonical）  
**対象外:** ルート `src/` 本番テンプレ、七戸 `/map`（`map-*` 艦隊）

---

## 1. 確定デザイン（1 行）

**Alpine Clarity 静的版:** ライト基調・Syne 見出し・IBM Plex Mono 数値・ヒーロー全面画像 + グラデオーバーレイ。コピーは JSON、HTML は `data-i18n` 配線のみ。

---

## 1.1 コピートーン（必須・ご法度）

LP の **ユーザー向け文言**（`messages/*.json`）に、戦略レポート・社内用語をそのまま出さない。

### 禁止（FAIL）

| 種別 | 例（NG） |
|------|----------|
| 市場ラベルの直出し | 「インバウンドが求めるもの」「インバウンド向け厳選〇選」 |
| 英語の同型 | "What inbound guests want", "Inbound-ready shortlist" |
| 観客のニーズ断定 | 「インバウンド観光客は〜を強く求めている」 |
| マーケ内部語の表出 | 「インバウンドに刺さる」「FIT向けパッケージの設計図」 |

### 許可

| 種別 | 置き場所 |
|------|----------|
| `インバウンド` / `inbound` | 戦略レポート、brief YAML、`AREA_MAP_FACTORY_SPEC`、エージェント指示（**LP JSON 外**） |
| 体験・事実の記述 | 「英語メニューあり」「貸切風呂」「新千歳から約100分」 |
| 地域・文化の語り | 「雪見露天」「港町の寿司」「広域周遊」 |

### 言い換えの型

| NG | OK（例） |
|----|----------|
| インバウンドが求めるもの | **三つの街でつながる体験** / *What this triangle offers* |
| インバウンド向け厳選飲食4選 | **厳選飲食4選** / *4 curated restaurants* |
| インバウンド個人手配旅行者向け | **自分で組み立てる3日間** / *A self-planned three-day loop* |

機械検証: `node docs/mock-assets/scripts/validate-mock-lp-copy.mjs`（`messages/*.json` + `*.html` フォールバック）

---

## 1.2 実装禁止（エージェント・勝手な省略）

LP Factory 作業で **ユーザー確認なし** にやってはいけないこと。詳細: [`.cursor/rules/lp-factory-no-shortcuts.mdc`](../../.cursor/rules/lp-factory-no-shortcuts.mdc) · [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) §0。

| 種別 | 例（NG） |
|------|----------|
| 他施設流用 | 比布 PNG を `lp-mock-kirigamine-*.png` にリネームだけ |
| 画像フォーマット変更 | LP セクション画像を SVG / 落書き / 簡易イラストに差し替え |
| アフィリエイト省略 | `affiliates.rentacar` なしで registry / guides に載せる |
| 検証スキップ | `validate-skyticket-affiliate.mjs` 等未 PASS で push |
| 独自修復ルート | 指摘後に手順書にない形式で「とりあえず直す」 |

**N 件目の新規ゲレンデも、1 件目と同じ出荷ゲートを通す。**

---

## 2. 出荷ゲート（必須）

```
L2 implementer 完了
  → 機械検証（validate-mock-*.mjs）exit 0
  → @resort-qa-a11y      → docs/mock-assets/lp_qa_report.md（施設単位 or テンプレ監査）
  → @resort-visual-evaluator → docs/mock-assets/lp_qa_visual.md
  → 両方 PASS で guides 配信・クライアント提示可
```

| FAIL 条件 | ブロッカー |
|-----------|------------|
| **LP-V1** or **LP-V5** | ビジュアル再実装 |
| **LP-Q1–Q7** いずれか | a11y / i18n / 導線 / コピー修正 |
| **LP-Q8** レイアウト非破壊 | CTA 被り・オーバーラップ CSS 修正 |
| **LP-Q9** JAPOW 詳細連携 | `resort-guides.json` + sync + URL 契約 |
| 機械検証 exit ≠ 0 | JSON / HTML 配線 / コピートーン修正 |
| **LP-Q7** コピートーン | 戦略内部語の直出し |
| Human Gate 未完了 | 事実誤り（料金・規制・URL） |

**a11y PASS のみでは出荷不可。** 周辺マップを含む場合は [area_map_handoff_checklist.md](./area_map_handoff_checklist.md) §8 のゲートも追加。

---

## 3. 機能要件（Must）

### 3.1 ファイル構成

- [ ] **F1** `{id}-lp/index.html`, `mock.css`, `messages/ja.json`, `messages/en.json` が存在
- [ ] **F2** `<html data-mock-resort="{registry.id}">` が index と子ページで一致
- [ ] **F3** `_shared/mock-i18n.js` + `_shared/mock-i18n.css` を読み込み
- [ ] **F4** `registry.json` に `id` / `slug` / `name` / `strategy` / `japowResortId`（または `guideNote`）
- [ ] **F5** 子ページがある場合、同じ `data-mock-resort` と i18n 配線
- [ ] **F11** Skyticket レンタカー: `registry.affiliates.rentacar` + `index.html` の `data-skyticket-rentacar-*`（`validate-skyticket-affiliate.mjs` PASS）

### 3.2 ナビ・導線

- [ ] **F6** ヘッダーに `../map.html?resort={id}` へのゲレンデマップリンク
- [ ] **F7** `#paths`（または同等）にレポートの主要導線が 3〜6 タイルで表現
- [ ] **F8** ヒーロー CTA が戦略の第1訴求を指す（今日の運営 / 広域周遊 / キャンプ等）

### 3.3 配信・JAPOW 詳細ボタン

- [ ] **F9** `{id}-lp/index.html` が存在し、`sync.mjs` が `public/{id}/` にコピーできる
- [ ] **F10** `data/resort-guides.json` に `japowResortId` マッピング（掲載する場合）

### 3.4 JAPOW「詳細確認」連携（掲載施設は必須）

> 仕様: [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md)

- [ ] **J1** `resort-guides.guides[japowId].registryId` === `registry.id`
- [ ] **J1b** `scripts/validate-resort-guides-ids.mjs` の `NAME_SUBSTRINGS[{id}]` が JAPOW 正式名にマッチ
- [ ] **J2** 詳細 URL = `https://guides.japowserch.com/{id}/`（`slug` 不可）
- [ ] **J3** 英語 = `https://guides.japowserch.com/{id}/?lang=en`
- [ ] **J4** `validate-resort-guides-ids.mjs` exit 0
- [ ] **J5** `validate-mock-japow-detail.mjs` exit 0
- [ ] **J6** sync 後 `validate-mock-japow-detail.mjs --public` exit 0

---

## 4. L3 ルーブリック — `resort-qa-a11y`（LP-Q1–Q6）

> 出力: `docs/mock-assets/lp_qa_report.md`（新規施設は `{id}` セクションを追記、または `lp_qa_reports/{id}.md`）

### LP-Q1 Mobile-first（必須）

- 375px 幅で横スクロールなし
- `.btn`, `.lang-switch button`, `.path-tile`, 主要リンク `min-height: 44px` 相当
- ヒーロー文字が 375px で読める（極端なクロップ・はみ出しなし）
- **装飾カードが CTA を覆わない** — 負の `margin-top` / `position:absolute` のオーバーラップで、ボタン・リンクの **50% 以上** が隠れない（`highlight-secondary` 型）
- **FAIL例:** 固定幅 px で 400px 超の要素、タップ領域が padding のみで 32px 未満、**霧ヶ峰 `highlight-secondary` が `btn-powder`（ゲレンデマップ）に被る**（2026-06 インシデント）

### LP-Q8 レイアウト非破壊（必須）

> 七戸マップの R1（主コンテンツ非遮蔽）を LP 静的ページに適用したもの。装飾のための重なりは **画像上のみ** 可。インタラクティブ要素の上は不可。

| チェック | 合格 |
|----------|------|
| 375px で全 `.btn` / `.path-tile` が完全にタップ可能（隣接カードに覆われない） | 必須 |
| `z-index` + 負マージンでセクションカードが CTA 上に載るパターン | **禁止** |
| `#highlights` の 2 カラム（`highlight-duet`） | モバイルは **縦積み**、デスクトップは grid。absolute オーバーラップ不可 |
| `transit-card` 型のオーバーラップ | 画像フレーム上に限定。直下の CTA 行を覆わない |
| 手動確認 | DevTools 375px + `#highlights` までスクロール |

**FAIL → 出荷不可。** `resort-visual-evaluator` の LP-V2（余白）とも連動。

### LP-Q2 Accessibility（必須）

- インタラクティブ要素に `:focus-visible` アウトライン
- 意味のある画像に `data-i18n-attr="alt:..."` または装飾は `alt=""`
- `prefers-reduced-motion: reduce` で `scroll-behavior` / transition を抑制
- 言語切替: `role="group"`, `aria-label`, 切替後 `aria-pressed` / `aria-current`
- セクションに `aria-labelledby` または `aria-label`
- **FAIL例:** キーボードでフォーカスが見えない、lang ボタンにラベルなし

### LP-Q3 Strategy conversion（必須）

- ヒーロー → 主要 CTA → 詳細セクションが **3 タップ以内**
- `registry.strategy` と hero / paths の訴求が一致
- レポートの「目玉」がファーストスクロール後（`#highlights` 等）に視認できる
- **FAIL例:** ヒーローが汎用コピーのみで戦略1行がどこにもない

### LP-Q4 i18n（必須）

- `node docs/mock-assets/scripts/validate-mock-i18n.mjs` → exit 0
- `node docs/mock-assets/scripts/validate-mock-html-i18n.mjs` → exit 0
- `node docs/mock-assets/scripts/validate-mock-lp-shell.mjs` → exit 0
- HTML にユーザー向け日本語・英語の直書きなし（`.mock-banner` はローカルプレビューのみ可）
- `?lang=en` で `document.documentElement.lang` が `en`
- **FAIL例:** 未翻訳キー、EN ページに JA 混在、file:// 前提の説明不足（[i18n_spec.md](./i18n_spec.md)）

### LP-Q5 Performance（必須・静的スコープ）

- ヒーロー `img` に `width` / `height`（CLS 抑制）
- 無限ループアニメーションなし、または reduced-motion で停止
- `next/image` は N/A（静的モック）
- **FAIL例:** 巨大 GIF 自動再生、全画像 lazy なしで十数枚同時 Above the fold

### LP-Q6 Data separation（必須）

- 施設コピーは `{id}-lp/messages/*.json` のみ
- 共通 UI は `_shared/messages/ui.*.json`
- `registry.json` が施設名・地域・strategy の単一ソース（HTML 直書きなし）
- 料金・電話は JSON に1箇所（重複直書き禁止）
- **FAIL例:** index.html に住所・料金が直書き

### LP-Q7 Copy tone（必須）

- `validate-mock-lp-copy.mjs` → exit 0
- §1.1 の禁止表現が `messages/*.json` にない
- 見出しは **体験・地域・行動** で書く（市場セグメント名を見出しにしない）
- **FAIL例:** `highlights.title` = 「インバウンドが求めるもの」

### LP-Q8 Layout integrity（必須）

- §LP-Q8 表の手動確認を実施（375px · `#highlights` · `#paths`）
- `highlight-duet` は grid 縦積み / 2 カラムのみ（negative margin overlay 禁止）
- **FAIL例:** 二次カードが primary CTA を覆い「ゲ」のみ見える（kirigamine 2026-06）

### LP-Q9 JAPOW「詳細確認」連携（必須・掲載施設）

> [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md)

- `validate-resort-guides-ids.mjs` → exit 0
- `validate-mock-japow-detail.mjs` → exit 0（ソース）
- `guides/scripts/sync.mjs` 後 `validate-mock-japow-detail.mjs --public` → exit 0
- `getResortGuideUrl(japowId)` が `/{registryId}/` と `?lang=en` を返す
- **FAIL例:** `japowResortId` 誤り、`/biei-lp/` のような slug URL、sync 前の「JAPOW 反映完了」

---

## 5. L3 ルーブリック — `resort-visual-evaluator`（LP-V1–V6）

> 出力: `docs/mock-assets/lp_qa_visual.md`  
> 基準 CSS: `sichinohe-lp/mock.css` を canonical とする

### LP-V1 タイポグラフィ階層（必須）

| 要素 | 仕様 |
|------|------|
| Display / H1 | `.hero-title` + Syne, `clamp(2.5rem, 8vw, 4.5rem)` 前後 |
| セクション見出し | `.heading-lg` 統一 |
| Eyebrow | `.eyebrow` — Syne, uppercase, letter-spacing |
| Body | Noto Sans JP, `line-height: 1.75` |
| 数値・時刻 | `.font-mono` + `tabular-nums` |
| **FAIL** | 全要素同一サイズ、見出しに Syne 未使用、1 画面に H2 スタイル 4 種以上 |

### LP-V2 余白リズム（必須）

- `--section: clamp(5rem, 14vw, 9rem)` でセクション縦を統一
- `.inner` max-width `72rem` + `--inner` 横 padding
- カード・グリッド gap がセクション間で一貫（`gap-4` / `1rem` 系）
- **FAIL例:** 隣接セクションで padding が 2 倍以上バラつく

### LP-V3 ビジュアルアセット

- ヒーロー: ゲレンデ向け生成画像 or 施設固有ビジュアル（**モックでは AI 画像可**）
- `.hero-overlay` 等で文字コントラスト確保
- サムネイルに適切な `alt` 配線
- Unsplash 汎用雪山のみ → **WARN**（クライアント提示前に差し替え推奨、テンプレ監査では PASS 可）
- 破損画像・極端な aspect 崩れ → **FAIL**

### LP-V4 マイクロインタラクション

- `.path-tile`, `.btn` に hover / focus の transform または border 変化（`--ease` 使用）
- `prefers-reduced-motion` で transition 無効化
- **FAIL例:** インタラクティブ要素が完全フラット（ホバー・フォーカス無反応）

### LP-V5 ブランド一貫性（必須）

- `:root` に `--bg`, `--fg`, `--accent`, `--surface`, `--border` を定義し CTA・リンクで使用
- 絵文字をナビ・アイコン代わりに使わない
- ライト基調（`--bg` #f8–#fa 系）。全面ダーク UI をトップにしない
- **FAIL例:** インライン `#hex` の乱立、絵文字ステータス、ネオン単色 UI

### LP-V6 アーキタイプ整合（推奨・WARN 可）

- [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) §3 の `archetype` とセクション構成が一致
- 使わないアーキタイプのセクション（例: `live-strip` が無いのに空 DOM）が残っていない
- ベンチマーク: 編集デザイン（非 BBS 羅列）が説明できる
- 完全不一致 → **FAIL**、軽微な余剰セクション → **WARN**

---

## 6. Human Gate（L3 外・公開前必須）

| 項目 | 確認 |
|------|------|
| 料金・営業時間 | 公式と照合 |
| 道路規制・バス | 冬季版 |
| 電話・URL | 404 なし |
| EN コピー | inbound 自然さ |
| `japowResortId` | JAPOW マップ連携 |
| 戦略一致 | レポートの売りが hero / paths にある |

---

## 7. 機械検証コマンド

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
```

---

## 8. L3 依頼文（コピペ）

### テンプレート canonical 監査（新規 archetype 追加時）

```
@resort-qa-a11y
対象: docs/mock-assets/sichinohe-lp/（LP テンプレ canonical）
基準: docs/mock-assets/lp_mock_requirements.md LP-Q1–Q6
出力: docs/mock-assets/lp_qa_report.md

@resort-visual-evaluator
対象: docs/mock-assets/sichinohe-lp/mock.css + index.html
基準: lp_mock_requirements.md LP-V1–V6
出力: docs/mock-assets/lp_qa_visual.md
```

### 新規施設 LP

```
@resort-qa-a11y
対象: docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md
出力: lp_qa_reports/{id}.md（または lp_qa_report.md に追記）

@resort-visual-evaluator
対象: docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md LP-V1–V6
出力: lp_qa_reports/{id}_visual.md
```

---

## 9. 参照ドキュメント

| 用途 | パス |
|------|------|
| Factory 手順 | [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) |
| i18n 仕様 | [i18n_spec.md](./i18n_spec.md) |
| L2 チェックリスト | [lp_mock_handoff_checklist.md](./lp_mock_handoff_checklist.md) |
| 周辺マップ L3 | [area_map_handoff_checklist.md](./area_map_handoff_checklist.md) §8 |
| ルート本番 V 基準 | [final_requirements.md](../final_requirements.md) §ビジュアル受け入れ |
