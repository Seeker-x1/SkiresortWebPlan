/**
 * Flags files that do not belong in a Next.js app tree, and lifecycle
 * scripts that download or pipe remote code. Dev tooling under scripts/ is
 * out of scope. This does not inspect a live server.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const BAD_EXT = new Set([".php", ".phtml", ".phar", ".asp", ".aspx", ".jsp", ".cgi"]);
const SKIP_DIR = new Set(["node_modules", ".next", ".git", "dist", "coverage", ".ops"]);
const CODE_EXT = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const ALLOW_CHILD_PROCESS = new Set([
  "apps/web/src/app/api/shop-ops/sync/route.ts",
]);

const SCAN_DIRS = [
  "app",
  "src",
  "pages",
  "public",
  "apps/web/app",
  "apps/web/src",
  "apps/web/public",
  "NanakoCyoueiSki/web/app",
  "NanakoCyoueiSki/web/src",
  "NanakoCyoueiSki/web/public",
  "resorts/Sichinohe-CyoueiSki/web/app",
  "resorts/Sichinohe-CyoueiSki/web/src",
  "resorts/Sichinohe-CyoueiSki/web/public",
];

const PACKAGE_FILES = [
  "package.json",
  "apps/web/package.json",
  "NanakoCyoueiSki/web/package.json",
  "resorts/Sichinohe-CyoueiSki/web/package.json",
];

const failures = [];

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (entry.isFile()) visit(full);
  }
}

function parseVersion(spec) {
  const match = String(spec || "").match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return match.slice(1).map(Number);
}

function below(version, floor) {
  for (let i = 0; i < 3; i += 1) {
    if (version[i] < floor[i]) return true;
    if (version[i] > floor[i]) return false;
  }
  return false;
}

function checkNext(spec, file) {
  const version = parseVersion(spec);
  if (!version) return;
  const floor = version[0] >= 16 ? [16, 4, 1] : version[0] === 15 ? [15, 5, 28] : null;
  if (floor && below(version, floor)) {
    failures.push(`${file}: next@${spec} is below ${floor.join(".")}`);
  }
}

function checkPackage(file) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  checkNext(json.dependencies && json.dependencies.next, rel(file));
  const scripts = json.scripts || {};
  for (const name of ["preinstall", "install", "postinstall", "prepare"]) {
    const value = scripts[name];
    if (!value) continue;
    if (/\b(curl|wget)\b|Invoke-WebRequest|\biex\b|powershell[^\n]*-e(nc|ncoded)/i.test(value)) {
      failures.push(`${rel(file)} script ${name} downloads or pipes remote code`);
    }
  }
}

function checkSource(file) {
  const relative = rel(file);
  const ext = path.extname(file).toLowerCase();
  if (BAD_EXT.has(ext)) {
    failures.push(`${relative}: unexpected server-script extension`);
    return;
  }
  if (!CODE_EXT.has(ext)) return;
  const text = fs.readFileSync(file, "utf8");
  const inHandler = /(?:^|\/)(route|middleware|proxy)\.[cm]?[jt]sx?$/.test(relative)
    || relative.includes("/pages/api/");
  if (!inHandler) return;
  if (/\beval\s*\(/.test(text) || /new\s+Function\s*\(/.test(text)) {
    failures.push(`${relative}: dynamic code execution in a request handler`);
  }
  if (/shell\s*:\s*true/.test(text)) {
    failures.push(`${relative}: child process uses a shell`);
  }
  if (text.includes("child_process") && !ALLOW_CHILD_PROCESS.has(relative)) {
    failures.push(`${relative}: request handler starts a child process`);
  }
}

for (const dir of SCAN_DIRS) {
  const full = path.join(ROOT, dir);
  walk(full, checkSource);
  for (const name of ["middleware.ts", "middleware.js", "proxy.ts", "proxy.js"]) {
    const file = path.join(full, name);
    if (fs.existsSync(file)) checkSource(file);
  }
}

for (const file of ["middleware.ts", "middleware.js", "proxy.ts", "proxy.js"]) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) checkSource(full);
}

for (const file of PACKAGE_FILES) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) checkPackage(full);
}

if (failures.length) {
  console.error("App integrity check failed:");
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}

console.log("App integrity check passed");
