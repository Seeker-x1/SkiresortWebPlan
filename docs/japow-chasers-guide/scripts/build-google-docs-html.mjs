/**
 * Build a Google Docs–importable HTML from the guide draft.
 * Upload the output .html to Drive → Open with Google Docs.
 * Then: Edit each "PAGE BREAK" line → Insert → Break → Page break.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const draftPath = path.join(root, "DRAFT_v1_copyedited.md");
const outPath = path.join(root, "GOOGLE_DOCS_DRAFT.html");

const draft = fs.readFileSync(draftPath, "utf8");

/** Agreed print page breaks (Docs: replace marker with Insert → Break → Page break) */
const BREAK_BEFORE = [
  { match: /^## Introduction: The Hub Strategy/m, label: "Orientation / Front matter follow-on — keep intro with cover flow as needed" },
  { match: /^## Section 1: The JAPOW Calendar/m, label: "Section 1: The JAPOW Calendar" },
  // Orientation is not in DRAFT_v1 as its own H2 — inserted below
  { match: /^## Section 2: The Ultimate Basecamp/m, label: "HUB 1 — Asahikawa (after JMA / hub picker in PDF)" },
  { match: /^### Where to stay: \[Hoshino Resorts OMO7/m, label: "Where to stay: OMO7 Asahikawa" },
];

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_, label, href) => {
    const blank = href.includes("google.com/maps/d/")
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    return `<a href="${href}"${blank}>${label}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
}

function parseTable(rows) {
  const cells = rows.map((r) =>
    r
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim())
  );
  if (cells.length < 2) return "";
  const head = cells[0];
  const body = cells.slice(2); // skip separator
  let html = "<table>\n<thead><tr>";
  for (const h of head) html += `<th>${inline(h)}</th>`;
  html += "</tr></thead>\n<tbody>\n";
  for (const row of body) {
    html += "<tr>";
    for (const c of row) html += `<td>${inline(c)}</td>`;
    html += "</tr>\n";
  }
  html += "</tbody></table>\n";
  return html;
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inUl = false;
  let inOl = false;
  let inBq = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };
  const closeBq = () => {
    if (inBq) {
      out.push("</blockquote>");
      inBq = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("|") && i + 1 < lines.length && /^\|[\s:-|]+\|$/.test(lines[i + 1])) {
      closeLists();
      closeBq();
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      out.push(parseTable(rows));
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeLists();
      closeBq();
      out.push("<hr />");
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      closeLists();
      if (!inBq) {
        out.push("<blockquote>");
        inBq = true;
      }
      out.push(`<p>${inline(line.slice(2))}</p>`);
      i++;
      continue;
    }
    if (inBq && !line.startsWith(">")) {
      closeBq();
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeLists();
      closeBq();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      closeBq();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      closeBq();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    if (!line.trim()) {
      closeLists();
      closeBq();
      i++;
      continue;
    }

    closeLists();
    closeBq();

    const linkedImg = line.match(
      /^\[!\[([^\]]*)\]\(([^)]+)\)\]\((https?:[^)]+)\)$/
    );
    if (linkedImg) {
      const [, alt, src, href] = linkedImg;
      const blank = href.includes("google.com/maps/d/")
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      out.push(
        `<p><a href="${escapeHtml(href)}"${blank}><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="max-width:100%;height:auto" /></a></p>`
      );
      i++;
      continue;
    }

    const plainImg = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (plainImg) {
      out.push(
        `<p><img src="${escapeHtml(plainImg[2])}" alt="${escapeHtml(plainImg[1])}" style="max-width:100%;height:auto" /></p>`
      );
      i++;
      continue;
    }

    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeLists();
  closeBq();
  return out.join("\n");
}

function pageBreak(label) {
  return `
<p class="page-break-marker" style="page-break-before: always; break-before: page; color: #8b3a2a; font-family: Arial, sans-serif; font-size: 11pt; border-top: 2px dashed #8b3a2a; padding-top: 8pt; margin-top: 24pt;">
<strong>⟦ PAGE BREAK ⟧</strong> — ${escapeHtml(label)}<br />
<span style="color:#666;font-size:10pt;">In Google Docs: delete this line → Insert → Break → Page break</span>
</p>
`;
}

// Insert orientation + JMA stubs before Section 1 / after intro
let bodyMd = draft;

// Replace outdated Nagano Station note lightly for Docs working copy
bodyMd = bodyMd.replace(
  /\*\*Nagano Station\*\* chapter still pending\./,
  "**Hakuba Happo-One (Nagano hub)** chapter still pending."
);

const orientationBlock = `
## Orientation — three hubs

One glance: where the hubs sit relative to Tokyo, Osaka, Kyoto, and the main gateways. Niseko is shown only as a familiar Hokkaido reference—not a hub in this guide.

**[IMAGE PLACEHOLDER]** Paste here: \`japow-guide-orient-japan-v5.png\`
(IMG-ORIENT · Japan locator for the three launch hubs)

`;

const jmaBlock = `
## JMA snowfall charts (1991–2020 normals)

Station data ≠ resort summit. Use japowsearch for nightly decisions.

**[IMAGE PLACEHOLDER]** IMG-02 Asahikawa · block 47407  
**[IMAGE PLACEHOLDER]** IMG-03 Hakuba · AMeDAS 0396 · annual 655 cm  
**[IMAGE PLACEHOLDER]** IMG-04 Yuzawa · block 0544

`;

// Inject Orientation after Introduction section (before Section 1)
bodyMd = bodyMd.replace(
  /(## Section 1: The JAPOW Calendar[^\n]*)/,
  `${orientationBlock.trim()}\n\n$1`
);

// Inject JMA after Section 1 calendar content — before Section 2
bodyMd = bodyMd.replace(
  /(## Section 2: The Ultimate Basecamp[^\n]*)/,
  `${jmaBlock.trim()}\n\n$1`
);

let htmlBody = mdToHtml(bodyMd);

// Insert page-break markers before key headings
const breaks = [
  ["Orientation — three hubs", /<h2>Orientation — three hubs<\/h2>/],
  ["Section 1: The JAPOW Calendar", /<h2>Section 1: The JAPOW Calendar[^<]*<\/h2>/],
  ["JMA snowfall charts", /<h2>JMA snowfall charts[^<]*<\/h2>/],
  ["Where to stay: OMO7", /<h3>Where to stay:[^<]*(?:<[^>]+>[^<]*)*<\/h3>/],
  ["HUB 2 — Hakuba Happo-One", /<h2>HUB 2 — Hakuba Happo-One<\/h2>/],
  ["HUB 3 — Echigo-Yuzawa", /<h2>HUB 3 — Echigo-Yuzawa<\/h2>/],
];

for (const [label, re] of breaks) {
  htmlBody = htmlBody.replace(re, (m) => pageBreak(label) + m);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>The Ultimate JAPOW Chaser's Guide — Google Docs draft</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.55; color: #1c1914; max-width: 48rem; margin: 1.5rem auto; padding: 0 1rem; }
    h1, h2, h3, h4 { font-family: Georgia, serif; color: #1c1914; }
    h1 { font-size: 22pt; }
    h2 { font-size: 16pt; border-bottom: 1px solid #1c1914; padding-bottom: 0.25rem; margin-top: 1.6rem; }
    h3 { font-size: 13pt; margin-top: 1.2rem; }
    h4 { font-size: 11.5pt; }
    table { border-collapse: collapse; width: 100%; margin: 0.8rem 0; font-size: 10pt; }
    th, td { border: 1px solid #c9bfae; padding: 0.35rem 0.45rem; vertical-align: top; text-align: left; }
    th { background: #ebe4d6; }
    a { color: #2a4a62; }
    blockquote { border-left: 3px solid #8b3a2a; margin: 0.8rem 0; padding-left: 0.9rem; color: #3a342c; font-style: italic; }
    code { font-family: Consolas, monospace; font-size: 0.9em; }
    .howto { background: #ebe4d6; border: 1px solid #c9bfae; padding: 0.9rem 1rem; margin-bottom: 1.5rem; font-family: Arial, sans-serif; font-size: 10.5pt; }
  </style>
</head>
<body>
  <div class="howto">
    <strong>Google Docs 手順</strong><br />
    1. この HTML を Google ドライブにアップロード<br />
    2. 右クリック → アプリで開く → Google ドキュメント<br />
    3. 赤い <code>⟦ PAGE BREAK ⟧</code> 行を消して、その位置に「挿入 → 区切り → 改ページ」<br />
    4. 画像プレースホルダにアセットを貼る（orientation / JMA）
  </div>
${htmlBody}
  <hr />
  <p><em>Working copy for Google Docs page-break layout. Source: DRAFT_v1_copyedited.md · Generated for Docs import.</em></p>
</body>
</html>
`;

fs.writeFileSync(outPath, html, "utf8");
console.log("Wrote", outPath);
