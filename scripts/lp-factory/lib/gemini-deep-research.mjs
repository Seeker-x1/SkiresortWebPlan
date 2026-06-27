const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * @param {{ apiKey: string, input: string, agent?: string }} opts
 */
export async function startDeepResearch({ apiKey, input, agent = "deep-research-max-preview-04-2026" }) {
  const res = await fetch(`${BASE_URL}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      agent,
      input,
      background: true,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini interactions.create failed (${res.status}): ${body}`);
  }
  return JSON.parse(body);
}

/**
 * @param {{ apiKey: string, id: string }} opts
 */
export async function getInteraction({ apiKey, id }) {
  const res = await fetch(`${BASE_URL}/interactions/${encodeURIComponent(id)}`, {
    headers: { "x-goog-api-key": apiKey },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini interactions.get failed (${res.status}): ${body}`);
  }
  return JSON.parse(body);
}

/**
 * Extract final report text from a completed interaction.
 * @param {Record<string, unknown>} interaction
 * @returns {string | null}
 */
export function extractReportText(interaction) {
  const steps = /** @type {Array<Record<string, unknown>>} */ (interaction.steps ?? []);
  for (let i = steps.length - 1; i >= 0; i--) {
    const parts = /** @type {Array<Record<string, unknown>>} */ (
      steps[i].content ?? steps[i].outputs ?? []
    );
    for (const part of parts) {
      if (typeof part.text === "string" && part.text.trim()) return part.text;
    }
  }

  const outputs = /** @type {Array<Record<string, unknown>>} */ (interaction.outputs ?? []);
  for (const part of outputs) {
    if (typeof part.text === "string" && part.text.trim()) return part.text;
  }

  return null;
}

/**
 * @param {{
 *   apiKey: string,
 *   id: string,
 *   pollIntervalMs?: number,
 *   timeoutMs?: number,
 *   onProgress?: (interaction: Record<string, unknown>) => void,
 * }} opts
 */
export async function pollUntilComplete({
  apiKey,
  id,
  pollIntervalMs = 15_000,
  timeoutMs = 3_600_000,
  onProgress,
}) {
  const started = Date.now();
  let lastStatus = "";

  while (Date.now() - started < timeoutMs) {
    const result = await getInteraction({ apiKey, id });
    if (result.status !== lastStatus) {
      lastStatus = /** @type {string} */ (result.status);
      onProgress?.(result);
    }

    if (result.status === "completed") return result;
    if (result.status === "failed") {
      throw new Error(`Deep Research failed: ${JSON.stringify(result.error ?? result)}`);
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new Error(`Deep Research timed out after ${timeoutMs}ms (interaction ${id})`);
}

/** @param {string} text */
export function validateReportMarkdown(text, expectedId) {
  const issues = [];
  if (!text || text.length < 1500) issues.push("report too short (<1500 chars)");
  if (!/^#\s+.+/m.test(text)) issues.push("missing top-level title");
  if (!text.includes("## 0. メタデータ")) issues.push("missing ## 0. メタデータ");
  if (!/registry id/i.test(text)) issues.push("missing registry id in metadata");
  if (!text.includes("## 10. 出典一覧") && !text.includes("## 10.")) {
    issues.push("missing ## 10. 出典一覧 (or truncated report)");
  }
  if (expectedId && !text.includes(expectedId)) {
    issues.push(`expected registry id "${expectedId}" not found in report body`);
  }
  return issues;
}
