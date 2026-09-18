// SPDX-License-Identifier: Apache-2.0
// Self-test for lib/scan-0.1.6.mjs — synthetic bad/good fixtures for the closed
// leg C corridor (0.1.5-rc.2 -> 0.1.6-alpha.2), the `--seams` filter, the
// born-hardened SKIP_DIRS (lib/ IS scanned), and a read-only guarantee.
// Run: node --test
import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { scanRepo, render, SEAMS, SEAM_IDS, CARD_ONLY } from '../lib/scan-0.1.6.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const cli = path.join(root, 'scripts', 'scan-0.1.6.mjs')
const legCBad = path.join(root, 'fixtures', 'leg-c-bad-repo')
const legCGood = path.join(root, 'fixtures', 'leg-c-good-repo')

/** Run the packaged CLI and return `{ status, stdout }` instead of throwing. */
function runCli(args) {
  try {
    return { status: 0, stdout: execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }) }
  } catch (error) {
    return { status: error.status, stdout: String(error.stdout ?? '') }
  }
}

const bySeam = hits => hits.reduce((acc, h) => { acc[h.seam] = (acc[h.seam] || 0) + 1; return acc }, {})

test('the catalog is exactly the five error seams of the closed corridor, in card order', () => {
  assert.deepEqual(SEAM_IDS, ['E1', 'E2', 'E3', 'E4', 'E5'])
  assert.ok(SEAMS.every(s => s.severity === 'error'), 'every seam of this corridor is error-severity (E1/E2 risk decision)')
  assert.deepEqual(CARD_ONLY, [], 'every seam ships a detector; no card-only seams')
})

test('leg-C bad fixture: every error seam is flagged', () => {
  const report = scanRepo(legCBad)
  const errors = report.hits.filter(h => h.severity === 'error')
  assert.deepEqual([...new Set(errors.map(h => h.seam))].sort(), ['E1', 'E2', 'E3', 'E4', 'E5'])
  assert.deepEqual(bySeam(errors), { E1: 1, E2: 3, E3: 2, E4: 3, E5: 2 })
})

test('born-hardened: committed build artifacts under lib/ ARE scanned (E4 found in lib/legacy.js)', () => {
  const report = scanRepo(legCBad)
  const libHits = report.hits.filter(h => h.file.includes(`${path.sep}lib${path.sep}`))
  assert.deepEqual(libHits.map(h => h.seam), ['E4'], 'the lib/ directory must not be skipped')
})

test('leg-C bad fixture: E2 reports each late registration with its line', () => {
  const report = scanRepo(legCBad, { seams: ['E2'] })
  assert.equal(report.hits.length, 3)
  assert.ok(report.hits.every(h => h.seam === 'E2' && h.severity === 'error'))
  const lines = report.hits.map(h => h.line).sort((a, b) => a - b)
  assert.deepEqual(lines, [7, 8, 9])
  assert.ok(report.hits.every(h => /first await/.test(h.detail)))
})

test('leg-C good fixture: an adapted repo produces zero error-severity hits', () => {
  const report = scanRepo(legCGood)
  const errors = report.hits.filter(h => h.severity === 'error')
  assert.deepEqual(errors, [], `unexpected error hits: ${JSON.stringify(errors, null, 1)}`)
  // The guarded agent/created listener is a review lead, not a blocker.
  assert.deepEqual(bySeam(report.hits), { E1: 1 })
  assert.ok(report.hits.every(h => h.severity === 'warn' && /guarded/.test(h.detail)))
})

test('--seams still filters', () => {
  const onlyE3 = scanRepo(legCBad, { seams: ['E3'] })
  assert.deepEqual([...new Set(onlyE3.hits.map(h => h.seam))], ['E3'])
  const unknown = scanRepo(legCBad, { seams: ['E9'] })
  assert.deepEqual(unknown.hits, [], 'an id outside the catalog must resolve to nothing')
})

test('CLI: --seams restricts the run, --json writes the report, exit codes follow severity', () => {
  const tmp = fs.mkdtempSync(path.join(tmpdir(), 'dsh-batch-016-cli-'))
  try {
    const jsonPath = path.join(tmp, 'report.json')
    const bad = runCli(['--repo', legCBad, '--seams', 'E4', '--quiet', '--json', jsonPath])
    assert.equal(bad.status, 1, 'an error-severity hit must exit 1')
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    assert.equal(report.hits.length, 3)
    assert.ok(report.hits.every(h => h.seam === 'E4'))

    const good = runCli(['--repo', legCGood, '--quiet'])
    assert.equal(good.status, 0, 'an adapted repo must exit 0')

    const usage = runCli(['--nope'])
    assert.equal(usage.status, 2, 'an unknown argument must exit 2')
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

test('render() derives its order from the catalog and prints the corridor header', () => {
  const out = render(scanRepo(legCBad))
  assert.match(out, /# scan-0\.1\.6 · /)
  assert.match(out, /## E1 \[error\]/)
  assert.match(out, /## E5 \[error\]/)
  assert.match(out, /CARD_ONLY = \[\]/)
})

test('the scan is read-only: the fixture trees are untouched', () => {
  for (const dir of [legCBad, legCGood]) {
    const before = fs.readdirSync(dir).sort()
    scanRepo(dir)
    assert.deepEqual(fs.readdirSync(dir).sort(), before)
  }
})
