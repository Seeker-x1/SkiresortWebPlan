# スキー場リフトマップ WebDX 雛形 — 設計書（フェーズ1〜2）

LAAX 級の体験を段階的に目指す、全国ゲレンデ向け汎用テンプレートのシステム・UI・データ契約を定義する。

**実装の進め方（ビジュアル優先）**: [ROADMAP_LIFT_MAP_VISUAL_FIRST.md](./ROADMAP_LIFT_MAP_VISUAL_FIRST.md)

---

## 1. システムアーキテクチャ設計

### 1.1 データフロー（テキスト図解）

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 現場（パトロール・リフト係）                                              │
│  LINE Official Account  … リッチメニュー / Postback / LIFF ミニフォーム   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS Webhook (Messaging API)
                                │ X-Line-Signature 検証
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ LINE Bridge（サーバーレス or 小さな API）                                  │
│  - 送信者ホワイトリスト（LINE User ID）                                   │
│  - Postback / 定型コマンド → 構造化イベント                               │
│  - 監査ログ（who / when / what）                                         │
│  - レート制限・二重送信ガード                                             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ 内部 REST（認証付き）
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Operations API（テナント単位）                                            │
│  PATCH /v1/resorts/{slug}/operations                                     │
│  - lifts[] / trails[] の status 更新                                     │
│  - 楽観ロック（version / updatedAt）                                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
   │ PostgreSQL   │    │ Redis        │    │ Object Storage   │
   │ (正規データ)  │    │ (Pub/Sub or  │    │ (SVG/GeoJSON/    │
   │              │    │  最新キャッシュ)│    │  3Dタイル)       │
   └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘
          │                   │                      │
          └───────────────────┼──────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
   GET /v1/public/resorts/{slug}/map-status   SSE or WebSocket
   （CDN キャッシュ可・短 TTL 5〜15s）          /map-stream（任意）
          │                                       │
          └───────────────────┬───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ フロントエンド（フェーズ1: SVG / フェーズ2: Mapbox or Cesium）             │
│  - data-feature-id で SVG 要素と JSON を結合                             │
│  - ポーリング or SSE で status 反映（色・aria-label）                      │
│  - タップ → ボトムシート詳細                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**リアルタイムの考え方**

| 経路 | 用途 | 目標遅延 |
|------|------|----------|
| LINE → DB 書込 | 真実のソース | 1〜3 秒 |
| 公開 GET + CDN | 来場者の大半 | 5〜15 秒（TTL） |
| SSE（任意） | マップ画面のみ即時 | &lt; 1 秒 |

フェーズ2で 3D に切り替えても、**Operations API の JSON スキーマは不変**。フロントは `renderMode: "svg" | "mapbox" | "cesium"` のアダプタだけ差し替える。

### 1.2 推奨技術スタック（軽量・モダン）

| レイヤ | 推奨 | 理由 |
|--------|------|------|
| フロント（フェーズ1） | **Next.js 16** + React 19 + TypeScript + Tailwind 4 | 既存雛形と一致。SSR/ISR、埋め込み widget 化しやすい |
| SVG 操作 | 自前 transform + `data-feature-id` 結合（または `@use-gesture/react`） | 依存最小。LAAX 級の慣性は後から追加可 |
| フロント（フェーズ2） | **Mapbox GL JS**（標高 DEM + コース GeoJSON） / 大規模は **Cesium** | 日本の標高タイル・商用利用の整理がしやすい Mapbox を第一候補 |
| バックエンド API | **Hono** on **Cloudflare Workers** または **Node (Fastify)** on Fly.io | コールドスタート・Webhook 向き。小チームで単一リポ運用可 |
| DB | **PostgreSQL**（Neon / Supabase） | 監査ログ・リレーション・将来のハブ連携 |
| キャッシュ / Pub | **Redis**（Upstash） | 最新スナップショット + SSE fan-out |
| LINE | Messaging API +（MVP）**リッチメニュー Postback** →（拡張）**LIFF** | 自由文 NLU は避け、誤公開リスクを下げる |
| インフラ | Vercel（FE）+ Workers/Fly（API）+ R2/S3（静的マップ） | スキー場ごとサブドメイン or パステナント |
| 観測 | Sentry + 構造化ログ（監査は DB 必須） | 現場トラブル時の切り分け |

### 1.3 公開 API 契約（フェーズ共通）

```json
{
  "schemaVersion": "2026-06-01",
  "resortId": "example-ski",
  "updatedAt": "2026-06-05T08:12:00+09:00",
  "features": [
    {
      "id": "lift-1",
      "type": "lift",
      "status": "operating",
      "label": "第1ペアリフト",
      "reason": null,
      "meta": { "capacity": "2人", "rideMinutes": 4 }
    },
    {
      "id": "trail-a",
      "type": "trail",
      "status": "open",
      "label": "チャンピオンコース",
      "reason": null
    }
  ]
}
```

`status` enum（lift）: `operating` | `stopped` | `hold` | `unknown`  
`status` enum（trail）: `open` | `closed` | `partial` | `unknown`

SVG 側は各インタラクティブ要素に `data-feature-id="{id}"` を付与する。

---

## 2. UI/UX 要件定義と Figma モックアップ指示書

### 2.1 モバイルファースト UI コンポーネント一覧

| # | コンポーネント | 仕様要点 |
|---|----------------|----------|
| 1 | **AppHeader（コンパクト）** | ロゴ + 施設名 + 「最終更新 8:12」+ 言語切替（任意） |
| 2 | **StatusTicker** | リフト停止本数・強風注意を1行スクロール（P0） |
| 3 | **MapViewport** | 画面高の 55〜65vh。角丸 16px。背景は薄いグラデ（雪面） |
| 4 | **MapGestureLayer** | ピンチズーム・二本指パン・ダブルタップズーム。ボタンと競合しない safe area |
| 5 | **MapControls（FAB 縦積み）** | ＋／−ズーム、現在地（フェーズ2 GPS）、フィット（全体表示） |
| 6 | **LegendSheet** | 下からスワイプ可能な半モーダル：稼働中／停止／確認中の色とアイコン |
| 7 | **FeatureBottomSheet** | タップ時：名称・状態バッジ・停止理由・所要時間・「公式ページへ」 |
| 8 | **FilterChips（任意）** | リフトのみ／コースのみ／停止のみ |
| 9 | **EmbedChrome** | iframe 用：ヘッダー省略・Legend 常時コンパクト |
| 10 | **OfflineBanner** | API 失敗時「最後に取得した表示」+ 再試行 |
| 11 | **StaffContrastMode** | 屋外視認：コントラスト比 4.5:1 以上、停止はグレー+斜線パターン |

**トークン（Figma Variables 推奨）**

- 稼働: `#16A34A` / 停止: `#64748B` / 保留: `#F59E0B` / 不明: `#94A3B8`
- タップ領域最小 44×44 pt
- フォント: 見出し SF Pro / Noto Sans JP 16–18、本文 14

### 2.2 現場スタッフ向け LINE 操作シナリオ（UI テキスト例）

**初回（リッチメニュー）**

```
【七戸スキー 運行更新】
タップして今日の状態を更新できます。

[ リフトを更新 ]  [ コースを更新 ]
[ 雪・天気を更新 ]  [ 今日のサマリー ]
```

**リフト更新（Postback フロー）**

```
Bot: どのリフトを更新しますか？
[ 第1ペア ] [ 第2ペア ] [ チャンピオンリフト ]

（ユーザーが「第1ペア」をタップ）

Bot: 第1ペアリフトの状態は？
[ 運転中 ] [ 停止 ] [ 確認中 ]

（「停止」をタップ）

Bot: 停止理由（任意）
[ 強風 ] [ 機械点検 ] [ その他 ] [ スキップ ]

Bot: 以下で公開します。よろしいですか？
・第1ペアリフト：停止（強風）
[ 公開する ] [ やり直す ]

（公開する）

Bot: 反映しました（8:12）。マップに表示されます。
```

**緊急一括停止（プリセット）**

```
Bot: プリセットを実行しますか？
「強風 — 上部リフトのみ停止」
対象: 第2ペア, チャンピオンリフト
[ 実行 ] [ キャンセル ]
```

### 2.3 Figma フレーム構成（375×812 基準）

```
┌──────────────────────────────────────┐  y=0
│ Header 56px                          │  施設名 + updatedAt
├──────────────────────────────────────┤
│ Ticker 32px（任意）                   │
├──────────────────────────────────────┤
│                                      │
│   Map Viewport (flex-grow)           │  SVG プレースホルダー
│   右下: FAB Stack 48px角×3           │  + / − / 全体表示
│   左下: Legend  pill → tap で Sheet  │
│                                      │
├──────────────────────────────────────┤
│ Filter chips 40px（横スクロール）     │
└──────────────────────────────────────┘

Overlay: BottomSheet 40%〜70% 高
  - Handle 4×32
  - Title + StatusBadge
  - Reason / Meta rows
  - Primary CTA: 閉じる
```

**Figma 作業手順**

1. Variables: 色・spacing・radius をライト/ダーク2モード
2. コンポーネント: `Map/ControlFAB`, `Map/Legend`, `Map/FeatureSheet`
3. プロトタイプ: マップ上 Lift パスタップ → Sheet Open；Legend → Sheet
4. 状態バリアント: operating / stopped / unknown の3色を Lift Path に割当

---

## 3. フェーズ1 プロトタイプ（実装場所）

実装コードは `resorts/Sichinohe-CyoueiSki/web` に配置:

| パス | 内容 |
|------|------|
| `src/components/lift-map/*` | パン・ズーム・動的着色・ポップアップ |
| `src/app/map/page.tsx` | デモページ |
| `src/app/api/public/map-status/route.ts` | モック JSON API |

ローカル確認: `npm run dev` → `/map`

---

## フェーズ2 への接続メモ

- `features[].id` を GeoJSON `properties.featureId` にそのままマッピング
- 3D レイヤは「地形 + ラインストリング」、色は Mapbox の data-driven style で同一 enum
- LINE / Operations API は変更しない
