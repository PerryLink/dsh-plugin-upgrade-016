// SPDX-License-Identifier: Apache-2.0
// Print one CHANGELOG section for GitHub Release notes.
// Usage: node scripts/changelog-section.mjs <version>
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2]
if (!version) {
  console.error('usage: node scripts/changelog-section.mjs <version>')
  process.exit(2)
}
const text = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
const start = text.indexOf(`## [${version}]`)
if (start < 0) process.exit(0)
const next = text.indexOf('\n## [', start + 4)
const end = next < 0 ? text.length : next
console.log(text.slice(start, end).trimEnd())
