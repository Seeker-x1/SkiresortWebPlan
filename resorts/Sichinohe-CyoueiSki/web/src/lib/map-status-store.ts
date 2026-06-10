import { promises as fs } from "node:fs";
import path from "node:path";
import { head, put } from "@vercel/blob";
import type { StatusFile } from "@/lib/map-features";

const MAP_DIR = path.join(process.cwd(), "data", "map");
const STATUS_FILENAME = "status.json";
const BLOB_PATHNAME = "map/status.json";

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocalStatus(): Promise<StatusFile | null> {
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, STATUS_FILENAME), "utf-8");
    return JSON.parse(raw) as StatusFile;
  } catch {
    return null;
  }
}

async function writeLocalStatus(data: StatusFile): Promise<void> {
  await fs.writeFile(
    path.join(MAP_DIR, STATUS_FILENAME),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf-8",
  );
}

async function readBlobStatus(): Promise<StatusFile | null> {
  if (!blobEnabled()) return null;
  try {
    const meta = await head(BLOB_PATHNAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as StatusFile;
  } catch {
    return null;
  }
}

async function writeBlobStatus(data: StatusFile): Promise<void> {
  if (!blobEnabled()) return;
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/** Vercel 本番: Blob 優先。ローカル: ファイルシステム。 */
export async function readMapStatusFile(): Promise<StatusFile | null> {
  if (blobEnabled()) {
    const fromBlob = await readBlobStatus();
    if (fromBlob) return fromBlob;
  }
  return readLocalStatus();
}

export async function writeMapStatusFile(data: StatusFile): Promise<void> {
  if (blobEnabled()) {
    await writeBlobStatus(data);
  }
  if (process.env.VERCEL !== "1" || !blobEnabled()) {
    await writeLocalStatus(data);
  }
}
