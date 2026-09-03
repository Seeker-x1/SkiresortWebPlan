# Hotel Compare v2 — 設計案（P1 · resort-ux-designer）

**日付:** 2026-09-03  
**対象:** `docs/japow-chasers-guide/preview-kit/hotel-compare.html` → 「泊まる + 移動する」作り変え  
**参照:** [AFFILIATE_STATE.md](./AFFILIATE_STATE.md) · hallmark `structure.md` / `macrostructures.md`

---

## 確定済み前提（P0 以降）

| 項目 | 決定 |
|------|------|
| アフィリエイト | Booking + Agoda（CID/AID 待ち・URL 構造のみ）+ Discover Cars（`Jaapowsearch`・即収益） |
| スコープ | 宿の比較 + ハブ別レンタカー（**白馬は車セクションなし・宿のみ**） |
| 言語 | EN のみ |
| 実装 | 単一 HTML in-place · JAPOWSERCH 同期 |
| Discover Cars 拠点 | Asahikawa: AKJ + 旭川駅 · Yuzawa: 湯沢駅 · **Hakuba: 車ブロック非表示** |

**ユーザー像:** JAPOW Chaser's Guide（PDF / full-guide-preview）から来る、英語圏のパウダー狙いスキーヤー。すでにハブは決まっており、**どの宿をベースにするか**と、必要なら**車をどこで借りるか**を一度に片付けたい。

**1 アクション:** 日程を入れて → ガイド shortlist から宿を選ぶ →（旭川・湯沢のみ）同じ日程でレンタカーを押さえる。

**現行の問題（構造）:** 日付フォーム → 2 本の OTA ボタン → 表、の **機能の並べ替え** に留まっている。ガイドが持つ判断順序（公式優先・旅館は Trip.com・シャトル有無）が `meta` 1 行に潰れ、Discover Cars がページに存在しない。

---

## 案 A — Field Memo（Long Document）

### Hallmark macrostructure

**02 · Long Document** — 連続した実用メモ。マーケティングの hero → feature → CTA リズムを使わない。

### Structural fingerprint

| 軸 | 選択 |
|----|------|
| Section heading | **Inline with body** — 見出しは段落の流れから立ち上がる |
| Body | **Single column**（max ~62ch） |
| Divider | **Hairline rule** |
| Button | **Unstyled link** + 1 箇所だけ outlined（OTA city search） |
| Image | **None** |
| Reveal | **None** |
| Nav | **N1 Wordmark + 2 links**（Powder ranking · Guide hub） |
| Footer | **Ft2 Inline rule single line** + disclosure リンク |

### セクション順（上 → 下）

1. **Masthead** — `JAPOW Chaser's Guide · {hub title}`（eyebrow）+ `{headline}`（h1）+ `{lede}`（shortlist JSON・改変しない）
2. **Hub switcher** — 3  pill ではなく **テキストリンク行**（Asahikawa · Hakuba · Yuzawa）。現在地は weight のみで示す。
3. **Dates** — 「Your week」見出しの下に check-in / check-out / adults / rooms を **1 行インラインフォーム**（C2 inline-form-as-cta 寄り）。未入力時は以降のリンクを disabled 表示。
4. **Compare all** — 短い段落 + Booking / Agoda の **typographic link 2 本**（ID 空のときは *"opens Booking.com (no affiliate ID yet)"* と正直に）。
5. **Shortlist** — 各宿を **番号付きエントリ**（01. OMO7…）。`name` + `meta` を本文、`bookOfficialFirst: true` は先頭に *Book official first* の 1 行。リンク行は Official · Agoda · Booking · Trip.com（該当のみ）。
6. **Getting around** — **旭川・湯沢のみ表示**。白馬では **セクション自体を DOM に出さない**（空状態メッセージも不要）。  
   - 旭川: AKJ / Asahikawa Station の 2 リンク + 1 文（*Kamui and Santa Present Park need a car or bus from town.*）  
   - 湯沢: Echigo-Yuzawa Station の 1 リンク + 1 文（*4WD for Myoko drive days — same dates carry over.*）  
   - Discover Cars のみ affiliate-tracked と明記。
7. **Disclosure** — 実態に合わせた英語（Discover Cars tracked · OTA tracked only when CID/AID set · official/Trip.com never wrapped）。

### 宿リストの見せ方

- **順位:** shortlist JSON の配列順を維持（ガイド表と一致）。
- **グルーピングなし** — 旭川 OMO7 の「公式優先」は `bookOfficialFirst` + meta で文脈化するだけ。

### 日付フォーム

- ページ上部（hub 切替の直後）。変更ですべての href を再計算。

### tone

**Editorial / austere** — ガイド本体の field-guide 系統を japowsearch ネイビーで継承。装飾より読みやすさ。

### この案が AI っぽく見えるとしたら

- Long Document を **均等な番号リスト + 同じリンク並び** にすると Specimen/AI テンプレの「01. 02. 03.」になる。番号は宿エントリにだけ使い、セクション見出しに `01.` タグを付けない（hallmark gate 54）。
- 段落が短すぎて **箇条書きの羅列** になると SaaS FAQ 化する → 各宿は 2–3 文の塊に留める。

---

## 案 B — Trip Sheet（Narrative Workflow）

### Hallmark macrostructure

**14 · Narrative Workflow** — 使い方を時間順の 3 フェーズで示す。ページはプロセスそのもの。

### Structural fingerprint

| 軸 | 選択 |
|----|------|
| Section heading | **Numbered display（stacked）** — 数字は見出し**上**の独立行（横並び eyebrow 禁止） |
| Body | **Asymmetric spans** — 左: ステップ説明 / 右: フォーム or リスト |
| Divider | **Bleed-colour block** — ステップごとに `--navy-mid` ブロックで区切る |
| Button | **Outlined** |
| Image | **None** |
| Reveal | **Fade-up stagger**（ステップ境界のみ・1 回） |
| Nav | **N6 Masthead**（hub 名を masthead 右に） |
| Footer | **Ft4 Dense typographic colophon** |

### セクション順

1. **Fold** — h1 + hub tabs（pill 維持可）+ 1 行サマリー（`lede` から最初の 1 文のみ。全文は Step 1 へ）
2. **Step 1 · Set your dates** — 4 フィールドをカード内 grid。checkout ≤ checkin はインラインエラー。
3. **Step 2 · Pick a base** — shortlist を **カードグリッド**（モバイル 1 列 / 768+ 2 列）。`bookOfficialFirst` には小さな **outline chip**「Official first」。各行の CTA は chip 群（Official / Agoda / …）。
4. **Step 2b · Search the whole city** — Booking / Agoda bulk（Step 2 の下、同じ背景ブロック内）。
5. **Step 3 · Move** — **hub === hakuba なら非表示（Step 3 自体をスキップ）**  
   - 旭川: 2 列 — AKJ | Station、各 Discover Cars CTA  
   - 湯沢: 1 列 — Yuzawa Station  
   - 見出し: *Step 3 · Rent a car*（捏造 stat なし）
6. **Disclosure**

### 宿リストの見せ方

- **グルーピング:** `bookOfficialFirst: true` を視覚的に先頭固定はせず、**chip で判別**（JSON 順維持）。
- 白馬の Maruishi / Shiroumaso は Agoda/Booking スラッグが空 → **Trip.com + Official のみ** のカード。空ボタンを出さない。

### 日付フォーム

- Step 1 専用ブロック。Step 2/3 は日付が有効になるまで `aria-disabled` + 説明文。

### tone

**Utilitarian / technical** — チェックリスト感。スキーヤーが印刷して持てる「trip sheet」。

### この案が AI っぽく見えるとしたら

- 3 ステップ + outlined カードは **SaaS onboarding** に近い → ステップ番号を「Setup / Stay / Drive」等のマーケ語にしない。数字と動詞のみ。
- fade-up を各カードに付けると **everything-fades-in** → ステップ境界 1 回だけ。

---

## 案 C — Spec Sheet（Catalogue + Tabular Spec）

### Hallmark macrostructure

**11 · Catalogue** + コンポーネント **F3 Tabular spec sheet** — 参照表として読む。叙述より密度。

### Structural fingerprint

| 軸 | 選択 |
|----|------|
| Section heading | **Hanging** — 表の上に余白だけで見出し |
| Body | **Three-column equal**（desktop）→ モバイルはカードへ崩す |
| Divider | **Negative space** |
| Button | **Outlined chip**（行内）+ bulk は **inline-form-as-cta** |
| Image | **None** |
| Reveal | **None** |
| Nav | **N3 Side-rail**（desktop のみ: Hub / Dates / Hotels / Car） |
| Footer | **Ft3 Index-style category list** |

### セクション順

1. **Header row** — 左: hub + headline / 右: **compact date bar**（常時表示・sticky 化はモバイルのみ C4 sticky-bottom-bar で日付サマリー）
2. **City search strip** — Booking | Agoda（横並び chip、表の上）
3. **Hotels table** — 列: **Property · Guide note · Book**  
   - Guide note = `meta` 全文  
   - Book = リンク chip 群  
   - `bookOfficialFirst` は Property 列に小さく `Official first` ラベル（色は accent2、捏造 badge 文言なし）
4. **Mobility** — 見出し *Rental pickup* — **旭川・湯沢のみ**  
   - 表形式: Location · Use case · Link  
   - 旭川 2 行 / 湯沢 1 行  
   - 白馬: セクションなし（ユーザー決定 2026-09-03）
5. **Disclosure**

### 宿リストの見せ方

- **表が主** — 現行 HTML の table を進化させるが、列設計を「Links 1 列」から **Property / Note / Book** に分割して meta を読めるようにする。
- モバイル: 表をやめ、**1 宿 = 1 spec card**（Property + Note + chip row）。

### 日付フォーム

- ヘッダー右（desktop）/ sticky bar（mobile）。表の上に常に見える。

### tone

**Technical / austere** — 航空会社の運賃表・装備仕様書に近い。感情表現は lede と meta に任せる。

### この案が AI っぽく見えるとしたら

- 3 列 table + navy カードは **現行ページの延長** で、構造変更が弱く見える → 列分割と sticky date bar で「ダッシュボード」ではなく「spec sheet」と分かる密度にする。
- Side-rail nav を **空リンクのダミー** にすると SPA 風 AI テンプレ → 同一ページ内アンカーのみ、未実装 scroll-spy 禁止。

---

## 3 案の対比

| | 案 A Field Memo | 案 B Trip Sheet | 案 C Spec Sheet |
|--|-----------------|-----------------|-----------------|
| Macrostructure | Long Document | Narrative Workflow | Catalogue + F3 |
| 読み心地 | ガイドの続き | チェックリスト | 早見表 |
| モバイル | 単列で最強 | ステップ縦積み | 表→カード変換 |
| 白馬（車なし） | セクション省略 | Step 3 省略 | Mobility 省略 |
| 既存からの差分 | 大（表をやめる） | 大（ステップ化） | 中（表の列設計変更） |
| 実装コスト | 中 | 中高（状態機械） | 中 |
| japowsearch 連続性 | 高 | 中 | 高 |

---

## 推奨（designer 所見）

**第一推奨: 案 A（Field Memo）**

- ガイド PDF からの流入と最も声が一致する。
- 「AI SaaS ランディング」構造（hero → 3 feature → CTA）から最も遠い。
- 白馬で車セクションを **静かに省略** するのが自然（メモに無い＝不要、という読み方）。
- 単一 HTML + fetch JSON のまま実装可能。hallmark の honest-copy ルール（捏造 stat なし）とも相性が良い。

**次点: 案 C** — 現行の table ユーザーにとって学習コストが低い。列を分ければ meta の判断材料が読める。

**案 B** — 初見の導線は最も明確だが、ステップ UI は AI onboarding と誤認されやすく、P6 visual で FAIL リスクがやや高い。

---

## P2 へ渡す際の固定事項

1. 白馬ハブ: **Mobility / Step 3 / Getting around セクションは一切出さない**（fallback 文案も不要）。
2. Discover Cars: 旭川 2 拠点 + 湯沢 1 拠点のみ。URL は `configs/affiliates/discover-cars.json` から。捏造禁止。
3. OTA: CID/AID 空のとき開示とボタン文言を **tracked と言わない**。
4. Trip.com: Maruishi / Shiroumaso の非トラッキング実用リンクとして維持。
5. トークン: JAPOWSERCH 既存 `--navy` / `--accent` 系を pre-flight で preserve（hallmark redesign 方針）。

---

## 次ステップ

→ **P2 `resort-design-director`:** 上記 3 案から 1 案を選び `final_requirements.md` を確定する（推奨は案 A）。
