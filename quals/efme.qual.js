// Quals for efme.js, the pure (DOM-free) walk through the flowchart.
// A `state` is the path of node ids visited so far; the current node is the
// last one. Every transition is a new state; nothing is mutated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { start, atStart, currentId, current, choose, back } from '../efme.js';
import { assert as efmeAssert } from '../assert.js';
import { FLOWCHART, START } from '../flowchart.js';

test('assert() throws its message when the condition is false and is silent otherwise', () => {
  assert.throws(() => efmeAssert(false, 'boom'), { message: 'boom' });
  assert.doesNotThrow(() => efmeAssert(true, 'never'));
});

test('start() is at the START node with a one-node path', () => {
  const s = start();
  assert.deepEqual(s, { path: [START] });
  assert.equal(current(s), FLOWCHART[START]);
  assert.equal(atStart(s), true);
});

test('choose(state, i) appends the i-th answer’s target', () => {
  const s1 = choose(start(), 0); // Yes! -> can-start
  assert.deepEqual(s1.path, ['know', 'can-start']);
  const s2 = choose(s1, 0); // No, that’s why I’m using this -> why-trouble
  assert.deepEqual(s2.path, ['know', 'can-start', 'why-trouble']);
  assert.equal(current(s2), FLOWCHART['why-trouble']);
  assert.equal(atStart(s2), false);
});

test('choose() and back() do not mutate the state they were given', () => {
  const s = choose(start(), 0);
  const before = JSON.stringify(s);
  choose(s, 1);
  back(s);
  assert.equal(JSON.stringify(s), before);
});

test('choose() with an answer index that does not exist throws, naming the node', () => {
  assert.throws(() => choose(start(), 3), { message: 'node know has no answer 3' });
  assert.throws(() => choose(start(), -1), { message: 'node know has no answer -1' });
});

test('choose() refuses anything but an integer index rather than coercing it', () => {
  assert.throws(() => choose(start(), '0'), { message: 'answer index must be an integer, got "0"' });
  assert.throws(() => choose(start(), 'Yes!'), { message: 'answer index must be an integer, got "Yes!"' });
  assert.throws(() => choose(start(), 'length'), { message: 'answer index must be an integer, got "length"' });
  assert.throws(() => choose(start(), 1.5), { message: 'answer index must be an integer, got 1.5' });
});

test('choose() on a terminal node throws', () => {
  const s = choose(choose(start(), 0), 1); // know -> Yes! -> can-start -> Yes! -> hell-yeah
  assert.equal(current(s), FLOWCHART['hell-yeah']);
  assert.throws(() => choose(s, 0), { message: 'node hell-yeah has no answer 0' });
});

test('current() on a state whose last id is not a node throws', () => {
  assert.throws(() => current({ path: ['nope'] }), { message: 'no node nope' });
  assert.throws(() => current({ path: [] }), { message: 'no node undefined' });
});

test('back() drops the last node of the path', () => {
  const s = choose(choose(start(), 0), 1);
  assert.deepEqual(back(s).path, ['know', 'can-start']);
  assert.deepEqual(back(back(s)).path, ['know']);
});

test('back() at the start throws rather than going nowhere quietly', () => {
  assert.throws(() => back(start()), { message: 'already at the start; nothing to go back to' });
});

test('a path can revisit a node (the flowchart has cycles)', () => {
  // know -> prioritize -> great-job-2 -> Perge -> can-start -> No -> why-trouble
  //   -> ??? -> mindfulness -> I know why now! -> great-job-3 -> Perge -> why-trouble
  let s = start();
  for (const i of [1, 1, 0, 0, 3, 0, 0]) s = choose(s, i);
  assert.deepEqual(s.path, ['know', 'prioritize', 'great-job-2', 'can-start', 'why-trouble', 'mindfulness', 'great-job-3', 'why-trouble']);
  assert.equal(s.path.filter(id => id === 'why-trouble').length, 2);
});
