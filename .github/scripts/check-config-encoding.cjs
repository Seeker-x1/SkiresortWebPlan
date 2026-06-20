"use strict";
const fs = require("fs");
const path = require("path");

function isUtf16(buf) {
  if (buf.length < 2) return false;
  if (buf[0] === 0xff && buf[1] === 0xfe) return true;
  if (buf[0] === 0xfe && buf[1] === 0xff) return true;
  if (buf.length >= 4 && buf[1] === 0 && buf[3] === 0 && buf[0] > 0 && buf[0] < 128) return true;
  return false;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(json|ya?ml)$/i.test(ent.name) || ent.name === "vercel.json") out.push(p);
  }
  return out;
}

function findVercelJson(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) findVercelJson(p, out);
    else if (ent.name === "vercel.json") out.push(p);
  }
  return out;
}

const targets = [...new Set([...walk(".github"), ...findVercelJson(".")])];
const bad = targets.filter((f) => isUtf16(fs.readFileSync(f)));
if (bad.length) {
  console.error("UTF-16 config detected (must be UTF-8 without BOM):");
  bad.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("Config encoding OK (" + targets.length + " files checked)");
