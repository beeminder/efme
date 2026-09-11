// Quals (see AGENTS.md: we call them quals, not tests) for flowchart.js, the
// transcription of the "GETTING STARTED WITH EXECUTIVE DYSFUNCTION" flowchart
// (reference/flowchart.png). These quals are the functional spec: every
// user-visible string must match the flowchart character for character,
// every emphasis span must start and end where the flowchart's does, and
// every arrow in the flowchart must be an edge in the graph.
//
// Vocabulary:
//   node     = one box or star in the flowchart, keyed by a short id
//   answer   = one outgoing arrow from a node, shown as a button; its label is
//              the text of the box the arrow passes through, or CONTINUE_LABEL
//              where the flowchart draws no box
//   marked() = the text a user reads once a node's html is rendered, with the
//              flowchart's emphasis kept as markers: **bold**, ~italic~,
//              =underlined= (none of those characters occur in the copy)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FLOWCHART, START, SOURCE_URL, SOURCE_TITLE } from '../flowchart.js';

const KINDS = ['step', 'question', 'list', 'star', 'hooray'];
const COLORS = ['green', 'pink', 'red', 'cream', 'peach', 'purple', 'lime', 'gray', 'chrome'];
const NODE_TAGS = ['b', 'i', 'u', 'h2', 'p', 'ul', 'li', 'br', 'a'];
// What the continue button says. The flowchart draws no box for those arrows,
// so this is the app's own copy; pinning it here makes changing it a spec change.
const CONTINUE_LABEL = 'OK Go';
const LABEL_TAGS = ['b', 'br'];
const BADGE = /<span class="step">\d<\/span>/g;
// Nodes that carry a continue answer without naming a step in their text.
const CONTINUE_WITHOUT_STEP = ['go-through-again', 'fine'];

function marked(html) {
  return html
    .replace(BADGE, '')
    .replace(/<\/?b>/g, '**')
    .replace(/<\/?i>/g, '~')
    .replace(/<\/?u>/g, '=')
    .replace(/<br>/g, '\n')
    .replace(/<\/(h2|p|li)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/\n+/g, '\n')
    .trim();
}

const ids = Object.keys(FLOWCHART);
const allAnswers = ids.flatMap(id => FLOWCHART[id].answers.map(a => ({ id, ...a })));
const tagsIn = html => [...html.replace(BADGE, '').matchAll(/<\/?([a-z0-9]+)/g)].map(m => m[1]);

test('START is the step-1 node', () => {
  assert.equal(START, 'know');
  assert.match(FLOWCHART[START].html, /<span class="step">1<\/span>/);
});

test('every answer points at an existing node', () => {
  for (const a of allAnswers) assert.ok(ids.includes(a.next), `${a.id} -> ${a.next}`);
});

test('every node is reachable from START', () => {
  const seen = new Set([START]);
  const todo = [START];
  while (todo.length) {
    for (const a of FLOWCHART[todo.pop()].answers) {
      if (!seen.has(a.next)) { seen.add(a.next); todo.push(a.next); }
    }
  }
  assert.deepEqual([...ids].sort(), [...seen].sort());
});

test('kinds and colors come from the vocabularies', () => {
  for (const id of ids) assert.ok(KINDS.includes(FLOWCHART[id].kind), `${id}: ${FLOWCHART[id].kind}`);
  for (const a of allAnswers) assert.ok(COLORS.includes(a.color), `${a.id}: ${a.color}`);
});

test('style.css styles exactly the kinds and colors in the vocabularies', () => {
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const classes = prefix => [...new Set([...css.matchAll(new RegExp(`\\.${prefix}-([a-z]+)`, 'g'))].map(m => m[1]))].sort();
  assert.deepEqual(classes('kind'), [...KINDS].sort());
  assert.deepEqual(classes('color'), [...COLORS].sort());
});

test('star and hooray cards wear a burst of a handful of spikes, not a tiled zigzag', () => {
  // Replicata: open a long star such as radical-acceptance.
  // Expectata: a starburst like the flowchart, a handful of large spikes.
  // Resultata: 18px triangles tiled around the rectangle, reading as a coupon.
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  // anchored at the start of a line, so the shared fill rule that also lists
  // these selectors, after .paper, is not mistaken for the burst
  const burst = css.match(/^\.kind-star::before,\s*\.kind-hooray::before\s*\{([^}]*)\}/m);
  assert.ok(burst !== null, 'style.css has no shared ::before rule for star and hooray cards');
  assert.doesNotMatch(burst[1], /repeat-x|repeat-y/, 'spikes are tiled along the edge');
  // the shape is declared once on the card and used by both the burst and the
  // lip behind it, so follow the custom property to find it
  assert.match(burst[1], /clip-path:/, 'the burst is not clipped to a shape');
  const shape = burst[1].match(/clip-path:\s*var\((--[a-z-]+)\)/);
  const where = shape === null ? burst[1] : css.match(new RegExp(`${shape[1]}:\\s*([\\s\\S]*?);`))[1];
  const poly = where.match(/polygon\(\s*([\d.%\s,]+)\s*\)/);
  assert.ok(poly !== null, 'the halo is not a clip-path polygon');
  const points = poly[1].split(',').map(s => s.trim()).filter(Boolean);
  assert.ok(points.length >= 16 && points.length <= 24,
    `burst has ${points.length} points; an 8–12 spike star has 16–24`);
  // The polygon's coordinates are percentages, so they only draw a star while
  // the box is square; on a tall box they stretch into a diamond. And since
  // the paper is out of flow, the aspect ratio is also the only thing giving
  // a star card any height at all: without it the card is 448 by 0.
  // The square is now a floor rather than a fixed ratio: short cards, which is
  // most of them, are exactly square, and only a card whose copy will not fit
  // one grows taller, stretching its spikes rather than losing its words.
  const floor = css.match(/\.kind-star::after,\s*\.kind-hooray::after\s*\{([^}]*)\}/);
  assert.ok(floor !== null && /padding-top:\s*100%/.test(floor[1]),
    'nothing holds the burst box square when its copy is short');
});

test('star copy is sized by the card it sits in, so it cannot outgrow the burst', () => {
  // Replicata: on a 390px phone, set the browser's default font to 32px, the
  // 200% text-resize threshold, and open the radical-acceptance card.
  // Expectata: the whole message, inside the star.
  // Resultata (before this qual): the copy ran 409px below the card, over the
  // page and under the buttons, because the card is capped by the viewport
  // while the type was sized from the root font.
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const box = css.match(/\.kind-star,\s*\.kind-hooray\s*\{([^}]*)\}/);
  assert.ok(box !== null, 'star and hooray cards share no sizing rule');
  assert.match(box[1], /container-type:\s*inline-size/, 'the card is not a container its copy can be measured against');
  for (const sel of ['.kind-star p', '.kind-hooray p']) {
    const rule = css.match(new RegExp(`\\${sel.replace(' ', '\\s+')}\\s*\\{([^}]*)\\}`));
    assert.ok(rule !== null, `${sel} has no rule`);
    const size = rule[1].match(/font-size:\s*([^;]+);/);
    assert.ok(size !== null, `${sel} declares no font-size`);
    assert.match(size[1], /cq[wibh]/, `${sel} is sized from something other than its card: ${size[1]}`);
    // and still capped, so a wide desktop card does not blow the copy up
    assert.match(size[1], /min\(|clamp\(/, `${sel} has no upper bound: ${size[1]}`);
  }
});

test('a star card is at least a square, and grows when its copy needs more room', () => {
  // Replicata: add a long aside to a star node, such as the Beeminder note on
  // the dbt-skills card, and open it on a phone.
  // Expectata: the whole note, inside the burst.
  // Resultata (before this qual): the copy ran straight out of the fixed
  // square, over the answer button, the controls and the footer. Sizing the
  // type from the card only solves type that is too large; it cannot solve
  // copy that is simply longer than a square of that size will hold.
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const box = css.match(/\.kind-star,\s*\.kind-hooray\s*\{([^}]*)\}/);
  assert.ok(box !== null, 'star and hooray cards share no sizing rule');
  assert.match(box[1], /display:\s*grid/, 'the card cannot stack a square floor under its copy');
  const floor = css.match(/\.kind-star::after,\s*\.kind-hooray::after\s*\{([^}]*)\}/);
  assert.ok(floor !== null, 'there is no square floor holding short cards square');
  assert.match(floor[1], /padding-top:\s*100%/, 'the floor is not a square');
  const paper = css.match(/\.kind-star \.paper,\s*\.kind-hooray \.paper\s*\{([^}]*)\}/);
  assert.ok(paper !== null, 'star papers share no rule');
  assert.doesNotMatch(paper[1], /position:\s*absolute/,
    'a paper out of flow cannot lengthen its card, so its copy can only overflow');
  assert.match(paper[1], /position:\s*relative/,
    'the paper must stay positioned, or the burst and the floor paint over the copy');
});

test('the burst does not put a filter on the element it clips, which would erase it', () => {
  // Replicata: look at a star card next to any other card.
  // Expectata: the same candy lip under it.
  // Resultata: a flat shape. clip-path is applied after filter, so a
  // drop-shadow on the clipped element is clipped straight back off; the
  // declaration painted 1 pixel in 258,064.
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  for (const rule of css.match(/[^{}]*\{[^}]*clip-path[^}]*\}/g) ?? []) {
    assert.doesNotMatch(rule, /filter\s*:/, `a filter on a clipped element is thrown away: ${rule.slice(0, 48)}`);
  }
});

test('the continue button is the only chrome-colored answer and vice versa', () => {
  for (const a of allAnswers) assert.equal(a.label === CONTINUE_LABEL, a.color === 'chrome', `${a.id}: ${a.label}`);
});

test('step badges 1 through 5 each appear exactly once, only on step nodes', () => {
  const badges = ids.flatMap(id => [...FLOWCHART[id].html.matchAll(/<span class="step">(\d)<\/span>/g)].map(m => [id, m[1]]));
  assert.deepEqual(badges.map(b => b[1]).sort(), ['1', '2', '3', '4', '5']);
  for (const id of ids) assert.equal(FLOWCHART[id].kind === 'step', badges.some(b => b[0] === id), id);
});

test('html uses only the allowed tags (the step badge aside)', () => {
  for (const id of ids) {
    for (const t of tagsIn(FLOWCHART[id].html)) assert.ok(NODE_TAGS.includes(t), `${id}: <${t}>`);
    for (const a of FLOWCHART[id].answers) {
      for (const t of tagsIn(a.label)) assert.ok(LABEL_TAGS.includes(t), `${id}: <${t}> in label`);
    }
  }
});

test('typography matches the flowchart: curly quotes only, no ASCII apostrophes', () => {
  // What the user reads, so a link's href quotes are out of scope by construction.
  const copy = [...ids.map(id => marked(FLOWCHART[id].html)), ...allAnswers.map(a => marked(a.label))];
  for (const s of copy) {
    assert.doesNotMatch(s, /'/, s);
    assert.doesNotMatch(s, /"/, s);
  }
});

test('every node that names a step has exactly one continue answer, leading to that step', () => {
  const stepNode = n => ids.find(id => FLOWCHART[id].html.includes(`<span class="step">${n}</span>`));
  let found = 0;
  for (const id of ids) {
    const m = marked(FLOWCHART[id].html).match(/(?:go|move) to step (\d)/i);
    if (m === null) continue;
    found++;
    const onward = FLOWCHART[id].answers.filter(a => a.label === CONTINUE_LABEL);
    assert.equal(onward.length, 1, id);
    assert.equal(onward[0].next, stepNode(m[1]), id);
  }
  assert.equal(found, 10);
});

test('the continue button appears only where the flowchart draws no answer box', () => {
  for (const id of ids) {
    const hasContinue = FLOWCHART[id].answers.some(a => a.label === CONTINUE_LABEL);
    const namesStep = /(?:go|move) to step \d/i.test(marked(FLOWCHART[id].html));
    assert.equal(hasContinue, namesStep || CONTINUE_WITHOUT_STEP.includes(id), id);
  }
});

// Where the app sends a reader who wants the thing the flowchart names: node
// id -> the link text and its destination, in the order they appear. Link
// text is always words the flowchart already had, which the golden below
// enforces by ignoring tags: a link can never add or change a character.
const EXPECTED_LINKS = {
  'tolerable': [
    ['Body double', 'https://health.clevelandclinic.org/body-doubling-for-adhd'],
    ['Focusmate', 'https://blog.beeminder.com/focusmate'],
  ],
  'prioritize': [['important/urgent matrix', 'https://blog.beeminder.com/rocks/']],
  'break-it-down': [['Goblin Tools', 'https://goblin.tools/ToDo']],
  'dbt-skills': [['CBT', 'https://blog.beeminder.com/cbt']],
  'dbt-willfulness': [['willfulness', 'https://dialecticalbehaviortherapy.com/distress-tolerance/willingness-vs-willfulness/']],
  'radical-acceptance': [['radical acceptance', 'https://dbtselfhelp.com/radical-acceptance-turning-the-mind/']],
  'do-the-task': [['distress tolerance', 'https://www.skylandtrail.org/survive-a-crisis-situation-with-dbt-distress-tolerance-skills/']],
};

const linksIn = html => [...html.matchAll(/<a ([^>]*)>([^<]*)<\/a>/g)].map(m => ({ attrs: m[1], text: m[2] }));

test('the links are exactly the golden ones, on the flowchart’s own words', () => {
  const actual = {};
  for (const id of ids) {
    const links = linksIn(FLOWCHART[id].html);
    if (links.length === 0) continue;
    actual[id] = links.map(l => [l.text, l.attrs.match(/href="([^"]+)"/)[1]]);
  }
  assert.deepEqual(actual, EXPECTED_LINKS);
  for (const [id, links] of Object.entries(EXPECTED_LINKS)) {
    for (const [text] of links) assert.ok(marked(FLOWCHART[id].html).includes(text), `${id}: ${text}`);
  }
});

test('every link opens in a new tab, so following one never loses the reader’s place', () => {
  for (const id of ids) {
    for (const link of linksIn(FLOWCHART[id].html)) {
      assert.match(link.attrs, /target="_blank"/, `${id}: ${link.text}`);
      assert.match(link.attrs, /rel="noopener"/, `${id}: ${link.text}`);
      assert.match(link.attrs, /href="https:\/\//, `${id}: ${link.text}`);
    }
  }
});

test('answer labels carry no links: a link belongs to the box the reader is reading', () => {
  for (const a of allAnswers) assert.doesNotMatch(a.label, /<a /, `${a.id}: ${a.label}`);
});

test('terminal nodes are exactly the flowchart’s dead-end stars', () => {
  const terminal = ids.filter(id => FLOWCHART[id].answers.length === 0).sort();
  assert.deepEqual(terminal, [
    'ask-for-help', 'do-the-task', 'half-ass', 'hell-yeah', 'radical-acceptance', 'set-another-time',
  ]);
});

test('boxes are one node iff their text and their outgoing arrows both match', () => {
  for (const a of ids) {
    for (const b of ids) {
      if (a >= b) continue;
      const sameText = marked(FLOWCHART[a].html) === marked(FLOWCHART[b].html);
      const sameArrows = JSON.stringify(FLOWCHART[a].answers) === JSON.stringify(FLOWCHART[b].answers);
      assert.ok(!(sameText && sameArrows), `${a} and ${b} should be one node`);
    }
  }
  // the pairs the flowchart draws twice with different arrows
  assert.equal(marked(FLOWCHART['go-to-4'].html), marked(FLOWCHART['go-to-4-protest'].html));
  assert.equal(marked(FLOWCHART['need-met-emotional'].html), marked(FLOWCHART['need-met-physical'].html));
});

test('source credit is the tumblr post and the flowchart’s title', () => {
  assert.equal(SOURCE_URL, 'https://www.tumblr.com/jackalwedding/774031119836397568/if-you-have-memory-problems-brain-fog-or');
  assert.equal(SOURCE_TITLE, 'GETTING STARTED WITH EXECUTIVE DYSFUNCTION');
});

// The golden transcription. Keys are node ids; `text` is marked() of the
// node; `answers` are [label, color, next-id] triples in reading order as
// drawn: boxes whose vertical extents overlap form a row and read left to
// right, otherwise top to bottom; a Perge answer comes first. A page
// Some entries say what the app is rather than what the paper flowchart said,
// because the human reworded them by hand for the app: the "(see pg 2)" and
// "(see page 2)" references are gone, since an app has no page 2; the
// flowchart's typos are fixed ("Accommodate", "Look forward:");
// 'did-you-actually' drops "on the flowchart"; and 'go-through-again' says
// "this app". Colors are the
// flowchart's box fills: green, pink, red, cream, peach, purple (INERTIA's
// orchid), lime (IMPULSE CONTROL's yellow-green), gray.
const EXPECTED = {
  'know': {
    kind: 'step',
    text: 'Do you know what you need to do?',
    answers: [
      ['Yes!', 'green', 'can-start'],
      ['OVERWHELM: Kind of, but I’m not sure where to start', 'cream', 'prioritize'],
      ['OVERWHELM: No idea :(', 'pink', 'prioritize'],
    ],
  },
  'can-start': {
    kind: 'step',
    text: 'Can you start the task?',
    answers: [
      ['No, that’s why I’m using this', 'pink', 'why-trouble'],
      ['Yes!', 'green', 'hell-yeah'],
    ],
  },
  'why-trouble': {
    kind: 'step',
    text: 'Why are you having trouble getting started?',
    answers: [
      ['INERTIA: I want to do it but I can’t stop doing something else', 'purple', 'interrupt-inertia'],
      ['IMPULSE CONTROL: I **really** want to do something else specifically', 'lime', 'resist-impulses'],
      ['MOTIVATION: I don’t want to do it', 'pink', 'ten-minutes'],
      ['??? Not sure why', 'cream', 'mindfulness'],
      ['SENSORY & EMOTIONAL REGULATION\nI feel bad, upset, gross', 'peach', 'wellbeing'],
      ['PARALYSIS: I don’t know how to do it', 'cream', 'break-it-down'],
      ['PERFECTIONISM: It feels too hard or I’m afraid of failing', 'peach', 'break-it-down'],
    ],
  },
  'ten-minutes': {
    kind: 'question',
    text: 'Can you do it for just 10 minutes?',
    answers: [
      ['Yeah, that sounds doable', 'green', 'hell-yeah'],
      ['That still sounds bad', 'pink', 'why'],
    ],
  },
  'why': {
    kind: 'question',
    text: 'Why?',
    answers: [
      ['It’s an unpleasant or arduous task', 'pink', 'tolerable'],
      ['I’m worried I’ll fail.', 'peach', 'go-to-4'],
    ],
  },
  'tolerable': {
    kind: 'list',
    text: 'MAKE IT MORE TOLERABLE\n'
      + '**Listen** to music or an audiobook\n'
      + '**Accommodate the task** to make it less bad\n'
      + '**Pretend to be excited** about it, **find the fun**\n'
      + '**Decide on a reward** for after\n'
      + '**Change of scenery**\n'
      + '**Wear the “Scientist Hat”** — they do this task!\n'
      + '**Body double** with a friend or via Focusmate',
    answers: [
      ['One of those worked!', 'green', 'hell-yeah'],
      ['This didn’t help', 'pink', 'diy-dopamine'],
    ],
  },
  'mindfulness': {
    kind: 'list',
    text: 'MINDFULNESS\n'
      + 'Take 5 minutes to sit quietly and consider why. How about now?',
    answers: [
      ['I know why now!', 'green', 'great-job-3'],
      ['I still don’t know...', 'cream', 'wellbeing'],
    ],
  },
  'wellbeing': {
    kind: 'list',
    text: 'WELLBEING\n'
      + 'Are your physical & emotional needs met right now?',
    answers: [
      ['Needs are met!', 'green', 'other-reasons'],
      ['No, I need something. It’s...', 'pink', 'need-kind'],
    ],
  },
  'need-kind': {
    kind: 'question',
    text: 'No, I need something. It’s...',
    answers: [
      ['EMOTIONAL: social interaction, managing shame, fear, anxiety, etc', 'gray', 'need-met-emotional'],
      ['PHYSICAL: meds, food, rest sensory, water, movement, etc', 'gray', 'need-met-physical'],
    ],
  },
  'need-met-emotional': {
    kind: 'question',
    text: 'Can the need be met right now, even partially?',
    answers: [
      ['Yes!', 'green', 'dbt-skills'],
      ['Need can’t be met', 'pink', 'other-reasons'],
    ],
  },
  'need-met-physical': {
    kind: 'question',
    text: 'Can the need be met right now, even partially?',
    answers: [
      ['Yes!', 'green', 'attend'],
      ['Need can’t be met', 'pink', 'other-reasons'],
    ],
  },
  'prioritize': {
    kind: 'list',
    text: 'PRIORITIZE\n'
      + 'Use an important/urgent matrix\n'
      + 'Pick the top 3 things or 1 next thing',
    answers: [
      ['OVERWHELM: I still don’t know...', 'pink', 'break-it-down'],
      ['I know what to do now!', 'green', 'great-job-2'],
    ],
  },
  'break-it-down': {
    kind: 'list',
    text: 'BREAK IT DOWN\n'
      + 'Use Goblin Tools!\n'
      + 'What’s the smallest, easiest, **measurable** first step?',
    answers: [
      ['I know what to do now!', 'green', 'great-job-2'],
      ['I still don’t know :(', 'pink', 'revisit'],
      ['It still feels too hard or like too much', 'cream', 'wellbeing'],
    ],
  },
  'hell-yeah': {
    kind: 'hooray',
    text: 'Hell yeah, get started!',
    answers: [],
  },
  'great-job-2': {
    kind: 'star',
    text: 'Great job! Move to step 2.',
    answers: [
      ['OK Go', 'chrome', 'can-start'],
    ],
  },
  'great-job-3': {
    kind: 'star',
    text: 'Great job! Go to Step 3.',
    answers: [
      ['OK Go', 'chrome', 'why-trouble'],
    ],
  },
  'go-to-4': {
    kind: 'star',
    text: 'Go to Step 4.',
    answers: [
      ['OK Go', 'chrome', 'other-reasons'],
    ],
  },
  'revisit': {
    kind: 'star',
    text: 'Revisit previous to-do lists, ask for help, or take a walk break to think about it. Go to Step 1.',
    answers: [
      ['OK Go', 'chrome', 'know'],
    ],
  },
  'dbt-skills': {
    kind: 'star',
    text: 'Use DBT skills — fit the facts, opposite action, loving kindness. [We at Beeminder don’t know what this is. I mean, we know what loving kindness is ~in general~, and apparently DBT is Dialectical Behavioral Therapy, which sounds like a variant of CBT, but that’s all we know.] Go to Step 2.',
    answers: [
      ['OK Go', 'chrome', 'can-start'],
    ],
  },
  'attend': {
    kind: 'star',
    text: 'Attend to the need. Go to Step 2',
    answers: [
      ['OK Go', 'chrome', 'can-start'],
    ],
  },
  'interrupt-inertia': {
    kind: 'list',
    text: 'INTERRUPT INERTIA\n'
      + '**Create interruptions**: drinking lots of water, content blockers, etc\n'
      + '**Stop what you’re doing for just 5 minutes**\n'
      + '**Drink water** so you get up to pee\n'
      + '**Put on content blocker**\n'
      + '**Get into an uncomfortable position** so you’re more likely to get up\n'
      + '**Set a recurring alarm** to check in: do you want to be doing this?\n'
      + '**Ask for help** to interrupt task\n'
      + '**Set up accountability** from others\n'
      + '**Make grumbling noises** about it\n'
      + '**Pretend you’re teaching** someone ADHD skills & verbally explain how you overcome paralysis',
    answers: [
      ['I got unstuck from the task, but still need help starting.', 'cream', 'diy-dopamine'],
      ['I can start the task now!', 'green', 'hell-yeah'],
      ['These didn’t help', 'pink', 'harmless-problem'],
    ],
  },
  'diy-dopamine': {
    kind: 'list',
    text: 'DIY DOPAMINE\n'
      + '**Dance break** with fun song\n'
      + '**Delicious snack**\n'
      + '**Exercise:** 60s jumping jacks\n'
      + '**Stretch**\n'
      + '**Novelty** (position, environs)',
    answers: [
      ['I can start the task now!', 'green', 'hell-yeah'],
      ['It isn’t helping', 'pink', 'other-reasons'],
    ],
  },
  'resist-impulses': {
    kind: 'list',
    text: 'RESIST IMPULSES\n'
      + '**Name the emotion, impulse, and need.** “I’m feeling grumpy, so I want to give up. I need to have a snack and take a break.”\n'
      + '**Create physical distance** from the thing\n'
      + '**Create a gap.** Wait just 5 minutes before acting.\n'
      + '**Look back:** During those 5 minutes, think about the last time you acted on this impulse. (“Last time I ___, I felt ___ / ____ happened”)\n'
      + '**Look forward:** “How will I feel if I follow X impulse?” Answer that question for yourself, as well as “How will I feel if I don’t follow X impulse?” (let there be good feelings about that one too!)\n'
      + '**Find an out**: add a natural stopping point- drink lots of water so you need to get up to pee, or set a content blocker to start in 15 minutes.\n'
      + '**Plan an interruption** or ask a friend for help interrupting.\n'
      + '**Make it harder** to follow impulse- delete apps, hide things, etc.\n'
      + '**Set a recurring alarm** to check in: do you want to be doing this?\n'
      + '**Set up accountability** with others\n'
      + '**Follow the dopamine** and replace it with something shorter/more contained- rather than play the game, do the task but get a snack from the vending machine after.\n'
      + '**Pretend you’re teaching** someone ADHD skills & verbally explain how you resist impulses',
    answers: [
      ['I’m sort of resisting the impulse, but not starting the task.', 'cream', 'interrupt-inertia'],
      ['I still can’t resist, I really really want to do the thing', 'pink', 'go-to-4-protest'],
      ['One of those worked!', 'green', 'hell-yeah'],
    ],
  },
  'go-to-4-protest': {
    kind: 'star',
    text: 'Go to Step 4.',
    answers: [
      ['OK Go', 'chrome', 'other-reasons'],
      ['I don’t want to, I really want to do this thing instead and I don’t want to bother with skills.', 'red', 'dbt-willfulness'],
    ],
  },
  'dbt-willfulness': {
    kind: 'star',
    text: 'Do DBT worksheet on **willfulness.** Go to Step 4.',
    answers: [
      ['OK Go', 'chrome', 'other-reasons'],
      ['I don’t want to!!', 'red', 'please-4'],
    ],
  },
  'please-4': {
    kind: 'star',
    text: 'Please go to Step 4?',
    answers: [
      ['OK Go', 'chrome', 'other-reasons'],
      ['No!!!', 'red', 'fine'],
    ],
  },
  'fine': {
    kind: 'question',
    text: 'Fine.',
    answers: [
      ['OK Go', 'chrome', 'radical-acceptance'],
    ],
  },
  'harmless-problem': {
    kind: 'star',
    text: 'Create a harmless but immediate **problem** (toss phone across room, knock over water) Go to step 4.',
    answers: [
      ['OK Go', 'chrome', 'other-reasons'],
    ],
  },
  'other-reasons': {
    kind: 'step',
    text: 'Are there other reasons you can’t start the task?',
    answers: [
      ['Yes', 'green', 'go-through-again'],
      ['Nope', 'pink', 'did-you-actually'],
    ],
  },
  'did-you-actually': {
    kind: 'question',
    text: 'Did you ~actually~ follow/try the suggestions?',
    answers: [
      ['I may have skipped some', 'peach', 'go-through-again'],
      ['I did, I promise!', 'green', 'complete-now'],
    ],
  },
  'go-through-again': {
    kind: 'star',
    text: 'Go through this app again to solve them first',
    answers: [
      ['OK Go', 'chrome', 'know'],
    ],
  },
  'complete-now': {
    kind: 'step',
    text: 'Do =~you~= need to =~complete ~=the task =~right now~=? Can you get an extension or make more time?',
    answers: [
      ['It can wait', 'green', 'set-another-time'],
      ['No flexibility', 'pink', 'delegate'],
    ],
  },
  'delegate': {
    kind: 'question',
    text: 'Can the task be delegated? Can someone else help you?',
    answers: [
      ['Yes!', 'green', 'ask-for-help'],
      ['Nope', 'pink', 'partially'],
    ],
  },
  'partially': {
    kind: 'question',
    text: 'Can you do the task partially or badly?',
    answers: [
      ['Yes!', 'green', 'half-ass'],
      ['No, it’s high-stakes', 'pink', 'worth-it'],
    ],
  },
  'worth-it': {
    kind: 'question',
    text: 'Is it really worth pushing yourself to do it anyway?',
    answers: [
      ['Not worth suffering for', 'pink', 'radical-acceptance'],
      ['It’s worth it', 'green', 'do-the-task'],
    ],
  },
  'set-another-time': {
    kind: 'star',
    text: '**Set another day/time** to complete the task',
    answers: [],
  },
  'ask-for-help': {
    kind: 'star',
    text: '**Ask for help!**',
    answers: [],
  },
  'half-ass': {
    kind: 'star',
    text: '**Half-ass it.** Something is better than nothing!',
    answers: [],
  },
  'radical-acceptance': {
    kind: 'star',
    text: '**Practice radical acceptance**. This task may not get done right now. It might feel like a catastrophe, but it’ll be okay.',
    answers: [],
  },
  'do-the-task': {
    kind: 'star',
    text: 'Do the task. **Use distress tolerance** skills and harm reduction tools to minimize its impact on you.',
    answers: [],
  },
};

test('the node set is exactly the golden transcription’s', () => {
  assert.deepEqual([...ids].sort(), Object.keys(EXPECTED).sort());
});

for (const [id, exp] of Object.entries(EXPECTED)) {
  test(`node ${id} matches the flowchart character for character`, () => {
    const node = FLOWCHART[id];
    assert.equal(node.kind, exp.kind);
    assert.equal(marked(node.html), exp.text);
    assert.deepEqual(node.answers.map(a => [marked(a.label), a.color, a.next]), exp.answers);
  });
}
