// efme.js — the walk through the flowchart, free of any DOM so it can be
// qualed in node. A state is { path: [nodeId, ...] }: the ids visited so far,
// the current node last. Every function returns a new state; nothing mutates.
import { FLOWCHART, START } from './flowchart.js';
import { assert } from './assert.js';

export function start() {
  return { path: [START] };
}

// True when nothing has been answered yet, so there is nothing to go back to.
export function atStart(state) {
  return state.path.length === 1;
}

export function currentId(state) {
  return state.path.at(-1);
}

export function current(state) {
  const id = currentId(state);
  const node = FLOWCHART[id];
  assert(node !== undefined, `no node ${id}`);
  return node;
}

// Follow the i-th answer of the current node.
export function choose(state, i) {
  assert(Number.isInteger(i), `answer index must be an integer, got ${JSON.stringify(i)}`);
  const id = currentId(state);
  const answer = current(state).answers[i];
  assert(answer !== undefined, `node ${id} has no answer ${i}`);
  return { path: [...state.path, answer.next] };
}

// Undo the last choose().
export function back(state) {
  assert(!atStart(state), 'already at the start; nothing to go back to');
  return { path: state.path.slice(0, -1) };
}
