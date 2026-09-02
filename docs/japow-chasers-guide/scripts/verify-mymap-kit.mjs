/**
 * My Maps kit verification — CSV pins vs DRAFT chapter tables vs live viewer title.
 * Usage: node docs/japow-chasers-guide/scripts/verify-mymap-kit.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const draftPath = join(root, "docs/japow-chasers-guide/DRAFT_v1_copyedited.md");
const draft = readFileSync(draftPath, "utf8");

const HUBS = [
  {
    id: "asahikawa",
    csv: "docs/research/inbox/asahikawa-hub-preview/asahikawa-eat-mymap-en.csv",
    meta: "docs/research/inbox/asahikawa-hub-preview/asahikawa-eat-mymap-meta.txt",
    mid: "1H9fAIBhcInblW99U2jBObN4dOxJ_2G4",
    draftStart: "## HUB 1 — Asahikawa",
    draftEnd: "## HUB 2 — Hakuba",
    titleNeedle: "01–17",
    expectedPins: [
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
      "11", "12", "13", "14", "15", "16", "17",
    ],
  },
  {
    id: "hakuba",
    csv: "docs/research/inbox/hakuba-hub-preview/eat-mymap-en.csv",
    meta: "docs/research/inbox/hakuba-hub-preview/eat-mymap-meta.txt",
    mid: "1tVmXYHtX8whQCDnpJaKf4-wWDjDXi5A",
    draftStart: "### Eat and drink",
    draftEnd: "### When Happo is tracked",
    hubMarker: "## HUB 2 — Hakuba",
    titleNeedle: "01",
    expectedPins: [
      "01", "03", "05", "06", "09", "10", "11", "12", "13", "17", "18", "19",
    ],
  },
  {
    id: "yuzawa",
    csv: "docs/research/inbox/yuzawa-hub-preview/yuzawa-eat-mymap-en.csv",
    meta: "docs/research/inbox/yuzawa-hub-preview/yuzawa-eat-mymap-meta.txt",
    mid: "1bjlmgLYwn82CK3FxtxdDwZ6u4u-sc_w",
    draftStart: "## HUB 3 — Echigo-Yuzawa",
    draftEnd: "## Appendix",
    eatSection: "### Eat",
    titleNeedle: "01–12",
    expectedPins: [
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
    ],
  },
];

const errors = [];
const passes = [];
const warnings = [];

function fail(id, msg) {
  errors.push({ id, msg });
}
function pass(id, msg) {
  passes.push({ id, msg });
}
function warn(id, msg) {
  warnings.push({ id, msg });
}

function read(path) {
  const full = join(root, path);
  if (!existsSync(full)) {
    fail("file", `Missing: ${path}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function parseCsvPins(csvText) {
  const lines = csvText.trim().split(/\r?\n/).slice(1);
  const pins = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    const nameCol = cols[2] ?? cols[1];
    const m = (nameCol ?? "").match(/^(\d{2})\s/);
    if (m) pins.push(m[1]);
  }
  return [...new Set(pins)].sort();
}

function extractDraftPins(section) {
  const pins = new Set();
  const re = /\|\s*\*\*(\d{2})\*\*/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    pins.add(m[1]);
  }
  return [...pins].sort();
}

function sliceDraft(hub) {
  let start = draft.indexOf(hub.draftStart);
  if (start < 0 && hub.hubMarker) {
    const hubStart = draft.indexOf(hub.hubMarker);
    if (hubStart >= 0) {
      const eatIdx = draft.indexOf(hub.draftStart, hubStart);
      start = eatIdx >= 0 ? eatIdx : hubStart;
    }
  }
  if (start < 0) {
    fail(`${hub.id}-draft`, `Draft marker not found: ${hub.draftStart}`);
    return "";
  }
  const end =
    hub.draftEnd && draft.indexOf(hub.draftEnd, start + 1) > start
      ? draft.indexOf(hub.draftEnd, start + 1)
      : draft.length;
  return draft.slice(start, end);
}

function parseMetaMid(metaText) {
  const m = metaText.match(
    /viewer\?mid=([A-Za-z0-9_-]+)/,
  );
  return m ? m[1] : null;
}

function diffSets(label, expected, actual) {
  const exp = new Set(expected);
  const act = new Set(actual);
  const missing = expected.filter((p) => !act.has(p));
  const extra = actual.filter((p) => !exp.has(p));
  if (missing.length) {
    fail(`${label}-missing`, `Missing pins: ${missing.join(", ")}`);
  }
  if (extra.length) {
    fail(`${label}-extra`, `Extra pins: ${extra.join(", ")}`);
  }
  if (!missing.length && !extra.length) {
    pass(`${label}-pins`, `Pins match (${expected.length})`);
  }
}

async function fetchViewerTitle(mid) {
  const url = `https://www.google.com/maps/d/viewer?mid=${mid}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "JAPOW-Guide-Verify/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    if (/sign in|ログイン|アクセス/i.test(html) && !/Google My Maps/i.test(html)) {
      return { title: null, loginWall: true, url };
    }
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/ - Google My Maps$/, "").trim() : null;
    return { title, loginWall: false, url };
  } catch (e) {
    return { title: null, loginWall: false, url, error: String(e) };
  }
}

for (const hub of HUBS) {
  const csvText = read(hub.csv);
  const metaText = read(hub.meta);
  const csvPins = parseCsvPins(csvText);
  const section = sliceDraft(hub);
  const draftPins = extractDraftPins(section);

  diffSets(`${hub.id}-csv-expected`, hub.expectedPins, csvPins);
  diffSets(`${hub.id}-draft-expected`, hub.expectedPins, draftPins);
  diffSets(`${hub.id}-csv-draft`, draftPins, csvPins);

  const metaMid = parseMetaMid(metaText);
  if (metaMid !== hub.mid) {
    fail(`${hub.id}-meta-mid`, `meta mid=${metaMid} expected ${hub.mid}`);
  } else {
    pass(`${hub.id}-meta-mid`, "meta mid matches config");
  }

  const draftMid = section.includes(hub.mid);
  if (!draftMid) {
    fail(`${hub.id}-draft-mid`, `DRAFT section missing mid=${hub.mid}`);
  } else {
    pass(`${hub.id}-draft-mid`, "DRAFT links to correct mid");
  }
}

console.log("My Maps kit verification\n");

const viewerResults = await Promise.all(
  HUBS.map(async (hub) => {
    const result = await fetchViewerTitle(hub.mid);
    return { hub, ...result };
  }),
);

for (const { hub, title, loginWall, url, error } of viewerResults) {
  if (error) {
    warn(`${hub.id}-viewer`, `Fetch failed: ${error}`);
    continue;
  }
  if (loginWall) {
    fail(`${hub.id}-viewer`, `Login wall on ${url}`);
    continue;
  }
  if (!title) {
    warn(`${hub.id}-viewer`, `No title parsed from ${url}`);
    continue;
  }
  if (hub.id === "asahikawa" && !/01.*17|01–17|01-17/.test(title)) {
    fail(`${hub.id}-viewer-title`, `Live title "${title}" — expected 01–17`);
  } else if (hub.id === "yuzawa" && !/01.*12|01–12|01-11/.test(title)) {
    if (/01–11|01-11/.test(title)) {
      fail(`${hub.id}-viewer-title`, `Live title "${title}" — expected 01–12 (pin 12 Asfes missing?)`);
    } else {
      fail(`${hub.id}-viewer-title`, `Live title "${title}" — expected 01–12`);
    }
  } else if (hub.id === "hakuba" && /01–29|01-29/.test(title)) {
    warn(`${hub.id}-viewer-title`, `Live title still shows 01–29: "${title}" — re-import trimmed CSV`);
  } else {
    pass(`${hub.id}-viewer`, `Live title: "${title}"`);
  }
}

console.log(`PASS: ${passes.length}`);
for (const p of passes) console.log(`  ✓ ${p.id}: ${p.msg}`);

if (warnings.length) {
  console.log(`\nWARN: ${warnings.length}`);
  for (const w of warnings) console.log(`  ! ${w.id}: ${w.msg}`);
}

if (errors.length) {
  console.log(`\nFAIL: ${errors.length}`);
  for (const e of errors) console.log(`  ✗ ${e.id}: ${e.msg}`);
  console.log(
    "\nOwner checklist: edit URL → import CSV → Share → anyone with link → verify logged-out viewer.",
  );
  process.exit(1);
}

console.log("\nverify-mymap-kit: ALL PASS");
