#!/usr/bin/env node
/**
 * ONE command: facility name → Deep Research (API) → inbox → push → LP Factory Automation.
 *
 * No Gem UI. No copy-paste.
 *
 * Usage:
 *   npm run lp:auto -- --name "新得山スキー場"
 *   npm run lp:auto -- --rank 22
 *   npm run lp:auto -- --next
 *
 * Prerequisites (once):
 *   - GEMINI_API_KEY in .env (same key as image MCP)
 *   - Cursor Automation "LP Factory — research inbox → guide LP" on main push
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseBatchArgs, loadBatchItem } from "./lib/prompt-builder.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const batchOpts = parseBatchArgs(argv);
  const opts = { ...batchOpts, force: false, noPush: false };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") opts.force = true;
    else if (a === "--no-push") opts.noPush = true;
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: npm run lp:auto -- --name "施設名"
       npm run lp:auto -- --rank 22
       npm run lp:auto -- --next

  施設名を指定 → Gemini Deep Research（API）→ inbox 保存 → git push
  → Cursor Automation がテンプレ LP を PR で作成。

  Options:
    --force     既存 inbox を上書き
    --no-push   調査のみ（LP Automation は起動しない）

  初回のみ: .env に GEMINI_API_KEY=（画像 MCP と同じキー）
`);
      process.exit(0);
    }
  }

  if (!opts.next && opts.rank == null && !opts.id && !opts.name) {
    console.error("施設名を指定してください: npm run lp:auto -- --name \"新得山スキー場\"");
    process.exit(1);
  }

  return opts;
}

function main() {
  const opts = parseArgs(process.argv);

  const { item } = loadBatchItem(opts);
  console.error("");
  console.error("═══════════════════════════════════════════════════");
  console.error(" LP Factory 自動パイプライン");
  console.error("═══════════════════════════════════════════════════");
  console.error(` 施設: ${item.nameJa} (#${item.rank}, id=${item.id})`);
  console.error(" ① Deep Research（Gemini API · ゲレンデリサーチャー同等）");
  console.error(" ② inbox 保存");
  if (!opts.noPush) {
    console.error(" ③ git push → LP Factory Automation → PR");
  }
  console.error(" コピペ不要 · Gem UI 不要");
  console.error("═══════════════════════════════════════════════════");
  console.error("");

  const args = [
    "node",
    path.join("scripts", "lp-factory", "run-deep-research.mjs"),
    "--prompt",
    "marketing",
  ];
  if (opts.name) args.push("--name", opts.name);
  else if (opts.next) args.push("--next");
  else if (opts.rank != null) args.push("--rank", String(opts.rank));
  else if (opts.id) args.push("--id", opts.id);
  if (opts.force) args.push("--force");
  if (!opts.noPush) args.push("--commit", "--push");

  execSync(args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" "), {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });

  if (!opts.noPush) {
    console.error("");
    console.error("✓ 調査完了 · push 済み");
    console.error(`  次: GitHub / Cursor で PR「lp-factory/${item.id}」を確認`);
    console.error("  LP 画像は Automation 内で Gemini MCP が生成");
  }
}

main();
