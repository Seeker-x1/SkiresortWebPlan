# LP案モック — 日英 i18n 管理仕様

## 対象

`docs/mock-assets/` 配下の静的 LP プレビュー（11施設）。本番 `src/` / `resorts/*/web/` とは別系統。

## ロケール

| 項目 | 値 |
|------|-----|
| 対応 | `ja`（既定）, `en` |
| 保存 | `localStorage` キー `mock-lp-locale` |
| URL | `?lang=en` で上書き（共有リンク用） |
| HTML | `document.documentElement.lang` を同期 |

## ファイル構成

```
docs/mock-assets/
  registry.json              # 施設一覧メタ（索引ページ用）
  i18n_spec.md               # 本書
  index.html                 # 11施設ハブ（日英）
  _shared/
    mock-i18n.js             # LP共通ローダー
    mock-i18n.css            # 言語切替 UI
    mock-hub.css             # 索引ページ
    messages/
      ui.ja.json             # 共通 UI 文言（ja）
      ui.en.json             # 共通 UI 文言（en）
  scripts/
    validate-mock-i18n.mjs   # ja/en キー parity 検証
    validate-mock-html-i18n.mjs
    generate-map-data.mjs    # data/maps/*.json 再生成
  map.html                   # 共通ゲレンデマップ（?resort=ID&lang=en）
  data/maps/
    {id}.json                # 概略コースマップ（11施設・座標は概略）
  _shared/
    mock-i18n.js / mock-i18n.css / mock-hub.js
    resort-map.js / resort-map.css   # マップ UI（七戸 /map レイアウト参考）
    messages/
      ui.ja.json / ui.en.json
  {resort}-lp/
    messages/
      ja.json
      en.json
    index.html               # data-i18n 属性 + mock-i18n.js
```

## メッセージ境界

| 置き場所 | 内容 |
|----------|------|
| `_shared/messages/ui.*.json` | Access, Google Map, 電話する, Explore, 特集, 読む, 言語切替 等 |
| `{resort}/messages/*.json` | 施設固有コピー（hero, 戦略訴求, 住所注記の英訳 等） |
| HTML 直書き禁止 | ユーザー向け文言は JSON のみ。**例外**: `.mock-banner` は `docs/mock-assets/` ローカルプレビュー用のみ。`guides.japowserch.com` ビルド（`sync.mjs`）では除去される。

## HTML バインディング

| 属性 | 用途 |
|------|------|
| `data-i18n="hero.title"` | テキスト置換 |
| `data-i18n-html="hero.title"` | innerHTML（`<br>` 可） |
| `data-i18n-attr="alt:hero.imgAlt"` | 属性置換 |
| `data-lang-switch` | 言語ボタン（値: `ja` / `en`） |
| `data-mock-resort` on `<html>` | 施設 ID（`registry.json` の `id`） |

## 住所・電話

- **JA**: 郵便番号・住所行は `ja.json` の正式表記（プレーンテキスト）
- **EN**:
  - `access.line` · `footer.location` — **プレーン英語**（ルビなし・読める1行）
  - `access.places` — 行政単位ごとの地名行（例: 北海道 · 上川郡 · 美瑛町 · 字大村村山）。`<ruby>日本語<rt>English</rt></ruby>` を **単語単位**で `place-unit` に分割。`data-i18n-html`
  - 生成: `node scripts/apply-en-address-ruby.mjs`
- `access.note` は英訳（アクセス説明）
- 電話番号の数字は ja/en 同一可。括弧内注記は英訳

## 合格基準（検証）

1. `validate-mock-i18n.mjs` が exit 0（全 JSON キー parity）
2. 各 `index.html` に `mock-i18n.js` と `data-lang-switch` あり
3. 索引 `index.html` が registry 全件を両言語で表示
4. QA: 未翻訳キー 0、切替後 `lang` 属性更新、フォーカス可能な言語 UI

## プレビュー（必須）

`fetch()` で JSON を読むため、**ローカルHTTPサーバーが必要**（`file://` 直開きでは言語切替不可）。

```bash
npx serve docs/mock-assets -p 3456
```

- 索引: http://localhost:3456/
- ゲレンデマップ: http://localhost:3456/map.html?resort=sichinohe
- 英語: `?lang=en` を付与（例: http://localhost:3456/sichinohe-lp/index.html?lang=en）

## ゲレンデマップ（概略）

- **目的**: 戦略レポート用モック。公式パンフレット級の正確さは未保証。
- **URL**: `map.html?resort={registry.id}`（例: `unabetsu`, `abashiri-lv`）
- **画像**: `images/maps/{id}-hero.png` — 七戸本番 `sichinohe-hero-v5.png` 同等の**イラスト焼き込み**（簡易SVG禁止）
- **七戸**: `sichinohe-hero.png` + `hitboxes-hero-v5.json` 手トレース座標
- **他施設**: 同スタイルのイラスト PNG（Gemini生成）+ リスト操作（タップ領域は未キャリブ）
- **禁止**: 本番 `/map` 向けの未検証ジオオーバーレイ。各 JSON に `disclaimer`（ja/en）を必須。
- **再生成**: `node docs/mock-assets/scripts/generate-map-data.mjs`
- LP・索引のナビから `../map.html?resort=…` でリンク

## 検証コマンド

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
```

## 本番テンプレとの関係

ルート `messages/ja.json` のキー設計を参考にするが、モックは独立管理。本番実装時は `resort-template-implementer` へ別途 handoff。

## guides.japowserch.com 配信

| 項目 | 値 |
|------|-----|
| ホスト | `https://guides.japowserch.com` |
| パス | `/{registry.id}/`（`slug` ではない） |
| ビルド | `cd guides && npm run build` |
| 出力 | `guides/public/`（Vercel Root Directory = `guides`） |
| 連携 | `guides/HANDOFF.md` · 配信時 `/registry.json` |

開発は従来どおり `docs/mock-assets/`。JAPOWSERCH「詳細確認」は `registry.json` の `guideUrl` を参照（`japowResortId` で `indexByJapowResortId` 引きも可）。
