// SPDX-License-Identifier: Apache-2.0
// Synthetic good fixture for leg C: the adapted forms of all five seams.
// E1 adapted: the listener never throws (try/catch) — reported as a review
// lead (warn), never an error.
export function mount(ctx: any) {
  ctx.on('agent/created', (agent: any) => {
    try {
      track(agent)
    } catch {
      // side-effect failure must never block agent creation
    }
  })
}

function track(_agent: any) {}
