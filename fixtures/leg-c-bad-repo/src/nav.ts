// SPDX-License-Identifier: Apache-2.0
// Synthetic bad fixture for leg C.
// This file: E4 — the removed client APIs sessions.open / openSubagent.
export function navigate(c: any, id: string) {
  c.sessions.open(id)
  c.sessions.openSubagent({ target: 'review' })
}
