/** P4: ライブ稼働色 — 緑ではなく薄い青（サイト全体で共有） */
export const STATUS_LIVE_COLOR = "#7ec8e3";
export const STATUS_LIVE_COLOR_DARK = "#5eb8e8";

export const STATUS_COLORS: Record<string, string> = {
  operating: STATUS_LIVE_COLOR,
  open: STATUS_LIVE_COLOR,
  stopped: "#64748b",
  closed: "#64748b",
  hold: "#f59e0b",
  partial: "#f59e0b",
  unknown: "#94a3b8",
};
