# マップインタラクション体験仕様 — G2 追記

> **L1 体験仕様** | 2026-06-07  
> **エージェント**: 17 map-interaction-spec  
> **親 spec**: [`agents/17-map-interaction-spec.prompt.md`](../agents/17-map-interaction-spec.prompt.md)（G1 確定分を上書きしない）  
> **入力**: [`docs/laax_gap_spec.md`](../../docs/laax_gap_spec.md) §G2、イラスト方針 **A（イラスト SVG）確定**  
> **コード禁止。** 実装は `map-ui-implementer`（19）が本 spec のみで判断する。

---

## 0. スコープ

| 項目 | G2 で追加・変更 | G3 以降（本 spec 対象外） |
|------|----------------|---------------------------|
| 画面 | `/map` フル、`/[locale]/courses` 埋め込み、`map-preview.html` parity | 検索、GPS、SSE |
| ビジュアル | イラスト SVG 本番（A 方式）+ 透明ヒットボックス | OSM オーバーレイ（C） |
| 選択対象 | manifest 全リフト + 公開コース（`runs.geojson`） | 難易度フィルタ |
| UI 追加 | **凡例**、埋め込み variant、全画面導線 | 凡例常時固定（折りたたみ不可） |

**G1 から継承（変更なし）**

- リスト選択 → サイドバー内 `.rail-detail` / `MapFeatureDetail` インライン
- 地図 stage 内に fixed bottom sheet / 選択用モーダル **禁止**
- R6 パン境界（scale=1 パン無効、scale>1 クランプ）

---

## 1. 主コンテンツ定義（G2）

| 優先度 | 内容 | 表示場所 |
|--------|------|----------|
| **P0** | イラスト SVG 全体（地形のうねり・林間・基部が読める） | `HeroMapCanvas` stage。常時可視。選択・凡例・フィルタで隠さない |
| **P1** | リフト/コース名 + 稼働ステータス一覧 | md+: 右サイドバー `MapStatusRail`。mobile: FAB → 単一ボトムパネル |
| **P1** | 凡例（稼働/停止/確認中 + 種別色） | **サイドバー上部**（推奨）または stage **外** flex 兄弟。**stage 内 bottom overlay 禁止** |
| **P2** | 最終更新・種別フィルタピル・ズーム FAB | `MapOverlayChrome` + `HeroMapCanvas` コントロール |
| **P2** | 選択時メタ（理由・更新時刻・距離等） | サイドバー内 `MapFeatureDetail` のみ |
| **P2** | 「マップを全画面で」リンク | `/courses` 埋め込みのみ（`/map` へ遷移） |

---

## 2. 画面種別とレイアウト契約

### 2.1 `map-full` — `/[locale]/map`

現行 `LiftMapViewer` と同型。G2 で追加するのは **凡例ブロック** と **コースヒットボックス** のみ。

```
┌──────────────────────────────────────────────┬──────────┐
│  [ヘッダー chrome]                              │          │
│  [フィルタピル nav]                             │  凡例    │
│                                               │  ─────   │
│         イラスト SVG（P0）                     │  リスト  │
│         + 透明ヒットボックス                    │  ─────   │
│         + 選択ハイライト                       │  詳細    │
│  [ズーム FAB]                                 │ (inline) │
└──────────────────────────────────────────────┴──────────┘
  flex-1 stage                          aside w-72 (md+)
```

### 2.2 `map-embed` — `/[locale]/courses` 先頭

**目的**: コースページを開いた瞬間に「ゲレンデの全体像」が主役（`laax_gap_spec` 受け入れ #2）。

| 項目 | 仕様 |
|------|------|
| 配置 | ページ先頭。`AwardPageShell` の notice 直下、コース `AwardFold` 一覧の**上** |
| ブロック高 | `min-h-[50dvh]` 必須。推奨 `h-[min(60dvh,640px)]`（md+ は `min-h-[480px]`） |
| 内部レイアウト | `LiftMapViewer` に `variant="embed"`。**md+ も `/map` と同型**（地図 flex-1 + サイドバー w-72）を埋め込みブロック内に閉じる |
| 初期ビューポート | 375px 幅で **スクロール前**にマップブロックが **≥ 50dvh** 見えること |
| コース一覧 | マップブロック**外**の下段。常時表示のリストでマップを押し潰さない（R3 継承） |
| 導線 | ブロック右上または下部にテキストリンク「マップを全画面で」→ `/[locale]/map`（新規タブ不要） |
| β 表示 | イラスト未承認時は既存 β バッジを stage 外（ヘッダー chrome 内）に維持 |

**埋め込みで禁止**

- コース `AwardFold` をマップ stage 内に重ねる
- リスト選択で埋め込みブロック高を動的に縮めてマップを 50dvh 未満にする
- 選択詳細のためにマップ上に second overlay（`/map` と同じ原則）

### 2.3 `map-preview.html`

`/map` の `map-full` と **同一インタラクション原則**。G2 追加分:

- 凡例を `.rail` 内先頭（リスト上）に配置
- コース path に `data-feature-id` 付与時はリフトと同じ `selectFeature` → `#railDetail` インライン
- `#sheet` 復活 **禁止**

---

## 3. 状態遷移表（G2 拡張）

G1 の `idle` / `item-selected` / `mobile-panel-open` を維持し、以下を追加。

| 状態 ID | 地図（stage） | サイドバー / パネル | モーダル | 遷移トリガー |
|---------|---------------|---------------------|----------|--------------|
| `idle` | イラスト 100% 表示。ヒットボックス待受 | 凡例（開）+ リストのみ | なし | 初期表示 / 選択解除 |
| `item-selected` | **可視面積は idle と同じ**。対象 path に stroke/opacity ハイライト | 行 `aria-pressed` + `MapFeatureDetail` インライン | **なし** | リスト行クリック **または** 地図ヒットボックスタップ |
| `filter-lift` | 非該当コース path を opacity 低下（0.35 目安）。リフトは通常 | リストがリフトのみ | なし | フィルタピル「リフト」 |
| `filter-trail` | 非該当リフト path を opacity 低下 | リストがコースのみ | なし | フィルタピル「コース」 |
| `filter-all` | 全 path 通常 opacity | 全グループ表示 | なし | フィルタ再タップで解除 |
| `legend-expanded` | 変化なし | 凡例 3 行 + 種別スウォッチ表示 | なし | 初期（md+）/ 「凡例」トグル |
| `legend-collapsed` | 変化なし | 凡例 1 行サマリ or 非表示 | なし | 「凡例を閉じる」 |
| `mobile-panel-open` | 背面（パンズーム無効化しない） | 単一ボトムパネル内で凡例+リスト+詳細完結 | 背面スクリムのみ | FAB「運行状況」 |
| `embed-view` | `map-embed` レイアウト契約に従う | `map-full` と同操作 | なし | `/courses` 表示 |

**選択の単一ソース**

- `selectedId: string | null` が唯一の選択状態
- リスト・地図タップは同じ setter。二重状態を持たない

**地図タップ（G2 新規）**

1. `pointer-events` 有効な透明 path（`data-feature-id`）のみヒット対象
2. ヒット時 → `item-selected`（リスト側の行も同期ハイライト）
3. ステージ空白タップ → `idle`（選択解除）。G1 の `onDeselect` と同じ
4. 地図上にポップアップ・ツールチップ・callout を出さない

---

## 4. 凡例（G2 必須）

### 4.1 配置（R1 準拠）

| 優先 | 配置 | 条件 |
|------|------|------|
| **推奨** | `MapStatusRail` 先頭（「運行状況」見出しの下、リストの上） | md+ サイドバーあり |
| 代替 | 埋め込みブロックの flex 列で stage **左隣**（幅 ≤ 200px） | サイドバーを出せない極窄 layout のみ |
| **禁止** | stage 内 `position:absolute; bottom:*` の凡例帯 | R1 インシデント再発 |

### 4.2 内容

| 行 | 表示 |
|----|------|
| 稼働 | スウォッチ + ラベル「稼働」（`STATUS_COLORS.open`） |
| 停止 | スウォッチ + ラベル「停止」+ 任意ハッチ見本 |
| 確認中 | スウォッチ + ラベル「確認中」 |
| 種別（任意） | リフト線色 / コース線色 — イラスト焼き込み色と一致 |

### 4.3 操作

| breakpoint | 初期 | 操作 |
|------------|------|------|
| md+ | `legend-expanded` | 「凡例を閉じる」で `legend-collapsed`（リスト領域を広げる） |
| mobile | `legend-collapsed` | FAB パネル内先頭で expanded。パネル閉で凡例も閉 |

**G3 差分メモ**: G3 で凡例を常時 expanded 固定に変更可。G2 では折りたたみ可。

---

## 5. 禁止パターン（G2 追記）

G1 禁止に加え:

1. **凡例を地図 stage 下部に fixed/absolute 配置**（基部・駐車場を隠す）
2. **リスト or 地図選択で詳細用 bottom sheet を stage 上に出す**（`FeatureSheet` 型）
3. **`/courses` 埋め込みで選択時に全画面マップモーダルを開く**
4. **イラスト未キャリブの OSM 線を stage 上に重ねてタップ対象にする**（A 方式違反）
5. **絵文字のみの凡例・フィルタ**（G3 までに SVG+ラベルへ。G2 新規は絵文字禁止）
6. **検索 UI**（テキストフィルタ、全画面検索モーダル）— G3 で spec 化
7. **embed 初期表示でマップ < 50dvh**（コース一覧を先に縦積みしない）

---

## 6. ブレークポイント別（G2）

### md+（≥ 768px）

- `/map`・`map-embed`: 地図 `flex-1` + `aside.w-72`
- 選択・凡例・詳細は **aside 内完結**
- 第二 overlay（dialog / sheet）禁止

### mobile（< 768px）

- 地図: 埋め込みでも `min-h-[50dvh]` をブロック単位で確保
- 運行状況: FAB → 単一パネル（凡例 + リスト + 詳細）
- リスト選択で **新規** fixed sheet を出さない（パネルが既に開いている場合はその中で詳細展開）

---

## 7. コンポーネント契約（実装者向け）

| コンポーネント | G2 変更 |
|----------------|---------|
| `LiftMapViewer` | `variant?: "full" \| "embed"`、embed 時の高さクラス、`MapLegend` 組み込み |
| `MapStatusRail` | 先頭に `MapLegend` slot。コースグループを `runs` 本数ぶん表示 |
| `MapLegend` | **新規**。props: `collapsed`, `onToggle`, `statusSwatches`, `typeSwatches?` |
| `HeroMapCanvas` / `HeroMapOverlay` | コース path ヒットボックス + `selectedId` ハイライト + フィルタ opacity |
| `MapOverlayChrome` | embed 時「マップを全画面で」リンク。絵文字フィルタ → SVG は G2 新規分から |
| `courses/page.tsx` | `LiftMapViewer variant="embed"` を先頭配置。座標 only fold は下げる or 削除 |

**イラスト A 方式**

- 見た目の線は SVG/PNG に焼き込み
- インタラクション用 path は `fill="transparent"` `stroke="transparent"` + `stroke-width` ヒット幅 ≥ 16px
- 各 path に `data-feature-id` = `features.manifest.json` の id

---

## 8. 受け入れ基準（Given / When / Then）

`18-map-interaction-evaluator` が G2 リリースで追試する項目。**I1 FAIL = 全体 FAIL**（G1 継承）。

### G2 必須（6 件）

| # | Given | When | Then |
|---|--------|------|------|
| **G2-1** | `/map` md+、manifest 全リフト登録 | ユーザーがリストでリフトを選択 | 地図可視面積は idle と同じ。サイドバー内詳細。stage 上に新規 overlay なし（**I1**） |
| **G2-2** | `/map`、公開コースが manifest + ヒットボックスにある | ユーザーが地図上のコース path をタップ | `item-selected` と同状態。リスト行も `aria-pressed`。地図上ポップアップなし |
| **G2-3** | `/courses` 375px、初期表示 | ページを開く（スクロール前） | マップ埋め込みブロック ≥ **50dvh** 可視。コース fold はその下 |
| **G2-4** | `/map` md+、`legend-expanded` | 凡例表示中 | 凡例はサイドバー内 or stage 外。地図中央〜下部（基部）を stage 内 overlay で覆わない（**R1**） |
| **G2-5** | `/courses` embed、コースをリスト選択 | ユーザーが運行状況でコース行をタップ | `/map` と同様 rail 内詳細。埋め込みブロック内でマップ高さが縮まない |
| **G2-6** | `map-preview.html` | コース path をクリック | `#railDetail` インライン更新。`#sheet` なし（**I5** parity） |

### G1 継続（抜粋）

| # | Given | When | Then |
|---|--------|------|------|
| G1-1 | mobile `/map`、FAB 未押下 | リスト行を直接選べない状態 | 地図 ≥ 50dvh（**R3**） |
| G1-2 | 任意 | リスト選択 | `MapFeatureDetail` はコンパクト。巨大「閉じる」単独 UI なし（**I2**） |
| G1-3 | md+ | 選択後 | 第二 dialog/sheet なし（**I3**） |

---

## 9. 評価ゲート

```
G2 実装後:
  map-ux-evaluator (R1–R6) — /map + /courses embed + map-preview
  map-interaction-evaluator (I1–I5 + G2-1..6)
  code-reviewer — 幾何 source・ヒットボックス・A 方式
```

**G2 完了宣言**: `laax_gap_spec` §G2 受け入れ #1–#3 を満たし、上記 3 ゲート PASS。

---

## 10. 関連ドキュメント

| ドキュメント | 関係 |
|-------------|------|
| [`docs/laax_gap_spec.md`](../../docs/laax_gap_spec.md) | G2 成果物・LAAX 判定 |
| [`docs/ROADMAP_LIFT_MAP_VISUAL_FIRST.md`](../../docs/ROADMAP_LIFT_MAP_VISUAL_FIRST.md) | M4 `/courses` 統合 |
| `.cursor/rules/map-interaction-gate.mdc` | パイプライン順序 |
| `.cursor/rules/lift-map-no-fake-overlays.mdc` | A 方式幾何 |

---

**着手順・完了判定の一本化**: [`docs/g2_checklist.md`](../../docs/g2_checklist.md)（2026-06-08）

```
進捗サマリ:
  イラスト本番: ✅ sichinohe-hero.png（1024×790）
  ヒットボックス: ✅ リフト2 + コース5（hitboxes-hero-v4.json）
  trails.geojson: 🟡 コース4未反映・要整備
  実装済み: MapLegend、embed、MapHitboxes、feature-colors
  残り: トークン統一（L5）、キャリブ QA、16/18 再評価
```
