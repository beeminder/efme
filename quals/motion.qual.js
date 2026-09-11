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

// The footnote marker on the wordmark. Its rules are pinned here because two
// of them were each a bug the human reported.
const marker = css.match(/\.fn-ref[^{]*\{[^}]*\}/g) ?? [];

test('the marker is set lighter than the wordmark, because the wordmark’s weight draws a flower', () => {
  // Replicata: look at the asterisk on "EF".
  // Expectata: an asterisk.
  // Resultata (before this qual): a solid six-petal blob, because Fredoka at
  // the wordmark's weight of 700 closes the gaps between the arms.
  const titleWeight = css.match(/\.title \{[\s\S]*?font-weight:\s*(\d+)/)[1];
  const markerWeight = marker.join('\n').match(/font-weight:\s*(\d+)/);
  assert.ok(markerWeight !== null, 'the marker inherits the wordmark’s weight, which draws a flower rather than an asterisk');
  assert.notEqual(markerWeight[1], titleWeight, `marker weight ${markerWeight[1]} is the wordmark’s own`);
});

test('nothing about the marker moves or resizes under the pointer', () => {
  // Replicata: hover the asterisk.
  // Expectata: it stays put.
  // Resultata (before this qual): it grew and rotated, and its dark hover
  // colour merged with the wordmark’s magenta drop shadow into one smudge.
  for (const rule of marker) {
    assert.doesNotMatch(rule, /transform\s*:/, `the marker declares a transform: ${rule.slice(0, 60)}`);
  }
});

test('the marker never suppresses its focus outline', () => {
  for (const rule of marker) {
    assert.doesNotMatch(rule, /outline\s*:\s*(none|0)\b/, rule.slice(0, 60));
  }
});

test('nothing that sets the page’s width is measured only in the reader’s font size', () => {
  // Replicata: a 320px viewport, the narrowest WCAG asks a page to reflow in,
  // with the browser's default font set to 32px, the 200% resize threshold.
  // Expectata: the page reflows, everything on screen, no sideways scrolling.
  // Resultata (before this qual): the wordmark overran the viewport by 32px
  // and the first answer by 49px, so the logo was chopped at both edges, the
  // step badge was half off screen, and a card had to be scrolled to.
  //
  // Both were sized only in rem, which grows with the reader's font while the
  // viewport does not. Each now also has a bound the viewport can enforce.
  const title = css.match(/\.title \{([\s\S]*?)\}/);
  assert.ok(title !== null, 'style.css has no .title rule');
  const size = title[1].match(/font-size:\s*([^;]+);/)[1];
  assert.match(size, /min\(/, `the wordmark has no cap the viewport can enforce: ${size}`);
  assert.match(size, /\dv[wi]/, `the wordmark's cap is not viewport-relative: ${size}`);
  const body = css.match(/\nbody \{([\s\S]*?)\}/);
  assert.ok(body !== null, 'style.css has no body rule');
  assert.match(body[1], /overflow-wrap:\s*anywhere/,
    'a long word anywhere on the page can still set the smallest width a card or button will accept, and push the page sideways');
  const controls = css.match(/\.controls \{([^}]*)\}/);
  assert.ok(controls !== null, 'style.css has no .controls rule');
  assert.match(controls[1], /flex-wrap:\s*wrap/,
    'the controls cannot break onto two lines, so at a large font they overflow both edges');
});

test('the reduced-motion block still turns every animation off', () => {
  const block = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
  assert.ok(block !== null, 'style.css has no prefers-reduced-motion block');
  for (const prop of ['animation-duration', 'animation-delay', 'animation-iteration-count', 'transition']) {
    assert.match(block[1], new RegExp(`${prop}\\s*:[^;]*!important`), `reduced motion does not neutralise ${prop}`);
  }
});
