// Quals for how the page moves. Motion here is decoration: it should never
// depend on where the pointer happens to be, because a decoration that reacts
// to the pointer reads as something having gone wrong.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('nothing stops or starts an animation because the pointer is somewhere', () => {
  // Replicata: put the pointer on the E of the wordmark.
  // Expectata: the wordmark keeps bobbing, exactly as when unhovered.
  // Resultata (before this qual): the whole wordmark froze mid-tilt and stayed
  // frozen, because a hover rule paused it to steady a small click target.
  assert.doesNotMatch(css, /animation-play-state/,
    'a hover or focus rule is pausing an animation; let the decoration run and make the target easier to hit instead');
});

test('the reduced-motion block still turns every animation off', () => {
  const block = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
  assert.ok(block !== null, 'style.css has no prefers-reduced-motion block');
  for (const prop of ['animation-duration', 'animation-delay', 'animation-iteration-count', 'transition']) {
    assert.match(block[1], new RegExp(`${prop}\\s*:[^;]*!important`), `reduced motion does not neutralise ${prop}`);
  }
});
