# LP Factory — テンプレ複製 → ガイド LP → JAPOW「詳細」ボタンまで

> **目的**: 戦略レポート（または同等の調査成果）を受け取ったあと、**既存 LP テンプレを複製**して `docs/mock-assets/{id}-lp/` を作り、`guides.japowserch.com` で配信し、**JAPOW マップの「詳細確認」ボタン**からその LP が開くところまでを **1 本の手順**で完了する。  
> **対象**: `docs/mock-assets/{id}-lp/`（モック）。ルート `src/` 本番テンプレ・七戸 `resorts/Sichinohe-CyoueiSki/web/` は **別パイプライン**。  
> **関連**: [i18n_spec.md](./i18n_spec.md) · [AREA_MAP_FACTORY_SPEC.md](./AREA_MAP_FACTORY_SPEC.md) · [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md) · [guides/HANDOFF.md](../../guides/HANDOFF.md)  
> **エージェント規範（必読）:** [`.cursor/rules/lp-factory-no-shortcuts.mdc`](../../.cursor/rules/lp-factory-no-shortcuts.mdc)

---

## 0.1 完了の定義（Definition of Done）

新規施設 `{id}` の作業は、次が **すべて** 満たされたときのみ「完了」。

| # | 完了条件 | 確認方法 |
|---|----------|----------|
| D1 | `{id}-lp/` がテンプレ複製＋専用 PNG・i18n・残骸なし | grep で他 `{id}` 不在 |
| D2 | 機械検証 **8 コマンド** がすべて exit 0 | §5 Phase 10 |
| D3 | `guides/scripts/sync.mjs` 後、`public/{id}/` が存在 | `--public` 検証 |
| D4 | `https://guides.japowserch.com/{id}/` と `?lang=en` が成立 | sync 後ローカル or 本番 |
| D5 | JAPOW `japowResortId` の「詳細確認」→ D4 の URL | `resort-guides.json` 契約 + JAPOWSERCH 同梱 |
| D6 | L3 評価 PASS（a11y + visual） | Phase 10 · Human Gate（Phase 8） |

**「LP だけできた」は未完了。** 詳細ボタン連携（D5）までが LP Factory のスコープ。

---

## 0.2 標準パイプライン（テンプレ → 詳細ボタン）

新規 1 施設あたり、**この順序を変えない**。

```
Step 1   レポート → configs/lp-brief/{id}.yaml + japowResortId 確定
Step 2   §3 アーキタイプ選定 → 複製元 LP を決める
Step 3   複製元を {id}-lp/ にコピー · data-mock-resort · 他 id 残骸削除
Step 4   専用 PNG（lp-mock-{id}-*.png + images/maps/{id}-hero.png）
Step 5   messages/ja.json + en.json（レポート由来コピー）
Step 6   index.html セクション配線 · mock.css トークン
Step 7   data/maps/{id}.json + generate-map-data.mjs
Step 8   registry.json + data/resort-guides.json
Step 9   apply-rentacar-affiliate.mjs（Skyticket 必須）
Step 10  機械検証 8 本（Phase 10 コマンドブロック）
Step 11  guides/scripts/sync.mjs + hub 件数更新
Step 12  JAPOWSERCH/data/resort-guides.json 同期 + **fork へ push**
Step 13  L3 評価 + Human Gate（並行可）· 両リポ push 完了で出荷
```

### エージェント依頼文（コピペ用）

```
戦略レポートに従い LP Factory 標準パイプライン（LP_FACTORY_PROCEDURE.md §0.2）を
テンプレ複製から JAPOW 詳細ボタン連携まで実施。

- registry id: {id}
- japowResortId: {数値}（JAPOW RESORTS一覧で確認済み）
- archetype / 複製元: {例: local-value / shinjo-lp}
- 画像: Gemini MCP（不可時はユーザー確認のうえ代替）
- チャット内に画像を貼らない
- 検証 8 本 PASS → sync → JAPOWSERCH resort-guides 同期 → **両リポ push まで**（ユーザーが push 停止を明示しない限り）
```

---

## 0. エージェント行動規範 — 勝手なこと禁止

**新規ゲレンデが何件目でも、既存 LP と同じゲートを省略しない。** 「急ぎ」「JAPOW まで反映」は Phase スキップの理由にならない。

### 0.1 禁止（ユーザー確認なし）

| # | 禁止行為 | 正しい対応 |
|---|----------|------------|
| 1 | 他 `{id}` の PNG・コピーをファイル名だけ変えて流用 | 施設専用 `lp-mock-{id}-*.png` を新規生成 |
| 2 | 複製元のハッシュタグ・`messages` キー・他施設名の残骸 | Phase 1 完了時に grep で `{id}` 以外を除去 |
| 3 | LP 画像を SVG / 落書き / 簡易イラストに差し替え | フォトリアル AI **PNG** のみ（比布・美瑛と同型） |
| 4 | Skyticket レンタカーアフィリエイトを抜く | Phase 7.5 必須 |
| 5 | `validate-*.mjs` 未 PASS の commit / push | §5 Phase 10 の全コマンド exit 0 後のみ |
| 6 | 指摘後に手順書にない独自ルートで「とりあえず直す」 | Phase 0 からやり直し |

### 0.2 再発防止

霧ヶ峰追加時に比布流用 → アフィリエイト欠落 → 検証スキップ → SVG / 落書き PNG という **手順外の連鎖** が発生した。以降、この回避策は使わない。

### 0.3 参照実装

直近で **§0.2 全 Step 完了** した LP を正とする（2026-06 時点）:

| 施設 | 複製元 | 備考 |
|------|--------|------|
| `hinode` | `shinjo-lp` | 駅徒歩・Snow & Spa · japow `52` |
| `shinjo` | `shinjo-lp` 系 | 新幹線ターミナル · japow `163` |
| `kamikawa-nakayama` | `kamikawa-nakayama-lp` | フリーミアム · japow `36` |
| `pippu` | `pippu-lp` | 初回からアフィリエイト・registry 完備の型 |

**新規 `{id}` は上記と同じファイルセット・同じ検証コマンドを適用する。**

---

## 1. 結論 — どこまで自動化できるか

| フェーズ | 自動化度 | 説明 |
|----------|----------|------|
| レポート → brief 抽出 | ✅ 80% | LLM が章立てを YAML brief に要約。**戦略1行・目玉・ターゲットは人間承認** |
| コピー（ja/en JSON） | ✅ 75% | レポート本文から `messages/*.json` 下書き。EN は inbound 向けに別トーン調整 |
| HTML 骨格 | ✅ 90% | 既存アーキタイプを複製し `data-i18n` 配線のみ差し替え |
| 画像 | ⚠️ 50% | ヒーロー等は AI 生成可。**公式ロゴ・標識は要確認** |
| ゲレンデマップ JSON | ✅ 85% | `generate-map-data.mjs` にエントリ追加（**焼き込みイラスト前提**） |
| 周辺マップ（飲食・温泉） | ✅ 70% | [AREA_MAP_FACTORY_SPEC.md](./AREA_MAP_FACTORY_SPEC.md) の brief → Deep Research 経路 |
| 配信・JAPOW 連携 | ✅ 95% | `registry.json` + `sync.mjs` + `resort-guides.json` + [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md) |
| 公開品質 | ⚠️ 必須 Human Gate | 電話・料金・道路規制・英訳の事実確認 |

**一言**: 「レポート → 下書き LP → ローカルプレビュー」までは 1 セッションで回せる。**クライアント提示前に必ず Human Gate を 1 パス**。

---

## 2. 入力 — レポートに含めるべき項目

レポートが次を満たすと、手作業が最小になる。

### 2.1 必須（brief 化する）

| 項目 | 例 | LP での使い道 |
|------|-----|----------------|
| 施設正式名（ja/en） | 札幌国際スキー場 / Sapporo Kokusai | `registry`, `hero.title`, `logo` |
| **registry `id`** | `sapporo-kokusai`（kebab、英小文字） | URL・マップ・i18n 全体のキー |
| 所在地（都道府県〜番地） | 北海道札幌市南区 定山渓 | `hero.eyebrow`, `access`, EN ruby |
| **戦略1行** | ゴールデントライアングル | `registry.strategy`, ヒーロー訴求 |
| **ターゲット** | inbound FIT / 国内日帰り / 競技関係者 | セクション取捨・トーン |
| **目玉（1〜3）** | 定山渓温泉・小樽寿司・都市アクセス | 特集ページ・path タイル |
| アクセス要約 | 札幌60分・新千歳100分 | `live` ダッシュボード or `transit` |
| 既知の課題・制約 | 朝里峠夜間通行止め | `noticeBody`（隠さず開示） |
| `japowResortId` | JAPOW マップ上の数値 ID | `registry.json`, `resort-guides.json` |

### 2.2 推奨（あると品質が上がる）

- 厳選宿・飲食・温泉リスト（各 5〜15 件、住所・電話・URL）
- コース・リフト一覧（公式パンフ・skimap 参照元付き）
- 競合・ポジショニング（なぜこのゲレンデか）
- 推奨滞在モデル（1泊2日 / 日帰り / 広域周遊）
- 画像指示（雪質・眺望・建物・人物の有無）

### 2.3 brief YAML（新規・任意だが推奨）

レポート受領直後に 1 ファイル化する。周辺マップと共通化可。

**パス**: `configs/lp-brief/{id}.yaml`（新規ディレクトリ）

```yaml
resortId: sapporo-kokusai
schemaVersion: "2026-06-23"

name:
  ja: 札幌国際スキー場
  en: Sapporo Kokusai Ski Resort
region:
  ja: 北海道札幌市
  en: Sapporo, Hokkaido
japowResortId: 3  # 要確認フラグ可

strategy:
  ja: ゴールデントライアングル
  en: Golden Triangle · Inbound
archetype: corridor-hub   # 下記 §3 参照

audience: inbound         # inbound | domestic | both | pivot

hero:
  tagline:
    ja: Japowの中心で、三つの街をつなぐ。
    en: Japow at the center — three cities, one snow day.
  badges: [powder, triangle, season]

pillars:                  # メインセクション（2〜3）
  - id: triangle
    hook: { ja: 都市・温泉・港町, en: City · onsen · port town }
  - id: mobility
    hook: { ja: 冬期動線と夜間規制, en: Winter routes & night closures }

subPages:                 # 任意の子ページ
  - golden-triangle-stay
  - nearby-food
  - nearby-onsen

map:
  sources: ["公式サイト", "LP戦略レポート"]
  heroImage: images/maps/sapporo-kokusai-hero.png

areaMap:                  # 周辺マップを作る場合
  enabled: true
  hookStrategy:
    primary: mixed
    secondary: [food, onsen, sight]

humanReview:
  - japowResortId
  - 道路規制・冬季閉鎖の日付
  - 料金・営業時間
```

---

## 3. LP アーキタイプ — 複製元の選び方

新規は **最も近い既存 LP を丸ごと複製**し、セクションを削る・足すだけにする（ゼロから HTML を書かない）。

| `archetype` | 複製元 | 特徴 | サブページ例 |
|-------------|--------|------|----------------|
| `transit-onsen` | `sichinohe-lp` | 新幹線・駅アクセス + 温泉 | — |
| `wellness-sight` | `biei-lp` | スノーウェルネス + 観光目玉 | `blue-pond.html`, `snow-play.html`, `nearby-*.html` |
| `live-dashboard` | `unabetsu-lp` / `minami-furano-lp` | 運営透明性・ライブ風チップ | — |
| `pivot-campus` | `tsunan-lp` | 一般滑走休止・特化施設・教育 | — |
| `corridor-hub` | `sapporo-kokusai-lp` / `sapporo-teine-lp` | 広域周遊・動線設計 | `golden-triangle-stay.html`, `corridor-stay.html`, `nearby-*.html` |
| `tourism-hub` | `abashiri-lv-lp` | 流氷・観光ハブ | — |
| `local-value` | `shinjo-lp` / `gokazan-lp` / `kamikawa-nakayama-lp` | ローカル密着・駅近・町営 | — |
| `nap-station` | `kiyosato-lp` | 駅近・手ぶら・NAP | — |

**選定ルール**

1. レポートの **第1章の戦略仮説** が何を売っているかで決める（雪質 / アクセス / 観光 / 転換）。
2. 迷ったら `live-dashboard`（情報開示型）か `transit-onsen`（汎用）。
3. 子ページは **レポートにリストがある層だけ** 作る（飲食だけ・温泉だけも可）。

---

## 4. 全体フロー（テンプレ → 詳細ボタン）

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ 戦略レポート  │────▶│ lp-brief.yaml   │────▶│ テンプレ複製      │
│              │     │ japowResortId   │     │ {id}-lp/         │
└──────────────┘     └────────┬────────┘     └────────┬─────────┘
                              │                        │
                              ▼                        ▼
                     ┌─────────────────┐     ┌──────────────────┐
                     │ 専用 PNG        │     │ messages ja/en   │
                     │ map hero        │     │ HTML + mock.css  │
                     └────────┬────────┘     └────────┬─────────┘
                              │                        │
          ┌───────────────────┼────────────────────────┘
          ▼                   ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ map JSON        │   │ registry.json   │   │ Skyticket 配線    │
│ data/maps/{id}  │   │ resort-guides   │   │ apply-rentacar  │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ 機械検証 8 本 PASS  │
                    │ guides/sync.mjs     │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ JAPOWSERCH 同梱     │
                    │ 詳細ボタン → LP URL │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ L3 + Human Gate     │
                    └─────────────────────┘
```

---

## 5. 実装手順（チェックリスト）

### Phase 0 — 受領・命名（15分）

- [ ] レポートから §2.1 必須項目を抜き出し、`configs/lp-brief/{id}.yaml` を作成（またはチャットに貼る）
- [ ] `id` を確定: **英小文字・ハイフン**、既存と重複なし
- [ ] `slug` = `{id}-lp`（慣例）
- [ ] `japowResortId` を確定: **`JAPOWSERCH/RESORTS一覧.txt`**（または `RESORTS一覧en.txt`）で施設名検索。**推測・仮 ID 禁止**
- [ ] アーキタイプを §3 から 1 つ選択し、**複製元フォルダ**（例: `shinjo-lp`）を決める

### Phase 1 — ディレクトリ作成

```bash
# 例: 札幌国際を手稲から複製
cp -r docs/mock-assets/sapporo-teine-lp docs/mock-assets/sapporo-kokusai-lp
# Windows PowerShell:
# Copy-Item -Recurse docs/mock-assets/sapporo-teine-lp docs/mock-assets/sapporo-kokusai-lp
```

- [ ] `index.html` の `data-mock-resort="{id}"` を更新
- [ ] `../map.html?resort={id}` リンクを全ページで統一
- [ ] 不要な子ページ・画像は削除（コピー元の残骸を残さない）
- [ ] 画像ファイル名を `lp-mock-{id}-*.png` にリネームし HTML を追随
- [ ] **他施設の PNG をコピーしない**（バイト同一・ファイル名だけ変更は禁止）。施設専用のフォトリアル AI PNG を新規用意
- [ ] 複製直後: 他 `{id}` 文字列が残っていないか grep（例: 比布なのに `Pippu` / `pippu` が残存していないか）

### Phase 1.5 — LP 画像（必須）

| 種別 | パス | ルール |
|------|------|--------|
| セクション写真 | `{id}-lp/lp-mock-{id}-*.png` | フォトリアル AI **PNG**。SVG・落書き・他施設流用禁止 |
| マップ hero | `images/maps/{id}-hero.png` | コース線**焼き込み**イラスト PNG（簡易 SVG オーバーレイ禁止） |

### Phase 2 — コピー（i18n）

**ルール**: ユーザー向け文言は JSON のみ。HTML 直書き禁止（[i18n_spec.md](./i18n_spec.md)）。

- [ ] `messages/ja.json` — レポートから日本語コピーを転記
  - `hero`, `live` or `transit`, メイン pillar セクション, `paths`, `access`, `guides`, `footer`
- [ ] `messages/en.json` — **同キー構造**で英訳（inbound 向けに短く・能動態）
- [ ] 住所 EN: `access.places` は ruby 単位分割。必要なら `node docs/mock-assets/scripts/apply-en-address-ruby.mjs`
- [ ] 検証:

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
```

### Phase 3 — HTML セクション配線

- [ ] ナビ項目をレポートの柱に合わせて増減（`nav.*` キーと `<a href="#...">` を一致）
- [ ] 使わないセクションは **HTML ごと削除**（空の `data-i18n` だけ残さない）
- [ ] 子ページ: `nearby-food.html` 等は guides アコーディオン・path タイルからリンク
- [ ] 全ページ末尾: `mock-i18n.js` + `data-lang-switch` ボタンがあること

### Phase 4 — ビジュアル（mock.css）

- [ ] 複製元の CSS 変数（`--accent`, `--hero-overlay` 等）をレポートのトーンに合わせて調整
- [ ] 大規模なレイアウト変更は避ける（アーキタイプ変更時のみ別テンプレへ移行）
- [ ] タップ領域 44px、`:focus-visible` は複製元を維持

### Phase 5 — ゲレンデマップ（モック）

**禁止**: 手置きピクセル座標の SVG オーバーレイを「本番品質」として載せること（[lift-map-no-fake-overlays](../../.cursor/rules/lift-map-no-fake-overlays.mdc)）。

モックでは次のパターンのみ:

| 方式 | 条件 |
|------|------|
| **焼き込みイラスト** | `images/maps/{id}-hero.png` にコース線込み。JSON はリスト・ヒットボックスのみ |
| 七戸同等 | 手トレース済み `hitboxes-*.json` がある場合のみ |

手順:

- [ ] `docs/mock-assets/scripts/generate-map-data.mjs` に `mapBase("{id}", ...)` エントリを追加
- [ ] `sources` にレポート・公式の参照元を列挙
- [ ] `bakedLines: true` を維持
- [ ] 実行: `node docs/mock-assets/scripts/generate-map-data.mjs`
- [ ] プレビュー: `http://localhost:3456/map.html?resort={id}`

### Phase 6 — 周辺マップ（任意）

飲食・温泉・観光の回遊を売るレポートなら並行して実施。

- [ ] [AREA_MAP_FACTORY_SPEC.md](./AREA_MAP_FACTORY_SPEC.md) §3 の `configs/area-map/{id}.yaml`
- [ ] 出力: `data/maps/{id}-area.json`
- [ ] LP 埋め込み: `map-embed-layers.js` / area-map リンクを index・子ページに配置
- [ ] 詳細: [area_map_handoff_checklist.md](./area_map_handoff_checklist.md)

### Phase 7 — レジストリ・JAPOW 詳細ボタン契約

**この Phase までが「詳細ボタン」のデータ正本。** UI 実装は JAPOWSERCH 側に既にある（[JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md)）。

- [ ] `docs/mock-assets/registry.json` に resort オブジェクトを追加:

```json
{
  "id": "example-resort",
  "slug": "example-resort-lp",
  "name": { "ja": "…", "en": "…" },
  "region": { "ja": "…", "en": "…" },
  "strategy": { "ja": "…", "en": "…" },
  "guidePath": "/example-resort/",
  "guideUrl": "https://guides.japowserch.com/example-resort/",
  "japowResortId": 0,
  "guideTier": "mock",
  "affiliates": { "rentacar": "asahikawa_airport" }
}
```

- [ ] `data/resort-guides.json` に `"<japowId>": { "registryId": "{id}", "tier": "mock" }` を追加  
  **URL は `registry.id`（`example-resort`）。`slug`（`example-resort-lp`）は使わない。**
- [ ] `node docs/mock-assets/scripts/validate-mock-japow-detail.mjs` exit 0
- [ ] `guides/hub/messages/hub.ja.json` / `hub.en.json` の施設数（`N施設` / `N Resorts`）を更新

### Phase 7.5 — Skyticket レンタカーアフィリエイト（必須）

他施設と同型。**省略不可。**

- [ ] `docs/mock-assets/scripts/apply-rentacar-affiliate.mjs` の `RESORT_COPY` に `{id}` と目的地コピーを追加
- [ ] 必要なら `_shared/affiliates/skyticket-rentacar.json` に `destinations` エントリ（Skyticket URL 根拠付き）
- [ ] 実行:

```bash
node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
```

- [ ] `registry.json` に `"affiliates": { "rentacar": "<destination_id>" }`
- [ ] `index.html` に `rentacar-link.css` · `skyticket-rentacar.js` · `data-skyticket-rentacar-*` ブロック

### Phase 8 — guides 同期（配信ビルド）

```bash
node guides/scripts/sync.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public
```

- [ ] `guides/public/{id}/index.html` が生成される
- [ ] `guides/public/resort-guides.json` に新 `japowId` が含まれる
- [ ] ローカル: `cd guides && npm run dev` → `http://localhost:3456/{id}/` · `?lang=en`

### Phase 9 — JAPOWSERCH 本番データ同期（詳細ボタン成立）

JAPOW マップは **`JAPOWSERCH/data/resort-guides.json`** を読む。SkiresortWebPlan だけ push しても本番ボタンは動かない。

- [ ] `JAPOWSERCH/data/resort-guides.json` を `SkiresortWebPlan/data/resort-guides.json` と **同一内容**に同期
- [ ] **JAPOWSERCH を `fork`（`Seeker-x1/POWDER`）へ push** — rebase 衝突時は `fork/main` 上で `resort-guides.json` のみ cherry-pick / 上書きコミット可
- [ ] push 後、マップで `japowResortId` のカード「詳細確認」→ `https://guides.japowserch.com/{id}/` を確認
- [ ] 未掲載 ID は `null` → 従来どおりカードへスクロール（[guides/HANDOFF.md](../../guides/HANDOFF.md) §②）

### Phase 9.5 — 両リポ push（出荷の最終ステップ）

ユーザーが push 停止を明示しない限り、**次の 2 つをセットで完了**させる。

| リポ | push 対象 | リモート |
|------|-----------|----------|
| SkiresortWebPlan | `{id}-lp` · registry · resort-guides · 手順書 | `origin/main` |
| JAPOWSERCH | `data/resort-guides.json`（最低限） | `fork/main`（`Seeker-x1/POWDER`） |

```bash
# SkiresortWebPlan（検証 PASS 後）
git push origin main

# JAPOWSERCH（fork/main が先行している場合）
cd ../JAPOWSERCH
git fetch fork main
git checkout fork/main -B main-push-sync
# resort-guides.json を SkiresortWebPlan と同一にして commit
git push fork HEAD:main
```

### Phase 10 — Human Gate（公開前必須）

| 確認項目 | 担当 |
|----------|------|
| 料金・営業時間・リフト本数 | 公式サイトと照合 |
| 道路規制・バス時刻 | 冬季版・最新年度 |
| 電話・URL | 実在確認（404 チェック） |
| EN コピー | インバウンドに不自然な直訳がないか |
| `japowResortId` | JAPOW マップでクリック先が正しいか |
| 戦略レポートとの一致 | レポートの「売り」がヒーローと paths に出ているか |

**モック免責**: 戦略提案用である旨は `map` の `disclaimer` および必要なら LP フッター注記で明示（[i18n_spec.md](./i18n_spec.md)）。

### Phase 11 — プレビュー

```bash
npx serve docs/mock-assets -p 3456
```

| URL | 確認内容 |
|-----|----------|
| `/{slug}/index.html` | 日本語デフォルト |
| `/{slug}/index.html?lang=en` | 英語切替・`lang` 属性 |
| `/map.html?resort={id}` | マップリスト・免責 |
| `/area-map.html?resort={id}` | 周辺マップ（作った場合） |
| `/`（hub） | テーブルに新施設が出る |

### Phase 12 — 機械検証 + L3 評価（出荷ゲート）

**8 コマンドすべて exit 0 が commit / push の前提**（[lp-factory-no-shortcuts.mdc](../../.cursor/rules/lp-factory-no-shortcuts.mdc)）。

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs
node guides/scripts/sync.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public
```

基準: [lp_mock_requirements.md](./lp_mock_requirements.md) · [lp_mock_handoff_checklist.md](./lp_mock_handoff_checklist.md)

```
@resort-qa-a11y
対象: docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md LP-Q1–Q9
出力: docs/mock-assets/lp_qa_reports/{id}.md

@resort-visual-evaluator
対象: docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md LP-V1–V6
出力: docs/mock-assets/lp_qa_reports/{id}_visual.md
```

**出荷ゲート:**

```
機械検証 8 本 exit 0
  + resort-qa-a11y PASS (LP-Q1–Q9)
  + resort-visual-evaluator PASS (LP-V1–V6)
  + Human Gate（Phase 10）
  + JAPOWSERCH resort-guides.json 同期（Phase 9）
→ guides 配信・JAPOW 詳細ボタン連携可
```

| FAIL | ブロッカー |
|------|------------|
| LP-V1 or LP-V5 | ビジュアル再実装 |
| LP-Q1–Q9 いずれか | a11y / i18n / JAPOW 詳細修正 |

---

## 6. 成果物一覧

新規ゲレンデ `{id}` 追加時のファイルセット:

```
docs/mock-assets/
  {id}-lp/
    index.html
    mock.css
    messages/ja.json, en.json
    lp-mock-{id}-*.png          # ヒーロー等
    *.html                      # 子ページ（任意）
  data/maps/
    {id}.json                   # ゲレンデマップ
    {id}-area.json              # 周辺マップ（任意）
  images/maps/
    {id}-hero.png
  registry.json                 # エントリ追加 + affiliates.rentacar
  _shared/affiliates/           # skyticket-rentacar（apply スクリプトで配線）

configs/lp-brief/{id}.yaml      # 推奨
data/resort-guides.json         # SkiresortWebPlan 正本
JAPOWSERCH/data/resort-guides.json  # 詳細ボタン用（Phase 9 で同期）
guides/scripts/sync.mjs
guides/hub/messages/hub.*.json  # 施設数
```

---

## 7. Cursor エージェントへの依頼例

チャットを **役割ごとに分ける**（[AGENTS.md](../../AGENTS.md)）。

### 7.1 LP 本体（L2）

```
@resort-template-implementer
docs/mock-assets/LP_FACTORY_PROCEDURE.md §0.2 標準パイプラインに従い、
添付の戦略レポートから {id} の LP をテンプレ複製し、
JAPOW 詳細ボタン連携（resort-guides.json + sync + JAPOWSERCH 同期）まで実施。

- archetype: local-value
- 複製元: shinjo-lp
- registry id: hinode, japowResortId: 52
- 画像: Gemini MCP（チャット内に貼らない）
```

### 7.2 周辺マップ（並行可）

```
@resort-template-implementer
AREA_MAP_FACTORY_SPEC.md に従い example-resort の area-map を生成。
brief: configs/area-map/example-resort.yaml
```

### 7.3 品質ゲート（必須 — Phase 10）

```
@resort-qa-a11y
docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md LP-Q1–Q6

@resort-visual-evaluator
docs/mock-assets/{id}-lp/
基準: lp_mock_requirements.md LP-V1–V6
```

---

## 8. やってはいけないこと

| 禁止 | 理由 |
|------|------|
| 推測座標でコース線 SVG を `/map` 本番に載せる | [lift-map-no-fake-overlays](../../.cursor/rules/lift-map-no-fake-overlays.mdc) |
| HTML に日本語・英語を直書き | i18n 検証が壊れる |
| `nanako` 識別子の使用 | [sichinohe-naming](../../.cursor/rules/sichinohe-naming.mdc) |
| 未検証の β 品質を「公式ガイド」として配信 | `guideTier: "mock"` を維持 |
| `file://` でプレビュー | `fetch` で JSON が読めない |

---

## 9. 本番テンプレへの移行

モック LP が承認されたあと、ルート `src/` への実装は **別 handoff**:

```
resort-ux-designer → resort-design-director → resort-spec-handoff
  → resort-template-implementer → resort-qa-a11y + resort-visual-evaluator
```

モックの `messages/*.json` は参考データ。キー設計は [i18n_spec.md](./i18n_spec.md) §本番テンプレとの関係を参照。

---

## 10. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2026-06-25 | §0.2 標準パイプライン追加 — テンプレ複製→詳細ボタンまでを 1 本化。Phase 9 JAPOWSERCH 同期を明記 |
| 2026-06-23 | Phase 12 機械検証 + L3 評価 |
| 2026-06-23 | 初版 — 戦略レポート受領〜 guides 配信までの Factory 手順 |
