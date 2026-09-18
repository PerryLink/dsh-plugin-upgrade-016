#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Skill-relative scanner entry.
 *
 * The skill body resolves its relative paths against this skill's own directory
 * (the `resourceBase`), so `./scripts/scan-0.1.6.mjs` must exist here as well as
 * at the package root. Both are thin wrappers over the single implementation in
 * `<package>/lib/scan-0.1.6.mjs`, so the skill, the CLI and the tests share one
 * catalog.
 *
 * Usage: node ./scripts/scan-0.1.6.mjs --repo <path>
 */
import { main } from '../../../lib/scan-0.1.6.mjs'

process.exit(main(process.argv.slice(2)))
