/**
 * Wave 4 (B4/M12/M19) — buyer PDF must not contain production scaffolding.
 * Usage: node docs/japow-chasers-guide/scripts/verify-wave4-print-master.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const htmlPath = join(
  root,
  "docs/research/inbox/full-guide-preview/index.html",
);
const cssPath = join(
  root,
  "docs/japow-chasers-guide/preview-kit/preview-print.css",
);

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");

const errors = [];
const passes = [];

function fail(id, msg) {
  errors.push({ id, msg });
}

function pass(id, msg) {
  passes.push({ id, msg });
}

// --- CSS gates ---
if (!css.includes(".print-hidden")) {
  fail("B4-css", "preview-print.css missing .print-hidden");
} else if (!/\.print-hidden[\s\S]*display:\s*none/.test(css)) {
  fail("B4-css", ".print-hidden not hidden in @media print");
} else {
  pass("B4-css", ".print-hidden hides on print");
}

if (!/\.status-pill[\s\S]*display:\s*none/.test(css)) {
  fail("B4-css", ".status-pill not hidden on print");
} else {
  pass("B4-css", ".status-pill hidden on print");
}

if (!/\.page-break-overlay[\s\S]*display:\s*none/.test(css)) {
  fail("B4-pagebreak", "page-break overlay not hidden on print");
} else {
  pass("B4-pagebreak", "page-break overlay hidden on print");
}

// --- HTML content (buyer-visible text / hrefs) ---
const forbidden = [
  { id: "B4-ai-mock", pattern: /AI mock/i, label: "AI mock caption" },
  {
    id: "B4-gallery-h2",
    pattern: /<h2>Asset gallery — approved v1 art<\/h2>/,
    label: "asset gallery h2 must be print-hidden (class on section)",
  },
  {
    id: "B4-completion",
    pattern: /Completion snapshot/,
    label: "Completion snapshot (must be inside print-hidden section)",
  },
  {
    id: "M19-researched",
    pattern: /researched 2026/i,
    label: "researched 2026",
  },
  {
    id: "M19-tablecheck",
    pattern: /TableCheck closed 2026/i,
    label: "TableCheck closed date",
  },
  {
    id: "M12-inbox-href",
    pattern: /href="[^"]*inbox\//,
    label: "inbox/ relative href",
  },
  {
    id: "M12-preview-kit-href",
    pattern: /href="[^"]*preview-kit\/asahikawa-hotels-compare\.html"/,
    label: "relative hotel compare href",
  },
  {
    id: "B4-field-preview",
    pattern: /Field preview/,
    label: "Field preview brand text",
  },
  {
    id: "B4-copy-ready",
    pattern: /copy ready/i,
    label: "copy ready scaffolding",
  },
  {
    id: "B4-a4-preview",
    pattern: /English A4 preview/i,
    label: "English A4 preview paragraph",
  },
];

for (const { id, pattern, label } of forbidden) {
  if (pattern.test(html)) {
    if (id === "B4-gallery-h2" || id === "B4-completion") {
      const section = html.match(
        /<section[^>]*id="asset-gallery"[^>]*>[\s\S]*?<\/section>/,
      );
      if (!section || !section[0].includes("print-hidden")) {
        fail(id, `${label} not in print-hidden section`);
      } else {
        pass(id, `${label} OK (print-hidden section)`);
      }
    } else {
      fail(id, `Found forbidden: ${label}`);
    }
  } else {
    pass(id, `No ${label}`);
  }
}

// asset-gallery section must have print-hidden
const galleryOpen = html.match(
  /<section[^>]*id="asset-gallery"[^>]*>/,
);
if (!galleryOpen || !galleryOpen[0].includes("print-hidden")) {
  fail("B4-gallery-class", "#asset-gallery missing print-hidden class");
} else {
  pass("B4-gallery-class", "#asset-gallery has print-hidden");
}

// footer production note
const footer = html.match(/<footer[^>]*class="[^"]*"[\s\S]*?<\/footer>/);
if (footer && !footer[0].includes("print-hidden")) {
  fail("B4-footer", "footer missing print-hidden");
} else if (footer) {
  pass("B4-footer", "footer print-hidden");
}

// hotel compare must use japowsearch.com absolute URL
if (
  !html.includes("https://japowsearch.com/tools/hotel-compare?hub=asahikawa") &&
  !html.includes("https://japowsearch.com/tools/asahikawa-hotels-compare")
) {
  fail("M12-hotel", "missing japowsearch.com hotel compare URL");
} else {
  pass("M12-hotel", "hotel compare uses japowsearch.com URL");
}

// cover preview badge
if (!html.includes('<span class="badge print-hidden">preview</span>')) {
  fail("B4-cover-badge", "cover preview badge not print-hidden");
} else {
  pass("B4-cover-badge", "cover preview badge print-hidden");
}

console.log("Wave 4 print-master verification\n");
console.log(`PASS: ${passes.length}`);
for (const p of passes) {
  console.log(`  ✓ ${p.id}: ${p.msg}`);
}
if (errors.length) {
  console.log(`\nFAIL: ${errors.length}`);
  for (const e of errors) {
    console.log(`  ✗ ${e.id}: ${e.msg}`);
  }
  process.exit(1);
}
console.log("\nverify-wave4-print-master: ALL PASS");
