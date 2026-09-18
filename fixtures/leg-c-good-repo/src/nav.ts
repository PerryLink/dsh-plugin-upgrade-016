// SPDX-License-Identifier: Apache-2.0
// Synthetic good fixture for leg C.
// E4 adapted: navigation goes through sessions.retain (the retain handle is
// stored and disposed on unload).
export function navigate(c: any, id: string) {
  const handle = c.sessions.retain(id, { source: 'gateway' })
  return handle
}
