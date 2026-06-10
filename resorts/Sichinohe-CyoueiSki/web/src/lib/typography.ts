const MIN_LAST_LINE = 2;

/**
 * 日本語見出しの編集的改行。
 * 1文字だけ次行に落ちる（ぶら下がり）パターンを避け、意味のある単位で分割する。
 */
export function splitEditorialLines(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.endsWith("スキー場") && trimmed.length > MIN_LAST_LINE + 2) {
    return [trimmed.slice(0, -3), "スキー場"];
  }

  if (trimmed.includes("・")) {
    return trimmed.split("・").map((part, index, parts) =>
      index < parts.length - 1 ? `${part}・` : part,
    );
  }

  if (trimmed.includes(" ")) {
    return trimmed.split(/\s+/);
  }

  const chars = [...trimmed];
  if (chars.length <= 6) {
    return [trimmed];
  }

  const mid = Math.ceil(chars.length / 2);
  let breakAt = mid;

  while (
    breakAt < chars.length - 1 &&
    chars.length - breakAt < MIN_LAST_LINE
  ) {
    breakAt -= 1;
  }

  while (breakAt > 1 && breakAt < MIN_LAST_LINE) {
    breakAt += 1;
  }

  if (breakAt <= 0 || breakAt >= chars.length) {
    return [trimmed];
  }

  return [
    chars.slice(0, breakAt).join(""),
    chars.slice(breakAt).join(""),
  ];
}
