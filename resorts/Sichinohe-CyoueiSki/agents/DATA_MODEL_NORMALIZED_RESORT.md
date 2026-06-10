# 全国ゲレンデ共通データモデル（ドラフト）

並列収集・ランキング・マップポップアップのための**正規化スキーマ案**。実装はJSON SchemaやOpenAPIに落とす前提の論理モデル。

---

## 共通エンベロープ

```json
{
  "resort_id": "uuid-or-stable-slug",
  "canonical_url": "https://example-resort.jp/",
  "retrieved_at": "2026-05-06T08:12:00+09:00",
  "source_type": "partner_api | cms_webhook | scraper | manual_dashboard",
  "confidence": "high | medium | low",
  "locale": "ja"
}
```

---

## `operations_summary`（ポップアップP0）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `open_status` | enum | `open` `closed` `partial` `unknown` |
| `scheduled_today` | string or interval | 例: `09:00–16:00` JST |
| `lift_summary` | object | `operating_count`, `total_count`, `notes[]` |
| `trail_summary` | object | 同上（コース単位が取れなければ省略可） |
| `last_changed_at` | datetime | 現場スキー場側の最終更新 |

---

## `snow_conditions`（ポップアップP0–P1）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `reported_depth_cm` | number? | 公式が言う基準点の積雪 |
| `snowfall_24h_cm` | number? | |
| `surface` | enum? | `powder` `packed` `wet` `icy` `unknown` |
| `datum_note` | string | 計測地点・更新者（手動なら必須に近い） |

---

## `points_of_sale_fnb`（ポップアップP1）

配列 `outlets[]`:

- `name`, `status` (`open` `closed` `limited` `unknown`)
- `hours_today`（文字列で可）
- `notes`（限定メニュー等）

---

## `childcare`（ポップアップP2）

- `available` boolean or enum: `open` `closed` `reservation_required` `unknown`
- `hours_today`, `phone_or_desk`（任意）

---

## `ski_school`（ポップアップP2）

- `desk_status`: `accepting` `waitlist` `closed` `unknown`
- `lesson_slots_note`（テキスト）

---

## ランキング用の派生指標（ハブ内計算）

生フィールドではなく**派生テーブル**で保持することを推奨。

- `freshness_score`: `now - last_changed_at` に基づく減点
- `lift_availability_ratio`: `operating_count / total_count`
- `snowfall_rank_inputs`: 24h降雪のエリア内順位用（欠損はnull）

---

## バージョン

- `schema_version`: `2026-05-06` など日付ベースで増やす。

各ゲレンデサイトは、このモデルの**部分集合**でも参加可能（欠損はUIでグレーアウト）。
