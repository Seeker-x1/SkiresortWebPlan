# 既存 Gem → LP サイト作成 — 手順書

あなたの Gem（観光マーケコン・売上倍増レポート）**をそのまま使う**手順です。  
`gem-system-prompt.md` に差し替える必要はありません。

---

## 準備（1回だけ）

1. Gem は **Deep Research ON** のまま（既存の Instructions そのまま）
2. （任意）Instructions 末尾に [`gem-addon-lp-factory.md`](./gem-addon-lp-factory.md) を追記
3. Cursor Automation「LP Factory — research inbox → guide LP」が main push で動く設定（未設定なら **方法B**）

---

## 1施設の流れ（例: #22 新得山）

### Step 1 — Gem で調査

Gem のチャットに **施設名だけ** 送る:

```
新得山スキー場
```

Deep Research が終わるまで待つ（数分〜十数分）。  
あなたのフォーマット（基礎データ・強弱・競合・アクションプラン等）のレポートが返る。

### Step 2 — レポートをファイルに保存

Gem の出力 **全文** をコピーし、例:

`C:\Users\Takum\Desktop\report-shintoku-yama.md`

として保存。

### Step 3 — リポジトリに取り込む

PowerShell:

```powershell
cd C:\Users\Takum\Desktop\Cloude\SkiresortWebPlan

npm run lp:import-report -- --id shintoku-yama --file C:\Users\Takum\Desktop\report-shintoku-yama.md
```

- `--id` = バッチ JSON の registry id（下表参照）
- 保存先: `docs/research/inbox/shintoku-yama.md`

**rank と id の対応（#22〜30）**

| 入力する施設名 | `--id` | JAPOW ID |
|----------------|--------|----------|
| 新得山スキー場 | shintoku-yama | 83 |
| 田山スキー場 | tayama | 116 |
| 富岡スキー場 | tomioka | 5 |
| 釜臥山スキー場 | kamifuse | 96 |
| 聖高原スキー場 | hijiri-kogen | 257 |
| 上ノ国町民スキー場 | kamoenokuni | 2 |
| 三ノ倉スキー場 | sanokura | 183 |
| 丹羽スキー場 | niwa | 6 |
| スノーパーク洞川 | horaguchi | 418 |

### Step 4 — サイト作成

#### 方法A: Automation あり（push する）

```powershell
git add docs/research/inbox/shintoku-yama.md configs/lp-batch/batch-21-30.json
git commit -m "research: shintoku-yama marketing report"
git push origin main
```

→ Cloud Agent が LP を作り **PR** を開く。  
LP 画像は LP 作成時に **いつもの Gemini 画像 MCP** が使われる（別設定不要）。

#### 方法B: Cursor チャットで直接（Automation なし）

```powershell
npm run lp:cursor-handoff -- --rank 22
```

出力された長文を **Cursor 新規チャット** に貼る → Agent が LP Factory 実行。

---

## あなたの Gem と LP Factory の関係

```
[あなたの Gem]          [リポジトリ]              [サイト]
 施設名入力      →    inbox/{id}.md      →    {id}-lp/
 売上倍増レポート      batch JSON の id          ガイド LP
 JAPOW ID（トップ）    japowResortId 83          JAPOW 詳細ボタン
```

- Gem の **売上倍増フォーマット** = 調査・営業資料としてそのまま使える
- LP の **文言・構成** = Cursor がレポート + `batch-21-30.json` から実装
- **画像 API** = LP 作成フェーズのみ（Gem 調査とは別タイミング）

---

## よくある質問

**Q: gem-system-prompt.md に書き換えが必要？**  
→ **不要。** 今の Gem のままで OK。

**Q: JAPOW ID は Gem がトップに書いてくれる**  
→ LP では `batch-21-30.json` の `japowResortId` も使う。83 = 新得山で一致していれば問題なし。

**Q: registry id（shintoku-yama）がレポートに無い**  
→ import の `--id` で指定するので問題なし。

**Q: lp:deep-research（API）は？**  
→ Gem を使うなら **不要。** API は Gem を開かずターミナルだけで調査したい人向け。

---

## 次の1施設をやるとき

1. Gem: `田山スキー場`
2. 保存 → `npm run lp:import-report -- --id tayama --file ...`
3. push または `lp:cursor-handoff --rank 23`
