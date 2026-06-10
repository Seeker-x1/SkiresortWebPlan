# web（七戸町営スキー場 フロントエンド）

## 開発

```bash
npm install
npm run dev
```

### リフトマップ（`/map`）

高解像度 **ヒーロー画像**（`public/maps/sichinohe-hero.png`）の上に **SVG オーバーレイ**でリフト・コースを表示します。Mapbox トークンは不要です。

- オーバーレイ座標: `data/map/overlay-paths.json`
- 運行状況: `data/map/status.json` を編集 → `/api/public/map-status` に反映
- 本番用画像は Blender / Google Earth Studio 書き出しに差し替え

Windows では `start-dev.bat` をダブルクリックしても起動できます。

- ローカル: [http://localhost:3000](http://localhost:3000)
- 同一Wi-Fi内のスマホ: `http://（PCのIP）:3000`（例: `http://192.168.10.5:3000`）

**注意**
- 必ず `web` フォルダで `npm run dev` を実行してください（親フォルダでは動きません）
- 初回アクセスはビルドに **10〜15秒** かかることがあります（真っ白に見えても少し待つ）
- HTMLファイルを直接開くのではなく、必ず上記 URL をブラウザのアドレスバーに入力してください
- Lint: `npm run lint`
- Build: `npm run build`

## 実データ連携（ファイルベース）

このMVPは `web/data/resort-data.json` を単一ソースとして読み込みます。

- 読み込みロジック: `src/lib/resort-data.ts`
- 主なページ（today / live-cams / faq / courses / tickets-rental / lessons-events / stay-local / news / contact / access / lift-deals）はこのデータを参照

## 多言語（i18n）

- `next-intl` による JA（デフォルト）/ EN 対応
- 日本語: `/`、英語: `/en/...`
- 文言: `messages/ja.json` / `messages/en.json`

## ライブカメラ（プレースホルダー）

カメラ設置前は `liveCams.items[].status: "preparing"` でフレームのみ表示します。配信開始時は `status: "live"` と `streamUrl` を設定してください。

## API

- `GET /api/public/resort`  
  公開用の統合データJSONを返します（`contact` は除外）。

- `GET /api/public/resort/popup`  
  地図ポップアップ向けの軽量JSONを返します（`slug`・座標・営業/積雪/リフト要約、最寄駅、最新ニュース、導線リンク）。

- `GET /api/public/resorts`  
  地図ピン一覧向けの軽量JSONを返します（`resorts[]` に `resortId` / `slug` / `coordinates` / 状態要約を含む）。

- `GET /api/public/map`  
  ゲレンデマップ用の中心座標とリフト GeoJSON（`web/data/map/`）を返します。

- `GET /api/admin/resort`  
  管理データ取得用。`Authorization: Bearer <ADMIN_UPDATE_TOKEN>` が必要です。

- `POST /api/admin/resort`  
  管理更新用（ローカルMVP）。`Authorization: Bearer <ADMIN_UPDATE_TOKEN>` が必要です。  
  受け取るJSON:

```json
{
  "patch": {
    "today": {
      "lastUpdated": "2026-05-07 21:00"
    }
  }
}
```

`patch` は次のトップレベルキーのみ更新可能です:  
`resort` `today` `access` `courses` `ticketsRental` `lessonsEvents` `stayLocal` `news` `contact` `liftDeals` `liveCams` `faq`

## 管理画面

- URL: `/admin`
- まずは「今日の運営」項目を更新する最小版です。
- トークンを入力 → 「現在値を読込」→ 編集 → 「今日の運営を保存」の順で運用します。

## 環境変数

`.env.example` を参照し、必要なら `.env.local` を作成してください。

- `ADMIN_UPDATE_TOKEN`（管理更新API用）
