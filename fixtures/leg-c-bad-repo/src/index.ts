// SPDX-License-Identifier: Apache-2.0
// Synthetic bad fixture for leg C: every error seam of the closed
// 0.1.5-rc.2 -> 0.1.6-alpha.2 corridor is hit, in its unguarded form.
// This file: E1 — an agent/created listener that throws blocks agent creation.
export function mount(ctx: any) {
  ctx.on('agent/created', (agent: any) => {
    throw new Error('boom')
  })
}
