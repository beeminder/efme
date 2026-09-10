// assert.js — the project's one way to refuse an impossible situation.
// Anti-Postel: crash loudly and immediately rather than carrying on with
// something the caller did not mean.
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
