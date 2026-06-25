# Agent instructions — SkiresortWebPlan

モノレポ構成:

```
SkiresortWebPlan/          # 汎用テンプレ（src/, docs/, resort-* 艦隊）
  resorts/
    Sichinohe-CyoueiSki/   # 七戸本番（web/ + map-* 艦隊）
    …                      # 今後ゲレンデごとに追加
```

このリポジトリは **2つのエージェント艦隊** と **横断 Rules** で運用する。

| 艦隊 | 配置 | 対象 |
|------|------|------|
| **resort-*** | `.cursor/agents/`（ルート） | 汎用テンプレ `src/`, `messages/`, ルート `docs/` |
| **map-*** | `resorts/Sichinohe-CyoueiSki/.cursor/agents/` | 七戸本番 `resorts/Sichinohe-CyoueiSki/web/` のリフトマップ |
| **Rules** | `.cursor/rules/` | 両艦隊に常時適用 |
| **設計書（詳細）** | `resorts/Sichinohe-CyoueiSki/agents/*.prompt.md` | マップ艦隊の一次参照（ID 01〜19） |
| **設計書（ルート L3）** | `agents/resort-visual-evaluator.prompt.md` | ビジュアル評価ルーブリック |

レジストリ: [`.cursor/agents/REGISTRY.yaml`](.cursor/agents/REGISTRY.yaml) / [`resorts/Sichinohe-CyoueiSki/.cursor/agents/REGISTRY.yaml`](resorts/Sichinohe-CyoueiSki/.cursor/agents/REGISTRY.yaml)

---

## 三層モデル（共通）

| 層 | 役割 | コード |
|----|------|--------|
| L1 体験 | spec・状態遷移・禁止パターン | **書かない** |
| L2 実装 | spec 通りにのみ実装 | 書く |
| L3 評価 | PASS/FAIL で止める | **書かない** |

---

## 艦隊 A: ルートテンプレート（resort-*）

**対象ディレクトリ**: `src/`, `messages/`, ルート `docs/`（`resorts/Sichinohe-CyoueiSki/web/` は対象外）

### エージェント一覧

| 名前 | 層 | 成果物 |
|------|-----|--------|
| `resort-ux-designer` | L1 | `docs/design_concepts.md` |
| `resort-design-director` | L1 | `docs/final_requirements.md` |
| `resort-i18n-spec` | L1 | `docs/i18n_requirements.md` |
| `resort-live-status-spec` | L1 | `docs/live_status_contract.md` |
| `resort-map-bridge` | L1 | `docs/map_integration_spec.md` |
| `resort-spec-handoff` | L1→L2 | `docs/handoff_checklist.md` |
| `resort-template-implementer` | L2 | `src/` 以下のコード |
| `resort-qa-a11y` | L3 | `docs/qa_report.md`（Q1–Q6: a11y・導線・i18n） |
| `resort-visual-evaluator` | L3 | `docs/qa_report_visual.md`（V1–V6: ビジュアル・アワード級） |

### 固定パイプライン

```
resort-ux-designer          # 3案 + ベンチマーク参照
  → resort-design-director    # Self-Critique + 1案 + V1–V5 受け入れ基準
    → resort-spec-handoff       # handoff_checklist（トークン・写真・モーション）
      → resort-template-implementer
        → resort-qa-a11y          ─┐
        → resort-visual-evaluator ─┴── 両方 PASS でルート UI 出荷可
```

**a11y PASS のみでは出荷不可。** ビジュアルは `resort-visual-evaluator` 必須。

### 分岐

| 作業 | 追加で先に起動 |
|------|----------------|
| 多言語 | `resort-i18n-spec` → handoff → implementer |
| ライブ積雪帯 | `resort-live-status-spec` → handoff → implementer |
| テンプレから /map へ | `resort-map-bridge`（本実装は艦隊 B へ） |
| LAAX ギャップ・G2–G4 | 先に [`docs/laax_gap_spec.md`](docs/laax_gap_spec.md) → `map-interaction-spec` |

---

## 艦隊 B: 七戸マップ（map-*）

**対象ディレクトリ**: `resorts/Sichinohe-CyoueiSki/web/`  
**詳細プロンプト**: `resorts/Sichinohe-CyoueiSki/agents/17,19,16,18`

### エージェント一覧

| 名前 | 旧 ID | 層 |
|------|-------|-----|
| `map-interaction-spec` | 17 | L1 |
| `map-ui-implementer` | 19 | L2 |
| `map-ux-evaluator` | 16 | L3 |
| `map-interaction-evaluator` | 18 | L3 |

### 固定パイプライン（変更不可）

```
map-interaction-spec
  → map-ui-implementer
    → map-ux-evaluator ──┐
    → map-interaction-evaluator ──┴── 両方 PASS + code-reviewer（座標時）
```

---

## 横断 Rules（必読）

LP モック（`docs/mock-assets/{id}-lp/`）を追加・変更する前に読むこと:

- [`.cursor/rules/lp-factory-no-shortcuts.mdc`](.cursor/rules/lp-factory-no-shortcuts.mdc)
- [docs/mock-assets/LP_FACTORY_PROCEDURE.md](docs/mock-assets/LP_FACTORY_PROCEDURE.md) — **§0.2 標準パイプライン**（テンプレ複製 → JAPOW「詳細」ボタンまで）

マップ・オーバーレイに触る前に読むこと:

- [`.cursor/rules/lift-map-no-fake-overlays.mdc`](.cursor/rules/lift-map-no-fake-overlays.mdc)
- [`.cursor/rules/map-interaction-gate.mdc`](.cursor/rules/map-interaction-gate.mdc)
- [`.cursor/rules/map-ux-gate.mdc`](.cursor/rules/map-ux-gate.mdc)

### 絶対禁止

- **LP Factory:** 他施設資産流用・画像フォーマット独自変更・アフィリエイト省略・検証未 PASS で配信（`lp-factory-no-shortcuts`）
- 根拠なき手置き座標でコース／リフト線を描く
- 未検証の SVG 線を `/map` 本番に載せる
- **`NanakoCyoueiSki/` で作業する**（正は `resorts/Sichinohe-CyoueiSki/`）
- **リスト選択で地図上に bottom sheet / モーダルを出す**

### 組み込みレビュー（Cursor 標準）

| 変更種別 | 起動 |
|----------|------|
| マップ線・座標 | `code-reviewer` |
| 一般 TS/React | `typescript-reviewer` または `code-reviewer` |

---

## 依頼の書き方

```
@resort-template-implementer
docs/handoff_checklist.md に従い HeroSection の contrast を修正
```

```
@map-interaction-spec
/map のリスト選択後の状態遷移を定義して
```

チャットは **役割ごとに分ける** と `agent-transcripts/.../subagents/` の履歴が追いやすい。

---

## 七戸その他（01〜15, 06 等）

汎用サイト・データ・運用コンソールは従来どおり  
[`resorts/Sichinohe-CyoueiSki/agents/REGISTRY.yaml`](resorts/Sichinohe-CyoueiSki/agents/REGISTRY.yaml) を参照。  
Cursor サブエージェント化は **マップ艦隊（map-*）とルート艦隊（resort-*）を優先**。
