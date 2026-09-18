// SPDX-License-Identifier: Apache-2.0
// Synthetic bad fixture for leg C.
// This file: E3 — both deleted slot/state keys: settings.plugin.item and
// SessionListState.current (list/snapshot consumption faces).
export function mountClient(ctx: any, sessions: any) {
  ctx.slots.inject('settings.plugin.item', () => null)
  const current = sessions.list.getSnapshot().current
  return current
}
