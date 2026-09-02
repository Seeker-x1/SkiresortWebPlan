/**
 * Apply verified 2026-27 fact updates to DRAFT + full-guide HTML (post-Steves).
 * Usage: node docs/japow-chasers-guide/scripts/apply-verify-updates.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const draftPath = join(root, "docs/japow-chasers-guide/DRAFT_v1_copyedited.md");
const htmlPath = join(
  root,
  "docs/research/inbox/full-guide-preview/index.html",
);

function applyAll(text) {
  let t = text;

  // --- Asahikawa: AKJ airport bus ---
  t = t.replace(
    /Adult fare last published in the \*\*¥1,000\*\* band — \*\*\[VERIFY 2026–27\]\*\* on the airport page\./g,
    "Adult fare **¥750** one-way (Asahikawa Denkikido Route 77; child half). Check the flight-linked timetable the night before.",
  );

  // --- Asahikawa: Ideyu-go ---
  t = t.replace(
    /\*\*Ideyu-go\*\* \(route 66\) year-round, 4\/day · station \*\*7:15 → 9:03\*\* · last down \*\*16:55\*\* · \*\*¥1,800\*\* \*\*\[VERIFY 2026–27\]\*\*/g,
    "**Ideyu-go** (route 66) year-round, 4/day · station **7:15 / 9:15 / 12:15 / 14:15** → ropeway **9:03 / 11:03 / 14:03 / 16:03** · last down **16:55** · **¥2,300** one-way (fare table 2026-09-01)",
  );

  // --- Asahikawa: Yukoman day-use ---
  t = t.replace(
    /~¥700 \*\*\[VERIFY 2026–27\]\*\*; phone 0166-97-2101/g,
    "**¥1,200** adult · **¥600** child (Kamigami-no-Yu day-use; reception **12:00–18:00**); phone 0166-97-2101",
  );

  // --- Asahikawa: Santa nighter hours ---
  t = t.replace(
    /often until around 20:30 \*\*\[VERIFY 2026–27\]\*\*/g,
    "**16:00–21:00** (official 2025–26; center lift to 21:00) **[VERIFY 2026–27]**",
  );
  t = t.replace(
    /often until ~\*\*20:30\*\* \*\*\[VERIFY 2026–27\]\*\*/g,
    "**16:00–21:00** (official 2025–26) **[VERIFY 2026–27]**",
  );

  // --- Hakuba: eatmap v4 ---
  t = t.replace(/japow-guide-hakuba-eatmap-v3\.png/g, "japow-guide-hakuba-eatmap-v4.png");

  // --- Hakuba: Goryu nighter season note ---
  t = t.replace(
    /\*\*2025–26:\*\* most nights 27 Dec–19 Mar \(closed 4 Mar 2026, private event\)\. \*\*\[VERIFY 2026–27\]\*\* \| \*\*18:00–21:30\*\*/g,
    "**2026–27:** late Dec–late Mar (official season-ticket page). Exact calendar TBD on nighter page. **[VERIFY 2026–27]** | **18:00–21:30**",
  );

  // --- Hakuba: Cortina nighter row (if present as 2026–27 confirmed in draft) ---
  t = t.replace(
    /\| \*\*Cortina\*\* — Ike-no-ta \| \*\*2026–27 confirmed\.\*\* Selected dates only: 26 Dec–2 Jan, 10 Jan, and Jan\/Feb Saturdays \| \*\*17:00–21:00\*\*/g,
    "| **Cortina** — Ike-no-ta | **2026–27:** Saturdays **26 Dec 2026–2 Jan 2027**, **10 Jan**, and **Jan–Feb Saturdays**; ticket **¥3,500** adult | **17:00–21:00**",
  );

  // --- Yuzawa: standardize bare [VERIFY] in hotel tables ---
  t = t.replace(
    /\| Free ~20\. No hold\. \*\*\[VERIFY\]\*\* \|/g,
    "| Free ~20. No hold. **[VERIFY 2026–27]** |",
  );
  t = t.replace(
    /\| Free ~100\. First-come\. \*\*\[VERIFY\]\*\* \|/g,
    "| Free ~100. First-come. **[VERIFY 2026–27]** |",
  );
  t = t.replace(
    /\| \*\*\[VERIFY\]\*\* at desk \|/g,
    "| **[VERIFY 2026–27]** at desk |",
  );
  t = t.replace(
    /regional analog; \*\*\[VERIFY\]\*\* on the dates/g,
    "regional analog; **[VERIFY 2026–27]** on the dates",
  );

  // --- Yuzawa: Hirokawa parking ---
  t = t.replace(
    /\| \*\*Hirokawa Hotel\*\* \| Same ~5 min walk as Kagetsu\. More rooms \| \*\*West exit ~5 min\*\* \(Yuzawa \*\*3203-2\*\*\) \| \*\*\[VERIFY 2026–27\]\*\* at desk \|/g,
    "| **Hirokawa Hotel** | Same ~5 min walk as Kagetsu. More rooms | **West exit ~5 min** (Yuzawa **3203-2**) | Free on-site (winter max ~9 spaces) |",
  );

  // --- Yuzawa: Toei parking + shuttle ---
  t = t.replace(
    /\| \*\*Yuzawa Toei Hotel\*\* \| ~7 min walk; also a west-exit shuttle for bags \| Official \*\*~7 min\*\* \/ west-exit shuttle \(Yuzawa \*\*3459\*\*\) \| \*\*\[VERIFY 2026–27\]\*\* at desk \|/g,
    "| **Yuzawa Toei Hotel** | ~7 min walk; also a west-exit shuttle for bags | Official **~7 min** / west-exit shuttle (Yuzawa **3459**) | Free parking; west-exit shuttle on call |",
  );

  return t;
}

const draft = readFileSync(draftPath, "utf8");
const html = readFileSync(htmlPath, "utf8");
const newDraft = applyAll(draft);
const newHtml = applyAll(html);

writeFileSync(draftPath, newDraft, "utf8");
writeFileSync(htmlPath, newHtml, "utf8");
console.log("Applied VERIFY updates to DRAFT and HTML.");
