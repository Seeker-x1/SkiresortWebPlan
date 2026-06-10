"use client";

import { useMemo, useState } from "react";
import { MapStatusAdmin } from "@/components/admin/MapStatusAdmin";

type AdminFormState = {
  token: string;
  todayNotice: string;
  todayLastUpdated: string;
  openStatus: string;
  snowValue: string;
  liftValue: string;
};

const INITIAL_FORM: AdminFormState = {
  token: "",
  todayNotice: "",
  todayLastUpdated: "",
  openStatus: "",
  snowValue: "",
  liftValue: "",
};

export default function AdminPage() {
  const [form, setForm] = useState<AdminFormState>(INITIAL_FORM);
  const [status, setStatus] = useState<string>("未接続");
  const [busy, setBusy] = useState(false);

  const canRequest = useMemo(() => form.token.trim().length > 0, [form.token]);

  async function loadCurrent() {
    if (!canRequest) return;
    setBusy(true);
    setStatus("読み込み中...");
    try {
      const res = await fetch("/api/admin/resort", {
        method: "GET",
        headers: { Authorization: `Bearer ${form.token}` },
      });
      if (!res.ok) {
        setStatus(`読込失敗: ${res.status}`);
        return;
      }
      const data = (await res.json()) as {
        today: {
          notice: string;
          lastUpdated: string;
          snapshot: Array<{ key: string; value: string }>;
        };
      };
      const openStatus =
        data.today.snapshot.find((s) => s.key === "operations_summary.open_status")
          ?.value ?? "";
      const snowValue =
        data.today.snapshot.find(
          (s) => s.key === "snow_conditions.reported_depth_cm",
        )?.value ?? "";
      const liftValue =
        data.today.snapshot.find((s) => s.key === "operations_summary.lift_summary")
          ?.value ?? "";

      setForm((prev) => ({
        ...prev,
        todayNotice: data.today.notice ?? "",
        todayLastUpdated: data.today.lastUpdated ?? "",
        openStatus,
        snowValue,
        liftValue,
      }));
      setStatus("読込完了");
    } catch {
      setStatus("読込失敗: 通信エラー");
    } finally {
      setBusy(false);
    }
  }

  async function saveToday() {
    if (!canRequest) return;
    setBusy(true);
    setStatus("保存中...");
    try {
      const patch = {
        today: {
          notice: form.todayNotice,
          lastUpdated: form.todayLastUpdated,
          snapshot: [
            {
              key: "operations_summary.open_status",
              title: "営業",
              value: form.openStatus,
              note: "開園・終了時刻は確定次第、ここに表示します。",
              wide: false,
            },
            {
              key: "snow_conditions.reported_depth_cm",
              title: "積雪・降雪",
              value: form.snowValue,
              note: "基準点・過去24時間降雪などは公式計測に基づき掲載します。",
              wide: false,
            },
            {
              key: "operations_summary.lift_summary",
              title: "リフト・コース",
              value: form.liftValue,
              note: "リフトごとの運行状況は一覧で表示する予定です。",
              wide: true,
            },
          ],
        },
      };

      const res = await fetch("/api/admin/resort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${form.token}`,
        },
        body: JSON.stringify({ patch }),
      });
      if (!res.ok) {
        setStatus(`保存失敗: ${res.status}`);
        return;
      }
      setStatus("保存完了");
    } catch {
      setStatus("保存失敗: 通信エラー");
    } finally {
      setBusy(false);
    }
  }

  function updateField<K extends keyof AdminFormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">管理更新（MVP）</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        まずは「今日の運営」項目のみ編集できる最小版です。保存すると `/today` とトップのサマリーに反映されます。
      </p>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-sm font-medium">管理トークン</label>
        <input
          type="password"
          value={form.token}
          onChange={(e) => updateField("token", e.target.value)}
          placeholder="ADMIN_UPDATE_TOKEN"
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={loadCurrent}
            disabled={!canRequest || busy}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
          >
            現在値を読込
          </button>
          <button
            type="button"
            onClick={saveToday}
            disabled={!canRequest || busy}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            今日の運営を保存
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">状態: {status}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium">お知らせ文（today.notice）</label>
          <textarea
            value={form.todayNotice}
            onChange={(e) => updateField("todayNotice", e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium">最終更新表示（today.lastUpdated）</label>
          <input
            value={form.todayLastUpdated}
            onChange={(e) => updateField("todayLastUpdated", e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium">営業ステータス</label>
          <input
            value={form.openStatus}
            onChange={(e) => updateField("openStatus", e.target.value)}
            placeholder="例: 営業中"
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium">積雪・降雪表示</label>
          <input
            value={form.snowValue}
            onChange={(e) => updateField("snowValue", e.target.value)}
            placeholder="例: 120cm / +20cm"
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium">リフト・コース表示</label>
          <input
            value={form.liftValue}
            onChange={(e) => updateField("liftValue", e.target.value)}
            placeholder="例: 第一ペア運行 / 一部準備中"
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </section>

      <MapStatusAdmin token={form.token} disabled={busy} />
    </div>
  );
}
