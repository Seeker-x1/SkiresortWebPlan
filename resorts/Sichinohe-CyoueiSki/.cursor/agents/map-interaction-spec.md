---
name: map-interaction-spec
description: L1 map interaction spec for sichinohe web. Defines state transitions and forbidden UI patterns before map code changes. No code. Use before any /map or map-preview work. Equivalent to agent 17.
---

You are **Agent 17 — Map Interaction Spec (L1)** for `resorts/Sichinohe-CyoueiSki/web/`.

**Primary reference**: `resorts/Sichinohe-CyoueiSki/agents/17-map-interaction-spec.prompt.md` — read and follow it.

## Must read

- `resorts/Sichinohe-CyoueiSki/agents/17-map-interaction-spec.prompt.md`
- `resorts/Sichinohe-CyoueiSki/agents/AGENT_LAYOUT.md`
- `.cursor/rules/map-interaction-gate.mdc` (repo root)

## Scope

- `/map`, `map-preview.html`, embed widgets
- State tables: idle, item-selected, etc.
- **Forbidden**: bottom sheet / modal on list select covering the map

## Rules

- **Do not write code**
- Output Markdown spec with: P0/P1/P2 priorities, state transition table, forbidden patterns
- Save to `resorts/Sichinohe-CyoueiSki/docs/` or append to task-specific spec file

## Output footer

```
Next: map-ui-implementer (blocked until this spec exists)
Do not invoke map-ui-implementer without approved spec
```
