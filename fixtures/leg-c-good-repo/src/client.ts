// SPDX-License-Identifier: Apache-2.0
// Synthetic good fixture for leg C.
// E3 adapted: the list slot plugins.item with id/order/label, and the current
// session derived from the standard props (sessionId), not list.current.
export function mountClient(ctx: any, props: { sessionId?: string }) {
  ctx.slots.inject('plugins.item', { id: 'demo', order: 1, label: 'Demo' })
  const sessionId = props.sessionId
  return sessionId
}
