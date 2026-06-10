#!/usr/bin/env node
/**
 * G4-1: admin POST → SSE update within 3s
 * Usage: node resorts/resorts/Sichinohe-CyoueiSki/scripts/verify-g4-1-sse.mjs [baseUrl]
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] ?? "http://localhost:3000";
const envPath = resolve(__dirname, "../web/.env.local");

function loadToken() {
  const env = readFileSync(envPath, "utf8");
  const line = env.split("\n").find((l) => l.startsWith("ADMIN_UPDATE_TOKEN="));
  if (!line) throw new Error("ADMIN_UPDATE_TOKEN missing in .env.local");
  return line.slice("ADMIN_UPDATE_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}

const token = loadToken();
const auth = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const beforeRes = await fetch(`${BASE}/api/public/map-status`);
if (!beforeRes.ok) {
  console.error("FAIL: public status", beforeRes.status);
  process.exit(1);
}
const before = await beforeRes.json();
const targetId = "lift-pony";
const prev = before.features.find((f) => f.id === targetId);
if (!prev) {
  console.error("FAIL: lift-pony not in payload");
  process.exit(1);
}

const nextStatus = prev.status === "operating" ? "stopped" : "operating";
const newFeatures = before.features.map((f) =>
  f.id === targetId ? { id: f.id, status: nextStatus } : { id: f.id, status: f.status },
);

let postAt = 0;
let sseUpdate = null;
const ac = new AbortController();

const ssePromise = (async () => {
  const res = await fetch(`${BASE}/api/public/map-status/stream`, { signal: ac.signal });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const msg = JSON.parse(line.slice(6));
      if (msg.type === "update" && msg.payload) {
        const feat = msg.payload.features.find((f) => f.id === targetId);
        if (feat?.status === nextStatus) {
          sseUpdate = {
            elapsedMs: Date.now() - postAt,
            updatedAt: msg.payload.updatedAt,
          };
          ac.abort();
          return;
        }
      }
    }
  }
})();

await new Promise((r) => setTimeout(r, 800));

postAt = Date.now();
const postRes = await fetch(`${BASE}/api/admin/map-status`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ features: newFeatures }),
});
if (!postRes.ok) {
  ac.abort();
  console.error("FAIL: admin POST", postRes.status, await postRes.text());
  process.exit(1);
}
await postRes.json();

try {
  await Promise.race([
    ssePromise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("SSE timeout 5s")), 5000)),
  ]);
} catch (e) {
  ac.abort();
  const afterRes = await fetch(`${BASE}/api/public/map-status`);
  const after = await afterRes.json();
  const feat = after.features.find((f) => f.id === targetId);
  const elapsed = Date.now() - postAt;
  if (feat?.status === nextStatus && elapsed <= 3000) {
    console.log(`PASS (REST fallback): ${elapsed}ms`);
  } else {
    console.error("FAIL:", e.message, "got", feat?.status, "expected", nextStatus);
    process.exit(1);
  }
}

if (sseUpdate) {
  const pass = sseUpdate.elapsedMs <= 3000;
  console.log(
    pass ? "PASS" : "FAIL",
    `G4-1 SSE: ${sseUpdate.elapsedMs}ms`,
    `updatedAt=${sseUpdate.updatedAt}`,
  );
  if (!pass) process.exit(1);
}

const restoreFeatures = before.features.map((f) => ({ id: f.id, status: f.status }));
await fetch(`${BASE}/api/admin/map-status`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ features: restoreFeatures }),
});
console.log(`RESTORED ${targetId} → ${prev.status}`);
