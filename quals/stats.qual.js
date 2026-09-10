// Quals for stats.js, what the app remembers between visits. The store is one
// append-only log of arrivals; runs, per-box visits and wins are derived from
// it. Node has no localStorage, so these quals supply one.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};

const { log, record, forget, summary } = await import('../stats.js');

beforeEach(() => { store.clear(); });

test('a browser that has never run the app has an empty log and a zeroed summary', () => {
  assert.deepEqual(log(), []);
  assert.deepEqual(summary(), { runs: 0, arrivals: 0, byNode: {}, firstAt: null, lastAt: null });
});

test('record() appends when, which box, and how the reader got there', () => {
  record('know', 'start');
  const entries = log();
  assert.equal(entries.length, 1);
  const [when, id, how] = entries[0];
  assert.equal(typeof when, 'number');
  assert.ok(when > 1_700_000_000_000, `${when} is not a plausible epoch time in ms`);
  assert.equal(id, 'know');
  assert.equal(how, 'start');
});

test('the log keeps every arrival, oldest first', () => {
  record('know', 'start');
  record('can-start', 'choose');
  record('know', 'back');
  assert.deepEqual(log().map(([, id, how]) => [id, how]), [
    ['know', 'start'], ['can-start', 'choose'], ['know', 'back'],
  ]);
});

test('summary() derives runs, arrivals, and visits per box from the log alone', () => {
  record('know', 'start');
  record('can-start', 'choose');
  record('hell-yeah', 'choose');
  record('know', 'start');
  record('prioritize', 'choose');
  const s = summary();
  assert.equal(s.runs, 2);
  assert.equal(s.arrivals, 5);
  assert.deepEqual(s.byNode, { know: 2, 'can-start': 1, 'hell-yeah': 1, prioritize: 1 });
  assert.equal(s.firstAt, log()[0][0]);
  assert.equal(s.lastAt, log().at(-1)[0]);
});

test('record() refuses a box that is not named, rather than logging a blank', () => {
  assert.throws(() => record('', 'start'), { message: 'node id must be a non-empty string, got ""' });
  assert.throws(() => record(undefined, 'start'), { message: 'node id must be a non-empty string, got undefined' });
  assert.deepEqual(log(), []);
});

test('record() refuses a way of arriving it does not know', () => {
  assert.throws(() => record('know', 'teleport'), { message: 'how must be one of start, choose, back, got "teleport"' });
  assert.deepEqual(log(), []);
});

test('a stored value that is not a list crashes rather than being quietly discarded', () => {
  localStorage.setItem('efme.v1', '{"runs":3}');
  assert.throws(() => log(), { message: 'efme.v1 is not a list' });
});

test('forget() empties the store', () => {
  record('know', 'start');
  forget();
  assert.deepEqual(log(), []);
  assert.equal(summary().runs, 0);
});

test('a browser with no storage at all crashes loudly instead of dropping stats', () => {
  const real = globalThis.localStorage;
  delete globalThis.localStorage;
  assert.throws(() => record('know', 'start'), /localStorage is not defined/);
  globalThis.localStorage = real;
});
