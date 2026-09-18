// SPDX-License-Identifier: Apache-2.0
// Synthetic bad fixture for leg C. This file lives under lib/ on purpose: the
// scanner must reach committed build artifacts (SKIP_DIRS excludes lib in the
// previous corridor's scanner — the born-hardened one must NOT skip it).
export function legacyNavigate(c, id) {
  c.sessions.clear()
}
