# dsh-plugin-upgrade-016

The **closed-corridor upgrade skill and scanner** for the DeepSeek Harness hop `0.1.5-rc.2 → 0.1.6-alpha.2`. It ships one version-locked corridor card and a zero-dependency seam scanner over a **five-seam catalog** — every seam is `error`-severity and every seam ships a detector:

| Seam | Breakage |
|---|---|
| `E1` | An `agent/created` listener that throws (or does slow work inline) blocks agent creation — the host dispatches it on a serial chain. |
| `E2` | Async `apply` race: any registration after the first `await` dies with `INACTIVE_EFFECT` in the unload window. |
| `E3` | Removed slot/state keys: `settings.plugin.item` (→ `plugins.item`) and `SessionListState.current` — both fail **silently**. |
| `E4` | Removed client APIs `sessions.open/openSubagent/clear` (→ `retain`/`using`/`retainInfo`) — click paths throw or swallow errors. |
| `E5` | Removed model literals `deepseek-v4-flash*`/`deepseek-v4-vision-exp` — uncatalogued ids route as text-only. |

The package is a **bundle skill** (the model sees the corridor card only when a task needs it) plus an **npx CLI** for plugin authors. It supersedes nothing and shares nothing with `dsh-plugin-upgrade-015` (which owns the `0.1.3-alpha.1 → 0.1.5-rc.1` corridor): a corridor never widens, and a hop that adds seams is a new package.

## What it is

- `skills/plugin-upgrade-016/` — the bundled agent skill: frontmatter routing, the fix-and-verify loop, and `references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md` (the version card: evidence, fix recipe and exit criteria per seam).
- `lib/scan-0.1.6.mjs` — a zero-dependency scanner (Node stdlib only). Born hardened: `lib/` is **scanned** (committed build artifacts ship old seams to users), every line-level behavior is a per-seam catalog field, and the render order derives from the catalog.
- `scripts/scan-0.1.6.mjs` — the CLI (`npx dsh-plugin-upgrade-016-scan --repo <path>`); exit 0 = no error hit, exit 1 = at least one.
- `docs/EVIDENCE.md` — the command→output record behind every seam.

A clean scan is **necessary, not sufficient**: the breakage this corridor covers is silent from both ends. Verify with a real-host smoke, a resume round-trip for log writers, and a real browser assertion for a client half.

## Quick start

```sh
dsh plugin --profile web add dsh-plugin-upgrade-016
npx dsh-plugin-upgrade-016-scan --repo <your-plugin-repo>
```

The skill routes itself: when a task is about migrating a plugin repo across `0.1.5-rc.2 → 0.1.6-alpha.2`, the model loads the packaged card and runs the fix-and-verify loop.

## Scanner usage

```sh
node scripts/scan-0.1.6.mjs [--repo <path>] [--json <out.json>] [--seams E1,E3] [--quiet]
```

Exit codes: `0` = no error-severity hit · `1` = at least one error hit · `2` = usage failure. The scanner is read-only: it never writes inside the scanned tree.

## The five seams

See the version card (`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`) for the full evidence and fix recipe. The short forms:

- **E1** — never throw in an `agent/created` listener; wrap sync work in try/catch, defer heavy work (`queueMicrotask`/`setImmediate`/own queue).
- **E2** — everything registers before the first `await` of an async `apply`; `register()` results go to `ctx.effect()`.
- **E3** — settings cards mount on `plugins.item` (list slot: `id`/`order`/`label`, props `{view:'summary'|'page'}`); the current session derives from standard props (`sessionId`/`useSessionStatus`/`retainedBy.mainView`), never `list.current`.
- **E4** — navigate via `sessions.retain(id, { source })`; store and dispose the returned handle.
- **E5** — model literals stay inside the alpha.2 catalog; replace `deepseek-v4-flash*`/`deepseek-v4-vision-exp`.

## Configuration

Every knob is a Schemastery `Config` field, documented inline in `cordis.patch.yml`:

- `enabled` (default `true`) — register the packaged skill.
- `skillName` (default `plugin-upgrade-016`) — skill name published to the model catalog.
- `skillsRoot` (default the package's own `skills/`) — must contain `<skillName>/SKILL.md`.
- `userInvocable` (default `true`) — user-invocable in addition to model-invocable.

## Development

```sh
pnpm install
pnpm test                    # scanner fixtures + card↔catalog parity + real-Cordis mount
pnpm run check:readmes       # five-language README sync
pnpm run verify:self-contained
pnpm run verify:artifacts    # pack + tarball inspection
pnpm pack
```

## Topics

`dsh` · `dsh-plugin` · `deepseek-harness` · `deepseek` · `cordis` · `plugin-upgrade` · `migration` · `skill` · `version-card` · `scanner` · `client-slots`

## License

Apache-2.0. See `LICENSE` and `THIRD_PARTY_NOTICES.md`.
