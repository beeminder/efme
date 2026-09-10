// app.js — the DOM layer. All flowchart logic lives in efme.js and everything
// remembered between visits in stats.js; this file only draws the current node
// and wires the buttons.
import { SOURCE_URL, SOURCE_TITLE } from './flowchart.js';
import { start, atStart, currentId, current, choose, back } from './efme.js';
import { assert } from './assert.js';
import { record } from './stats.js';

function $(selector) {
  const found = document.querySelector(selector);
  assert(found !== null, `missing element ${selector}`);
  return found;
}

const stage = $('#stage');
const backButton = $('#back');
const restartButton = $('#restart');

let state;

function el(tag, className) {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

// Confetti pieces are always present; style.css animates them only when the
// card is the "Hell yeah, get started!" one (see .kind-hooray ~ .confetti).
function confetti() {
  const box = el('div', 'confetti');
  box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--delay', `${Math.random() * 1.5}s`);
    piece.style.setProperty('--hue', `${Math.floor(Math.random() * 360)}`);
    piece.style.setProperty('--spin', `${Math.random() * 1080 - 540}deg`);
    box.append(piece);
  }
  return box;
}

// Fresh elements every time so the CSS entrance animations replay. Returns
// the new card so a button handler can focus it: the button just pressed is
// gone, so focus would otherwise fall to <body>, and focusing the card also
// announces it to screen readers.
function render() {
  const node = current(state);

  const card = el('section', `card kind-${node.kind}`);
  const paper = el('div', 'paper');
  paper.innerHTML = node.html;
  card.append(paper);

  const answers = el('div', 'answers');
  node.answers.forEach((answer, i) => {
    const button = el('button', `answer color-${answer.color}`);
    button.type = 'button';
    button.innerHTML = answer.label;
    button.style.setProperty('--i', i); // style.css staggers the buttons' rise by this index
    button.addEventListener('click', () => move(choose(state, i), 'choose').focus());
    answers.append(button);
  });

  stage.replaceChildren(card, answers, confetti());
  backButton.disabled = atStart(state);
  window.scrollTo({ top: 0 });
  paper.tabIndex = -1;
  return paper;
}

// Every move notes where the user landed before redrawing, so the log in
// stats.js is the whole history of the app being used.
function move(next, how) {
  state = next;
  record(currentId(state), how);
  return render();
}

backButton.addEventListener('click', () => move(back(state), 'back').focus());
restartButton.addEventListener('click', () => move(start(), 'start').focus());

$('#source-link').href = SOURCE_URL;
$('#source-title').textContent = SOURCE_TITLE;

move(start(), 'start');
