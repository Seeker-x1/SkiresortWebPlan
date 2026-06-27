# LP Factory — 使い方（チャットだけで足りる）

**結論:** Cursor Automation も GitHub Actions も **不要**。  
このリポジトリのチャットに話しかけるだけで、Deep Research → LP まで進む。

---

## 毎回やること（これだけ）

### 1本で全部（おすすめ）

```
田山スキー場を Deep Research して LP まで作って
```

### 分けても OK

```
新得山スキー場を Deep Research して
```

（完了後）

```
新得山の LP を作って
```

エージェントが裏で `npm run lp:auto` や LP Factory 手順を実行する。  
**PowerShell · Automation · Gem コピペは不要。**

---

## 初回セットアップ（1 点だけ）

Deep Research 用 API キーを `.env` に書く（画像 MCP と同じキーで OK）:

| ファイル |
|----------|
| `C:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\.env` |

```env
GEMINI_API_KEY=AIza...
```

雛形: `C:\Users\Takum\Desktop\Cloude\SkiresortWebPlan\.env.example`

---

## 裏で起きること

```
あなた: 「田山スキー場 LP 作って」
    ↓
エージェント（このチャット）
    ├─ Deep Research API（必要なら）
    ├─ inbox レポート保存
    ├─ LP テンプレ実装（brief · i18n · 画像 · registry）
    ├─ 検証 8 本 PASS
    ├─ npm run lp:ship（commit + push + Vercel デプロイ）
    └─ JAPOWSERCH resort-guides.json 同期 push
```

**push / デプロイは毎回エージェントが自動実行。** 「push するな」と言ったときだけ止める。

---

## バッチ #22〜30

| 施設名 |
|--------|
| 新得山スキー場（#22 · 完了） |
| 田山スキー場 |
| 富岡スキー場 |
| 釜臥山スキー場 |
| 聖高原スキー場 |
| 上ノ国町民スキー場 |
| 三ノ倉スキー場 |
| 丹羽スキー場 |
| スノーパーク洞川 |

---

## Automation はいつ使う？

| やり方 | 向いている人 |
|--------|-------------|
| **チャット（標準）** | あなた — 指示して見届ける |
| Cursor Automation / GitHub Actions | 寝てる間に勝手に回したい人 · チーム CI |

Automation 未設定でも LP Factory は **普通に完成する**（新得山がその例）。

関連ファイル（使わなくてよい）:
- `configs/lp-batch/cloud-agent-prompt.md`
- `configs/lp-batch/cloud-lp-auto-prompt.md`
- `.github/workflows/lp-auto.yml`

---

## トラブル

| 症状 | 対処 |
|------|------|
| `GEMINI_API_KEY is required` | `.env` にキーを書く |
| 調査だけ終わって LP がない | 「〇〇の LP を作って」と続けて送る |
| 画像が粗い | 「画像を Gemini MCP で差し替えて」 |
