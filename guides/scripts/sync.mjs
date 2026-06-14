/**
 * Sync docs/mock-assets → guides/public for guides.japowserch.com
 * Source of truth: docs/mock-assets/ (dev preview)
 * Deploy output: guides/public/ (Vercel static root)
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GUIDES_ROOT = join(__dirname, "..");
const REPO_ROOT = join(GUIDES_ROOT, "..");
const MOCK_ROOT = join(REPO_ROOT, "docs", "mock-assets");
const RESORT_GUIDES_SRC = join(REPO_ROOT, "data", "resort-guides.json");
const OUT = join(GUIDES_ROOT, "public");
const HOST = "https://guides.japowserch.com";

function loadResortGuides() {
  const data = JSON.parse(readFileSync(RESORT_GUIDES_SRC, "utf8"));
  const byRegistryId = {};
  for (const [japowId, entry] of Object.entries(data.guides)) {
    byRegistryId[entry.registryId] = { japowResortId: Number(japowId), ...entry };
  }
  return { data, byRegistryId };
}

function mergeJapowIds(registry, resortGuides) {
  const { byRegistryId } = resortGuides;
  return {
    ...registry,
    resorts: registry.resorts.map((r) => {
      const link = byRegistryId[r.id];
      if (!link) {
        console.warn(`⚠ resort-guides.json: no japow id for registry id "${r.id}"`);
        return r;
      }
      return {
        ...r,
        japowResortId: link.japowResortId,
        guideTier: link.tier,
        ...(link.note ? { guideNote: link.note } : {}),
      };
    }),
  };
}

function validateResortGuides(registry, resortGuides) {
  const registryIds = new Set(registry.resorts.map((r) => r.id));
  const guideIds = new Set(Object.values(resortGuides.data.guides).map((g) => g.registryId));
  for (const id of registryIds) {
    if (!guideIds.has(id)) throw new Error(`resort-guides.json missing registryId: ${id}`);
  }
  for (const id of guideIds) {
    if (!registryIds.has(id)) throw new Error(`resort-guides.json unknown registryId: ${id}`);
  }
}

function rewriteHtml(content) {
  let out = content
    .replaceAll('href="../_shared/', 'href="/_shared/')
    .replaceAll('src="../_shared/', 'src="/_shared/')
    .replaceAll('href="../map.html', 'href="/map.html')
    .replaceAll('href="../index.html"', 'href="/"')
    .replaceAll("href='../index.html'", "href='/'")
    .replaceAll('href="index.html"', 'href="/"')
    .replaceAll('href="_shared/', 'href="/_shared/')
    .replaceAll('src="_shared/', 'src="/_shared/');
  // Internal dev banner (docs/mock-assets preview only) — not for public guides host
  out = out.replace(/<p class="mock-banner">[\s\S]*?<\/p>\s*/g, "");
  return out;
}

function rewriteJs(content, filename) {
  let out = content
    .replaceAll("fetchJson(`../_shared/messages/", "fetchJson(`/_shared/messages/")
    .replaceAll("fetch(`data/maps/", "fetch(`/data/maps/")
    .replaceAll('fetch("registry.json"', 'fetch("/registry.json"');

  if (filename === "mock-hub.js") {
    out = out.replace(
      'const href = `${r.slug}/index.html${locale === "en" ? "?lang=en" : ""}`;',
      'const href = `/${r.id}/${locale === "en" ? "?lang=en" : ""}`;',
    );
    out = out.replace(
      'href="map.html?resort=${r.id}',
      'href="/map.html?resort=${r.id}',
    );
  }

  if (filename === "resort-map.js") {
    out = out.replace(
      "el.back.href = `${resort.slug}/index.html${locale === \"en\" ? \"?lang=en\" : \"\"}`;",
      "el.back.href = `/${resortId}/${locale === \"en\" ? \"?lang=en\" : \"\"}`;",
    );
    // hero image: root-absolute for /map.html
    out = out.replace(
      /src="\$\{hero\.src\}"/,
      'src="${hero.src.startsWith("/") ? hero.src : `/${hero.src}`}"',
    );
  }

  return out;
}

function copyDirSimple(src, dest, opts = {}) {
  mkdirSync(dest, { recursive: true });
  for (const ent of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, ent.name);
    const destPath = join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDirSimple(srcPath, destPath, opts);
    } else if (opts.transformHtml && ent.name.endsWith(".html")) {
      writeFileSync(destPath, rewriteHtml(readFileSync(srcPath, "utf8")), "utf8");
    } else if (opts.transformJs && ent.name.endsWith(".js")) {
      writeFileSync(destPath, rewriteJs(readFileSync(srcPath, "utf8"), ent.name), "utf8");
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

function buildRegistry(registry) {
  const langSuffix = (path, locale) =>
    locale === "en" ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path;

  return {
    schemaVersion: "2026-06-13",
    host: HOST,
    locales: registry.locales,
    defaultLocale: registry.defaultLocale,
    deployment: {
      phase: "mock-static",
      source: "docs/mock-assets/",
      nextMigration: "resorts/{id}/web/ via Vercel rewrite",
    },
    resorts: registry.resorts.map((r) => {
      const lpPath = `/${r.id}/`;
      const mapPath = `/map.html?resort=${r.id}`;
      const guideUrl = `${HOST}${lpPath}`;
      const guideUrlEn = `${HOST}${langSuffix(lpPath, "en")}`;
      return {
        ...r,
        guideUrl,
        guideUrlEn,
        japowResortId: r.japowResortId ?? null,
        paths: {
          lp: lpPath,
          lpEn: langSuffix(lpPath, "en"),
          map: mapPath,
          mapEn: langSuffix(mapPath, "en"),
        },
        urls: {
          lp: `${HOST}${lpPath}`,
          lpEn: `${HOST}${langSuffix(lpPath, "en")}`,
          map: `${HOST}${mapPath}`,
          mapEn: `${HOST}${langSuffix(mapPath, "en")}`,
          /** JAPOWSERCH「詳細確認」ボタンは lp / lpEn を指す */
          detail: `${HOST}${lpPath}`,
          detailEn: `${HOST}${langSuffix(lpPath, "en")}`,
        },
        japowserch: {
          detailButtonTarget: "guideUrl",
          registryId: r.id,
          mapByJapowResortId: r.japowResortId != null,
        },
      };
    }),
    indexByJapowResortId: Object.fromEntries(
      registry.resorts
        .filter((r) => r.japowResortId != null)
        .map((r) => [String(r.japowResortId), r.id]),
    ),
  };
}

function main() {
  if (!existsSync(MOCK_ROOT)) {
    const hub = join(OUT, "index.html");
    const registry = join(OUT, "registry.json");
    if (existsSync(hub) && existsSync(registry)) {
      console.log("⚠ docs/mock-assets missing; using existing guides/public");
      return;
    }
    throw new Error(
      "docs/mock-assets missing and guides/public is not ready — run sync from repo root or connect Git deploy",
    );
  }

  const resortGuides = loadResortGuides();
  const registryRaw = JSON.parse(readFileSync(join(MOCK_ROOT, "registry.json"), "utf8"));
  validateResortGuides(registryRaw, resortGuides);
  const registry = mergeJapowIds(registryRaw, resortGuides);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // Hub
  writeFileSync(
    join(OUT, "index.html"),
    rewriteHtml(readFileSync(join(MOCK_ROOT, "index.html"), "utf8")),
    "utf8",
  );

  // Map
  writeFileSync(
    join(OUT, "map.html"),
    rewriteHtml(readFileSync(join(MOCK_ROOT, "map.html"), "utf8")),
    "utf8",
  );

  // Shared JS/CSS + hub messages
  copyDirSimple(join(MOCK_ROOT, "_shared"), join(OUT, "_shared"), { transformJs: true });
  mkdirSync(join(OUT, "messages"), { recursive: true });
  for (const f of ["hub.ja.json", "hub.en.json"]) {
    cpSync(join(MOCK_ROOT, "messages", f), join(OUT, "messages", f));
  }

  // Map data + hero images
  copyDirSimple(join(MOCK_ROOT, "data"), join(OUT, "data"));
  copyDirSimple(join(MOCK_ROOT, "images"), join(OUT, "images"));

  // Resort LPs: {slug}/ → public/{id}/  (例: biei-lp/ → public/biei/)
  const EXPECTED_IDS = [
    "sichinohe", "biei", "unabetsu", "kiyosato", "gokazan", "tsunan",
    "minami-furano", "asahigaoka", "otoifuji", "shimukappu", "abashiri-lv",
  ];
  for (const id of EXPECTED_IDS) {
    const resort = registry.resorts.find((r) => r.id === id);
    if (!resort) throw new Error(`registry missing id: ${id}`);
  }

  for (const resort of registry.resorts) {
    const src = join(MOCK_ROOT, resort.slug);
    const dest = join(OUT, resort.id);
    copyDirSimple(src, dest, { transformHtml: true });
    console.log(`✓ /${resort.id}/ ← ${resort.slug}`);
  }

  // JAPOWSERCH-facing registry + resort-guides handoff
  const extended = buildRegistry(registry);
  writeFileSync(join(OUT, "registry.json"), JSON.stringify(extended, null, 2) + "\n", "utf8");
  cpSync(RESORT_GUIDES_SRC, join(OUT, "resort-guides.json"));

  // Also update source registry with paths + japowResortId
  const sourceRegistry = {
    ...registryRaw,
    guides: {
      host: HOST,
      pathPattern: "/{id}/",
      localeEn: "?lang=en",
      buildScript: "guides/scripts/sync.mjs",
      japowMapping: "data/resort-guides.json",
    },
    resorts: registry.resorts.map((r) => ({
      ...r,
      guidePath: `/${r.id}/`,
      guideUrl: `${HOST}/${r.id}/`,
    })),
  };
  writeFileSync(
    join(MOCK_ROOT, "registry.json"),
    JSON.stringify(sourceRegistry, null, 2) + "\n",
    "utf8",
  );

  writeFileSync(
    join(OUT, "robots.txt"),
    "User-agent: *\nAllow: /\n\nSitemap: https://guides.japowserch.com/registry.json\n",
    "utf8",
  );

  console.log(`\n✓ guides/public ready (${extended.resorts.length} resorts)`);
  console.log(`  Hub:     ${HOST}/`);
  console.log(`  Example: ${HOST}/biei/`);
  console.log(`  Registry: ${HOST}/registry.json`);
  console.log(`  JAPOW map: ${HOST}/resort-guides.json`);
}

main();
