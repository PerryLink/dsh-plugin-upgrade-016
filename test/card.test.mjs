// SPDX-License-Identifier: Apache-2.0
// The evidence-binding gate: the version card and the scanner catalog are two
// renderings of ONE catalog, so their seam ids and severities must match
// exactly. Without this test the card and `lib/scan-0.1.6.mjs` drift silently,
// which is the failure mode the corridor rules exist to prevent.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEAMS, SEAM_IDS, CARD_ONLY } from '../lib/scan-0.1.6.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const cardPath = path.join(root, 'skills', 'plugin-upgrade-016', 'references', 'v0.1.5-rc.2-to-v0.1.6-alpha.2.md')
const card = readFileSync(cardPath, 'utf8')

/** The seam index section, delimited by HTML comment markers. */
function indexSection(text) {
  const start = text.indexOf('<!-- SEAM-INDEX:BEGIN -->')
  const end = text.indexOf('<!-- SEAM-INDEX:END -->')
  assert.ok(start >= 0 && end > start, 'the card must keep its delimited seam index')
  return text.slice(start, end)
}

const section = indexSection(card)
const rows = [...section.matchAll(/^\|\s*`(E\d{1,2})`\s*\|\s*\*{0,2}(error|warn|info)\*{0,2}\s*\|/gmu)]
  .map(m => ({ id: m[1], severity: m[2] }))

test('the catalog is exactly the five seams of the closed corridor, in catalog order', () => {
  assert.deepEqual(SEAM_IDS, ['E1', 'E2', 'E3', 'E4', 'E5'])
  assert.equal(SEAM_IDS.length, 5)
})

test('the card index names exactly the catalog seams, in catalog order', () => {
  assert.deepEqual(rows.map(r => r.id), SEAM_IDS)
})

test('the card index states each seam severity exactly as the catalog does', () => {
  assert.deepEqual(
    rows.map(r => `${r.id}:${r.severity}`),
    SEAMS.map(s => `${s.id}:${s.severity}`),
  )
})

test('the E1/E2 risk decision is locked: both are error, never advisory', () => {
  for (const id of ['E1', 'E2']) {
    assert.equal(SEAMS.find(s => s.id === id).severity, 'error', `${id} must stay error-severity`)
    assert.match(section, new RegExp(`\\|\\s*\`${id}\`\\s*\\|\\s*\\*\\*error\\*\\*\\s*\\|`))
  }
})

test('the card mints no seam id outside the catalog', () => {
  const mentioned = new Set([...card.matchAll(/`(E\d{1,2})`/g)].map(m => m[1]))
  for (const id of mentioned) assert.ok(SEAM_IDS.includes(id), `the card names ${id}, which is not in the catalog`)
  for (const id of SEAM_IDS) assert.ok(mentioned.has(id), `the card never names ${id}`)
})

test('every seam ships a detector: CARD_ONLY = [] is stated on the card and in the catalog', () => {
  assert.deepEqual(CARD_ONLY, [])
  assert.match(card, /CARD_ONLY = \[\]/)
})

test('the card declares the closed corridor and its scope statement', () => {
  assert.match(card, /^# 版本卡 · `0\.1\.5-rc\.2` → `0\.1\.6-alpha\.2`/m)
  assert.match(card, /本卡只对\s*\*\*`0\.1\.5-rc\.2 → 0\.1\.6-alpha\.2`\*\*/)
  assert.match(card, /新包.*dsh-plugin-upgrade-016/)
  assert.match(card, /两包不共享任何 SEAMS/)
})

test('each seam section carries its evidence and its fix recipe', () => {
  for (const [id, needle] of [
    ['E1', /agent\/created/],
    ['E2', /INACTIVE_EFFECT/],
    ['E3', /settings\\\.plugin\\\.item|settings\.plugin\.item/],
    ['E4', /retain\(id, \{ source \}\)/],
    ['E5', /deepseek-v4-flash/],
  ]) {
    assert.match(card, new RegExp(`## \\d\\. ${id} ·`), `${id} section missing`)
    assert.match(card, needle)
  }
  assert.match(card, /未测即未完成/)
  assert.match(card, /necessary, not sufficient|必要但不充分/)
})

test('the skill directory, the frontmatter name, the Config default and the bundle row agree', () => {
  const skill = readFileSync(path.join(root, 'skills', 'plugin-upgrade-016', 'SKILL.md'), 'utf8')
  assert.match(skill, /^name: plugin-upgrade-016$/m)
  assert.match(skill, /^  corridor: "0\.1\.5-rc\.2 -> 0\.1\.6-alpha\.2"$/m)
  const patch = readFileSync(path.join(root, 'cordis.patch.yml'), 'utf8')
  assert.match(patch, /^\s+- id: dsh-plugin-upgrade-016$/m)
  assert.match(patch, /skillName: plugin-upgrade-016/)
  const entry = readFileSync(path.join(root, 'index.mjs'), 'utf8')
  assert.match(entry, /default\('plugin-upgrade-016'\)/, 'the Config default must name the packaged skill')
  assert.match(entry, /export const name = 'dsh-plugin-upgrade-016'/)
})
