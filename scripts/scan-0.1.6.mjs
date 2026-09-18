#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Thin bin wrapper over the single implementation in lib/scan-0.1.6.mjs.
// Usage: node scripts/scan-0.1.6.mjs --repo <path>   (or: npx dsh-plugin-upgrade-016-scan --repo <path>)
import { main } from '../lib/scan-0.1.6.mjs'

process.exit(main(process.argv.slice(2)))
