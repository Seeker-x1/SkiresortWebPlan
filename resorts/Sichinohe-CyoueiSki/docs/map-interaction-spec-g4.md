# マップインタラクション体験仕様 — G4 追記

> **L1** | 2026-06-08 | 親: `map-interaction-spec-g3.md`

---

## 0. G4 スコープ

| 項目 | G4 | 対象外 |
|------|-----|--------|
| リアルタイム | SSE + 30s poll フォールバック | WebSocket 本番クラスタ |
| データ | `status.json` + 監査ログ JSONL | PostgreSQL（将来） |
| 探索 | 難易度フィルタ + GPS 距離（sidebar） | イラスト上の GPS ドット |
| L1 | 2D イラスト PASS 継続 | WebGL 3D |

---

## 1. `status-live`（SSE）

| 項目 | 仕様 |
|------|------|
| エンドポイント | `GET /api/public/map-status/stream` |
| 間隔 | 3s で `status.json` 変更検知 |
| クライアント | `EventSource` 優先、失敗時 30s poll |
| UI | chrome「ライブ」バッジ（SSE 接続時） |

---

## 2. 難易度フィルタ

| 項目 | 仕様 |
|------|------|
| UI | サイドバー検索下ピル（すべて/初級/中級/上級） |
| 地図 | 非該当コースは dim（ヒットは残す） |
| リフト | 常時表示（フィルタ対象外） |

---

## 3. GPS（任意）

| 項目 | 仕様 |
|------|------|
| UI | サイドバー `MapLocationPanel` |
| 表示 | ゲレンデ中心からの km のみ |
| 禁止 | 未キャリブの hero ピクセル座標へのドット（A 方式） |

---

## 4. 監査

| 項目 | 仕様 |
|------|------|
| ファイル | `data/map/status-audit.jsonl` |
| トリガー | admin POST で status 変更時 |
| 閲覧 | admin GET `audit[]` 直近 8 件 |

---

## 5. G4 試験

| # | Then |
|---|------|
| G4-1 | admin 保存 → 3s 以内 SSE update → 線色変化 |
| G4-2 | 初級フィルタ → 初級コースのみリスト + 他 dim |
| G4-3 | GPS 許可 → 距離表示、地図に新 overlay なし |
| G4-4 | SSE 切断 → 30s poll 継続、stale 帯は API 失敗時のみ |
