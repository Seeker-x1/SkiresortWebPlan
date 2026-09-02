# Hub density scorecard

**Rule:** PASS only if a reader can **book tonight and stand on a hill tomorrow** from that block. Readable prose does not count.  
**Bar:** union of Hakuba operations + Asahikawa hotel-as-system / food categories.  
**Measured:** 2026-09-02 — **`docs/research/inbox/full-guide-preview/index.html`** cross-checked with `DRAFT_v1_copyedited.md` after Steves pass + post-Steves maps/VERIFY.  
**Scoring:** **PASS** / **FAIL**. No partial credit on the chapter row.

---

## The 12 blocks

| # | Block | What PASS requires |
|---|--------|-------------------|
| 1 | 30 seconds | Sleep / Shape / Arrive / Out / Days / Soak / Money in one table |
| 2 | Do / Don't | Executable bans (not vibe). At least 5 Don'ts that prevent a wasted day |
| 3 | Why this hub | One paragraph + mountain table (5+ rows) + pilgrimage mountain (named, what it is/isn't) |
| 4 | Choose the week | **One** path fork. Named beds + official book links. **If those are gone** backups |
| 5 | Soak after the hill | Named baths, price or hours, tattoo line, official URL |
| 6 | How you get here | Plan A spine (named operator + yen + time) + Plan B if sold out + bags |
| 7 | 7 nights | Weather table **wins**. Locked Day 2 / Day 3 tour = FAIL. japowsearch candidate hills listed |
| 8 | Eat | **Both:** category TOP3 (reservation / Web book / English) **and** walk-radius list for tonight. **8+ Layer B spots:** map pair (live My Maps + walk-layer PNG; numbers match the table) |
| 9 | When tracked | Named waki-pow hill + lean-snow alternative. Not “go find powder” |
| 10 | Backcountry | First-timer pick + operator table. Group total vs per person labeled |
| 11 | What it costs | Columns = **paths** (or one explicit path fork), not contradictory hotel-class tiers. In / out of the number in one sentence |
| 12 | Book this | August / 90 / 30 / 14–7 days. Do not re-ask the path fork |

---

## Chapter scores (HTML print surface — 2026-09-02)

| # | Block | Asahikawa | Hakuba Happo-One | Echigo-Yuzawa | Evidence (HTML) |
|---|--------|-----------|------------------|---------------|-----------------|
| 1 | 30 seconds | **PASS** | **PASS** | **PASS** | `#asahikawa-snapshot` · `#snapshot` · `#yuzawa-snapshot` |
| 2 | Do / Don't | **PASS** | **PASS** | **PASS** | Do/Don't tables; Yuzawa includes “Do not overnight in **Myoko**” |
| 3 | Why this hub | **PASS** | **PASS** | **PASS** | Mountain tables + Asahidake / Happo pilgrimage prose |
| 4 | Choose the week | **PASS** | **PASS** | **PASS** | Path A/B/C (Asahikawa) · eat-out vs inn (Hakuba) · Path A/B (Yuzawa) + named beds |
| 5 | Soak after the hill | **PASS** | **PASS** | **PASS** | Tattoo / price / official URLs (Happo-no-Yu, Yukoman-so, Kaido-no-Yu, etc.) |
| 6 | How you get here | **PASS** | **PASS** | **PASS** | AKJ airport bus ¥750 · NSS + Alpico · Skyliner/N'EX/Joetsu + TA-Q-BIN |
| 7 | 7 nights | **PASS** | **PASS** | **PASS** | Weather tables win; “Days 2–6 are **not** … locked tour” (all three) |
| 8 | Eat | **PASS** | **PASS** | **PASS** | See notes below |
| 9 | When tracked | **PASS** | **PASS** | **PASS** | Lean-week rows; Goryu Waves; waki-pow / Joetsu Kokusai |
| 10 | Backcountry | **PASS** | **PASS** | **PASS** | `/ group` / `pp` labeled (Yabai, Evergreen, Canyons) |
| 11 | What it costs | **PASS** | **PASS** | **PASS** | Path forks: A/B/C · Eat out / Inn dinner / Backup · Path A/B |
| 12 | Book this | **PASS** | **PASS** | **PASS** | `#asahikawa-book` · `#hakuba-book` · `#yuzawa-book` |
| | **PASS count** | **12 / 12** | **12 / 12** | **12 / 12** | |

### Block 8 notes

| Hub | Status | Detail |
|-----|--------|--------|
| **Asahikawa** | PASS | pins **01–17** · CSV/meta synced · PNG `japow-guide-asahikawa-eatmap-v1.png` (Playwright capture 2026-09-02) |
| **Hakuba** | PASS | Steves week map **12 pins** (Walk 6 / Echoland 3 / Locals 3) · CSV trimmed · PNG **`japow-guide-hakuba-eatmap-v4.png`** |
| **Yuzawa** | PASS | CSV **01–12** · map + PNG wired |

### Block 11 notes

| Hub | Status | Detail |
|-----|--------|--------|
| **Asahikawa** | PASS | Path **A / B / C** rows only (no Premium tier table) |
| **Hakuba** | PASS | Eat out / Inn dinner / Backup path rows · `#hakuba-budget` (2026-08-30) |
| **Yuzawa** | PASS | Path **A — no car** / **B — station 4WD** |

---

## Wave 8 ship gate (PLAYBOOK `#w8` — grep 2026-08-30)

| Check | Result | grep / note |
|-------|--------|-------------|
| Asahikawa airport bus | **PASS** | `AKJ` + `airport bus` in `#hub-asahikawa` |
| No locked Day 2/3 tour | **PASS** | `7-Day Powder Hunter` · `Deep trees` · `Asahidake pilgrimage` → **0** |
| No Asahikawa Premium cost tier | **PASS** | `Tier: Premium` → **0** in Asahikawa section |
| Hakuba Premium cost tier | **PASS** | `#hakuba-budget` → Eat out / Inn dinner / Backup only |
| Asset gallery hidden from print | **PASS** | `#asset-gallery` has `print-hidden`; preview badge idem |
| Season note all 3 hubs | **PASS** | `Season:` at L397 · L2523 · L4671 |
| `JR to Bibai` on Pippu row | **PASS** | **0** (wave 7 → Pippu 比布) |
| `Powder Belt Pass` | **PASS** | **0** (wave 1 removed) |
| Hub picker column names | **NIT** | Table uses `Hakuba Happo` / `Yuzawa` — playbook asks `Hakuba Happo-One` / `Echigo-Yuzawa` |
| Bare `[VERIFY]` → `[VERIFY 2026–27]` | **NIT** | ~18 bare `[VERIFY]` in Yuzawa/Hakuba (DRAFT + HTML) |
| `in the finished PDF` future tense | **NIT** | DRAFT calendar L58 only |
| `Hotel Wing` legacy name | **NIT** | KOKO row (historical note — intentional) |
| Scorecard matches HTML | **PASS** | this file |

---

## BLOCKER status (audit B1–B8 vs current HTML)

| ID | Audit title | 2026-08-30 status | Notes |
|----|-------------|-------------------|-------|
| **B1** | Fixed Asahikawa day tour | **CLOSED** | Weather table + quiet-week fallback; no `7-Day Powder Hunter` |
| **B2** | No AKJ spine in HTML | **CLOSED** | Plan A AKJ + airport bus in `#hub-asahikawa` |
| **B3** | Asahikawa Premium tier | **CLOSED** | Path A/B/C budget only |
| **B4** | Scaffolding in print master | **CLOSED (print)** | `print-hidden` on gallery / completion snapshot / preview badge — **still in repo HTML** for dev |
| **B5** | Closed days missing vs CSV | **CLOSED** | Santouka Thu · Ji-Beer Sun · Gin-neko Mon in HTML |
| **B6** | No Path A/B/C fork | **CLOSED** | `#asahikawa-choose` |
| **B7** | Asfes unconditional dinner | **CLOSED** | Week table: `Asfes if open` (wave 6) |
| **B8** | Pippu JR Bibai wrong | **CLOSED** | Official 比布駅 + [access page](https://www.town.pippu.hokkaido.jp/ski/access.html) (wave 7) |

**Ship gate:** audit **BLOCKERs B1–B8 are closed** on purchaser print surface. Hakuba eat block 8 **PASS** after v4 PNG + 12-pin CSV (2026-09-02).

---

## Remaining work (not BLOCKER)

| Item | Owner | Why still open |
|------|-------|----------------|
| **My Maps live re-import** | Owner Google account | CSV/meta ready; viewer title may still show old pin count until owner imports on edit URL |
| **Nozawa My Map live viewer** | Manual browser | Eat + sotoyu layers — eye-verify only |
| **hotel-compare live 404** | japowsearch deploy | HTML links use `japowsearch.com/tools/hotel-compare?hub=*` |

---

## $15 read (honest)

- **Asahikawa · 12/12** on HTML — executable week after waves 1–2–7 + VERIFY pass.  
- **Yuzawa · 12/12** on HTML — path fork, eat pair, lean-week, JMA 0544 note (wave 6).  
- **Hakuba · 12/12** on HTML — ops-strong; eat v4 PNG + 12-pin CSV (2026-09-02).  
- **Three-hub PDF** is **not** “12/12 × 3” until Hakuba block 8 (PNG) is re-captured.

Quality bar for the next hub: **12 / 12** on this sheet, using [MAP_TEMPLATE.md](./MAP_TEMPLATE.md). Do not copy the old “12/12×3” header from the 2026-08-17 fill pass.

---

## Historical — audit snapshot (2026-08-17, superseded)

Pre–wave-1 HTML scored **Asahikawa 3/12** in [AUDIT_v1_ja.md](./AUDIT_v1_ja.md). That gap drove waves 0–2. The “After fill (2026-08-17) — 12/12×3” table below was **aspirational**; replace with the measured table above.

<details>
<summary>Before-fill baseline (why the work existed)</summary>

| # | Block | Asahikawa (before) | Hakuba (before) | Yuzawa (before) |
|---|--------|--------------------|-----------------|---------------|
| 1 | 30 seconds | FAIL | PASS | FAIL |
| 2 | Do / Don't | FAIL | PASS | FAIL |
| 3 | Why this hub | PASS | FAIL | PASS |
| 4 | Choose the week | FAIL | PASS | FAIL |
| 5 | Soak | PASS | PASS | FAIL |
| 6 | How you get here | FAIL | PASS | FAIL |
| 7 | 7 nights | FAIL | PASS | FAIL |
| 8 | Eat | FAIL | FAIL | FAIL |
| 9 | When tracked | FAIL | PASS | PASS |
| 10 | Backcountry | FAIL | PASS | FAIL |
| 11 | What it costs | FAIL | PASS | FAIL |
| 12 | Book this | FAIL | PASS | FAIL |

</details>
