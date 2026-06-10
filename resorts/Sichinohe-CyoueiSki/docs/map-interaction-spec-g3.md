# マップインタラクション体験仕様 — G3 追記

> **L1 体験仕様** | 2026-06-08  
> **親 spec**: [`map-interaction-spec-g2.md`](./map-interaction-spec-g2.md)（G2 を上書きしない）  
> **入力**: [`docs/laax_gap_spec.md`](../../docs/laax_gap_spec.md) §G3

---

## 0. G3 スコープ

| 項目 | G3 で追加 | 対象外（G4） |
|------|-----------|--------------|
| 探索 | サイドバー内テキスト検索 | GPS・難易度フィルタ |
| 運用 | `status.json` 手編集 + admin トグル | DB・SSE・監査ログ |
| 状態 | `search-active`・`status-stale` | `status-live`（SSE） |
| i18n | UI 文言（済）+ 検索ラベル | API `feature.label` 多言語 |

**G2 継承（変更なし）**: I1 地図面積不変、sheet 禁止、凡例サイドバー内、A 方式幾何。

---

## 1. 新状態

### 1.1 `search-active`

| 項目 | 仕様 |
|------|------|
| トリガー | サイドバー検索入力に 1 文字以上 |
| 地図 | **変化なし**（ハイライト・ズーム・フィルタ変更なし） |
| サイドバー | リスト行が `label` / `shortLabel` / `id` の部分一致で絞り込み |
| 選択 | 検索中も既存選択は維持。詳細は rail 下部に表示可 |
| 解除 | 検索クリア → 全リスト復帰 |

**禁止**: 検索で地図上モーダル・全画面オーバーレイ・リスト選択時の高さ縮小。

### 1.2 `status-stale`

| 項目 | 仕様 |
|------|------|
| トリガー | `/api/public/map-status` 取得失敗（初回 or ポーリング） |
| 地図 | 最後に成功した status を表示し続ける（あれば） |
| chrome | ヘッダー直下に **琥珀色帯**「更新失敗」+ 再試行ボタン |
| 解除 | 手動リフレッシュ or 次回ポーリング成功 |

---

## 2. サイドバー検索 UI

| 項目 | 仕様 |
|------|------|
| 配置 | `MapStatusRail` タイトル直下・凡例の上 |
| 入力 | `type="search"`、`aria-label` i18n |
| 一致 | 大文字小文字無視、部分一致 |
| 空結果 | 「該当なし」1 行（リスト領域内） |
| a11y | `map-focus-ring--on-dark`、ラベル付き |

---

## 3. status 手運用

| 項目 | 仕様 |
|------|------|
| データ | `web/data/map/status.json` |
| 公開 API | `GET /api/public/map-status`（既存） |
| 管理 API | `GET/POST /api/admin/map-status`（`ADMIN_UPDATE_TOKEN`） |
| admin UI | `/admin` — feature ごとに status ドロップダウン + 保存 |
| 反映 | クライアント 10s ポーリング + 手動リフレッシュ |

**リフト status**: `operating` | `stopped` | `hold` | `unknown`  
**コース status**: `open` | `closed` | `partial` | `hold` | `unknown`

---

## 4. G3 必須試験（evaluator）

| # | Given | When | Then |
|---|--------|------|------|
| **G3-1** | `/map` md+、リスト 7 件 | 「ペア」と検索 | ペアリフトのみ表示。地図面積不変 |
| **G3-2** | 検索クリア | 入力を空にする | 全件復帰 |
| **G3-3** | admin で `lift-pony`→`stopped` 保存 | 10s 以内に `/map` 表示 | グレー破線 + バッジ「停止」 |
| **G3-4** | map-status API 停止 | ページ表示継続 | 琥珀帯 + 再試行。地図は最後の status |
| **G3-5** | `/en/map` | 検索 placeholder | 英語 UI |

---

## 5. 評価ゲート

```
map-ui-implementer（G3 実装）
  → map-ux-evaluator（R1–R6 + 検索）
  → map-interaction-evaluator（I1–I5 + G3-1〜5）
  → code-reviewer（admin API・status 書き込み）
```
