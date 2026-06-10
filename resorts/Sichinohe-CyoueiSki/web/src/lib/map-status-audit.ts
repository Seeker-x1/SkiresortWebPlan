import { promises as fs } from "node:fs";
import path from "node:path";

const MAP_DIR = path.join(process.cwd(), "data", "map");
const AUDIT_FILE = path.join(MAP_DIR, "status-audit.jsonl");

export type StatusAuditEntry = {
  at: string;
  source: "admin";
  updatedAt: string;
  changes: Array<{ id: string; from?: string; to: string }>;
};

export async function appendStatusAudit(entry: StatusAuditEntry): Promise<void> {
  await fs.mkdir(MAP_DIR, { recursive: true });
  await fs.appendFile(AUDIT_FILE, `${JSON.stringify(entry)}\n`, "utf-8");
}

export async function readRecentStatusAudit(
  limit = 10,
): Promise<StatusAuditEntry[]> {
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as StatusAuditEntry)
      .reverse();
  } catch {
    return [];
  }
}
