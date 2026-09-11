// stats.js — what the app remembers between visits, kept in localStorage so a
// future Beeminder integration has something to post datapoints from.
//
// Vocabulary:
//   entry   = one arrival at a box, [when, node id, how]. `how` is 'start'
//             (a fresh run, which is to say a page load),
//             'choose' (the user picked an answer) or 'back'.
//   log     = every entry ever, oldest first. One append-only list is the
//             whole store: runs, visits per box, and wins are all derived
//             from it, so nothing can disagree with anything else.
//   summary = those derived counts.
//
// Anti-Postel: no try/catch around localStorage. A browser that cannot store
// (private mode, storage disabled) crashes the app loudly rather than
// pretending to keep stats it is silently dropping.
import { assert } from './assert.js';

const KEY = 'efme.v1';
const HOWS = ['start', 'choose', 'back'];

export function log() {
  const stored = localStorage.getItem(KEY);
  if (stored === null) return [];
  const entries = JSON.parse(stored);
  assert(Array.isArray(entries), `${KEY} is not a list`);
  return entries;
}

export function record(id, how) {
  assert(typeof id === 'string' && id !== '', `node id must be a non-empty string, got ${JSON.stringify(id)}`);
  assert(HOWS.includes(how), `how must be one of ${HOWS.join(', ')}, got ${JSON.stringify(how)}`);
  localStorage.setItem(KEY, JSON.stringify([...log(), [Date.now(), id, how]]));
}

export function forget() {
  localStorage.removeItem(KEY);
}

export function summary() {
  const entries = log();
  const byNode = {};
  for (const [, id] of entries) byNode[id] = (byNode[id] ?? 0) + 1;
  return {
    runs: entries.filter(([, , how]) => how === 'start').length,
    arrivals: entries.length,
    byNode,
    firstAt: entries.length === 0 ? null : entries[0][0],
    lastAt: entries.length === 0 ? null : entries.at(-1)[0],
  };
}
