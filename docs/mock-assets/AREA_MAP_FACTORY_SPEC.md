# 周辺マップ Factory — テンプレート化・Deep Research 自動化 spec

> **目的**: 「周辺マップ」を呼び出すと、ゲレンデごとのインバウンド向け POI 調査 → データ生成 → BKKDW 型 UI 表示まで一連で回せる仕組みを定義する。  
> **前提 UI**: `docs/mock-assets/_shared/area-map.js` + `{resortId}-area.json`（[AREA_MAP_BKKDW_AGENT_BRIEF.md](./AREA_MAP_BKKDW_AGENT_BRIEF.md)）  
> **対象外**: 七戸 `/map` リフトマップ、座標の手置きオーバーレイ

---

## 1. 結論 — ここまで自動化できるか

| フェーズ | 自動化度 | 説明 |
|----------|----------|------|
| **調査指示の生成** | ✅ 100% | ゲレンデ brief（YAML）から Gemini 用プロンプトを機械生成 |
| **Deep Research 実行** | ✅ 90% | Gemini Deep Research に投入。出力は Markdown |
| **Markdown → JSON 変換** | ✅ 85% | LLM + スキーマバリデーション。分類・施設名・コメントは高精度 |
| **電話・URL 事実確認** | ⚠️ 60% | 自動 HEAD リクエスト + 検索照合。**最終は人間 1 パス必須** |
| **緯度経度付与** | ⚠️ 70% | Nominatim / Google Geocoding API。**曖昧ヒットは要確認** |
| **フック戦略の選定** | ⚠️ 50% | brief で「飲食主軸 / 観光主軸 / 混合」を指定 → プロンプト分岐。**目玉 1 件は人間承認推奨** |
| **マップ JSON 書き出し** | ✅ 100% | `data/maps/{id}-area.json` + `registry.json` 更新 |
| **UI 表示** | ✅ 100% | 既存 `area-map.html?resort={id}` がデータ駆動 |
| **LP 埋め込み・本番 src/** | ⚠️ 80% | モックは即時。`src/` テンプレは handoff 後に implementer |

### 一言

**「調査 → 下書き JSON → マッププレビュー」まではほぼ自動化可能。**  
**公開品質（電話・座標・インバウンドコピーの正確性）には必ず Human Gate を 1 段挟む。**  
完全無人公開は非推奨（ハルシネーション・冬季休業・座標ズレのリスク）。

---

## 2. システム像

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ area-map-brief  │────▶│ Prompt Builder       │────▶│ Gemini Deep     │
│ .yaml (ゲレンデ) │     │ (フック戦略テンプレ)   │     │ Research        │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
                                                                │ Markdown
                                                                ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ area-map.html   │◀────│ {id}-area.json       │◀────│ Normalize +     │
│ ?resort={id}    │     │ (biei-area スキーマ)  │     │ Geocode + QA    │
└─────────────────┘     └──────────────────────┘     └────────▲────────┘
                                                                │
                                                     ┌──────────┴──────────┐
                                                     │ Human Gate (任意)   │
                                                     │ POI 承認・座標修正   │
                                                     └─────────────────────┘
```

**呼び出し方（完成後）**:

```bash
npm run area-map:generate -- --resort bihoro --brief configs/area-map/bihoro.yaml
npm run area-map:preview  -- --resort bihoro
# → http://localhost:3456/area-map.html?resort=bihoro
```

---

## 3. ゲレンデ brief（入力テンプレート）

各ゲレンデ 1 ファイル。フック戦略をここで指定する。

**パス（新規）**: `configs/area-map/{resortId}.yaml`

```yaml
resortId: bihoro
schemaVersion: "2026-06-15"

# 調査の中心
hub:
  name:
    ja: 美幌町国スポスキー場
    en: Bihoro Town Ski Area
  lat: 43.8231   # 既知なら直接。なければ research 後に geocode
  lon: 144.0456
  mapsQuery: "美幌町国スポスキー場"

# インバウンド・フック戦略（プロンプト分岐の核心）
hookStrategy:
  primary: sight          # food | onsen | sight | stay | mixed
  secondary: [food, onsen]
  narrative:
    ja: "糠平湖・摩周の絶景と、道東のローカル食堂を雪遊び後に回遊"
    en: "Lake Kussharo views and east Hokkaido local dining after snow play"
  anchorHighlights:       # 目玉（観光スポット系）。food 主軸なら空でも可
    - id: kussharo
      label: { ja: 糠平湖, en: Lake Kussharo }
      hook: { ja: "冬の蒸気霧とサンセット", en: "Winter steam mist at sunset" }
  foodHighlights: []      # 飲食主軸ゲレンデ向け。美瑛なら dairy/bakery 等

# 調査半径・レイヤ
research:
  radiusKm: 35
  layers:
    food: { enabled: true, minPois: 8, maxPois: 15 }
    onsen: { enabled: true, minPois: 3, maxPois: 8 }
    stay: { enabled: false }   # v1 は food/onsen/anchor のみ
    anchor: { enabled: true, minPois: 2, maxPois: 6 }
  localeAudience: inbound   # inbound | domestic | both
  excludeCategories: []     # 例: ["fine-dining"] で高級のみ除外

# マップ UI デフォルト
mapDefaults:
  defaultLayers: [food, anchor]
  hubAnchorId: ski
  boundsProfile: skiFood    # 自動生成 or テンプレ名
```

### フック戦略パターン（ゲレンデ例）

| ゲレンデ | `primary` | 目玉 | 飲食の役割 |
|----------|-----------|------|------------|
| **美瑛** | `mixed` | 青い池（`anchor`） | ジャンル多様（酪農・パン）がフック |
| **美幌** | `sight` | 糠平湖・摩周 | 雪遊び後のローカル食堂 |
| **七戸** | `onsen` | 新幹線駅 | 温泉 + 駅近グルメ |
| **ウナベツ** | `sight` | 流氷・知床方面 | 斜里の海鮮 |

brief の `hookStrategy.primary` が Gemini プロンプトの「調査対象」「厳選基準」を切り替える。

---

## 4. Gemini Deep Research プロンプト（テンプレート）

**生成器**: `scripts/area-map/build-research-prompt.mjs`  
**実行**: 人手で Gemini Deep Research UI、または Gemini API（Deep Research 対応時）

### 4.1 プロンプト骨格

```markdown
# 命令書:
あなたは「インバウンド観光マーケティングと地域活性化に精通したシニアリサーチャー」です。
以下の[調査対象]について、外国人観光客向けのマップ作成の基礎となる徹底的なDeep Researchを行い、要件を満たした構造化リストを作成してください。

# 調査対象:
{{hub.name.ja}}を中心とした半径{{research.radiusKm}}km圏内の観光資源
（{{enabled_layers}}）

# フック戦略（このゲレンデの訴求軸）:
- 主軸: {{hookStrategy.primary}} — {{hookStrategy.narrative.ja}}
- 目玉候補: {{anchorHighlights | foodHighlights}}
- 二次軸: {{hookStrategy.secondary}}

# 調査項目:
1. インバウンド観光客のフックとなる施設を、上記主軸に沿って深掘りすること。
2. {{#if primary==food}}飲食を中心に、雪景色・ローカル食材のストーリーが強い店を優先。{{/if}}
   {{#if primary==sight}}観光スポット・絶景・文化施設を中心に、飲食は回遊の補完として厳選。{{/if}}
   {{#if primary==onsen}}温泉・日帰り入浴を中心に、冬季アクセスと外国人向け受入を確認。{{/if}}
3. マップの目玉となる質の高い場所を厳選し、指定フォーマットでリスト化。

# 制約条件:
- Web検索をフル活用。最新・正確な情報。
- ハルシネーション禁止。電話・URLは公式または信頼ソースで確認。不明は「情報なし」。
- 一言コメントは施設説明ではなく、インバウンドに刺さる理由をプロ視点で記載。
- 各施設に Google Maps で検索可能な正式名称を付ける。

# 出力形式:
## インバウンド向け 厳選リスト
（各施設）
- **分類**: [飲食 / 温泉 / 拠点 / 宿]
- **施設名**:
- **電話番号**:
- **公式サイト**:
- **Googleマップリンク**:
- **一言コメント**:
- **選定理由タグ**: [food-hook | sight-hook | onsen-hook | access-hook]
```

### 4.2 美瑛向け具体例（ユーザー提示プロンプトの位置づけ）

ユーザー提示の美瑛プロンプトは **`hookStrategy.primary: mixed`** + `anchorHighlights: [青い池]` の brief から **自動生成される 1 インスタンス**。手書きプロンプトは brief に吸収する。

---

## 5. 後処理パイプライン（Normalize）

**スクリプト（新規）**: `scripts/area-map/normalize-research.mjs`

| ステップ | 処理 | 自動/手動 |
|----------|------|-----------|
| 1. Parse | Deep Research Markdown → 中間 JSON | 自動 |
| 2. Slugify | `id`: `junpei`, `blue-pond` | 自動 |
| 3. Geocode | 施設名 + 町名 → `lat`, `lon`（Nominatim） | 自動 + 信頼度スコア |
| 4. Verify URL | `HEAD` + タイムアウト。4xx/5xx → フラグ | 自動 |
| 5. Verify phone | 桁数・市外局番形式 | 自動（厳密確認は人） |
| 6. Map groups | 分類 → `food` / `onsen` / `anchors` | 自動 |
| 7. Category | 細分類 → `bakery`, `cafe`, `view` 等 | LLM 1 回 |
| 8. boundsProfiles | brief + POI 分布から zoom 推定 | 自動（テンプレ） |
| 9. Emit | `docs/mock-assets/data/maps/{id}-area.json` | 自動 |
| 10. Registry | `registry.json` に `areaMap: true` | 自動 |

**Human Gate（推奨必須）**:  
`data/maps/{id}-area.draft.json` → レビュー → `{id}-area.json` に promote。

---

## 6. 出力 JSON スキーマ（既存拡張）

`biei-area.json` を正とする。Factory 出力は同一スキーマ。

```jsonc
{
  "schemaVersion": "2026-06-14-bkkdw",
  "id": "bihoro-area",
  "resortId": "bihoro",
  "hookStrategy": { "primary": "sight", "narrative": { "ja": "…", "en": "…" } },
  "anchors": [{ "id": "ski", "category": "ski", "lat", "lon", "label", "phone?", "website?", "hookComment?" }],
  "food": [{ "id", "category", "lat", "lon", "label", "phone?", "website?", "mapsQuery", "hookComment?" }],
  "onsen": [ /* 同 */ ],
  "boundsProfiles": { /* brief テンプレから */ },
  "researchMeta": {
    "source": "gemini-deep-research",
    "briefVersion": "2026-06-15",
    "generatedAt": "ISO8601",
    "humanReviewed": false
  }
}
```

- **`hookComment`**: Deep Research の「一言コメント」（ポップアップ・LP リスト用）
- **`researchMeta.humanReviewed: false`** の間は LP 本番 embed 禁止（draft バナー表示）

---

## 7. テンプレート統合（モック → 本番 `src/`）

### 7.1 現状（モック）

| 要素 | パス | データ駆動 |
|------|------|------------|
| 周辺マップ UI | `_shared/area-map.js`, `.css` | ✅ |
| 1 URL | `area-map.html?resort={id}` | ✅ |
| データ | `data/maps/{id}-area.json` | ✅ |
| LP リンク | `nearby-food.html` → `area-map.html?resort=biei&layers=…` | 部分 |

### 7.2 本番テンプレ（将来）

| 要素 | 移行先 | 備考 |
|------|--------|------|
| `AreaMapViewer` | `src/components/map/AreaMapViewer.tsx` | Leaflet → 動的 import |
| データ | `content/area-maps/{slug}.json` または CMS | Factory 出力を sync |
| ルート | `/[locale]/area-map` or `/[locale]/nearby` | `resortConfig.areaMap.enabled` |
| 生成 | `npm run area-map:generate` | CI / オンボーディング |

**resort-map-bridge** が「LP → 周辺マップ」の href 契約を `docs/map_integration_spec.md` に追記。

---

## 8. npm スクリプト（追加予定）

```json
{
  "area-map:prompt": "node scripts/area-map/build-research-prompt.mjs",
  "area-map:import": "node scripts/area-map/normalize-research.mjs",
  "area-map:generate": "node scripts/area-map/run-factory.mjs",
  "area-map:preview": "npx serve docs/mock-assets -p 3456"
}
```

**`run-factory.mjs` フロー**:

1. brief 読込  
2. プロンプト出力（`stdout` or `out/{id}-research-prompt.md`）  
3. `--research-file` 指定時のみ import → draft JSON  
4. `--approve` で human-reviewed JSON に promote  
5. registry 更新  

Gemini API 直叩きは **API キー・Deep Research エンドポイント可用性** に依存。v1 は **プロンプト生成 + 手動ペースト + import** で十分。

---

## 9. エージェント分担（Factory 版）

| 順 | エージェント | 役割 |
|----|-------------|------|
| 1 | **resort-ux-designer** | brief 項目・フック戦略タイプの UX 定義 |
| 2 | **resort-design-director** | Factory 出力 → UI の受け入れ基準 |
| 3 | **resort-map-bridge** | `src/` 統合・URL 契約・データ境界 |
| 4 | **11-partner-onboarding**（七戸） | 新規ゲレンデ onboarding チェックリストに Factory 手順追加 |
| 5 | **resort-spec-handoff** | スクリプト + スキーマ + QA ゲート |
| 6 | **resort-template-implementer** | `scripts/area-map/*`, brief テンプレ, registry |
| 7 | **resort-qa-a11y** + **visual-evaluator** | 生成マップの PASS/FAIL |

**Deep Research 実行本体**は Cursor/Gemini 上の **人手 1 ステップ**（または将来 API ワーカー）。

---

## 10. リスクと対策

| リスク | 対策 |
|--------|------|
| 電話・URL 捏造 | draft フラグ + HEAD 検証 + 人間承認 |
| 座標ズレ | geocode 信頼度 < 0.8 は `needsReview: true` |
| 冬季休業・道路規制 | disclaimer 固定 + `updatedAt` 明示 |
| ゲレンデごとフック誤り | brief の `primary` 必須。Director が onboarding 時に 1 回設定 |
| コピー左 | hookComment は AI 生成 → 公開前に編集可能フィールド |

---

## 11. 実装ロードマップ

> **P0 は別エージェントトラックで進行中。** Factory（P1 以降）は P0 完了物を **上書きせず拡張** する。

| Phase | 担当 | 内容 | 参照ドキュメント |
|-------|------|------|------------------|
| **P0** | `@resort-template-implementer`（別チャット） | BKKDW 型 UI v2 — fitBounds・統一ドット・地図上 popup・70/30 | `area_map_handoff_checklist.md` |
| **P1** | Factory スクリプト | `configs/area-map/*.yaml` + プロンプト生成 | 本 spec §4 |
| **P2** | Factory スクリプト | Research Markdown → `{id}-area.json`（**P0 の data contract 準拠**） | `area_map_data_contract.md` |
| **P3** | 運用 | draft → approve 人間ゲート | 本 spec §5 |
| **P4** | PoC | 美幌等 2 ゲレンデ目で Factory 通し | `configs/area-map/bihoro.yaml` |
| **P5** | `@resort-template-implementer` | `src/` AreaMapViewer 統合 | `map_integration_spec.md` |

### P0 完了の判定（Factory 開始前チェック）

- [ ] `area-map.js` が divIcon 統一ドット + `bindPopup`（PNG ピン廃止）
- [ ] `biei-area.json` の `schemaVersion` が `2026-06-14-bkkdw`
- [ ] `area_map_qa_report.md` / `area_map_qa_visual.md` が PASS（または P0 自己確認完了）

**Factory が触るファイル:** `data/maps/{id}-area.json`, `configs/area-map/*.yaml`, `scripts/area-map/*`  
**Factory が触らないファイル（P0 成果）:** `area-map.js`, `area-map.css`, `area-map.html` の UI ロジック

---

## 12. 起動例（P1 完成後）

```bash
# 1. brief から調査プロンプト生成
npm run area-map:prompt -- --resort bihoro

# 2. Gemini Deep Research に貼り付け → 結果を保存
#    out/bihoro-research.md

# 3. JSON 化 + マップデータ生成
npm run area-map:import -- --resort bihoro --research-file out/bihoro-research.md

# 4. プレビュー
npm run area-map:preview
# → area-map.html?resort=bihoro

# 5. 承認
npm run area-map:import -- --resort bihoro --approve
```

---

## 13. 関連ドキュメント

- [AREA_MAP_BKKDW_AGENT_BRIEF.md](./AREA_MAP_BKKDW_AGENT_BRIEF.md) — UI・ポップアップ spec  
- [data/maps/biei-area.json](./data/maps/biei-area.json) — 参照データ  
- [registry.json](./registry.json) — ゲレンデ一覧  
- [../map_integration_spec.md](../map_integration_spec.md) — 本番 `/map` との境界  
