# マップインタラクション体験仕様 — G6 追記（UI 整理・レイアウト固定）

> **L1 体験仕様** | 2026-06-09  
> **エージェント**: 17 `map-interaction-spec`  
> **親 spec**（上書きしない）: [`map-interaction-spec-g2.md`](./map-interaction-spec-g2.md)  
> **直近の親**: [`map-interaction-spec-g5.md`](./map-interaction-spec-g5.md)  
> **入力**: UI 整理セッション（ユーザー承認）、[`docs/qa_report_map.md`](../../docs/qa_report_map.md) UI 整理再評価  
> **コード禁止。** 実装は `map-ui-implementer`（19）が **本書 + 親 spec** のみで判断する。

---

## 0. G6 スコープ

| 項目 | G6 で確定・変更 | G6 対象外（別承認まで実装禁止） |
|------|----------------|--------------------------------|
| レイアウト | **split rail**（地図とレール横並び）。chrome は **地図 stage 外** | 地図上 `absolute` のナビ帯・凡例帯 |
| サイト導線 | `MapQuickNav` **ADEF 4列**（layout 行） | 6ピル LAAX 型フィルタ帯（ホーム/リフト/コース/カメラ…一体） |
| 種別フィルタ | レール内タブ **コース｜リフト**、**初期コース** | 上段ピルでのリフト/コース切替（二重 UI 禁止） |
| 凡例 | **表示しない**（ユーザー免除） | `MapLegend` の復活 |
| 探索・運用 | — | **G3** 検索 UI、**G4** GPS・難易度・LIVE バッジ（下記 §6） |
| IA | `/courses` → `/map` 恒久リダイレクト維持 | G5 の「コースガイド独立ページ」案の復活 |

**G1–G2–G5 継承（変更なし）**

- A 方式（焼き込み + 透明ヒットボックス）
- リスト/地図タップ → `selectedId` 単一。詳細は **レール内インライン** のみ
- リスト選択で地図上 fixed bottom sheet / 第二モーダル **禁止**
- R6 パン境界（`MAP_FIT_SCALE` 基準ビュー、fit 以下パン無効、拡大時クランプ）
- `status-stale`（G3）: API 失敗時のみ **layout 行** の琥珀帯 — 地図 stage 上に載せない

**G6 が上書きする親記述**

| 親 | 旧記述 | G6 |
|----|--------|-----|
| G2 §1 | 凡例 P1 必須 | **免除**（§4） |
| G2 §2.1 図 | 地図上フィルタピル nav | **削除**。フィルタはレールタブのみ |
| G5 §3 | `MapTopBar` にホーム/コースガイド | **§2** の TopBar + QuickNav に置換 |
| layout-v5 評価メモ | md+ rail `absolute` オーバーレイ | **禁止**（full `/map` は split のみ） |

---

## 1. 主コンテンツ定義（G6）

| 優先度 | 内容 | 表示場所 |
|--------|------|----------|
| **P0** | イラスト全体（山頂〜基部が読める） | `HeroMapCanvas` stage。**二次 UI で覆わない** |
| **P1** | リフト/コース名 + 稼働ステータス一覧 | md+: `MapStatusRail`（**地図の横**）。mobile: FAB → 単一ボトムパネル |
| **P1** | サイト内主要導線（ホーム・ライブカメラ・アクセス・今日の運営） | `MapQuickNav`（**layout chrome**。stage 外） |
| **P2** | 最終更新時刻 | レール見出し行（`MapStatusRail`） |
| **P2** | 種別フィルタ（コース / リフト） | **レール内タブのみ**（§3） |
| **P2** | ズーム FAB（+ / − / 全体表示） | stage 右端。地図上唯一の常時フローティング UI |
| **P2** | 選択時メタ | `MapFeatureDetail`（レール内） |
| **P2** | 「マップを全画面で」 | `variant="embed"` の `MapOverlayChrome` のみ（現行 `/courses` は redirect のため未使用可） |
| **—** | 凡例 | **出さない**（§4） |

---

## 2. `map-full` レイアウト契約（`/map`）

### 2.1 垂直構造（viewport 全体）

```
MapPageShell (fixed inset-0, body overflow:hidden)
├── MapTopBar          … タイトル「ゲレンデマップ」+ LangSwitcher（shrink-0）
├── MapQuickNav        … ADEF 4列 grid（shrink-0、§2.2）
├── MapStaleBanner     … API 失敗時のみ（shrink-0、G3 継承）
└── LiftMapViewer      … flex-1 min-h-0
    └── flex row (md+)
        ├── mapStage (flex-1) … HeroMapCanvas + ズーム FAB のみ
        └── MapStatusRail (w-80, shrink-0) … md+ のみ横並び
```

**禁止（R1 再発防止）**

1. `MapQuickNav`・フィルタ帯・凡例を `HeroMapCanvas` 上に `absolute` / `fixed` で載せる
2. full `/map` で `MapStatusRail` を `absolute inset-y-0 right-0` で地図に重ねる
3. 角丸カード状の chrome を stage 中央に浮かせる（帯は **全幅 layout 行**）

### 2.2 `MapQuickNav`（ADEF）

| ID | ラベル（`nav.*`） | 遷移先 | 種別 |
|----|-------------------|--------|------|
| **A** | ホーム | `/` | サイト離脱 |
| **D** | ライブカメラ | `/live-cams` | サイト離脱 |
| **E** | アクセス | `/access` | サイト離脱 |
| **F** | 今日の運営 | `/today` | サイト離脱 |

| 項目 | 仕様 |
|------|------|
| 配置 | `MapTopBar` **直下**。`border-b` の **4等分 grid** |
| 角 | **直角**（ピル型・`rounded-2xl` カード禁止） |
| アイコン | `MapFilterIcons` の SVG（絵文字禁止） |
| ラベル | `messages` の `nav.home` / `nav.liveCams` / `nav.access` / `nav.today` |
| 含めない | リフト/コースフィルタ（**B/C** はレールタブへ）、G3 検索、G4 GPS |

**理由**: `/map` は `MapPageShell` で通常 `SiteHeader` を隠すため、サイト主要ページへの導線を layout 行で補う。

### 2.3 `MapTopBar`

| 項目 | 仕様 |
|------|------|
| 左 | ページタイトル `map.chrome.fullTitle` |
| 右 | `LangSwitcher` |
| 含めない | 単独「← トップへ」（**A** と重複するため） |

---

## 3. 種別フィルタ（レールタブ）

| 項目 | 仕様 |
|------|------|
| UI | `MapStatusRail` 内 `role="tablist"`。**2タブのみ** |
| 順序 | **左: コース** → **右: リフト** |
| 初期 | `filter-trail`（**コース**が選択） |
| 地図 | 非該当 type のヒットボックスを **opacity 低下**（0.35 目安）。ハイライト選択は維持 |
| リスト | 選択タブの type のみ表示 |
| 禁止 | 上段 `MapQuickNav` にリフト/コースを並べる（二重フィルタ） |
| 禁止 | G2 の `filter-all` を UI タブとして復活させる（タブは常に lift **xor** trail） |

**状態 ID**（G2 から改名なし）

- `filter-trail` / `filter-lift` — 上記タブで遷移
- `legend-expanded` / `legend-collapsed` — **G6 では未使用**（凡例なし）

---

## 4. 凡例（ユーザー免除）

| 項目 | 仕様 |
|------|------|
| G2-4 | **WAIVED** — ユーザー明示により `MapLegend` は **本番 `/map` に出さない** |
| ステータス色 | リスト行の **ドット + バッジ色** で足りる |
| コース難易度色 | イラスト焼き込み + リストのアクセント色 |
| 将来復活 | **新 L1 spec + ユーザー OK** がない限り実装禁止 |

---

## 5. `map-preview.html` parity（G2-6 更新）

| 項目 | `/map` React と同じこと |
|------|-------------------------|
| 垂直 | `.topbar` + `.quicknav`（4列）+ `.main` |
| 水平 | `.map-col` + `.rail` **flex 兄弟**（rail は stage 内 `absolute` 禁止） |
| レール幅 | 320px 目安（React `w-80`） |
| タブ | **コース｜リフト**、初期 **コース** |
| 凡例 | **なし** |
| ズーム | FAB に全体表示（⊡） |
| 詳細 | `#railDetail` インライン。`#sheet` **禁止** |
| 更新 | `node scripts/build-map-preview.mjs` で再生成 |

---

## 6. G3 / G4 先走り実装禁止

以下は **別ドキュメントに spec がありコードが残っていても**、**ユーザーが G6 後に明示承認するまで** `map-ui-implementer` は **UI に載せてはならない**。

| 機能 | 元フェーズ | 禁止する UI | 承認後の参照 spec |
|------|-----------|-------------|-------------------|
| サイドバー検索 | G3 | 検索 input・`search-active` 導線 | `map-interaction-spec-g3.md` §1.1 |
| `status-stale` 以外の chrome 拡張 | G3 | — | G3（**琥珀帯のみ G6 で許可**） |
| SSE ライブバッジ | G4 | chrome「ライブ」表示 | `map-interaction-spec-g4.md` §1 |
| 難易度フィルタピル | G4 | レール内ピル | G4 §2 |
| GPS 距離 | G4 | `MapLocationPanel` | G4 §3 |
| 6ピル一体ナビ | — | 地図上または未承認の上段帯（リフト/コース/ホーム/カメラ…） | **本書 §2.2 の ADEF のみ** |

**違反時**: `map-interaction-evaluator` **FAIL**。差し戻しは UI 削除のみ（幾何・API バックエンドは別 PR 可）。

---

## 7. 状態遷移表（G6）

G1/G2 の `idle` / `item-selected` / `mobile-panel-open` / `filter-lift` / `filter-trail` を維持。  
`legend-*` は **削除**（該当 UI なし）。

| 状態 ID | 地図（stage） | サイドバー / パネル | モーダル | 遷移トリガー |
|---------|---------------|---------------------|----------|--------------|
| `idle` | イラスト 100%。初期は **コース強調**（リフト dim） | タブ「コース」+ コース一覧 | なし | 初期表示 / 選択解除 |
| `item-selected` | 可視面積不変。対象ハイライト | 行 `aria-pressed` + `MapFeatureDetail` | **なし** | リスト or ヒットボックスタップ |
| `filter-lift` | コース dim | リフト一覧 | なし | タブ「リフト」 |
| `filter-trail` | リフト dim | コース一覧 | なし | タブ「コース」 |
| `mobile-panel-open` | 背面（パン継続可） | 単一ボトムパネル（リスト+詳細） | スクリムのみ | FAB「運行状況」 |
| `status-stale` | 変化なし | 変化なし | なし | API 失敗 → **layout** 琥珀帯 |

---

## 8. 禁止パターン（G6 追記）

G1/G2 禁止に加え:

1. **layout chrome を決めてから stage を割る**の逆（オーバーレイ先行）— 新 chrome は必ず §2.1 の垂直構造に追加
2. **凡例・検索・GPS** を「とりあえず見えるように」載せる
3. **LAAX 比較モック**や未承認の **6ピル帯** を本番 `/map` に出す
4. full `/map` でレール **オーバーレイ**（layout-v5 インシデントの再発）
5. 色・ヒーロー画像・座標系の変更を **L1 spec なし**で行う（横断 Rules 継承）

---

## 9. ブレークポイント

| breakpoint | 地図 | レール | QuickNav |
|------------|------|--------|----------|
| **md+** (≥768px) | `flex-1` stage 全面 | `w-80` **横並び** | 4列表示 |
| **mobile** (<768px) | ほぼ全高（FAB 分除く） | `hidden` + FAB → ボトムパネル（初期**閉**） | 4列（ラベル省略可、タップ領域 44px 維持） |

---

## 10. コンポーネント契約（実装者向け）

| コンポーネント | G6 役割 |
|----------------|---------|
| `MapPageShell` | フルビューポート。`header` に TopBar + QuickNav |
| `MapTopBar` | タイトル + 言語 |
| `MapQuickNav` | ADEF 4列（server component） |
| `MapStaleBanner` | layout 行。成功時は非表示 |
| `LiftMapViewer` | splitRail: 地図 + aside。embed: 従来オーバーレイ可 |
| `MapStatusRail` | タブ・一覧・詳細。**凡例・検索・GPS なし** |
| `MapOverlayChrome` | **embed のみ**。リゾート名 + 全画面リンク + stale |
| `HeroMapCanvas` | P0 + ズーム FAB |
| `MapLegend` | **マウント禁止**（dead code 削除は L2 任意） |

---

## 11. 受け入れ基準（Given / When / Then）

`map-interaction-evaluator`（18）が G6 リリースで追試する項目。

| # | Given | When | Then |
|---|--------|------|------|
| **G6-1** | `/map` md+ 1280×800 | 初期表示 | 地図 stage に **ナビ帯・凡例・レールが重なっていない**。レールは viewport **右列**（split） |
| **G6-2** | `/map` md+ | 初期表示 | レールタブは **コースが選択**。リストはコースのみ。リフト path は dim |
| **G6-3** | `/map` | QuickNav 各リンク | A→`/`、D→`/live-cams`、E→`/access`、F→`/today`。地図 layout は変化しない |
| **G6-4** | `/map` | レールで項目選択 | 地図面積不変。詳細はレール内のみ（**I1**） |
| **G6-5** | `/map` | ソース検索 `MapLegend` `MapLocationPanel` 検索 input | **本番 `/map` ツリーにマウントされていない** |
| **G6-6** | `map-preview.html` file:// | 初期表示 | §5 parity。コースタブ active。`#sheet` なし |
| **G6-7** | 375px `/map` | 初期表示 | 地図 ≥50dvh 相当。運行 FAB のみ（レール常時表示なし） |

**G2-4（凡例）**: 本書 §4 により **評価対象外（WAIVED）**。

---

## 12. エージェントパイプライン（G6 後）

```
map-interaction-spec（本書）✅
  → ユーザー承認 ✅ 2026-06-08
    → map-ui-implementer（差分なし — UI整理セッション済）
      → map-ux-evaluator（R1–R6 + G6-1,3,7）✅ 2026-06-08
      → map-interaction-evaluator（I1–I5 + G6-2,4,5,6）✅ 2026-06-08
      → code-reviewer（座標・幾何変更時のみ — 本セッション対象外）
```

**出荷条件**: 16 **PASS** + 18 **PASS**（G2-4 waived 記録済み）— **達成**（[`qa_report_map.md`](../../docs/qa_report_map.md) §G6）。

---

## 13. 参照

- [`.cursor/rules/lift-map-no-fake-overlays.mdc`](../../.cursor/rules/lift-map-no-fake-overlays.mdc)
- [`.cursor/rules/map-interaction-gate.mdc`](../../.cursor/rules/map-interaction-gate.mdc)
- [`.cursor/rules/map-ux-gate.mdc`](../../.cursor/rules/map-ux-gate.mdc)
- [`docs/g2_checklist.md`](../../docs/g2_checklist.md) §9 UI 整理記録
