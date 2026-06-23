# 札幌国際 LP — ビジュアル評価（2026-06-23）

## Verdict（リデザイン後）

**CONDITIONAL PASS** — mock として配信可。V3（AI 画像トーン）は Human Gate 残。

## 実施した削減

| 変更 | Before | After |
|------|--------|-------|
| index セクション | 10 | **7**（hero / live / triangle / paths / highlights / mobility / guides / tour / access → guides 統合で実質8→7） |
| path タイル | 8 | **4** |
| 厳選リスト | 11件フル掲載 | **3 teaser カード** → 子ページ |
| 特集アコーディオン | 3 | **削除** |
| インライン style | 多数 | **CSS ユーティリティへ移行** |
| JA eyebrow | 英語混在 | **日本語統一**（EN は英語） |

## ルーブリック（mock LP 適用）

| ID | 結果 | 根拠 |
|----|------|------|
| V1 タイポ階層 | FAIL | eyebrow に英語混在（Hub / Golden Triangle / Explore / Curated）。見出しスタイル乱立 |
| V2 余白 | FAIL | インライン `style=` による ad-hoc 余白。セクション過多でリズム崩れ |
| V3 写真 | WARN | AI ヒーロー6枚。モック許容。トーン統一は子ページ含め要 Human Gate |
| V4 モーション | PASS | 複製元準拠。過剰演出なし |
| V5 ブランド | FAIL | 情報密度過多・CTA 重複。南ふらの archetype より1段冗長 |
| V6 ベンチマーク | WARN | 広域ハブ訴求は明確。編集デザインとして「1スクロール1メッセージ」未達 |

## ブロッカー（修正方針）

1. index から厳選11件の全件リストを削除 → 3 枚のガイド teaser のみ
2. path タイル 8 → 4（南ふらのと同型）
3. 特集アコーディオン削除（triangle / mobility / tour と重複）
4. eyebrow・live ラベルを ja/en JSON で統一
5. インライン style を CSS ユーティリティへ移行

## 再発防止

モック LP 追加時は **index セクション数 ≤ 南ふらの + 1**。詳細リストは子ページのみ。
