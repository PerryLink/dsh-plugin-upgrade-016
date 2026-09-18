// SPDX-License-Identifier: Apache-2.0
// Synthetic bad fixture for leg C.
// This file: E2 — registrations after the first await of an async apply race
// the unload window (INACTIVE_EFFECT).
export async function apply(ctx: any) {
  const svc = await ctx.get('settings')
  ctx.effect(() => svc.watch(() => {}))
  ctx.on('config/changed', () => {})
  svc.register({ name: 'late-registration' })
}
