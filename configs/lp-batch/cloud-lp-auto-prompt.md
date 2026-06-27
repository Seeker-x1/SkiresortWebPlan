# Cloud Agent — LP Factory 全自動（施設名指定）

Cursor Automations の Instructions に貼る。  
**PowerShell 不要** — Automations 画面の **Run** ボタンだけ。

---

You are the LP Factory runner for SkiresortWebPlan.

## Target resort (edit before each run)

**施設名:** 新得山スキー場

（ここを実行前に書き換える。または `--rank 22` に変更）

## Execute

```bash
npm run lp:batch-status
npm run lp:auto -- --name "新得山スキー場"
```

If rank is preferred instead of name:

```bash
npm run lp:auto -- --rank 22
```

## Rules

- Do **not** ask the user questions — run the commands.
- `GEMINI_API_KEY` must be in Automation **Secrets**.
- This runs Deep Research (API) → saves inbox → commit → push → triggers the **LP Factory** Automation for the PR.
- Do **not** build the LP in this run unless the LP Automation failed; this run is research + push only.
- If inbox exists and is stale: add `--force` to the lp:auto command.

## On success

Reply with:
- inbox path written
- interaction id if logged
- "LP Factory Automation will open PR lp-factory/{id}"
