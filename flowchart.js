// flowchart.js — the "GETTING STARTED WITH EXECUTIVE DYSFUNCTION" flowchart
// (reference/flowchart.png, from SOURCE_URL) transcribed as a graph.
//
// Vocabulary:
//   node    = one box or star of the flowchart, keyed by a short id. Boxes
//             with identical text AND identical outgoing arrows are one node
//             (the four "Hell yeah, get started!" stars); boxes whose arrows
//             differ stay separate even when their text matches (the two
//             "Go to Step 4." stars, the two "Can the need be met..." boxes)
//   kind    = how the node is drawn: 'step' (the five numbered cyan questions),
//             'question' (any other question box, plus the "Fine." box),
//             'list' (a blue box with an underlined heading, usually followed
//             by bullets), 'star' (a lavender starburst instruction), 'hooray'
//             (the orange "Hell yeah" starburst)
//   html    = the node's content, trusted markup; only <b> <i> <u> <h2> <p>
//             <ul> <li> <br> <a> and the <span class="step"> badge are used.
//             Every <a> opens in a new tab, so following a link never costs
//             the reader their place in the flowchart, and wraps words the
//             flowchart already had: a link adds no characters to the copy.
//   answers = the outgoing arrows; each is the box the arrow passes through:
//             its text (label, may contain <b>/<br>), the flowchart's box
//             color, and the id of the node it points at. Order is reading
//             order as drawn: boxes whose vertical extents overlap form a row
//             and read left to right; otherwise top to bottom. A continue
//             answer comes first.
//   continue = the button (see CONTINUE below) for the one way forward that
//             the flowchart draws without a labeled box: the stars that say
//             "Go to Step N", "Go through the flowchart again", and the bare
//             arrow out of "Fine."
//
// Every string below was copied character for character from the flowchart,
// down to the typos (which dreev then fixed with his bare hands).

export const SOURCE_URL = 'https://www.tumblr.com/jackalwedding/774031119836397568/if-you-have-memory-problems-brain-fog-or';
export const SOURCE_TITLE = 'GETTING STARTED WITH EXECUTIVE DYSFUNCTION';
export const START = 'know';

// The button that follows a node's own instruction where the flowchart draws
// no labeled answer box: "Go to Step 4.", "Move to step 2.", "Go through the
// flowchart again to solve them first", and the bare arrow out of "Fine.".
const CONTINUE = Object.freeze({ label: 'OK Go', color: 'chrome' });

export const FLOWCHART = {
  // ---------------------------------------------------------------- page 1
  'know': {
    kind: 'step',
    html: '<p><span class="step">1</span>Do you know what you need to do?</p>',
    answers: [
      { label: 'Yes!', color: 'green', next: 'can-start' },
      { label: 'OVERWHELM: Kind of, but I’m not sure where to start', color: 'cream', next: 'prioritize' },
      { label: 'OVERWHELM: No idea :(', color: 'pink', next: 'prioritize' },
    ],
  },
  'can-start': {
    kind: 'step',
    html: '<p><span class="step">2</span>Can you start the task?</p>',
    answers: [
      { label: 'No, that’s why I’m using this', color: 'pink', next: 'why-trouble' },
      { label: 'Yes!', color: 'green', next: 'hell-yeah' },
    ],
  },
  'why-trouble': {
    kind: 'step',
    html: '<p><span class="step">3</span>Why are you having trouble getting started?</p>',
    answers: [
      { label: 'INERTIA: I want to do it but I can’t stop doing something else', color: 'purple', next: 'interrupt-inertia' },
      { label: 'IMPULSE CONTROL: I <b>really</b> want to do something else specifically', color: 'lime', next: 'resist-impulses' },
      { label: 'MOTIVATION: I don’t want to do it', color: 'pink', next: 'ten-minutes' },
      { label: '??? Not sure why', color: 'cream', next: 'mindfulness' },
      { label: 'SENSORY &amp; EMOTIONAL REGULATION<br>I feel bad, upset, gross', color: 'peach', next: 'wellbeing' },
      { label: 'PARALYSIS: I don’t know how to do it', color: 'cream', next: 'break-it-down' },
      { label: 'PERFECTIONISM: It feels too hard or I’m afraid of failing', color: 'peach', next: 'break-it-down' },
    ],
  },
  'ten-minutes': {
    kind: 'question',
    html: '<p>Can you do it for just 10 minutes?</p>',
    answers: [
      { label: 'Yeah, that sounds doable', color: 'green', next: 'hell-yeah' },
      { label: 'That still sounds bad', color: 'pink', next: 'why' },
    ],
  },
  'why': {
    kind: 'question',
    html: '<p>Why?</p>',
    answers: [
      { label: 'It’s an unpleasant or arduous task', color: 'pink', next: 'tolerable' },
      { label: 'I’m worried I’ll fail.', color: 'peach', next: 'go-to-4' },
    ],
  },
  'tolerable': {
    kind: 'list',
    html: '<h2>MAKE IT MORE TOLERABLE</h2><ul>'
      + '<li><b>Listen</b> to music or an audiobook</li>'
      + '<li><b>Accommodate the task</b> to make it less bad</li>'
      + '<li><b>Pretend to be excited</b> about it, <b>find the fun</b></li>'
      + '<li><b>Decide on a reward</b> for after</li>'
      + '<li><b>Change of scenery</b></li>'
      + '<li><b>Wear the “Scientist Hat”</b> &mdash; they do this task!</li>'
      + '<li><b><a href="https://health.clevelandclinic.org/body-doubling-for-adhd" target="_blank" rel="noopener">Body double</a></b> with a friend or via <a href="https://blog.beeminder.com/focusmate" target="_blank" rel="noopener">Focusmate</a></li>'
      + '</ul>',
    answers: [
      { label: 'One of those worked!', color: 'green', next: 'hell-yeah' },
      { label: 'This didn’t help', color: 'pink', next: 'diy-dopamine' },
    ],
  },
  'mindfulness': {
    kind: 'list',
    html: '<h2>MINDFULNESS</h2><p>Take 5 minutes to sit quietly and consider why. How about now?</p>',
    answers: [
      { label: 'I know why now!', color: 'green', next: 'great-job-3' },
      { label: 'I still don’t know...', color: 'cream', next: 'wellbeing' },
    ],
  },
  'wellbeing': {
    kind: 'list',
    html: '<h2>WELLBEING</h2><p>Are your physical &amp; emotional needs met right now?</p>',
    answers: [
      { label: 'Needs are met!', color: 'green', next: 'other-reasons' },
      { label: 'No, I need something. It’s...', color: 'pink', next: 'need-kind' },
    ],
  },
  'need-kind': {
    kind: 'question',
    html: '<p>No, I need something. It’s...</p>',
    answers: [
      { label: 'EMOTIONAL: social interaction, managing shame, fear, anxiety, etc', color: 'gray', next: 'need-met-emotional' },
      { label: 'PHYSICAL: meds, food, rest sensory, water, movement, etc', color: 'gray', next: 'need-met-physical' },
    ],
  },
  'need-met-emotional': {
    kind: 'question',
    html: '<p>Can the need be met right now, even partially?</p>',
    answers: [
      { label: 'Yes!', color: 'green', next: 'dbt-skills' },
      { label: 'Need can’t be met', color: 'pink', next: 'other-reasons' },
    ],
  },
  'need-met-physical': {
    kind: 'question',
    html: '<p>Can the need be met right now, even partially?</p>',
    answers: [
      { label: 'Yes!', color: 'green', next: 'attend' },
      { label: 'Need can’t be met', color: 'pink', next: 'other-reasons' },
    ],
  },
  'prioritize': {
    kind: 'list',
    html: '<h2>PRIORITIZE</h2><ul>'
      + '<li>Use an <a href="https://blog.beeminder.com/rocks/" target="_blank" rel="noopener">important/urgent matrix</a></li>'
      + '<li>Pick the top 3 things or 1 next thing</li>'
      + '</ul>',
    answers: [
      { label: 'OVERWHELM: I still don’t know...', color: 'pink', next: 'break-it-down' },
      { label: 'I know what to do now!', color: 'green', next: 'great-job-2' },
    ],
  },
  'break-it-down': {
    kind: 'list',
    html: '<h2>BREAK IT DOWN</h2><ul>'
      + '<li>Use <a href="https://goblin.tools/ToDo" target="_blank" rel="noopener">Goblin Tools</a>!</li>'
      + '<li>What’s the smallest, easiest, <b>measurable</b> first step?</li>'
      + '</ul>',
    answers: [
      { label: 'I know what to do now!', color: 'green', next: 'great-job-2' },
      { label: 'I still don’t know :(', color: 'pink', next: 'revisit' },
      { label: 'It still feels too hard or like too much', color: 'cream', next: 'wellbeing' },
    ],
  },
  'hell-yeah': {
    kind: 'hooray',
    html: '<p>Hell yeah, get started!</p>',
    answers: [],
  },
  'great-job-2': {
    kind: 'star',
    html: '<p>Great job! Move to step 2.</p>',
    answers: [{ ...CONTINUE, next: 'can-start' }],
  },
  'great-job-3': {
    kind: 'star',
    html: '<p>Great job! Go to Step 3.</p>',
    answers: [{ ...CONTINUE, next: 'why-trouble' }],
  },
  'go-to-4': {
    kind: 'star',
    html: '<p>Go to Step 4.</p>',
    answers: [{ ...CONTINUE, next: 'other-reasons' }],
  },
  'revisit': {
    kind: 'star',
    html: '<p>Revisit previous to-do lists, ask for help, or take a walk break to think about it. Go to Step 1.</p>',
    answers: [{ ...CONTINUE, next: 'know' }],
  },
  'dbt-skills': {
    kind: 'star',
    html: '<p>Use <a href="https://deconstructingstigma.org/guides/dbt-emotion-regulation" target="_blank" rel="noopener">DBT skills</a>- fit the facts, opposite action, <a href="https://ggia.berkeley.edu/practice/loving_kindness_meditation" target="_blank" rel="noopener">loving kindness</a>. Go to Step 2.</p>',
    answers: [{ ...CONTINUE, next: 'can-start' }],
  },
  'attend': {
    kind: 'star',
    html: '<p>Attend to the need. Go to Step 2</p>',
    answers: [{ ...CONTINUE, next: 'can-start' }],
  },
  // ---------------------------------------------------------------- page 2
  'interrupt-inertia': {
    kind: 'list',
    html: '<h2>INTERRUPT INERTIA</h2><ul>'
      + '<li><b>Create interruptions</b>: drinking lots of water, content blockers, etc</li>'
      + '<li><b>Stop what you’re doing for just 5 minutes</b></li>'
      + '<li><b>Drink water</b> so you get up to pee</li>'
      + '<li><b>Put on content blocker</b></li>'
      + '<li><b>Get into an uncomfortable position</b> so you’re more likely to get up</li>'
      + '<li><b>Set a recurring alarm</b> to check in: do you want to be doing this?</li>'
      + '<li><b>Ask for help</b> to interrupt task</li>'
      + '<li><b>Set up accountability</b> from others</li>'
      + '<li><b>Make grumbling noises</b> about it</li>'
      + '<li><b>Pretend you’re teaching</b> someone ADHD skills &amp; verbally explain how you overcome paralysis</li>'
      + '</ul>',
    answers: [
      { label: 'I got unstuck from the task, but still need help starting.', color: 'cream', next: 'diy-dopamine' },
      { label: 'I can start the task now!', color: 'green', next: 'hell-yeah' },
      { label: 'These didn’t help', color: 'pink', next: 'harmless-problem' },
    ],
  },
  'diy-dopamine': {
    kind: 'list',
    html: '<h2>DIY DOPAMINE</h2><ul>'
      + '<li><b>Dance break</b> with fun song</li>'
      + '<li><b>Delicious snack</b></li>'
      + '<li><b>Exercise:</b> 60s jumping jacks</li>'
      + '<li><b>Stretch</b></li>'
      + '<li><b>Novelty</b> (position, environs)</li>'
      + '</ul>',
    answers: [
      { label: 'I can start the task now!', color: 'green', next: 'hell-yeah' },
      { label: 'It isn’t helping', color: 'pink', next: 'other-reasons' },
    ],
  },
  'resist-impulses': {
    kind: 'list',
    html: '<h2>RESIST IMPULSES</h2><ul>'
      + '<li><b>Name the emotion, impulse, and need.</b> “I’m feeling grumpy, so I want to give up. I need to have a snack and take a break.”</li>'
      + '<li><b>Create physical distance</b> from the thing</li>'
      + '<li><b>Create a gap.</b> Wait just 5 minutes before acting.</li>'
      + '<li><b>Look back:</b> During those 5 minutes, think about the last time you acted on this impulse. (“Last time I ___, I felt ___ / ____ happened”)</li>'
      + '<li><b>Look forward:</b> “How will I feel if I follow X impulse?” Answer that question for yourself, as well as “How will I feel if I don’t follow X impulse?” (let there be good feelings about that one too!)</li>'
      + '<li><b>Find an out</b>: add a natural stopping point- drink lots of water so you need to get up to pee, or set a content blocker to start in 15 minutes.</li>'
      + '<li><b>Plan an interruption</b> or ask a friend for help interrupting.</li>'
      + '<li><b>Make it harder</b> to follow impulse- delete apps, hide things, etc.</li>'
      + '<li><b>Set a recurring alarm</b> to check in: do you want to be doing this?</li>'
      + '<li><b>Set up accountability</b> with others</li>'
      + '<li><b>Follow the dopamine</b> and replace it with something shorter/more contained- rather than play the game, do the task but get a snack from the vending machine after.</li>'
      + '<li><b>Pretend you’re teaching</b> someone ADHD skills &amp; verbally explain how you resist impulses</li>'
      + '</ul>',
    answers: [
      { label: 'I’m sort of resisting the impulse, but not starting the task.', color: 'cream', next: 'interrupt-inertia' },
      { label: 'I still can’t resist, I really really want to do the thing', color: 'pink', next: 'go-to-4-protest' },
      { label: 'One of those worked!', color: 'green', next: 'hell-yeah' },
    ],
  },
  // The flowchart's argument with a reader who refuses to go to Step 4: each
  // red box is the reader talking back, each star (and "Fine.") is the
  // flowchart answering.
  'go-to-4-protest': {
    kind: 'star',
    html: '<p>Go to Step 4.</p>',
    answers: [
      { ...CONTINUE, next: 'other-reasons' },
      { label: 'I don’t want to, I really want to do this thing instead and I don’t want to bother with skills.', color: 'red', next: 'dbt-willfulness' },
    ],
  },
  'dbt-willfulness': {
    kind: 'star',
    html: '<p>Do DBT worksheet on <b><a href="https://dialecticalbehaviortherapy.com/distress-tolerance/willingness-vs-willfulness/" target="_blank" rel="noopener">willfulness</a>.</b> Go to Step 4.</p>',
    answers: [
      { ...CONTINUE, next: 'other-reasons' },
      { label: 'I don’t want to!!', color: 'red', next: 'please-4' },
    ],
  },
  'please-4': {
    kind: 'star',
    html: '<p>Please go to Step 4?</p>',
    answers: [
      { ...CONTINUE, next: 'other-reasons' },
      { label: 'No!!!', color: 'red', next: 'fine' },
    ],
  },
  'fine': {
    kind: 'question',
    html: '<p>Fine.</p>',
    answers: [{ ...CONTINUE, next: 'radical-acceptance' }],
  },
  'harmless-problem': {
    kind: 'star',
    html: '<p>Create a harmless but immediate <b>problem</b> (toss phone across room, knock over water) Go to step 4.</p>',
    answers: [{ ...CONTINUE, next: 'other-reasons' }],
  },
  'other-reasons': {
    kind: 'step',
    html: '<p><span class="step">4</span>Are there other reasons you can’t start the task?</p>',
    answers: [
      { label: 'Yes', color: 'green', next: 'go-through-again' },
      { label: 'Nope', color: 'pink', next: 'did-you-actually' },
    ],
  },
  'did-you-actually': {
    kind: 'question',
    html: '<p>Did you <i>actually</i> follow/try the suggestions?</p>',
    answers: [
      { label: 'I may have skipped some', color: 'peach', next: 'go-through-again' },
      { label: 'I did, I promise!', color: 'green', next: 'complete-now' },
    ],
  },
  'go-through-again': {
    kind: 'star',
    html: '<p>Go through this app again to solve them first</p>',
    answers: [{ ...CONTINUE, next: 'know' }],
  },
  'complete-now': {
    kind: 'step',
    html: '<p><span class="step">5</span>Do <u><i>you</i></u> need to <u><i>complete </i></u>the task <u><i>right now</i></u>? Can you get an extension or make more time?</p>',
    answers: [
      { label: 'It can wait', color: 'green', next: 'set-another-time' },
      { label: 'No flexibility', color: 'pink', next: 'delegate' },
    ],
  },
  'delegate': {
    kind: 'question',
    html: '<p>Can the task be delegated? Can someone else help you?</p>',
    answers: [
      { label: 'Yes!', color: 'green', next: 'ask-for-help' },
      { label: 'Nope', color: 'pink', next: 'partially' },
    ],
  },
  'partially': {
    kind: 'question',
    html: '<p>Can you do the task partially or badly?</p>',
    answers: [
      { label: 'Yes!', color: 'green', next: 'half-ass' },
      { label: 'No, it’s high-stakes', color: 'pink', next: 'worth-it' },
    ],
  },
  'worth-it': {
    kind: 'question',
    html: '<p>Is it really worth pushing yourself to do it anyway?</p>',
    answers: [
      { label: 'Not worth suffering for', color: 'pink', next: 'radical-acceptance' },
      { label: 'It’s worth it', color: 'green', next: 'do-the-task' },
    ],
  },
  'set-another-time': {
    kind: 'star',
    html: '<p><b>Set another day/time</b> to complete the task</p>',
    answers: [],
  },
  'ask-for-help': {
    kind: 'star',
    html: '<p><b>Ask for help!</b></p>',
    answers: [],
  },
  'half-ass': {
    kind: 'star',
    html: '<p><b>Half-ass it.</b> Something is better than nothing!</p>',
    answers: [],
  },
  'radical-acceptance': {
    kind: 'star',
    html: '<p><b>Practice <a href="https://dbtselfhelp.com/radical-acceptance-turning-the-mind/" target="_blank" rel="noopener">radical acceptance</a></b>. This task may not get done right now. It might feel like a catastrophe, but it’ll be okay.</p>',
    answers: [],
  },
  'do-the-task': {
    kind: 'star',
    html: '<p>Do the task. <b>Use <a href="https://www.skylandtrail.org/survive-a-crisis-situation-with-dbt-distress-tolerance-skills/" target="_blank" rel="noopener">distress tolerance</a></b> skills and harm reduction tools to minimize its impact on you.</p>',
    answers: [],
  },
};
