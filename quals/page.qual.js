// Quals for index.html, the page shell. README.md is the spec: its first three
// lines are the app's own copy, and its $TITLE / $DESCRIPTION / $URL blocks are
// the values the head boilerplate asks for. Reading them here means the head
// and the README cannot drift apart, and that editing the README is what
// changes the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const html = read('index.html');
const readme = read('README.md');

// The human's three title lines, trailing markdown line-break spaces removed.
const [NAME, GLOSS, SUBTITLE] = readme.split('\n').slice(0, 3).map(l => l.trimEnd());
// What the head boilerplate was filled in with. These came from a $TITLE /
// $DESCRIPTION / $URL block the human wrote in README.md and has since
// removed, that block being one-time scaffolding rather than a standing part
// of the README. They live here now because this is the spec: changing what
// the page claims to be means changing this qual on purpose.
const boilerplate = {
  TITLE: 'EF Me: A tool to overcome executive dysfunction',
  DESCRIPTION: 'Based on a flowchart by jackalwedding on Tumblr.',
  URL: 'https://beeminder.github.io/efme',
  OPTAUTHORHANDLE: 'bmndr',
  OPTALTTITLE1: 'EF Me',
};

const tag = re => {
  const m = html.match(re);
  assert.ok(m !== null, `index.html has nothing matching ${re}`);
  return m[1];
};
const meta = (attr, name) => tag(new RegExp(`<meta ${attr}="${name}"\\s+content="([^"]*)"`));
const text = className => tag(new RegExp(`class="${className}"[^>]*>([^<]*)<`));
// What a reader sees in an element, tags and comments removed.
const shown = re => tag(re).replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const MARKER = '*';
const MARKER_LINK = /<a class="fn-ref"[\s\S]*?<\/a>/;
// The README's gloss, "(EF = Executive Function)", is one line carrying two
// things: the abbreviation the marker belongs on, and what the note spells
// out. The note itself needs neither the parentheses nor "EF =", because the
// marker already points at the word being explained.
const TERM = GLOSS.match(/\(([^\s=]+) =/)[1];
const DEFINITION = GLOSS.match(/= ([^)]+)\)/)[1];

test('README.md still opens with the three title lines the page shows', () => {
  assert.deepEqual([NAME, GLOSS, SUBTITLE], ['EF Me', '(EF = Executive Function)', 'A tool to overcome executive dysfunction']);
});

test('the page shows the human’s copy character for character', () => {
  // take the marker back out and the title is the human's name, exactly
  assert.equal(tag(/<h1 class="title">([\s\S]*?)<\/h1>/).replace(MARKER_LINK, ''), NAME);
  assert.equal(text('subtitle'), SUBTITLE);
  assert.equal(text('gloss'), DEFINITION);
  assert.equal(text('credit-label'), 'Based on');
});

test('the title’s footnote marker and the note it explains are a matching pair', () => {
  const h1 = tag(/<h1 class="title">([\s\S]*?)<\/h1>/);
  const note = tag(/<p class="footnote" id="ef-note">([\s\S]*?)<\/p>/);
  // the marker sits on the abbreviation it explains, not at the end of the title
  assert.equal(TERM, 'EF');
  assert.match(h1, new RegExp(`^${TERM}<a class="fn-ref" id="ef-ref" href="#ef-note"`));
  assert.equal(shown(/<h1 class="title">([\s\S]*?)<\/h1>/), NAME.replace(TERM, TERM + MARKER));
  assert.equal(shown(/<a class="fn-ref"[^>]*>([\s\S]*?)<\/a>/), MARKER);
  // the note repeats the marker, links back to it, then gives the human's gloss
  assert.match(note, /^<a class="fn-back" href="#ef-ref"/);
  assert.equal(shown(/<a class="fn-back"[^>]*>([\s\S]*?)<\/a>/), MARKER);
  assert.equal(shown(/<p class="footnote" id="ef-note">([\s\S]*?)<\/p>/), `${MARKER} ${DEFINITION}`);
});

test('both footnote links say what they are for, since an asterisk alone reads as nothing', () => {
  for (const re of [/<a class="fn-ref"([^>]*)>/, /<a class="fn-back"([^>]*)>/]) {
    assert.match(tag(re), /aria-label="[^"]+"/);
  }
  // the asterisk itself is decoration once the link is labelled
  assert.match(tag(/<a class="fn-ref"[^>]*>([\s\S]*?)<\/a>/), /aria-hidden="true"/);
});

test('title and description are the README’s, in every place they are repeated', () => {
  assert.equal(tag(/<title>([^<]*)<\/title>/), boilerplate.TITLE);
  assert.equal(meta('property', 'og:title'), boilerplate.TITLE);
  assert.equal(meta('name', 'description'), boilerplate.DESCRIPTION);
  assert.equal(meta('property', 'og:description'), boilerplate.DESCRIPTION);
});

test('canonical url and link-preview image are the README’s url', () => {
  assert.equal(tag(/<link rel="canonical"\s+href="([^"]*)"/), boilerplate.URL);
  assert.equal(meta('property', 'og:url'), boilerplate.URL);
  assert.equal(meta('property', 'og:image'), `${boilerplate.URL}/preview.png`);
  assert.ok(existsSync(new URL('preview.png', root)), 'preview.png is missing, so link previews would 404');
});

test('the structured data agrees with the head', () => {
  const data = JSON.parse(tag(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/));
  assert.equal(data.name, boilerplate.TITLE);
  assert.deepEqual(data.alternateName, [boilerplate.OPTALTTITLE1]);
  assert.equal(data.url, boilerplate.URL);
  assert.equal(data.image, meta('property', 'og:image'));
});

test('the author handle is the README’s', () => {
  assert.equal(meta('name', 'twitter:creator'), `@${boilerplate.OPTAUTHORHANDLE}`);
});

test('no boilerplate placeholder survived into the page', () => {
  assert.doesNotMatch(html, /\$[A-Z]/, 'an unfilled $PLACEHOLDER is still in index.html');
});

test('every file the page asks for exists, so nothing 404s', () => {
  const local = [...html.matchAll(/(?:href|src)="(?!https?:|#)([^"]+)"/g)].map(m => m[1]);
  assert.ok(local.length >= 6, `expected the icons, stylesheet and script, found ${local.length}`);
  for (const ref of local) assert.ok(existsSync(new URL(ref, root)), `index.html references missing ${ref}`);
  for (const icon of JSON.parse(read('site.webmanifest')).icons) {
    assert.ok(existsSync(new URL(icon.src, root)), `site.webmanifest references missing ${icon.src}`);
  }
});

test('every link off the page opens in a new tab, keeping the reader’s place', () => {
  const links = [...html.matchAll(/<a ([^>]*)>/g)].map(m => m[1]);
  assert.ok(links.length >= 4, `expected the source, Beeminder, transcript and footnote links, found ${links.length}`);
  for (const attrs of links) {
    const href = attrs.match(/href="([^"]*)"/);
    // the footnote pair points within the page, so it must not open a tab
    if (href !== null && href[1].startsWith('#')) {
      assert.doesNotMatch(attrs, /target=/, attrs);
      continue;
    }
    assert.match(attrs, /target="_blank"/, attrs);
    assert.match(attrs, /rel="noopener"/, attrs);
  }
});

test('the footer credits Beeminder and links the transcript that built the app', () => {
  const madeby = tag(/<p class="madeby">([\s\S]*?)<\/p>/);
  assert.match(madeby, /^App-ified by <a href="https:\/\/www\.beeminder\.com"/);
  assert.equal(shown(/<a href="https:\/\/www\.beeminder\.com"[^>]*>([\s\S]*?)<\/a>/), 'Beeminder');
  assert.match(madeby, /<a href="sourcery\.html"/);
});

test('the page loads the app as a module, since it ships as ES modules', () => {
  assert.match(html, /<script type="module" src="app\.js"><\/script>/);
});
