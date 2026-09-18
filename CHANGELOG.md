# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New closed-corridor package for the DSH hop `0.1.5-rc.2 -> 0.1.6-alpha.2` (a corridor never widens: this span is a new package, not a wider card).
- Bundled agent skill `plugin-upgrade-016` with the version card `references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`.
- Zero-dependency seam scanner `lib/scan-0.1.6.mjs` + CLI `dsh-plugin-upgrade-016-scan` over the five-seam catalog (E1-E5, all error-severity, every seam detected).
- Born-hardened scanner: `lib/` is scanned (committed build artifacts ship old seams), per-seam catalog fields applied uniformly, render order derived from the catalog.
- Synthetic good/bad fixtures (`fixtures/leg-c-good-repo`, `fixtures/leg-c-bad-repo`) proving every seam hits and an adapted repo exits 0.
- Card-to-catalog id/severity parity gate (`test/card.test.mjs`).
- Evidence ledger `docs/EVIDENCE.md` (command -> output per seam, re-run against the harness checkout at `dsh-v0.1.6-alpha.2`).
- Three-clause peer band from birth (`|| >=0.1.6-0 <0.2.0`), `engines.dsh`, `dsh.manifestVersion: 1`, compat.yml anchored at `0.1.6-alpha.2`.

### Notes

- The previous corridor package `dsh-plugin-upgrade-015` keeps its own closed span unchanged; the two packages share no SEAMS catalog.
