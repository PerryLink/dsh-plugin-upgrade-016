---
name: plugin-upgrade-016
description: Migrate a DeepSeek Harness plugin repo across the closed 0.1.5-rc.2 -> 0.1.6-alpha.2 corridor. Runs a zero-dependency seam scanner over one five-seam catalog — E1 (agent/created listener throwing blocks creation), E2 (async apply race: registration after the first await), E3 (removed slot keys settings.plugin.item and SessionListState.current), E4 (removed client APIs sessions.open/openSubagent/clear) and E5 (removed model literals deepseek-v4-flash*/deepseek-v4-vision-exp) — then walks the fix-and-verify loop with a real-host smoke, a resume round-trip for log writers and a real browser assertion for a client half.
whenToUse: Use when a DSH plugin must reach the DeepSeek Harness 0.1.6-alpha.2 line (or any host line the >=0.1.6-0 <0.2.0 peer segment admits) while keeping the older peer band working. Not for 0.1.3-alpha.1 -> 0.1.5-rc.1 migrations (use the plugin-upgrade-015 skill), not for a hop after 0.1.6-alpha.2 (a new corridor is a new package) and not for the DSH user-facing upgrade/repair path.
metadata:
  corridor: "0.1.5-rc.2 -> 0.1.6-alpha.2"
  leg: "leg C 0.1.5-rc.2 -> 0.1.6-alpha.2 (E1-E5)"
  host-baseline: "0.1.6-alpha.2 (tag dsh-v0.1.6-alpha.2 = ddefc45); previous line 0.1.5-rc.2"
  evidence: "W0 wave facts: event vocabulary 58, model catalog 2 entries, slot table 70 keys; seam evidence re-read from the harness checkout and recorded with path:line in the version card and docs/EVIDENCE.md"
  status: "unpublished (new package built in W0; first tag pending the family release round)"
  supersedes: "nothing (dsh-plugin-upgrade-015 keeps its own closed corridor)"
user-invocable: true
---

# Plugin upgrade · 0.1.5-rc.2 → 0.1.6-alpha.2 (one package, one closed leg)

You are migrating **one plugin repository** across the closed DSH span `0.1.5-rc.2 → 0.1.6-alpha.2`. The goal is not "make typecheck pass" — it is "prove the plugin still works on the target host". Local gates are necessary but not sufficient, and three classes of failure survive a green gate: **stale-type false green** (the local gate compiles an old type line), **silent non-mount** (the host drops a contribution with no error, no log line and no failed build) and **runtime races** (a throwing agent/created listener, an async-apply registration that only dies in the unload window).

## 1. Read the card first

The card is `./references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`. It holds the five-seam catalog (E1–E5, all error-severity), each with evidence, the fix recipe and the verification. The scanner implements the same catalog: the card and the catalog are one catalog, and `test/card.test.mjs` fails when their ids or severities disagree.

## 2. Scan, then fix, then verify

1. `node ./scripts/scan-0.1.6.mjs --repo <your-repo>` — read every error hit; the action text on the card is the fix recipe.
2. Fix each seam. The shared engineering rules of this corridor:
   - Registration is an effect: `register()` results go to `ctx.effect()`; nothing registers after the first `await` of an async `apply`.
   - An `agent/created` listener never throws and never does slow work inline.
   - Settings cards mount on `plugins.item` (list slot, `id`/`order`/`label`, props `{view:'summary'|'page'}`); the current session comes from the standard props (`sessionId`/`useSessionStatus`/`retainedBy.mainView`), never `list.current`.
   - Navigation goes through `sessions.retain(id, { source })`; the returned Disposable is stored and disposed.
   - Model literals stay inside the alpha.2 catalog; the removed `deepseek-v4-flash*`/`deepseek-v4-vision-exp` ids route as text-only.
   - Own session events are never written unconditionally (the gate is closed by design on the alpha line — never patch a bare `session.append`).
3. Verify each fix with the exit criteria on the card: scan clean → real-host smoke on a temp DSH_HOME → G-9 unload/reload round trip → real browser assertion for a client half → resume round trip for log writers. Anything not run stays marked **未测即未完成**.

## 3. Family context (W0 facts, fixed before this corridor shipped)

- The peer band canonical is `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0` (third clause admits the whole 0.1.6 tuple).
- The event vocabulary is 58 entries (`workspace/changes` added), the slot table is 70 keys, the default model catalog is 2 entries.
- compat.yml jobs anchor `0.1.6-alpha.2` and run on every PR and weekly.

A clean scan is **necessary, not sufficient**. Never describe a scan as proof of adaptation.
