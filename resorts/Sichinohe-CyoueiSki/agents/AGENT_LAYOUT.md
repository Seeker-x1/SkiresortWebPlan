# エージェントレイアウト — 体験 / 実装 / 評価の三層分離

**目的**: バイブコーディングで「とりあえず動くUI」を量産しない。アワード水準の**体験設計を先に固定**し、**実装は仕様に従う**、**評価は書かずに止める**。

---

## 三層モデル

```
┌─────────────────────────────────────────────────────────────┐
│  L1 体験設計（Experience） — コードを書かない                │
│  何が起きるか・何を隠さないか・状態遷移を先に定義            │
└───────────────────────────┬─────────────────────────────────┘
                            │ 承認済み spec のみ渡す
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  L2 実装（Implementation） — spec 外の UI 判断をしない       │
│  コンポーネント・HTML・スタイルを spec 通りに実装             │
└───────────────────────────┬─────────────────────────────────┘
                            │ PR / プレビュー
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  L3 評価（Evaluation） — コードを書かない・FAIL で止める      │
│  レイアウト・インタラクション・アワード基準で PASS/FAIL       │
└─────────────────────────────────────────────────────────────┘
```

**原則**: L2 は L1 なしでマップ UI を書かない。L3 が FAIL なら L2 に戻す（L3 が直すな）。

---

## レイヤー別エージェント一覧

### L1 体験設計（書かない）

| ID | slug | ファイル | 役割 |
|----|------|----------|------|
| 01 | information-architecture | `01-*.prompt.md` | サイト IA |
| 05 | design-accessibility | `05-*.prompt.md` | UI キット・A11y |
| 09 | map-popup-embed | `09-*.prompt.md` | 地図ポップアップ情報優先度 |
| 13 | award-typography | `13-*.prompt.md` | タイポ・階層 |
| **17** | **map-interaction-spec** | **`17-map-interaction-spec.prompt.md`** | **マップ操作の状態遷移・禁止パターン（必須）** |

### L2 実装（spec 通りに書く）

| ID | slug | ファイル | 役割 |
|----|------|----------|------|
| 06 | implementation-engineering | `06-*.prompt.md` | 一般実装・インフラ |
| **19** | **map-ui-implementer** | **`19-map-ui-implementer.prompt.md`** | **マップ UI のみ。17 の spec 必須入力** |

### L3 評価（止める）

| ID | slug | ファイル | 役割 |
|----|------|----------|------|
| 15 | award-rollout-qa | `15-*.prompt.md` | 全ページ完成 QA |
| **16** | **map-ux-evaluator** | **`16-map-ux-evaluator.prompt.md`** | **地図非遮蔽・レイアウト** |
| **18** | **map-interaction-evaluator** | **`18-map-interaction-evaluator.prompt.md`** | **クリック後・モーダル・状態遷移** |

### 横断（品質・幾何）

| 役割 | 起動 |
|------|------|
| code-reviewer | マップ線・座標・セキュリティ |
| lift-map-no-fake-overlays | 根拠なき SVG 線禁止 |

---

## マップ UI 変更の必須パイプライン

```
17 map-interaction-spec
        │
        ▼ （状態遷移表・禁止リストが Markdown で出る）
19 map-ui-implementer
        │
        ▼ （コード / map-preview.html）
16 map-ux-evaluator  ──┐
18 map-interaction-evaluator ──┴── 両方 PASS でのみ出荷
```

**並列不可**: 17 → 19 → (16 ∥ 18)

---

## 過去インシデントと担当

| 日付 | 症状 | 欠けていた層 |
|------|------|--------------|
| 2026-06-07 AM | 運行状況が地図上に overlay | L3（16）未実施 |
| 2026-06-07 PM | リストクリックで巨大 bottom sheet が地図を覆う | L1（17）未実施 — 「移動しただけ」 |

**正**: リスト選択 → **サイドバー内インライン詳細**（地図は常に全画面表示）

---

## Cursor / サブエージェント対応

| レイヤー | 推奨 subagent_type |
|----------|-------------------|
| L1 17 | generalPurpose（readonly） |
| L2 19 | 実装エージェント（06 と同系） |
| L3 16, 18 | generalPurpose（readonly） |
| 幾何 | code-reviewer |

---

## 同期チェックリスト

- [ ] `REGISTRY.yaml` に 17 / 18 / 19 を登録
- [ ] `AGENTS.md` に三層パイプラインを記載
- [ ] `ORCHESTRATION.md` にマップ UI プリセット追加
- [ ] `.cursor/rules/map-interaction-gate.mdc` を L2/L3 起動条件に
