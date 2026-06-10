"use client";

import { useCallback, useState } from "react";
import type { MapFeature } from "@/components/lift-map/types";
import type { StatusAuditEntry } from "@/lib/map-status-audit";

type AdminRow = {
  id: string;
  type: "lift" | "trail";
  label: string;
  shortLabel?: string;
  status: MapFeature["status"];
  reason?: string;
};

const LIFT_STATUSES: MapFeature["status"][] = [
  "operating",
  "stopped",
  "hold",
  "unknown",
];

const TRAIL_STATUSES: MapFeature["status"][] = [
  "open",
  "closed",
  "partial",
  "hold",
  "unknown",
];

type Props = {
  token: string;
  disabled?: boolean;
};

export function MapStatusAdmin({ token, disabled = false }: Props) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [status, setStatus] = useState("未読込");
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<StatusAuditEntry[]>([]);

  const canRequest = token.trim().length > 0 && !disabled;

  const load = useCallback(async () => {
    if (!canRequest) return;
    setBusy(true);
    setStatus("読み込み中…");
    try {
      const res = await fetch("/api/admin/map-status", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      if (!res.ok) {
        setStatus(`読込失敗: ${res.status}`);
        return;
      }
      const data = (await res.json()) as {
        updatedAt: string;
        features: AdminRow[];
        audit?: StatusAuditEntry[];
      };
      setRows(data.features);
      setUpdatedAt(data.updatedAt);
      setAudit(data.audit ?? []);
      setStatus("読込完了");
    } catch {
      setStatus("読込失敗: 通信エラー");
    } finally {
      setBusy(false);
    }
  }, [canRequest, token]);

  async function save() {
    if (!canRequest || rows.length === 0) return;
    setBusy(true);
    setStatus("保存中…");
    try {
      const res = await fetch("/api/admin/map-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          features: rows.map((r) => ({
            id: r.id,
            status: r.status,
            ...(r.reason ? { reason: r.reason } : {}),
          })),
        }),
      });
      if (!res.ok) {
        setStatus(`保存失敗: ${res.status}`);
        return;
      }
      const data = (await res.json()) as { updatedAt: string };
      setUpdatedAt(data.updatedAt);
      setStatus("保存完了 — /map に SSE で即時反映（最大 3 秒）");
      await load();
    } catch {
      setStatus("保存失敗: 通信エラー");
    } finally {
      setBusy(false);
    }
  }

  function setRowStatus(id: string, status: MapFeature["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">マップ運行状況（status.json）</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        リフト・コースの稼働状態を更新します。保存は status.json に書き込み、監査ログに記録。マップは SSE で数秒以内に反映されます。
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void load()}
          disabled={!canRequest || busy}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          運行状況を読込
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!canRequest || busy || rows.length === 0}
          className="rounded-lg bg-[color:var(--alpine,#2d6b7a)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          運行状況を保存
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        状態: {status}
        {updatedAt ? ` / ファイル更新: ${updatedAt}` : null}
      </p>

      {rows.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const options = row.type === "lift" ? LIFT_STATUSES : TRAIL_STATUSES;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-zinc-500">
                    {row.type === "lift" ? "リフト" : "コース"} · {row.id}
                  </p>
                </div>
                <select
                  value={row.status}
                  onChange={(e) =>
                    setRowStatus(row.id, e.target.value as MapFeature["status"])
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      ) : null}

      {audit.length > 0 ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            監査ログ（直近）
          </h3>
          <ul className="mt-2 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            {audit.map((entry) => (
              <li key={entry.at} className="rounded border border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
                <span className="font-mono text-[0.625rem]">{entry.at}</span>
                <span className="ml-2">
                  {entry.changes.map((c) => `${c.id}: ${c.from ?? "?"}→${c.to}`).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
