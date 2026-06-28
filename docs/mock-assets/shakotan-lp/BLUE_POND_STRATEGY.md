# 白金青い池 — LPサムネイル & 詳細ページ戦略

## 目的

積丹町野外スポーツ林スキー場 LP（`docs/mock-assets/shakotan-lp/`）を、**海外 FIT 旅行者のフック**として機能させる。  
「ニセコ級の雪体験」に加え、世界的認知度の高い **白金青い池（Shirogane Blue Pond）** を回遊のクライマックスとして位置づける。

## ターゲット

| セグメント | 動機 | 訴求 |
|-----------|------|------|
| 海外 FIT（英語 UI） | Mac 壁紙・SNS で既知 | "The blue pond from your wallpaper — 25 min from Biei Station" |
| 非滑走層（アジア圏） | 雪＋絶景の一日 | スノーウェルネス → 温活 → ライトアップ |
| 国内散策客 | 美瑛の定番 | スキー場拠点からの回遊モデル |

## LP 上の配置（3 接点）

### 1. Featured Spot カード（`#highlights` 直下）

- **役割**: ファーストスクロール後の「海外向けビジュアルフック」
- **レイアウト**: 16:9 ヒーロー画像 + オーバーレイコピー + CTA
- **コピー軸（EN 優先）**: Iconic · Winter light-up · Pair with snow wellness
- **リンク**: `blue-pond.html`

### 2. Journey Step 05 強化（`#journey`）

- 既存「絶景・終着」を **青い池詳細へのリンク** に変更
- ステップ本文は短く、詳細は専用ページへ委譲

### 3. Guides アコーディオン第 4 項

- タイトル: 白金青い池 — 冬のライトアップ
- サムネイル付きプレビュー行（4:5 thumb）+ 「読む」→ 詳細ページ

### 4. Path tile（`#paths`）

- `paths.bluePond` タイルを追加（span-4）：Nearby · Blue Pond

## 詳細ページ（`blue-pond.html`）

| ブロック | 内容 |
|---------|------|
| Hero | 冬ライトアップ全景（生成画像） |
| Hook | EN: "Japan's Blue Pond — beyond the photo" / JA: 写真の向こう側の青い池 |
| Why blue | 硫酸アルミニウムのコロイド・十勝岳関連の成池背景（概説） |
| When | 冬ライトアップ期間（例年 11 月〜4 月頃・公式要確認の免責付き） |
| Access | 美瑛駅から車約25分 / 白金温泉エリア / バス・ツアー言及 |
| Pairing | スキー場 → おきらく亭 → 白金温泉 → 青い池（1日回遊） |
| Responsible | 指定展望デッキ・駐車規制・混雑・農地立入禁止との一貫メッセージ |
| CTA | Google Map（公式エリア）・LPへ戻る |

## ビジュアル方針

- **トーン**: 美瑛 LP 既存パレット（`#5a6f85` accent, 白背景）を維持
- **画像**: Gemini 生成の冬ライトアップ（人物なし・実写風）
  - `lp-mock-shakotan-blue-pond-hero.png` — 詳細 Hero / Featured 16:9
  - `lp-mock-shakotan-blue-pond-thumb.png` — Guides サムネ 4:5
- **禁止**: 過度なグロー・非現実的なネオン（SNS バズ風）

## i18n

- キー名前空間: `bluePond.*` + `paths.bluePond.*` + `guides.bluePond.*` + `journey.steps.05.linkLabel`
- `meta.title` / `meta.description` は詳細ページ用に `bluePond.meta.*` を別途持ち、`mock-i18n-ready` で上書き

## 配信 URL

| 環境 | URL |
|------|-----|
| ローカル | `http://localhost:3456/shakotan-lp/index.html` |
| 本番 | `https://guides.japowserch.com/shakotan/blue-pond.html` |
| EN | `?lang=en` |

## 将来 migration

本番 `resorts/Biei/web/` 化時は七戸 `stay-local` + `onsen` 詳細パターンを参照し、`/[locale]/spots/blue-pond` へ移行。

## 実装チェックリスト

- [x] 戦略ドキュメント（本ファイル）
- [x] `messages/ja.json` · `en.json` キー parity
- [x] `index.html` 3 接点 + リンク
- [x] `blue-pond.html` 詳細
- [x] `mock.css` spot / detail スタイル
- [x] `validate-mock-i18n.mjs` exit 0
- [x] `guides/scripts/sync.mjs` で `/shakotan/blue-pond.html` 配信確認
