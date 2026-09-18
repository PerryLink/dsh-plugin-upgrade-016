// SPDX-License-Identifier: Apache-2.0
// Synthetic good fixture for leg C.
// E2 adapted: registration happens inside ctx.effect BEFORE the first await;
// the register() result is held by the effect.
export async function apply(ctx: any) {
  ctx.effect(() => ctx.skills.register({ name: 'adapted-skill' }))
  await ctx.get('settings')
}
