// Quals for the palette's legibility. Everything here is computed from
// style.css itself, so changing a color is what changes the result.
//
// The page's ground is not one color: a gradient with four blurred blobs
// drifting over it. The darkest ground any text can land on is taken as the
// darkest of the gradient's own stops and of each blob blended over each stop
// at the blob's opacity, and every color used as text has to clear WCAG AA
// against that. Thresholds are AA: 4.5:1 for normal text, 3:1 for large
// (>=24px, or >=18.66px bold).
//
// These numbers were checked against the rendered page as well: the audit
// sampled the pixels the glyphs actually cover, across every card kind at two
// viewports, and the worst real measurement was comfortably above the worst
// case computed here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

function channel(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function rgb(hex) {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  assert.ok(m !== null, `not a hex color: ${hex}`);
  const six = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(six.slice(i, i + 2), 16));
}
// what you see when `over` is painted at `alpha` on top of `under`
function blend(over, under, alpha) {
  return over.map((c, i) => Math.round(c * alpha + under[i] * (1 - alpha)));
}

function block(selector) {
  const m = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*(?:,[^{]*)?\\{([^}]*)\\}`));
  assert.ok(m !== null, `style.css has no rule for ${selector}`);
  return m[1];
}
function value(selector, prop) {
  const m = block(selector).match(new RegExp(`${prop}\\s*:\\s*([^;]+);`));
  assert.ok(m !== null, `${selector} declares no ${prop}`);
  return m[1].trim();
}
// a color that may be written as a hex or as var(--token)
function color(selector, prop) {
  const raw = value(selector, prop);
  const token = raw.match(/var\((--[a-z-]+)\)/);
  return rgb(token === null ? raw : value(':root', token[1]));
}

const INK = rgb(value(':root', '--ink'));
const GRAPE = rgb(value(':root', '--grape'));
const BERRY = rgb(value(':root', '--berry'));

// ---- the darkest ground text can sit on -------------------------------
const stops = [...value('body', 'background').matchAll(/#[0-9a-f]{3,6}\b/gi)].map(m => rgb(m[0]));
const blobOpacity = parseFloat(value('.blob', 'opacity'));
const blobs = ['.b1', '.b2', '.b3', '.b4'].map(b => rgb(value(b, 'background')));
const grounds = [...stops, ...blobs.flatMap(b => stops.map(s => blend(b, s, blobOpacity)))];
const DARKEST_GROUND = grounds.reduce((a, b) => (luminance(a) <= luminance(b) ? a : b));

test('the page ground is a gradient with blobs over it, all of them parsed', () => {
  assert.equal(stops.length, 3, `expected three gradient stops, parsed ${stops.length}`);
  assert.equal(blobs.length, 4);
  assert.ok(blobOpacity > 0 && blobOpacity < 1, `blob opacity ${blobOpacity}`);
  assert.ok(luminance(DARKEST_GROUND) < luminance(stops[0]), 'a blob should darken some stop');
});

test('every color used as text on the page ground clears AA at its worst', () => {
  const onGround = [
    ['footer text', color('.colophon', 'color'), AA_NORMAL],
    ['subtitle', color('.subtitle', 'color'), AA_NORMAL],
    ['links and footnote markers', GRAPE, AA_NORMAL],
    ['the berry accent, as text', BERRY, AA_NORMAL],
  ];
  for (const [what, ink, need] of onGround) {
    const ratio = contrast(ink, DARKEST_GROUND);
    assert.ok(ratio >= need, `${what} is ${ratio.toFixed(2)}:1 on the darkest ground, needs ${need}`);
  }
});

// ---- text on the cards ------------------------------------------------
const papers = ['.kind-step', '.kind-question, .kind-list', '.kind-star', '.kind-hooray']
  .map(sel => [sel, rgb(value(sel, '--paper'))]);

test('card text and card links clear AA on every card color', () => {
  for (const [sel, paper] of papers) {
    for (const [what, ink] of [['body text', INK], ['links', GRAPE], ['link hover', BERRY]]) {
      const ratio = contrast(ink, paper);
      assert.ok(ratio >= AA_NORMAL, `${what} on ${sel} is ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}`);
    }
  }
});

test('the heading and the star-card text clear AA on their own cards', () => {
  const heading = contrast(color('.card h2', 'color'), rgb(value('.kind-question, .kind-list', '--paper')));
  assert.ok(heading >= AA_LARGE, `list heading is ${heading.toFixed(2)}:1, needs ${AA_LARGE}`);
  const star = contrast(color('.kind-star p', 'color'), rgb(value('.kind-star', '--paper')));
  assert.ok(star >= AA_LARGE, `star card text is ${star.toFixed(2)}:1, needs ${AA_LARGE}`);
});

// ---- text on the answer buttons ---------------------------------------
const pills = [...css.matchAll(/\.color-([a-z]+)\s*\{([^}]*)\}/g)].map(m => ({
  name: m[1],
  fills: [...m[2].matchAll(/--c(?:-light)?\s*:\s*(#[0-9a-f]{3,6}|var\(--[a-z-]+\))/gi)]
    .map(f => rgb(f[1].startsWith('#') ? f[1] : value(':root', f[1].slice(4, -1)))),  // eslint-disable-line
  ink: /(^|;)\s*color\s*:/.test(m[2]) ? color(`.color-${m[1]}`, 'color') : INK,
}));

test('every answer button’s label clears AA on both ends of its gradient', () => {
  assert.equal(pills.length, 9, `expected nine answer colors, parsed ${pills.length}`);
  for (const pill of pills) {
    assert.equal(pill.fills.length, 2, `.color-${pill.name} should declare --c and --c-light`);
    for (const fill of pill.fills) {
      const ratio = contrast(pill.ink, fill);
      assert.ok(ratio >= AA_NORMAL, `.color-${pill.name} label is ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}`);
    }
  }
});

test('the candy pink is a fill, never text: it is too light to read', () => {
  assert.ok(contrast(rgb(value(':root', '--raspberry')), DARKEST_GROUND) < AA_NORMAL,
    'if --raspberry now passes as text, this qual and the two-pink split can go');
  assert.doesNotMatch(css, /(?<!-)color\s*:\s*var\(--raspberry\)/,
    '--raspberry is used as a text color somewhere; use --berry for text');
});
