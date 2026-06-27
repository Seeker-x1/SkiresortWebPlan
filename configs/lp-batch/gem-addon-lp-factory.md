# LP Factory 連携用 — 既存 Gem への追記（任意）

**あなたの Gem（観光マーケティング・売上倍増レポート）を差し替えない。**  
Instructions の **末尾** に以下だけ追加すると、サイト自動生成がスムーズになる。

---

## 追記ブロック（コピペ）

```
# LP Factory 連携（追記）

上記レポートの**最後**に、必ず次のセクションを追加すること。

## 0. LP Factory メタデータ
| 項目 | 値 |
|------|-----|
| JAPOW ID | （ゲレンデリストの ID 番号） |
| registry id | （英小文字 kebab-case。例: shintoku-yama） |
| 正式名 (ja) | |
| 正式名 (en) | |
| 都道府県 | |
| 推奨 LP 複製元 | （shinjo-lp / minami-furano-lp / biei-lp / unabetsu-lp 等、既存 LP から1つ） |
| 戦略1行 (ja) | （LP ヒーロー用・1文） |
| 戦略1行 (en) | （英訳） |

registry id が不明な場合は施設名から推定し、要確認と明記すること。
```

---

## 追記しない場合

追記なしでも LP 作成は可能。`configs/lp-batch/batch-21-30.json` の id / japowResortId を Cursor が参照する。

| rank | registry id | 施設名 | JAPOW ID |
|------|-------------|--------|----------|
| 22 | shintoku-yama | 新得山スキー場 | 83 |
| 23 | tayama | 田山スキー場 | 116 |
| 24 | tomioka | 富岡スキー場 | 5 |
| 25 | kamifuse | 釜臥山スキー場 | 96 |
| 26 | hijiri-kogen | 聖高原スキー場 | 257 |
| 27 | kamoenokuni | 上ノ国町民スキー場 | 2 |
| 28 | sanokura | 三ノ倉スキー場 | 183 |
| 29 | niwa | 丹羽スキー場 | 6 |
| 30 | horaguchi | スノーパーク洞川 | 418 |

import 時に `--id shintoku-yama` のように指定すればよい。
