# Hotel Compare v2 — アフィリエイト配線の実態（P0 棚卸し）

**調査日:** 2026-09-03  
**対象:** `SkiresortWebPlan` + 兄弟リポ `JAPOWSERCH`  
**目的:** hotel-compare 作り変え前の「今どこが稼いでいて、どこが空振りか」の正本

---

## 結論（先に読む）

### 今日から収益化できる導線

| プログラム | ID / 方式 | 実際にリンクが出ている場所 | hotel-compare への配線 |
|------------|-----------|---------------------------|------------------------|
| **Discover Cars** | Post Affiliate Pro `aAid=Jaapowsearch` | ガイド印刷プレビュー `full-guide-preview/index.html`（旭川 AKJ/駅、白馬章の羽田/成田、湯沢駅） | **未配線** |
| **Skyticket レンタカー** | ValueCommerce `sid=2347006` / `pid=892631184` | mock LP 艦隊 **141 件**の `index.html`（`data-skyticket-rentacar-*`） | **未配線**（今回スコープ外） |

Discover Cars だけが **英語圏向け japowsearch / ガイド** と整合する。Skyticket は日本語専用（`skyticket-rentacar.js` コメント明記）で、hotel-compare（EN）には入れない方針と一致。

### ID 待ち・現状は無報酬の導線

| プログラム | 設定値 | URL に付くか | hotel-compare の現状 |
|------------|--------|--------------|----------------------|
| **Agoda** | `agodaCid: ""` | `cid` パラメータなし | リンクは出るが **成果ゼロ** |
| **Booking.com** | `bookingAid: ""` | `aid` パラメータなし | 同上 |
| **Travelpayouts** | `travelpayoutsMarker: "763558"` | **コード上は URL に一切付与されていない** | AFF オブジェクトに保持するだけ。Hotellook 終了後の代替として Booking/Agoda 直契約待ち |

**hotel-compare は現状、ページ上のすべての OTA リンクが非トラッキング** なのに、ページ内開示文は *"some links on this page are affiliate-tracked (Agoda, Booking.com, Travelpayouts when configured)"* と書いており **開示と実態が不一致**。

---

## 1. `configs/affiliates/` 全 JSON 一覧

| ファイル | プロバイダ | トラッキング | 登録 ID | 稼働 | 備考 |
|----------|-----------|--------------|---------|------|------|
| `hotels.json` | Booking + Agoda（+ TP marker 保管） | Agoda `?cid=` / Booking `?aid=` / TP marker は **未使用** | marker `763558`、CID/AID **空** | 構造のみ | 正本。`apply-hotel-affiliate-config.mjs` が JAPOWSERCH へ sync |
| `discover-cars.json` | Discover Cars | Post Affiliate Pro deep link `?a_aid=` | `Jaapowsearch` | **稼働** | 6 拠点。`build-discover-cars-link.mjs` 参照 |
| `skyticket-rentacar.json` | Skyticket レンタカー | ValueCommerce referral | `sid=2347006`, `pid=892631184` | **稼働** | 16 拠点。mock LP + 七戸本番 web と同期検証あり |
| `hotels-asahikawa.json` | （legacy） | 同上 | marker `763558`、CID/AID 空 | 非推奨 | `deprecated` フィールドあり → `hotels.json` へ移行済み |
| `hotels-asahikawa.example.json` | テンプレ | — | すべて空 | 未使用 | 申請時のメモ用 |
| `hotel-shortlists/asahikawa.json` | 宿データ | なし（slug のみ） | — | コンテンツ | 7 件 |
| `hotel-shortlists/hakuba.json` | 宿データ | なし | — | コンテンツ | 5 件。Maruishi/Shiroumaso は Trip.com のみ |
| `hotel-shortlists/yuzawa.json` | 宿データ | なし | — | コンテンツ | 7 件 |

### 重複コピー（同期注意）

| 正本 | コピー | 差分 |
|------|--------|------|
| `configs/affiliates/discover-cars.json`（6 拠点） | `docs/mock-assets/_shared/affiliates/discover-cars.json`（**3 拠点のみ**） | `_shared` に haneda / narita / nagano_downtown が **欠落** |
| `configs/affiliates/skyticket-rentacar.json` | `docs/mock-assets/_shared/affiliates/skyticket-rentacar.json` | `validate-skyticket-affiliate.mjs` で byte 一致必須 |
| `configs/affiliates/skyticket-rentacar.json` | `resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json` | 同上 |

---

## 2. HTML / JS からの呼び出し実態（grep）

### Discover Cars

| 場所 | 件数 | 形式 |
|------|------|------|
| `docs/research/inbox/full-guide-preview/index.html` | 5 リンク | `https://www.discovercars.com/...?a_aid=Jaapowsearch` |
| `docs/mock-assets/*-lp/index.html` | **0 件** | 設定 JSON と `build-discover-cars-link.mjs` はあるが LP HTML 未配線 |
| `JAPOWSERCH/`（本番サイト） | **0 件**（hotel-compare 除く） | `affiliate-disclosure.html` に言及のみ |
| `docs/japow-chasers-guide/preview-kit/hotel-compare.html` | **0 件** | |
| `JAPOWSERCH/tools/hotel-compare/index.html` | **0 件** | |

ガイドプレビュー内の Discover Cars リンク（実 URL）:

- 旭川: `.../japan/asahikawa/akj?a_aid=Jaapowsearch`
- 旭川: `.../japan/asahikawa/asahikawa-railway-station?a_aid=Jaapowsearch`
- 白馬章（移動の節）: `.../japan/tokyo/hnd?a_aid=Jaapowsearch` / `.../nrt?a_aid=Jaapowsearch`
- 湯沢: `.../japan/yuzawa/yuzawa-railway-station?a_aid=Jaapowsearch`

### Skyticket レンタカー

| 場所 | 件数 | 仕組み |
|------|------|--------|
| `docs/mock-assets/*-lp/index.html` | **141 件** | `data-skyticket-rentacar-block` + `_shared/affiliates/skyticket-rentacar.js` |
| `resorts/Sichinohe-CyoueiSki/web/` | 本番サイト | 同上パターン |
| hotel-compare | 0 件 | |

生成 URL 形式:

```
https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=2347006&pid=892631184&vc_url={Skyticket拠点URL}
```

### Hotel compare（Booking / Agoda）

| 場所 | 状態 |
|------|------|
| `docs/japow-chasers-guide/preview-kit/hotel-compare.html` | 3 ハブ・shortlist fetch・OTA URL 生成 |
| `JAPOWSERCH/tools/hotel-compare/index.html` | 本番デプロイ済（GA タグ付き）。preview-kit と同一ロジック |
| `docs/japow-chasers-guide/preview-kit/asahikawa-hotels-compare.html` | `hotel-compare.html?hub=asahikawa` へリダイレクトのみ |
| `docs/research/inbox/full-guide-preview/index.html` | 3 ハブすべて `japowsearch.com/tools/hotel-compare?hub=...` へリンク |

---

## 3. Booking / Agoda URL 生成（実例）

**前提:** デフォルト日付 check-in `2027-01-16` / check-out `2027-01-23` / adults `2` / rooms `1`  
**AFF:** `{ travelpayoutsMarker: "763558", agodaCid: "", bookingAid: "" }`（現行本番と同じ）

### 一括 city search（旭川ハブ）

**Agoda bulk** — `cid` なし:

```
https://www.agoda.com/city/asahikawa-jp.html?checkIn=2027-01-16&los=7&adults=2&rooms=1&locale=en-us&currency=USD
```

**Booking bulk** — `aid` なし:

```
https://www.booking.com/searchresults.html?ss=Asahikawa&dest_type=city&checkin=2027-01-16&checkout=2027-01-23&group_adults=2&no_rooms=1&group_children=0
```

### 個別ホテル（OMO7 Asahikawa）

**Agoda hotel** — `cid` なし:

```
https://www.agoda.com/hoshino-resorts-omo7-asahikawa/hotel/asahikawa-jp.html?checkIn=2027-01-16&los=7&adults=2&rooms=1&locale=en-us&currency=USD
```

**Booking hotel** — `aid` なし:

```
https://www.booking.com/hotel/jp/xing-ye-rizoto-omo7-xu-chuan.html?checkin=2027-01-16&checkout=2027-01-23&group_adults=2&no_rooms=1&group_children=0
```

### official / tripcom（パラメータ付与なし — 正しい）

- Official: JSON の `official` URL をそのまま（例: `https://hoshinoresorts.com/en/hotels/omo7asahikawa/`）
- Trip.com: JSON の `tripcom` URL をそのまま（白馬 Maruishi / Shiroumaso のみ）

### Travelpayouts marker `763558`

- `hotels.json` と AFF インラインに **保持されているが、上記 URL 生成コードでは参照されていない**。
- 旧 Hotellook 一括 CTA は削除済み。marker を Booking/Agoda に付ける実装は **未着手**。
- TP 経由で Agoda/Booking を Join するには **MAU 1,000+** が必要（下記 §5）。

### Discover Cars（参考 — 今回 v2 で追加予定）

```
https://www.discovercars.com/japan/asahikawa/akj?a_aid=Jaapowsearch
```

`build-discover-cars-link.mjs` の `linkStyle: "new"` と同型（destination URL + `a_aid`）。日付パラメータは Discover Cars 側 UI で入力（現行スクリプトも日付を URL に付けない）。

---

## 4. 開示文の食い違い

| ソース | 記載 | 実態との差 |
|--------|------|------------|
| **hotel-compare ページ内**（preview-kit + JAPOWSERCH） | *"some links on this page are affiliate-tracked (Agoda, Booking.com, Travelpayouts when configured)"* | **現状すべて非トラッキング**。Travelpayouts marker も URL に付いていない |
| **JAPOWSERCH/affiliate-disclosure.html** | *"When configured, affiliate IDs (Agoda CID, Booking AID, or Travelpayouts Partner ID 763558) are appended"* | 条件付き表現で **より正確**。ただし hotel-compare ページからこのページへのリンクが **無い** |
| **hotel-compare の note** | *"Affiliate IDs apply when configured"* | 同上。bulk ボタンは出るが ID 空 |

**v2 で直すべき点:**

1. ID が空のときは「tracked」と言わない（または Discover Cars のみ tracked と明記）。
2. `affiliate-disclosure.html` へのリンクを追加。
3. Discover Cars セクションを開示に含める（ガイド disclosure ページには既に記載あり）。

---

## 5. Travelpayouts 解禁条件とギャップ

`docs/japow-chasers-guide/HOTEL_AFFILIATE_SETUP.md`（2026-09 更新）より:

- **Hotellook:** 2025-10-28 終了。再開なし。
- **Unlock more 20（Agoda / Booking 等）:** Travelpayouts サポート回答で **MAU 約 1,000 以上** で再申請。早期例外不可。
- **Available 26（KKday / Klook / Aviasales / Localrent 等）:** 接続済みで即利用可 — **hotel-compare には未配線**（今回スコープ外）。
- **本命の並行ルート:** Agoda / Booking **直契約**（`agodaCid` / `bookingAid`）— TP ロックと独立。現状 **未申請または未承認**（JSON 空）。

**ギャップ:** japowsearch.com の GA4（`G-SZT43DTJ9E`）で MAU 1,000 未満の間、TP 経由の Booking/Agoda 成果は期待できない。`763558` は設定されているが **コードに効いていない**。収益化の現実解は (a) Discover Cars 即時、(b) 直契約 CID/AID 取得、(c) MAU 到達後の TP 再申請。

`apply-hotel-affiliate-config.mjs --check` は **marker だけあれば OK** と warn する（Booking/Agoda 空でも exit 0）。

---

## 6. Discover Cars — 3 ハブ対応表

`configs/affiliates/discover-cars.json` の `destinations` を正本とする。

| Hub | 推奨ピックアップ | destination ID | landing URL | ガイドでの使用 | v2 配線 |
|-----|-----------------|----------------|-------------|---------------|---------|
| **Asahikawa** | 旭川空港（AKJ） | `asahikawa_airport` | `https://www.discovercars.com/japan/asahikawa/akj` | ✓ ガイド Asahikawa 章 | **配線可** |
| **Asahikawa** | 旭川駅（OMO7 周辺） | `asahikawa_station` | `https://www.discovercars.com/japan/asahikawa/asahikawa-railway-station` | ✓ ガイド | **配線可**（駅前泊向け） |
| **Hakuba** | — | **該当なし** | — | ガイド白馬章は **羽田/成田** のみ（国内ピックアップなし） | **要ユーザー確認** |
| **Hakuba** | （候補）長野駅周辺 | `nagano_downtown` | `https://www.discovercars.com/japan/nagano/nagano-downtown` | ガイドでは **未使用** | JSON に存在するがハブとの対応は未決 |
| **Yuzawa** | 越後湯沢駅 | `yuzawa_station` | `https://www.discovercars.com/japan/yuzawa/yuzawa-railway-station` | ✓ ガイド Yuzawa 章 | **配線可** |

### 白馬（Hakuba）— 要ユーザー確認

- `discover-cars.json` に **hakuba 専用 destination は無い**。
- 最も近い既存拠点は `nagano_downtown`（長野駅 — 特急しなの / バスで白馬方面）だが、Happo BT 周辺宿からの実用距離は旭川・湯沢ほど直結ではない。
- ガイド原稿は白馬の車需要を **羽田/成田ピックアップ**（国際到着）で扱っており、バレー内レンタカー拠点とは別レイヤー。
- **URL を捏造しない。** v2 実装前に以下いずれかをユーザーが決める必要がある:
  1. `nagano_downtown` を白馬ハブの国内ピックアップとして採用する
  2. Discover Cars に白馬/Happo 用 landing を追加申請してから JSON を更新する
  3. 白馬ハブでは Discover Cars セクションを出さず、羽田/成田リンクのみ（ガイドと同型）にする

### 参考: ガイドにあって JSON にあるが hub 未割当

| destination ID | 用途 |
|----------------|------|
| `haneda_airport` | 国際到着 → 白馬章で使用 |
| `narita_airport` | 同上 |

v2 スコープ「泊まる+移動する」では、**ハブ内移動**を優先するなら旭川・湯沢は明確、白馬のみ要決定。

---

## 7. JAPOWSERCH 本番デプロイ状態

| パス | 状態 |
|------|------|
| `tools/hotel-compare/index.html` | 存在（17,867 bytes）。preview-kit 版 + GA |
| `tools/hotel-compare/affiliate-config.json` | `{ travelpayoutsMarker: "763558", agodaCid: "", bookingAid: "" }` |
| `tools/hotel-compare/shortlists/*.json` | asahikawa / hakuba / yuzawa 3 件（SkiresortWebPlan と同期済み） |
| `affiliate-disclosure.html` | hotel-compare + Discover Cars の説明あり |

---

## 8. v2 実装へのインプット（P1 以降）

確定済み方向性（ユーザー合意 2026-09-03）:

- **入れる:** Booking + Agoda（構造のみ、CID/AID 待ち）+ Discover Cars（即収益）
- **入れない:** Skyticket、TP Available 26（KKday 等）
- **Trip.com:** 非トラッキングの実用リンクとして Maruishi / Shiroumaso に残す
- **開示:** 実態に合わせて書き直し + disclosure ページへリンク

**P1/P2 で決めるべき未決事項:** 白馬ハブの Discover Cars 拠点（§6）。

---

## 付録: 検証コマンドログ

```text
node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs --check
→ check: OK { travelpayoutsMarker: '763558', agodaCid: '', bookingAid: '' }

mock LP with data-skyticket-rentacar: 141 files
mock LP with discover-cars/Jaapowsearch: 0 files
```
