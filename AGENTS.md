# AGENTS.md

Standalone DeepSeek Harness plugin repository (`dsh-plugin-upgrade-016`). Development
follows the dsh-plugin-guide skill and the official plugin contract; this file records
repo-local decisions. Read `README.md` (external contract) and the packaged corridor card
(`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`) before changing
behavior.

## A corridor never widens

- **A corridor never widens.** This package upgrades plugins across `0.1.5-rc.2 →
  0.1.6-alpha.2` and nothing else. Do not widen the peer band or the card to "all versions":
  a drifting card is worse than no card. A hop that adds a seam is a new package.
- **One package, one closed leg.** Leg C (`0.1.5-rc.2 → 0.1.6-alpha.2`) carries the five
  seams `E1`–`E5`. Neither the previous span's package (`dsh-plugin-upgrade-015`, legs A+B)
  nor this package may absorb a second hop. The two packages share **no SEAMS catalog** —
  zero code dependency, no import, no vendoring.

## The five seams are all errors, all detected

- `E1` (`agent/created` serial dispatch) and `E2` (async-apply registration race) are
  **errors, never warnings**: a wrong grade lets a repo look green and hang its first model
  request on the new line. Only promote/demote one with new upstream evidence and a fixture
  that proves the false positive is gone.
- Every seam ships a detector; `CARD_ONLY = []`. Adding a card-only seam requires adding
  it to `SEAMS` with `test: null` and updating the card index, the parity test and
  `CARD_ONLY` in the same commit.

## Born-hardened scanner

- `SKIP_DIRS` must never contain `lib`: committed build artifacts (`lib/client.js`) ship
  old seams to users and must be scanned.
- Every line-level behavior (`lineFilter`/`windowFilter`/`fileCheck`/`downgradeIf`) is a
  per-seam catalog field applied by one uniform loop; never add a seam-specific branch in
  the scan loop. The render order derives from `SEAM_IDS`.
- The scanner is read-only and dependency-free. No network, no child process, no write
  inside `--repo`; `lib/scan-0.1.6.mjs` imports only `node:fs` and `node:path`. Keep it
  that way.
- A clean scan is necessary, not sufficient. Never describe a scan as proof of adaptation:
  a session-log writer needs a resume round-trip, a client half needs a real browser
  assertion, and the card's exit criterion is a real-host smoke on a temp `DSH_HOME`.

## Layout (JS form, pure host, no browser half)

```
index.mjs             single host face: Config schema + skill bundle reader + apply()
lib/scan-0.1.6.mjs    zero-dependency five-seam catalog + scanner + CLI main()
types.d.ts            Config, SeamId, SeamHit, ScanReport and the public function surface
scripts/scan-0.1.6.mjs   thin bin wrapper (npx dsh-plugin-upgrade-016-scan)
skills/plugin-upgrade-016/SKILL.md  the bundled skill body (frontmatter name is the skill id)
skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md  the corridor card
skills/plugin-upgrade-016/scripts/scan-0.1.6.mjs  the same wrapper inside the skill directory
scripts/verify-self-contained.mjs  every import resolves inside the package
scripts/verify-artifacts.mjs       pack + inspect the published tarball (dev-only content excluded)
scripts/check-readme-sync.mjs      five-language README consistency
scripts/changelog-section.mjs      print one CHANGELOG section for GitHub Release notes
test/scan.test.mjs      synthetic good/bad fixtures + --seams + lib/-is-scanned + read-only
test/plugin.test.mjs    real Cordis Context + real SkillRegistry: register, dispose, negatives
test/card.test.mjs      the card↔catalog id/severity parity gate
fixtures/               scanner fixtures — never published: leg-c-bad-repo / leg-c-good-repo
docs/EVIDENCE.md        the command→output record every card claim traces to
cordis.patch.yml        bundle declaration (insert dsh-plugin-upgrade-016); every Config key inline
pnpm-workspace.yaml     nearest-workspace root; minimumReleaseAge: 0
package.json            npm metadata; files whitelist = published content
.github/workflows/      CI (3 OS × 2 Node), compat probe anchored 0.1.6-alpha.2, v* npm release
README.md               English primary (GitHub default page; source of truth)
README-{zh,es,pt,hi}.md  translations, updated in the same commit
CHANGELOG.md            Keep a Changelog, [Unreleased] at the top
```

## Hard rules applied here

- **The card and the catalog are one catalog.** `test/card.test.mjs` fails when their ids
  or severities disagree. Change the card first, then the catalog, in the same commit.
- **Mount loud.** A missing `SKILL.md`, an empty body, or a frontmatter without `name`
  must abort the mount. Never register a placeholder skill.
- **The skill id is the frontmatter name.** Keep the four in sync
  (`plugin-upgrade-016`: directory, frontmatter `name`, package.json Config default,
  `cordis.patch.yml`).
- **Registration is an effect.** `ctx.skills.register()` runs inside `ctx.effect()` so the
  disposer removes the contribution on unload; the test asserts that.
- **No build step.** Pure ESM: `index.mjs` + `lib/` are the shipped artifacts.
- **Optional seams fail closed.** `skills` is a hard `inject`; if the service is absent the
  plugin waits rather than registering into a void.
- **License headers.** `// SPDX-License-Identifier: Apache-2.0` is the first line of every
  source file; `# SPDX-License-Identifier: Apache-2.0` heads `cordis.patch.yml`.

## Checks

```sh
pnpm install                        # pnpm-lock.yaml is committed
pnpm test                           # node --test: scanner + card parity + real-registry mount
pnpm run verify:self-contained      # every import resolves inside the package
pnpm run verify:artifacts           # tarball contents + entry import + dev-only content excluded
pnpm run check:readmes              # five-language README consistency
pnpm pack                           # the published tarball
```

`pnpm-workspace.yaml` keeps `minimumReleaseAge: 0`: pnpm 11 enables a 1440-minute age gate
by default, so the freshly published `@deepseek-ai/dsh-skill@0.1.6-alpha.2` pin would
otherwise keep a fresh install red for 24h after the harness release.

## Release

Version is `0.1.0` (new package, new version line). For a new version: bump
`package.json#version`, stamp the CHANGELOG `[Unreleased]` section into `## [<x.y.z>] - <UTC
date>`, re-run the full gate, commit `chore(release): <x.y.z>`, and `git tag -a v<x.y.z>`.
`git push origin main --follow-tags` triggers `.github/workflows/release.yml`, which re-runs
the gate, publishes to npm with provenance (skipped without the `NPM_TOKEN` secret) and
creates the GitHub Release from the stamped CHANGELOG section. Never push a tag for a version
already on the registry.

The scanner catalog is evidence-bound: a version bump that changes a seam must update the
card, `docs/EVIDENCE.md`, the fixtures and `CHANGELOG.md` in the same commit.

## Docs

- Five-language READMEs (`README.md` is the source; `README-zh.md`, `README-es.md`,
  `README-pt.md`, `README-hi.md` follow). Every behavior change updates all five in the same
  commit; `check:readmes` enforces the shared section count and the install line in CI.
- All files are UTF-8 without BOM. The previous corridor's package has historical mojibake
  in its SKILL.md — never copy text from there; this package's content is written clean.
- License is Apache-2.0 (`LICENSE` + the package.json `license` field).
  `THIRD_PARTY_NOTICES.md` documents install-time dependencies; nothing is bundled.
- Every factual claim in the card or the scanner traces to a command recorded in
  `docs/EVIDENCE.md`. Where a claim could not be verified it is marked **unverified** and
  kept out of the card.
