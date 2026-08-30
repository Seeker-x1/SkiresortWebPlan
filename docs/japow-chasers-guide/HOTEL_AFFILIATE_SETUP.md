# 3-Hub ホテル比較 — アフィリエイト ID 取得手順

**対象ツール:** `preview-kit/hotel-compare.html`（3ハブ共通）  
**公開 URL:** `https://japowsearch.com/tools/hotel-compare?hub={asahikawa|hakuba|yuzawa}`  
**設定ファイル:** `configs/affiliates/hotels.json`  
**ショートリスト:** `configs/affiliates/hotel-shortlists/{hub}.json`

旧旭川専用 URL `…/asahikawa-hotels-compare` はリダイレクト先に統合済み。

Discover Cars（`Jaapowsearch`）は既に配線済み。**ホテル用 marker は `763558`（Travelpayouts）をリポジトリに登録済み。**

**公開前必須:** Travelpayouts ダッシュボードで **Hotellook** プログラムに Join すること。未 Join だと `marker=763558` は付くが成果が紐づかない可能性あり。

---

## 最短ルート（推奨）

**Phase 1 だけで公開可能:** Travelpayouts **1 アカウント** → `travelpayoutsMarker` だけで Hotellook 一括検索がトラッキングされる。

Agoda / Booking の直リンク ID は Phase 2（任意。Travelpayouts 経由でも可）。

| Phase | サービス | 所要 | 取得する ID |
|-------|----------|------|-------------|
| **1** | Travelpayouts | 15–30 分（即時） | `travelpayoutsMarker`（Partner ID） |
| 2a | Agoda 直契約（任意） | 即時〜数日 | `agodaCid` |
| 2b | Booking 直契約（任意） | 数日 | `bookingAid` |

---

## Phase 1 — Travelpayouts（必須）

1. **登録**  
   https://www.travelpayouts.com/ → **Start getting paid**

2. **メール確認**  
   `hello@travelpayouts.com` のリンクをクリック（未確認だと出金不可）

3. **Project 作成**（登録ウィザード内）
   - Type: **Website**
   - URL: `https://japowsearch.com`
   - Name: `japowsearch — JAPOW Chaser's Guide`

4. **Partner ID（= marker）をコピー**
   - ダッシュボード **左下** に数字の Partner ID
   - 参考: https://support.travelpayouts.com/hc/en-us/articles/203955653

5. **プログラム接続**（Tools → Programs）
   - **Hotellook** — 旭川一括比較の「Quote all」用（必須）
   - **Booking.com** — ダッシュボード内 Join（推奨）
   - **Agoda** — 同上（推奨・Travelpayouts 経由なら Phase 2 省略可）

6. **設定に貼る**

```json
"travelpayoutsMarker": "1234567"
```

`.env` でも可:

```bash
TRAVELPAYOUTS_MARKER=1234567
```

7. **反映**

```bash
node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs
node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs --check
```

8. **動作確認**  
   ローカルで HTML を開き、「Quote all hotels」の URL に `marker=1234567`（自分の ID）が付いていること。

---

## Phase 2a — Agoda CID（任意・直リンク用）

1. **登録**  
   https://partners.agoda.com/ → Sign up

2. **サイト登録**
   - Site URL: `https://japowsearch.com`
   - 説明例: *English powder-ski travel guide with hotel shortlists for inbound skiers*

3. **CID 取得**  
   Partner Center → **Profile** → **Manage My Sites** → サイト行の **CID**（数字）

4. **設定**

```json
"agodaCid": "1234567"
```

または `AGODA_CID=1234567` in `.env`

---

## Phase 2b — Booking AID（任意・直リンク用）

2026 年以降、新規は **CJ Affiliate または Awin** 経由が一般的（地域で異なる）。

1. **入口**  
   https://www.booking.com/affiliate-program/v2/index.html → Register

2. **ネットワーク選択**
   - 日本 / APAC: 案内に従い **Awin** または **CJ**
   - 既に CJ / Awin アカウントがあれば流用

3. **申請内容**
   - Website: `https://japowsearch.com`
   - プロモーション方法: *Travel guide PDF + hotel compare tool for ski hubs*

4. **承認後 — AID 取得**  
   Booking Partner Centre → **Marketplace** → **All products** → **Booking-branded Platform**  
   参考: https://affiliates.support.booking.com/kb/s/article/Affiliate-ID

5. **設定**

```json
"bookingAid": "1234567"
```

または `BOOKING_AID=1234567` in `.env`

---

## リポジトリへの反映チェックリスト

- [ ] `configs/affiliates/hotels.json` に ID 記入（**git commit する場合は公開リポジトリ注意** —  affiliate ID 自体はクライアント露出が普通）
- [ ] `apply-hotel-affiliate-config.mjs` 実行（`--sync` で JAPOWSERCH へ同期）
- [ ] `--check` が exit 0
- [ ] 比較ページから Agoda / Booking / Hotellook を1本ずつクリックし、URL に `cid` / `aid` / `marker` がある
- [ ] JAPOWSERCH `tools/` に HTML 配置して push（別タスク）

---

## よくある質問

**Q. 3 つ全部必要？**  
A. 公開最低ラインは **Travelpayouts marker のみ**。Agoda/Booking 直 ID は Travelpayouts 内プログラムで代替できる。

**Q. Discover Cars の `Jaapowsearch` を流用できる？**  
A. 不可。Post Affiliate Pro のレンタカー ID で、ホテル OTA とは別体系。

**Q. ID を .env に置く？ JSON？**  
A. どちらでも可。スクリプトは **env が JSON より優先**。

---

## エージェント向けメモ

アフィリエイトアカウント作成は **ユーザーのメール・本人確認・審査** が必要なため、エージェント単体では ID を発行できない。  
ユーザーが ID を取得したら `hotels.json` に貼り、`apply-hotel-affiliate-config.mjs --check --sync` まで自動化可能。
