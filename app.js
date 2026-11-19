'use strict';

/* =====================================================================
   Bibcit – învață alfabetul românesc
   Two parts:
     • Alfabetul – a quick overview of all letters (alphabetical order)
     • Niveluri  – levels that build on each other (LEVELS in letters.js)
   Each level: learn → trace → find → pair → syllables & words → result.
   Plain JavaScript, no build step.
   ===================================================================== */

const FIND_LENGTH = 10;     // most questions in the "find the letter" step
const MAX_OPTIONS = 3;      // most letters to choose from (starts at 2, then 3)
const PASS_RATIO = 0.8;     // share of right-on-the-first-try answers needed to pass a level
const MAX_REC_SECONDS = 4;  // a recording stops by itself after this

/* ---------- Texts (all in one place, easy to change) ---------- */
const T = {
  alphabet: 'Alfabetul',
  levels: 'Niveluri',
  level: n => `Nivelul ${n}`,
  nextLevel: 'Mai departe',
  again: 'Încă o dată',
  back: 'Înapoi',
  listen: 'Ascultă',
  previous: 'Înapoi',
  next: 'Înainte',
  clear: 'Șterge',
  traceShow: 'Arată cum se scrie',
  traceStart: 'Privește degetul, apoi scrie și tu pe linia gri. Începe de la 1.',
  traceEmpty: 'Scrie litera cu degetul, pe linia gri.',
  traceGood: 'Bravo!',
  traceCover: 'Mai trece o dată peste toată linia gri.',
  traceOutside: 'Rămâi pe linia gri.',
  syllables: 'Silabe',
  words: 'Cuvinte',
  locked: n => `Mai întâi trebuie trecut nivelul ${n}. (Toate nivelurile se pot deschide din Setări.)`,
  settings: 'Setări',
  levelsHelp: (done, total) => `${done} din ${total} niveluri trecute. Un nivel este trecut cu cel puțin ${Math.round(PASS_RATIO * 100)}% răspunsuri corecte din prima încercare. Atunci se deschide nivelul următor.`,
  unlockAll: 'Deschide toate nivelurile',
  resetProgress: 'Șterge progresul',
  resetConfirm: 'Ștergi tot progresul? Se începe din nou de la nivelul 1.',
  voice: 'Vocea telefonului',
  voiceFound: name => `Voce românească găsită: ${name}. Este folosită doar unde nu există încă o înregistrare.`,
  voiceMissing: 'Pe acest dispozitiv nu există o voce românească. Se aud doar înregistrările tale.',
  voiceUnsupported: 'Acest browser nu poate vorbi. Se aud doar înregistrările tale.',
  voiceTest: 'Bună ziua! Ma, mi, mu.',
  test: 'Test',
  recordings: 'Înregistrări',
  recordingsHelp: (n, total) => `${n} din ${total} sunete sunt înregistrate. Înregistrezi pe laptop, cu vocea ta.`,
  openRecorder: 'Deschide pagina de înregistrare',
  recorderNoServer: 'Înregistrarea merge doar pe laptop, când aplicația este pornită cu server.py. În folderul proiectului rulează: python server.py — apoi deschide http://localhost:8000/#/inregistrare',
  recorderHelp: 'Apasă ● și vorbește, apoi apasă ■ (se oprește singur după 4 secunde). Pentru litere spune sunetul („mmm”, „sss”), nu numele literei („me”, „se”). Înregistrarea se aude imediat, ca s-o poți verifica. Dacă nu-ți place, înregistreaz-o din nou.',
  recLetter: 'sunetul literei',
  recExample: 'cuvânt exemplu',
  otherLetters: 'Alte litere (pentru alfabet)',
  record: 'Înregistrează',
  stop: 'Stop',
  micError: 'Nu pot folosi microfonul. Permite accesul la microfon pentru această pagină.',
  saveError: 'Înregistrarea nu a putut fi salvată. Este pornit server.py?',
};

/* ---------- Icons (inline SVG) ---------- */
const ICONS = {
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  steps: '<polyline points="3 20 8 20 8 15 13 15 13 10 18 10 18 5 21 5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
};
const FILLED = new Set(['stop', 'play']);

function icon(name) {
  return `<svg class="icon${FILLED.has(name) ? ' filled' : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

/* ---------- Saved settings and progress (localStorage) ---------- */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

const settings = Object.assign({ unlockAll: false }, store.get('bibcit.settings', {}));
let progress = Object.assign({ done: {}, results: {} }, store.get('bibcit.progress', {}));

const saveSettings = () => store.set('bibcit.settings', settings);
const saveProgress = () => store.set('bibcit.progress', progress);

const recentResults = l => (progress.results[l.lower] || []).slice(-5);

/* ---------- Letters and levels ---------- */
const BY_LOWER = new Map(LETTERS.map(l => [l.lower, l]));
const fixCedilla = text => text.replace(/ş/g, 'ș').replace(/ţ/g, 'ț').replace(/Ş/g, 'Ș').replace(/Ţ/g, 'Ț');

const LEVEL_DATA = LEVELS.map(level => {
  const letters = String(level.letters || '').split(/[\s,]+/).filter(Boolean).map(text => {
    const letter = BY_LOWER.get(fixCedilla(text.toLocaleLowerCase('ro')));
    if (!letter) console.warn(`letters.js: "${text}" in LEVELS is not in LETTERS`);
    return letter;
  }).filter(Boolean);
  const syllables = (level.syllables || []).map(fixCedilla);
  const words = (level.words || []).map(fixCedilla);
  return {
    letters,
    syllables,
    words,
    items: [...new Set([...syllables, ...words])],
    practice: !!level.practice,
    find: level.find,
  };
}).filter(level => level.letters.length);

const levelKey = i => LEVEL_DATA[i].letters.map(l => l.lower).join(' ') + (LEVEL_DATA[i].practice ? '+' : '');
// How a level is shown on its tile: "Mm", or "Mm+" for the practice level.
const levelText = i => LEVEL_DATA[i].letters.map(pairText).join(' ') + (LEVEL_DATA[i].practice ? '<span class="plus">+</span>' : '');
const isDone = i => !!progress.done[levelKey(i)];
const isOpen = i => settings.unlockAll || i === 0 || isDone(i) || isDone(i - 1);
const doneCount = () => LEVEL_DATA.filter((_, i) => isDone(i)).length;
const nextLevel = () => LEVEL_DATA.findIndex((_, i) => !isDone(i)); // -1 when all are passed

// All letters taught up to and including level i.
function lettersUpTo(i) {
  const out = [];
  for (let k = 0; k <= i; k++) {
    for (const l of LEVEL_DATA[k].letters) if (!out.includes(l)) out.push(l);
  }
  return out;
}

// Letters of the coming levels, then the rest of the alphabet (for wrong choices).
function lettersAfter(i, exclude) {
  const out = [];
  for (let k = i + 1; k < LEVEL_DATA.length; k++) {
    for (const l of LEVEL_DATA[k].letters) if (!exclude.includes(l) && !out.includes(l)) out.push(l);
  }
  for (const l of LETTERS) if (!exclude.includes(l) && !out.includes(l)) out.push(l);
  return out;
}

/* ---------- Sound ----------
   Your recordings are files in the audio/ folder, listed in audio/index.json.
   Without a recording, the phone's Romanian voice is used (if it has one). */
const SLUG = { 'ă': 'a1', 'â': 'a2', 'î': 'i2', 'ș': 's1', 'ț': 't1' };
const slug = text => text.toLocaleLowerCase('ro').replace(/[ăâîșț]/g, c => SLUG[c]).replace(/[^a-z0-9]/g, '');
const letterKey = l => 'L_' + slug(l.lower);   // a letter's sound
const textKey = text => 'T_' + slug(text);     // a syllable or word

const audioFiles = new Set();
const audioEl = new Audio();
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let roVoice = null;
let audioVersion = Date.now();

async function loadAudioIndex() {
  try {
    const res = await fetch('audio/index.json', { cache: 'no-cache' });
    const keys = await res.json();
    audioFiles.clear();
    keys.forEach(k => audioFiles.add(k));
    // Fetch every recording once, so they also work offline later.
    setTimeout(() => keys.forEach(k => fetch(audioUrl(k)).catch(() => {})), 3000);
  } catch { /* no recordings yet */ }
}
const audioUrl = key => `audio/${key}.wav`;

function findVoice() {
  if (!hasSpeech) return;
  roVoice = speechSynthesis.getVoices().find(v => /^ro([-_]|$)/i.test(v.lang)) || null;
}
if (hasSpeech) {
  findVoice();
  speechSynthesis.onvoiceschanged = () => {
    findVoice();
    if (currentPath() === '/settings') renderSettings();
  };
}

function stopSound() {
  if (hasSpeech && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  audioEl.pause();
}

function speak(text) {
  if (!hasSpeech || !text) return;
  if (!roVoice) findVoice();
  if (!roVoice) return; // a non-Romanian voice would teach the wrong sounds
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ro-RO';
  u.voice = roVoice;
  u.rate = 0.8;
  speechSynthesis.speak(u);
}

function playKey(key, fallbackText, fresh = false) {
  stopSound();
  if (audioFiles.has(key)) {
    audioEl.src = audioUrl(key) + (fresh ? `?v=${audioVersion}` : '');
    audioEl.play().catch(() => speak(fallbackText));
  } else {
    speak(fallbackText);
  }
}
const playLetter = l => playKey(letterKey(l), l.say);
const playText = text => playKey(textKey(text), text);

// iPhones only allow sound after a tap: "unlock" the audio element on the first tap.
document.addEventListener('click', () => {
  if (audioEl.src) return;
  audioEl.src = SILENT_WAV;
  audioEl.play().catch(() => {});
}, { once: true, capture: true });

// Short tones for right / wrong / level passed.
let audioCtx = null;
function tones(freqs, type, dur, vol) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let t = audioCtx.currentTime;
    for (const f of freqs) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      t += dur * 0.85;
    }
  } catch { /* no Web Audio */ }
}
const soundRight = () => tones([660, 880], 'sine', 0.15, 0.2);
const soundWrong = () => tones([196], 'triangle', 0.25, 0.15);
const soundPassed = () => tones([523, 659, 784, 1047], 'sine', 0.16, 0.2);

/* ---------- Navigation ----------
   Pages:  #/              home (the two parts)
           #/letters       alphabet overview      #/letter/3   one letter
           #/levels        all levels             #/level/3    one level
           #/settings      #/inregistrare (recording page, laptop only)
   The back button on a page goes to its parent page; the phone's own back
   button behaves the same way. */
const $app = document.getElementById('app');
const currentPath = () => location.hash.slice(1) || '/';

function navigate(path, { replace = false } = {}) {
  stopRecording();
  stopSound();
  if (replace) history.replaceState(history.state, '', '#' + path);
  else history.pushState({ from: currentPath() }, '', '#' + path);
  window.scrollTo(0, 0);
  render(true);
}

function goUp(parent) {
  if (history.state && history.state.from === parent) {
    stopRecording();
    stopSound();
    history.back(); // the popstate handler shows the parent page
  } else {
    navigate(parent, { replace: true });
  }
}

window.addEventListener('popstate', () => {
  stopRecording();
  stopSound();
  window.scrollTo(0, 0);
  render(true);
});

function render(entering = false) {
  const path = currentPath();
  let m;
  if (path === '/letters') renderAlphabet();
  else if ((m = path.match(/^\/letter\/(\d+)$/)) && LETTERS[+m[1]]) renderLetter(+m[1]);
  else if (path === '/levels') renderLevels();
  else if ((m = path.match(/^\/level\/(\d+)$/)) && LEVEL_DATA[+m[1]]) renderLevel(+m[1], entering);
  else if (path === '/settings') renderSettings();
  else if (path === '/inregistrare') renderRecorder();
  else renderHome();
}

/* ---------- Small pieces of markup ---------- */
function topBar({ left = '', title = '', center = '', right = '' } = {}) {
  const spacer = '<span class="spacer"></span>';
  return `<header class="topbar">
    ${left || (center ? spacer : '')}
    ${center ? `<div class="center">${center}</div>` : `<div class="title">${title}</div>`}
    ${right || spacer}
  </header>`;
}

const iconButton = (action, name, label, value = '') =>
  `<button class="icon-btn" data-action="${action}" data-value="${value}" aria-label="${label}">${icon(name)}</button>`;

const backButton = parent => iconButton('up', 'back', T.back, parent);

// Big and small letter together: "M m".
const glyphs = l => `<span class="glyphs"><span>${l.upper}</span><span>${l.lower}</span></span>`;
const pairText = l => l.upper + l.lower;

// The example word, with the letter coloured wherever it appears.
function wordHTML(l) {
  return [...l.word].map(ch => (ch.toLocaleLowerCase('ro') === l.lower ? `<mark>${ch}</mark>` : ch)).join('');
}

let toastTimer = null;
function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4500);
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Home: the two parts ---------- */
function renderHome() {
  const done = doneCount();
  const total = LEVEL_DATA.length;
  const next = nextLevel();
  const nextArt = next === -1
    ? '🏆'
    : `<span class="glyphs">${levelText(next)}</span>`;

  $app.innerHTML = `
    ${topBar({ title: 'Bibcit', right: iconButton('go', 'settings', T.settings, '/settings') })}
    <div class="home">
      <button class="home-card" data-action="go" data-value="/letters">
        <span class="art"><span class="glyphs">Aa Bb Cc</span></span>
        <span class="label">${icon('grid')}<span>${T.alphabet}</span></span>
      </button>
      <button class="home-card levels-card" data-action="go" data-value="/levels">
        <span class="art">${nextArt}</span>
        <span class="label">${icon('steps')}<span>${T.levels}</span><span class="count">${done} / ${total}</span></span>
        <span class="progress"><i style="width:${total ? (done / total) * 100 : 0}%"></i></span>
      </button>
    </div>`;
}

/* ---------- Part 1: alphabet overview ---------- */
let letterIndex = 0;

function renderAlphabet() {
  const tiles = LETTERS.map((l, i) => {
    const r = recentResults(l);
    const filled = Math.round((r.filter(Boolean).length / 5) * 100);
    return `<button class="tile" data-action="openLetter" data-value="${i}" aria-label="${l.upper}">
      ${glyphs(l)}
      ${r.length ? `<span class="meter"><i style="width:${filled}%"></i></span>` : ''}
    </button>`;
  }).join('');
  $app.innerHTML = `
    ${topBar({ left: backButton('/'), title: T.alphabet })}
    <div class="grid">${tiles}</div>`;
}

function renderLetter(i) {
  letterIndex = i;
  const l = LETTERS[i];
  $app.innerHTML = `
    ${topBar({ left: backButton('/letters') })}
    <div class="page">
      <button class="card-btn big-letter" data-action="playLetter" data-value="${i}" aria-label="${T.listen}">
        ${glyphs(l)}<span class="corner">${icon('volume')}</span>
      </button>
      ${l.word ? `
        <button class="card-btn word-card" data-action="playExample" data-value="${i}" aria-label="${T.listen}">
          <span class="pic">${l.pic}</span>
          <span class="word">${wordHTML(l)}</span>
          <span class="corner">${icon('volume')}</span>
        </button>` : ''}
      <div class="nav-row">
        <button class="nav-btn" data-action="prevLetter" aria-label="${T.previous}"${i === 0 ? ' disabled' : ''}>${icon('left')}</button>
        <button class="nav-btn" data-action="nextLetter" aria-label="${T.next}"${i === LETTERS.length - 1 ? ' disabled' : ''}>${icon('right')}</button>
      </div>
    </div>`;
}

function showLetter(i) {
  if (!LETTERS[i]) return;
  navigate('/letter/' + i, { replace: true });
  playLetter(LETTERS[i]);
}

/* ---------- Part 2: levels ---------- */
function renderLevels() {
  const next = nextLevel();
  const tiles = LEVEL_DATA.map((level, i) => {
    const done = isDone(i);
    const open = isOpen(i);
    const state = done ? ' done' : !open ? ' locked' : i === next ? ' current' : '';
    const badge = done ? icon('check') : !open ? icon('lock') : '';
    const size = level.letters.length > 2 ? ' multi3' : level.letters.length > 1 ? ' multi' : '';
    return `<button class="level${state}${size}" data-action="openLevel" data-value="${i}" aria-label="${T.level(i + 1)}">
      <span class="num">${i + 1}</span>
      ${badge ? `<span class="badge">${badge}</span>` : ''}
      <span class="glyphs">${levelText(i)}</span>
    </button>`;
  }).join('');

  $app.innerHTML = `
    ${topBar({ left: backButton('/'), title: T.levels, right: `<span class="count">${doneCount()} / ${LEVEL_DATA.length}</span>` })}
    <div class="level-grid">${tiles}</div>`;
}

/* ---------- One level ----------
   learn → trace → find → pair → read (syllables & words) → readquiz → result */
let lesson = null;

function startLesson(i) {
  // The practice level of a letter skips the "learn" screen.
  const steps = LEVEL_DATA[i].practice ? ['trace', 'find', 'pair'] : ['learn', 'trace', 'find', 'pair'];
  if (LEVEL_DATA[i].items.length) steps.push('read', 'readquiz');
  steps.push('result');
  lesson = { level: i, steps, step: 0, pos: 0, part: 0, right: 0, total: 0, find: null, pair: null, rq: null, passed: false };
}

const stepName = () => lesson.steps[lesson.step];

function stepDots() {
  const dots = lesson.steps.slice(0, -1)
    .map((_, k) => `<i class="${k < lesson.step ? 'ok' : k === lesson.step ? 'now' : ''}"></i>`).join('');
  return `<div class="level-label"><span>${T.level(lesson.level + 1)}</span><div class="dots small">${dots}</div></div>`;
}

const levelTopBar = () => topBar({ left: backButton('/levels'), center: stepDots() });

function renderLevel(i, entering) {
  if (!isOpen(i)) {
    toast(T.locked(i));
    return navigate('/levels', { replace: true });
  }
  if (!lesson || lesson.level !== i) startLesson(i);
  const name = stepName();
  if (name === 'learn') renderLearn();
  else if (name === 'trace') renderTrace();
  else if (name === 'find') renderChoice(lesson.find);
  else if (name === 'pair') renderPair();
  else if (name === 'read') renderRead();
  else if (name === 'readquiz') renderChoice(lesson.rq);
  else renderResult();
  if (entering) playStepStart();
}

// Move on to the next step of the level.
function nextStep() {
  lesson.step++;
  lesson.pos = 0;
  lesson.part = 0;
  const name = stepName();
  const i = lesson.level;
  if (name === 'find') lesson.find = makeFindQuiz(i);
  if (name === 'pair') lesson.pair = makePair(i);
  if (name === 'readquiz') lesson.rq = makeReadQuiz(i);
  if (name === 'result') finishLevel();
  window.scrollTo(0, 0);
  renderLevel(i, false);
  playStepStart();
}

function playStepStart() {
  const name = stepName();
  const letters = LEVEL_DATA[lesson.level].letters;
  if (name === 'learn') playLetter(letters[lesson.pos]);
  if (name === 'find') playQuestion(lesson.find);
  if (name === 'readquiz') playQuestion(lesson.rq);
}

/* Step 1: learn the new letter(s) */
function renderLearn() {
  const letters = LEVEL_DATA[lesson.level].letters;
  const l = letters[lesson.pos];
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      <button class="card-btn big-letter huge" data-action="playShown" aria-label="${T.listen}">
        ${glyphs(l)}<span class="corner">${icon('volume')}</span>
      </button>
      <div class="nav-row">
        ${lesson.pos > 0 ? `<button class="nav-btn" data-action="learnPrev" aria-label="${T.previous}">${icon('left')}</button>` : ''}
        <button class="nav-btn primary" data-action="learnNext" aria-label="${T.next}">${icon('right')}</button>
      </div>
    </div>`;
}

/* Step 2: trace the letter with a finger
   Each letter is described by its strokes, in writing order. The same strokes
   draw the grey guide, the finger demo and the masks used to check the drawing.
   Box: y=0 is the top of the big letters, y=100 the line letters sit on;
   small letters start at y=40. */
const line = (x1, y1, x2, y2) => [[x1, y1], [x2, y2]];
function arc(cx, cy, rx, ry, from, to) { // angles in degrees: 0 right, 90 down, 180 left, 270 up
  const points = [];
  const n = Math.max(6, Math.ceil(Math.abs(to - from) / 8));
  for (let k = 0; k <= n; k++) {
    const a = ((from + ((to - from) * k) / n) * Math.PI) / 180;
    points.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return points;
}
const join = (...parts) => [].concat(...parts);

const STROKES = {
  I: { w: 40, strokes: [line(20, 0, 20, 100), line(6, 0, 34, 0), line(6, 100, 34, 100)] },
  i: { w: 20, strokes: [line(10, 40, 10, 100), line(10, 18, 10, 18.5)] },
  S: { w: 60, strokes: [join(arc(30, 26, 26, 25, 320, 90), arc(30, 75, 28, 25, 270, 500))] },
  s: { w: 40, strokes: [join(arc(20, 55, 18, 15, 320, 90), arc(20, 85, 19, 15, 270, 500))] },
  U: { w: 60, strokes: [join(line(0, 0, 0, 65), arc(30, 65, 30, 35, 180, 0), line(60, 65, 60, 0))] },
  u: { w: 38, strokes: [join(line(0, 40, 0, 78), arc(19, 78, 19, 22, 180, 0), line(38, 78, 38, 40)), line(38, 40, 38, 100)] },
  M: { w: 72, strokes: [[[0, 100], [0, 0], [36, 62], [72, 0], [72, 100]]] },
  m: { w: 68, strokes: [line(0, 40, 0, 100), join(arc(17, 58, 17, 16, 180, 360), line(34, 58, 34, 100)), join(arc(51, 58, 17, 16, 180, 360), line(68, 58, 68, 100))] },
  A: { w: 64, strokes: [line(0, 100, 32, 0), line(32, 0, 64, 100), line(13, 62, 51, 62)] },
  a: { w: 40, strokes: [arc(20, 70, 20, 30, 330, -20), line(40, 40, 40, 100)] },
  N: { w: 58, strokes: [[[0, 100], [0, 0], [58, 100], [58, 0]]] },
  n: { w: 40, strokes: [line(0, 40, 0, 100), join(arc(20, 58, 20, 18, 180, 360), line(40, 58, 40, 100))] },
};

const TRACE_COVER = 0.7;    // at least this share of the middle of the grey line must be covered
const TRACE_OUTSIDE = 0.2;  // at most this share of the drawing may be off the grey line
const TRACE_TRIES = 3;      // after this many tries the learner may go on anyway

// The strokes of "M m", placed in a box of W × H pixels.
// The strokes of one letter shape (e.g. "M" or "m"), as big as fits in W × H pixels.
function traceLayout(ch, W, H) {
  const glyph = STROKES[ch];
  if (!glyph) return null;
  const pts = glyph.strokes.flat();
  const minX = Math.min(...pts.map(p => p[0])), maxX = Math.max(...pts.map(p => p[0]));
  const minY = Math.min(...pts.map(p => p[1])), maxY = Math.max(...pts.map(p => p[1]));
  const bw = Math.max(maxX - minX, 1), bh = Math.max(maxY - minY, 1);
  const s = Math.min((W * 0.7) / bw, (H * 0.58) / bh);
  const ox = (W - bw * s) / 2 - minX * s;
  const oy = (H - bh * s) / 2 - minY * s + H * 0.04; // a little lower: the tip text sits on top
  return {
    strokes: glyph.strokes.map(stroke => stroke.map(([x, y]) => [ox + x * s, oy + y * s])),
    numbers: glyph.strokes.map((_, k) => k + 1),
    width: Math.min(15 * s, W * 0.09), // thickness of the grey line
  };
}

function drawStrokes(ctx, strokes, width, color, upTo = Infinity) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  strokes.forEach(stroke => {
    ctx.beginPath();
    stroke.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  });
}

const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Canvas sized to its box, sharp on phone screens; drawing uses CSS pixels.
function sizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const box = canvas.getBoundingClientRect();
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, W: box.width, H: box.height };
}

let trace = null; // { layout, guide, demo, ink, tries, demoId }

function renderTrace() {
  const l = LEVEL_DATA[lesson.level].letters[lesson.pos];
  const ch = lesson.part ? l.lower : l.upper; // first the big letter, then the small one
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      <div class="trace-wrap">
        <div class="trace-guide-text"><span class="glyphs">${ch}</span></div>
        <canvas class="trace-guide"></canvas>
        <canvas class="trace-demo"></canvas>
        <canvas class="trace-canvas"></canvas>
        <div class="trace-msg" aria-live="polite"></div>
      </div>
      <div class="nav-row">
        <button class="nav-btn" data-action="traceDemo" aria-label="${T.traceShow}"><span class="finger">👆</span></button>
        <button class="nav-btn" data-action="traceClear" aria-label="${T.clear}">${icon('refresh')}</button>
        <button class="nav-btn primary" data-action="traceCheck" aria-label="${T.next}">${icon('check')}</button>
      </div>
    </div>`;

  const wrap = $app.querySelector('.trace-wrap');
  const guide = sizeCanvas(wrap.querySelector('.trace-guide'));
  const layout = traceLayout(ch, guide.W, guide.H);
  trace = { layout, tries: 0, demoId: 0, inked: false, done: false };

  if (layout) {
    wrap.querySelector('.trace-guide-text').remove();
    drawGuide(guide.ctx, layout);
    trace.demo = sizeCanvas(wrap.querySelector('.trace-demo')).ctx;
  } else {
    // No stroke shapes for this letter yet: plain grey letter, not checked.
    wrap.querySelector('.trace-guide').remove();
    fitGuide(wrap, wrap.querySelector('.trace-guide-text .glyphs'));
  }
  setupInk(wrap.querySelector('.trace-canvas'), layout ? layout.width * 0.9 : null);
  traceMessage(layout ? T.traceStart : '');
  if (layout) setTimeout(() => playDemo(), 400);
}

// Grey letter with a numbered dot where each stroke starts.
function drawGuide(ctx, layout) {
  drawStrokes(ctx, layout.strokes, layout.width, cssVar('--guide'));
  const r = Math.max(11, layout.width * 0.42);
  ctx.font = `700 ${Math.round(r * 1.2)}px Andika, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  layout.strokes.forEach((stroke, k) => {
    const [x, y] = stroke[0];
    ctx.fillStyle = cssVar('--good');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(String(layout.numbers[k]), x, y + 1);
  });
}

// Make the grey letter as big as possible, but never wider than the box.
function fitGuide(box, letters) {
  const guide = letters.parentElement;
  let size = parseFloat(getComputedStyle(guide).fontSize);
  const maxW = box.clientWidth * 0.9;
  const maxH = box.clientHeight * 0.8;
  if (letters.offsetWidth > maxW) size *= maxW / letters.offsetWidth;
  if (letters.offsetHeight > maxH) size *= maxH / letters.offsetHeight;
  guide.style.fontSize = size + 'px';
}

// The learner's finger drawing.
function setupInk(canvas, width) {
  const { ctx, W } = sizeCanvas(canvas);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width || Math.max(14, W / 22);
  ctx.strokeStyle = cssVar('--accent') || '#1E4FB5';
  ctx.fillStyle = ctx.strokeStyle;
  trace.ink = canvas;
  let last = null;
  const point = e => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  canvas.addEventListener('pointerdown', e => {
    stopDemo();
    canvas.setPointerCapture(e.pointerId);
    last = point(e);
    trace.inked = true;
    ctx.beginPath();
    ctx.arc(last.x, last.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  canvas.addEventListener('pointermove', e => {
    if (!last) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  });
  const end = () => { last = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

function clearInk() {
  const ctx = trace.ink.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, trace.ink.width, trace.ink.height);
  ctx.restore();
  trace.inked = false;
}

function traceMessage(text, kind = '') {
  const el = $app.querySelector('.trace-msg');
  if (!el) return;
  el.textContent = text;
  el.className = 'trace-msg' + (kind ? ' ' + kind : '') + (text ? ' show' : '');
}

// Finger demo: draws the letter stroke by stroke, with a finger moving along.
function playDemo() {
  if (!trace || !trace.layout || !trace.demo) return;
  const id = ++trace.demoId;
  const ctx = trace.demo;
  const { strokes, width } = trace.layout;
  const canvas = ctx.canvas;
  const lengths = strokes.map(st => st.reduce((sum, p, k) => (k ? sum + Math.hypot(p[0] - st[k - 1][0], p[1] - st[k - 1][1]) : 0), 0));
  const speed = canvas.getBoundingClientRect().height * 0.55; // pixels per second
  let strokeIndex = 0;
  let travelled = 0;
  let lastTime = null;
  const color = cssVar('--accent');

  function frame(time) {
    if (!trace || trace.demoId !== id) return;
    if (lastTime === null) lastTime = time;
    travelled += ((time - lastTime) / 1000) * speed;
    lastTime = time;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // strokes already finished
    drawStrokes(ctx, strokes.slice(0, strokeIndex), width * 0.55, color);
    // the stroke being drawn, up to the finger
    const stroke = strokes[strokeIndex];
    const goal = Math.max(lengths[strokeIndex], 1);
    const along = Math.min(travelled, goal);
    let finger = stroke[0];
    ctx.beginPath();
    ctx.moveTo(stroke[0][0], stroke[0][1]);
    let done = 0;
    for (let k = 1; k < stroke.length; k++) {
      const [x0, y0] = stroke[k - 1];
      const [x1, y1] = stroke[k];
      const seg = Math.hypot(x1 - x0, y1 - y0);
      if (done + seg >= along) {
        const t = seg ? (along - done) / seg : 1;
        finger = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
        ctx.lineTo(finger[0], finger[1]);
        break;
      }
      done += seg;
      ctx.lineTo(x1, y1);
      finger = [x1, y1];
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width * 0.55;
    ctx.strokeStyle = color;
    ctx.stroke();
    // the finger
    ctx.font = `${Math.round(width * 2.4)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('👆', finger[0] - width * 0.75, finger[1] - width * 0.2);

    if (travelled >= goal) {
      strokeIndex++;
      travelled = 0;
      if (strokeIndex >= strokes.length) {
        setTimeout(() => { if (trace && trace.demoId === id) stopDemo(); }, 700);
        return;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function stopDemo() {
  if (!trace || !trace.demo) return;
  trace.demoId++;
  const canvas = trace.demo.canvas;
  trace.demo.save();
  trace.demo.setTransform(1, 0, 0, 1, 0, 0);
  trace.demo.clearRect(0, 0, canvas.width, canvas.height);
  trace.demo.restore();
}

// How well the drawing fits the letter:
//   cover   = share of the middle of the grey line that was drawn over
//   outside = share of the drawing that is off the grey line (with some leeway)
function scoreTrace() {
  const { strokes, width } = trace.layout;
  const box = trace.ink.getBoundingClientRect();
  const k = 0.5; // check at half size: fast enough on any phone
  const w = Math.max(1, Math.round(box.width * k));
  const h = Math.max(1, Math.round(box.height * k));
  const mask = lineWidth => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.scale(k, k);
    drawStrokes(ctx, strokes, lineWidth, '#000');
    return ctx.getImageData(0, 0, w, h).data;
  };
  const mask1 = (stroke, lineWidth) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.scale(k, k);
    drawStrokes(ctx, [stroke], lineWidth, '#000');
    return ctx.getImageData(0, 0, w, h).data;
  };
  const middle = mask(width * 0.5);
  const allowed = mask(width * 2);
  const perStroke = strokes.map(st => mask1(st, width * 0.5));
  const inkCanvas = document.createElement('canvas');
  inkCanvas.width = w;
  inkCanvas.height = h;
  const inkCtx = inkCanvas.getContext('2d');
  inkCtx.drawImage(trace.ink, 0, 0, w, h);
  const ink = inkCtx.getImageData(0, 0, w, h).data;

  let middleAll = 0, middleHit = 0, inkAll = 0, inkOut = 0;
  const strokeAll = strokes.map(() => 0);
  const strokeHit = strokes.map(() => 0);
  for (let i = 3; i < ink.length; i += 4) {
    const drawn = ink[i] > 60;
    if (middle[i] > 128) {
      middleAll++;
      if (drawn) middleHit++;
    }
    perStroke.forEach((m, s) => {
      if (m[i] > 128) {
        strokeAll[s]++;
        if (drawn) strokeHit[s]++;
      }
    });
    if (drawn) {
      inkAll++;
      if (allowed[i] < 128) inkOut++;
    }
  }
  return {
    cover: middleAll ? middleHit / middleAll : 0,
    weakest: Math.min(...strokeAll.map((n, s) => (n ? strokeHit[s] / n : 1))), // the least covered stroke
    outside: inkAll ? inkOut / inkAll : 0,
  };
}

const TRACE_EACH = 0.5; // every single stroke must be at least this much covered
const traceGood = s => s.cover >= TRACE_COVER && s.weakest >= TRACE_EACH && s.outside <= TRACE_OUTSIDE;

function traceCheck() {
  if (!trace || trace.done) return;
  if (!trace.layout) return traceNextLetter(); // letter without stroke shapes: not checked

  if (!trace.inked) {
    traceMessage(T.traceEmpty);
    return playDemo();
  }
  const score = scoreTrace();
  const { outside } = score;
  const good = traceGood(score);
  trace.tries++;
  if (trace.tries === 1) {
    lesson.total++;
    if (good) lesson.right++;
  }
  if (good) {
    trace.done = true;
    soundRight();
    traceMessage(T.traceGood, 'good');
    $app.querySelector('.trace-wrap').classList.add('good');
    const here = lesson;
    const step = lesson.step;
    setTimeout(() => { if (stillHere(here, step)) traceNextLetter(); }, 1000);
    return;
  }
  soundWrong();
  traceMessage(outside > TRACE_OUTSIDE ? T.traceOutside : T.traceCover, 'bad');
  if (trace.tries >= TRACE_TRIES) {
    // Don't get stuck: the check button now moves on.
    const btn = $app.querySelector('[data-action="traceCheck"]');
    btn.dataset.action = 'traceSkip';
    btn.innerHTML = icon('right');
  }
  setTimeout(() => {
    if (!trace || trace.done) return;
    clearInk();
    playDemo();
  }, 1300);
}

function traceNextLetter() {
  if (!lesson.part) {
    lesson.part = 1; // now the small letter
    return renderTrace();
  }
  if (lesson.pos < LEVEL_DATA[lesson.level].letters.length - 1) {
    lesson.pos++;
    lesson.part = 0;
    return renderTrace();
  }
  nextStep();
}

/* Steps 3 and 6: hear something, tap it ("find" letters, "readquiz" syllables & words) */

// Letters that were missed recently, or not practised much yet, come up more often.
function letterWeight(l) {
  const r = recentResults(l);
  return 1 + r.filter(x => !x).length * 1.5 + (r.length < 3 ? 1 : 0);
}

function pickWeighted(items, weightOf) {
  const weights = items.map(weightOf);
  let x = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x <= 0) return items[i];
  }
  return items[items.length - 1];
}

function makeFindQuiz(i) {
  const pool = lettersUpTo(i);
  const quiz = {
    kind: 'letter',
    pool,
    focus: LEVEL_DATA[i].letters,                               // about half the questions
    extras: lettersAfter(i, pool),                              // wrong choices while few letters are known
    length: LEVEL_DATA[i].find || Math.min(FIND_LENGTH, Math.max(4, pool.length * 3)),
    options: Math.min(MAX_OPTIONS, pool.length + 2),            // most choices (MAX_OPTIONS = 3)
    grow: true,                                                 // start with 2 choices, one more each question
    newFirst: LEVEL_DATA[i].practice ? 0 : 2,                   // the first 2 questions ask the new letter
    weight: letterWeight,
    results: [],
    last: null,
    q: null,
  };
  nextQuestion(quiz);
  return quiz;
}

function makeReadQuiz(i) {
  const pool = LEVEL_DATA[i].items;
  const earlier = [];
  for (let k = i - 1; k >= 0; k--) {
    for (const t of LEVEL_DATA[k].items) if (!pool.includes(t) && !earlier.includes(t)) earlier.push(t);
  }
  const quiz = {
    kind: 'text',
    pool,
    focus: pool,
    extras: earlier,
    length: Math.min(6, Math.max(3, pool.length * 2)),
    options: Math.min(2, pool.length + earlier.length), // syllables and words: always 2 choices
    weight: () => 1,
    results: [],
    last: null,
    q: null,
  };
  nextQuestion(quiz);
  return quiz;
}

function nextQuestion(quiz) {
  const earlier = quiz.pool.filter(x => !quiz.focus.includes(x));
  const askNew = quiz.results.length < (quiz.newFirst || 0);
  let candidates = !askNew && earlier.length && Math.random() < 0.5 ? earlier : quiz.focus;
  if (candidates.length > 1) candidates = candidates.filter(x => x !== quiz.last);
  const target = pickWeighted(candidates, quiz.weight);

  const count = quiz.grow ? Math.min(quiz.options, 2 + quiz.results.length) : quiz.options;
  const need = count - 1;
  let others = shuffle(quiz.pool.filter(x => x !== target)).slice(0, need);
  if (others.length < need) others = others.concat(quiz.extras.slice(0, need - others.length));

  quiz.q = {
    target,
    options: shuffle([target, ...others]),
    upper: Math.random() < 0.5, // letters: show big or small letters this time
    firstTry: true,
    wrong: [],
    done: false,
  };
  quiz.last = target;
}

function optionText(quiz, item) {
  if (quiz.kind === 'text') return item;
  return quiz.q.upper ? item.upper : item.lower;
}

function playQuestion(quiz) {
  const t = quiz.q.target;
  if (quiz.kind === 'text') playText(t);
  else playLetter(t);
}

function renderChoice(quiz) {
  const q = quiz.q;
  const cols = q.options.length === 3 ? 3 : 2;
  const options = q.options.map((item, i) => {
    const wrong = q.wrong.includes(i);
    const correct = q.done && item === q.target;
    return `<button class="option${quiz.kind === 'text' ? ' text' : ''}${wrong ? ' wrong' : ''}${correct ? ' correct' : ''}" data-action="answer" data-value="${i}"${wrong ? ' disabled' : ''}>${optionText(quiz, item)}</button>`;
  }).join('');
  let dots = '';
  for (let k = 0; k < quiz.length; k++) {
    const r = quiz.results[k];
    dots += `<i class="${r === true ? 'ok' : r === false ? 'retry' : k === quiz.results.length ? 'now' : ''}"></i>`;
  }

  $app.innerHTML = `
    ${levelTopBar()}
    <div class="quiz">
      <div class="dots">${dots}</div>
      <button class="listen-btn" data-action="listen" aria-label="${T.listen}">${icon('volume')}</button>
      <div class="options" style="--cols:${cols}">${options}</div>
    </div>`;
}

const currentQuiz = () => (stepName() === 'find' ? lesson.find : lesson.rq);
const stillHere = (l, step) => lesson === l && l.step === step && currentPath() === '/level/' + l.level;

function answer(i, button) {
  const quiz = currentQuiz();
  const q = quiz.q;
  if (q.done) return;
  stopSound();
  const here = lesson;
  const step = lesson.step;

  if (q.options[i] === q.target) {
    q.done = true;
    button.classList.add('correct');
    soundRight();
    if (quiz.kind === 'letter') {
      const r = progress.results[q.target.lower] || [];
      r.push(q.firstTry ? 1 : 0);
      progress.results[q.target.lower] = r.slice(-10);
      saveProgress();
    }
    quiz.results.push(q.firstTry);
    lesson.total++;
    if (q.firstTry) lesson.right++;

    setTimeout(() => {
      if (!stillHere(here, step)) return;
      if (quiz.results.length >= quiz.length) return nextStep();
      nextQuestion(quiz);
      renderChoice(quiz);
      playQuestion(quiz);
    }, 1100);
  } else {
    q.firstTry = false;
    q.wrong.push(i);
    button.classList.add('wrong', 'shake');
    button.disabled = true;
    soundWrong();
    setTimeout(() => {
      if (stillHere(here, step) && quiz.q === q) playQuestion(quiz);
    }, 500);
  }
}

/* Step 4: pair each big letter with its small letter */
function makePair(i) {
  const pool = lettersUpTo(i);
  const fresh = LEVEL_DATA[i].letters;
  const count = i < 3 ? 2 : 3; // levels 1–3: 2 pairs, from level 4: 3 pairs
  let chosen = [...fresh, ...shuffle(pool.filter(l => !fresh.includes(l)))].slice(0, count);
  if (chosen.length < count) chosen = chosen.concat(lettersAfter(i, pool).slice(0, count - chosen.length));
  return { left: shuffle(chosen), right: shuffle(chosen), matched: [], missed: [], sel: null };
}

function renderPair() {
  const p = lesson.pair;
  const cell = (l, side) => {
    const matched = p.matched.includes(l);
    const selected = p.sel && p.sel.side === side && p.sel.l === l;
    return `<button class="pair-btn${matched ? ' correct' : ''}${selected ? ' selected' : ''}" data-action="pick" data-value="${side}:${l.lower}"${matched ? ' disabled' : ''}>${side === 'L' ? l.upper : l.lower}</button>`;
  };
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="pair">
      <div class="pair-col">${p.left.map(l => cell(l, 'L')).join('')}</div>
      <div class="pair-col">${p.right.map(l => cell(l, 'R')).join('')}</div>
    </div>`;
}

function pick(value, button) {
  const p = lesson.pair;
  const [side, lower] = value.split(':');
  const l = BY_LOWER.get(lower);
  playLetter(l);
  if (!p.sel || p.sel.side === side) {
    p.sel = { side, l };
    return renderPair();
  }
  if (p.sel.l === l) {
    p.matched.push(l);
    lesson.total++;
    if (!p.missed.includes(l)) lesson.right++;
    p.sel = null;
    soundRight();
    renderPair();
    if (p.matched.length === p.left.length) {
      const here = lesson;
      const step = lesson.step;
      setTimeout(() => { if (stillHere(here, step)) nextStep(); }, 900);
    }
  } else {
    if (!p.missed.includes(p.sel.l)) p.missed.push(p.sel.l);
    p.sel = null;
    soundWrong();
    renderPair();
    const again = $app.querySelector(`[data-value="${value}"]`);
    if (again) again.classList.add('shake');
  }
}

/* Step 5: read and hear syllables and words */
function renderRead() {
  const level = LEVEL_DATA[lesson.level];
  const tiles = list => list.map(t => `<button class="read-btn" data-action="readItem" data-value="${t}">${t}</button>`).join('');
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      ${level.syllables.length ? `<h2 class="section">${T.syllables}</h2><div class="read-grid">${tiles(level.syllables)}</div>` : ''}
      ${level.words.length ? `<h2 class="section">${T.words}</h2><div class="read-grid">${tiles(level.words)}</div>` : ''}
      <div class="nav-row">
        <button class="nav-btn primary" data-action="nextStep" aria-label="${T.next}">${icon('right')}</button>
      </div>
    </div>`;
}

/* Result */
function finishLevel() {
  lesson.passed = lesson.total > 0 && lesson.right / lesson.total >= PASS_RATIO;
  if (lesson.passed) {
    progress.done[levelKey(lesson.level)] = true;
    saveProgress();
    soundPassed();
  }
}

function renderResult() {
  const isLast = lesson.level === LEVEL_DATA.length - 1;
  const emoji = lesson.passed ? (isLast ? '🏆' : '🎉') : '💪';
  const toLevels = `<button class="btn" data-action="up" data-value="/levels" aria-label="${T.levels}">${icon('steps')}</button>`;
  let buttons;
  if (!lesson.passed) {
    buttons = `${toLevels}<button class="btn primary" data-action="retry">${icon('refresh')}<span>${T.again}</span></button>`;
  } else if (!isLast) {
    buttons = `${toLevels}<button class="btn primary" data-action="nextLevel"><span>${T.nextLevel}</span>${icon('right')}</button>`;
  } else {
    buttons = `<button class="btn primary" data-action="up" data-value="/levels">${icon('steps')}<span>${T.levels}</span></button>`;
  }
  $app.innerHTML = `
    ${topBar({ left: backButton('/levels'), center: `<div class="level-label"><span>${T.level(lesson.level + 1)}</span></div>` })}
    <div class="results">
      <div class="emoji">${emoji}</div>
      <div class="score">${lesson.right} / ${lesson.total}</div>
      <div class="btn-row">${buttons}</div>
    </div>`;
}

/* ---------- Settings ---------- */
function allSoundKeys() {
  const keys = new Set();
  LETTERS.forEach(l => {
    keys.add(letterKey(l));
    if (l.word) keys.add(textKey(l.word));
  });
  LEVEL_DATA.forEach(level => level.items.forEach(t => keys.add(textKey(t))));
  return keys;
}

function renderSettings() {
  if (hasSpeech && !roVoice) findVoice();
  const voiceText = !hasSpeech ? T.voiceUnsupported : roVoice ? T.voiceFound(roVoice.name) : T.voiceMissing;
  const keys = allSoundKeys();
  const recorded = [...keys].filter(k => audioFiles.has(k)).length;

  $app.innerHTML = `
    ${topBar({ left: backButton('/'), title: T.settings })}
    <div class="settings">
      <section>
        <h2>${T.levels}</h2>
        <p>${T.levelsHelp(doneCount(), LEVEL_DATA.length)}</p>
        <div class="switch-row"><span>${T.unlockAll}</span><button class="switch${settings.unlockAll ? ' on' : ''}" data-action="toggleUnlock" role="switch" aria-checked="${settings.unlockAll}" aria-label="${T.unlockAll}"></button></div>
        <button class="text-btn danger" data-action="resetProgress">${icon('refresh')}${T.resetProgress}</button>
      </section>
      <section>
        <h2>${T.recordings}</h2>
        <p>${T.recordingsHelp(recorded, keys.size)}</p>
        <button class="text-btn" data-action="go" data-value="/inregistrare">${icon('mic')}${T.openRecorder}</button>
      </section>
      <section>
        <h2>${T.voice}</h2>
        <p>${voiceText}</p>
        ${hasSpeech ? `<button class="text-btn" data-action="testVoice">${icon('volume')}${T.test}</button>` : ''}
      </section>
      <p class="version">Bibcit 0.3</p>
    </div>`;
}

/* ---------- Recording page (on the laptop, with server.py) ---------- */
let serverOk = null;
let recorder = null; // { key, mr, timer }
let saving = null;   // key being saved

async function checkServer() {
  try {
    const res = await fetch('api/status', { cache: 'no-store' });
    serverOk = res.ok;
  } catch { serverOk = false; }
}

// A letter's sound, followed by its example word (if it has one).
function letterRows(l) {
  const rows = [{ key: letterKey(l), text: pairText(l), note: T.recLetter }];
  if (l.word) rows.push({ key: textKey(l.word), text: `${l.pic} ${l.word}`, note: T.recExample });
  return rows;
}

function recorderRows() {
  const sections = [];
  const inLevels = new Set();
  LEVEL_DATA.forEach((level, i) => {
    const rows = [];
    level.letters.forEach(l => {
      inLevels.add(l);
      rows.push(...letterRows(l));
    });
    level.items.forEach(t => rows.push({ key: textKey(t), text: t }));
    sections.push({ title: T.level(i + 1), rows });
  });
  const others = LETTERS.filter(l => !inLevels.has(l)).flatMap(letterRows);
  if (others.length) sections.push({ title: T.otherLetters, rows: others });
  return sections;
}

function renderRecorder() {
  if (serverOk === null) {
    checkServer().then(() => { if (currentPath() === '/inregistrare') renderRecorder(); });
  }
  let body;
  if (!serverOk) {
    body = `<section><p>${serverOk === null ? '…' : T.recorderNoServer}</p></section>`;
  } else {
    const seen = new Set();
    body = `<section><p>${T.recorderHelp}</p></section>` + recorderRows().map(sec => {
      const rows = sec.rows.filter(r => !seen.has(r.key) && seen.add(r.key)).map(r => {
        const has = audioFiles.has(r.key);
        const isRec = recorder && recorder.key === r.key;
        const busy = saving === r.key;
        return `<div class="rec-item">
          <span class="rec-status">${has ? icon('check') : ''}</span>
          <span class="rec-text">${r.text}${r.note ? `<small>${r.note}</small>` : ''}</span>
          ${has && !isRec ? `<button class="rec-btn icon-only" data-action="playRec" data-value="${r.key}" aria-label="Play">${icon('play')}</button>` : ''}
          <button class="rec-btn${isRec ? ' recording' : ''}" data-action="rec" data-value="${r.key}"${busy ? ' disabled' : ''}>${isRec ? icon('stop') + `<span class="lbl">${T.stop}</span>` : icon('mic') + `<span class="lbl">${T.record}</span>`}</button>
        </div>`;
      }).join('');
      return rows ? `<section><h2>${sec.title}</h2>${rows}</section>` : '';
    }).join('');
  }
  $app.innerHTML = `
    ${topBar({ left: backButton('/settings'), title: T.recordings })}
    <div class="settings recorder">${body}</div>`;
}

async function toggleRecording(key) {
  if (recorder) {
    const wasKey = recorder.key;
    stopRecording();
    if (wasKey === key) return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) return toast(T.micError);
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return toast(T.micError);
  }
  stopSound();
  const mr = new MediaRecorder(stream);
  const chunks = [];
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    saving = key;
    renderRecorder();
    try {
      const wav = await toWav(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
      const res = await fetch('api/audio/' + key, { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: wav });
      if (!res.ok) throw new Error(res.status);
      audioFiles.add(key);
      audioVersion = Date.now();
      playKey(key, '', true); // play it back so you can check it
    } catch {
      toast(T.saveError);
    }
    saving = null;
    if (currentPath() === '/inregistrare') renderRecorder();
  };
  recorder = { key, mr, timer: setTimeout(stopRecording, MAX_REC_SECONDS * 1000) };
  mr.start();
  renderRecorder();
}

function stopRecording() {
  if (!recorder) return;
  const { mr, timer } = recorder;
  recorder = null;
  clearTimeout(timer);
  if (mr.state !== 'inactive') mr.stop(); // saving happens in mr.onstop
}

// Turns a recording into a small WAV file (plays on every phone):
// silence at the start and end is cut off and the volume is evened out.
async function toWav(blob) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close && ctx.close();
  const data = buffer.getChannelData(0);
  const rate = buffer.sampleRate;

  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  const threshold = Math.max(0.01, peak * 0.08);
  let start = 0;
  let end = data.length - 1;
  while (start < end && Math.abs(data[start]) < threshold) start++;
  while (end > start && Math.abs(data[end]) < threshold) end--;
  start = Math.max(0, start - Math.floor(rate * 0.08));
  end = Math.min(data.length - 1, end + Math.floor(rate * 0.15));

  const outRate = 22050;
  const step = rate / outRate;
  const count = Math.max(1, Math.floor((end - start) / step));
  const gain = peak > 0 ? 0.9 / peak : 1;
  const out = new DataView(new ArrayBuffer(44 + count * 2));
  const text = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  text(0, 'RIFF'); out.setUint32(4, 36 + count * 2, true); text(8, 'WAVEfmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, outRate, true); out.setUint32(28, outRate * 2, true);
  out.setUint16(32, 2, true); out.setUint16(34, 16, true); text(36, 'data'); out.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const v = Math.max(-1, Math.min(1, data[start + Math.floor(i * step)] * gain));
    out.setInt16(44 + i * 2, v * 32767, true);
  }
  return new Blob([out.buffer], { type: 'audio/wav' });
}

/* ---------- Taps ---------- */
const actions = {
  go: path => navigate(path),
  up: parent => goUp(parent),

  // alphabet
  openLetter(value) {
    navigate('/letter/' + value);
    playLetter(LETTERS[+value]);
  },
  prevLetter: () => showLetter(letterIndex - 1),
  nextLetter: () => showLetter(letterIndex + 1),
  playLetter: value => playLetter(LETTERS[+value]),
  playExample: value => playText(LETTERS[+value].word),

  // levels
  openLevel(value, button) {
    const i = +value;
    if (!isOpen(i)) {
      button.classList.remove('shake');
      void button.offsetWidth; // restart the animation
      button.classList.add('shake');
      return toast(T.locked(i));
    }
    startLesson(i);
    navigate('/level/' + i);
  },
  playShown: () => playLetter(LEVEL_DATA[lesson.level].letters[lesson.pos]),
  learnPrev() {
    lesson.pos--;
    renderLearn();
    playStepStart();
  },
  learnNext() {
    if (lesson.pos < LEVEL_DATA[lesson.level].letters.length - 1) {
      lesson.pos++;
      renderLearn();
      return playStepStart();
    }
    nextStep();
  },
  traceClear() {
    stopDemo();
    clearInk();
    traceMessage(trace.layout ? T.traceStart : '');
  },
  traceDemo() {
    clearInk();
    traceMessage(T.traceStart);
    playDemo();
  },
  traceCheck: () => traceCheck(),
  traceSkip: () => traceNextLetter(),
  listen: () => playQuestion(currentQuiz()),
  answer: (value, button) => answer(+value, button),
  pick: (value, button) => pick(value, button),
  readItem: value => playText(value),
  nextStep: () => nextStep(),
  retry() {
    // Do the exercises again (without learning and tracing again).
    lesson.step = lesson.steps.indexOf('find') - 1;
    lesson.right = 0;
    lesson.total = 0;
    nextStep();
  },
  nextLevel() {
    const i = lesson.level + 1;
    startLesson(i);
    navigate('/level/' + i, { replace: true });
  },

  // settings
  toggleUnlock() {
    settings.unlockAll = !settings.unlockAll;
    saveSettings();
    renderSettings();
  },
  resetProgress() {
    if (!confirm(T.resetConfirm)) return;
    progress = { done: {}, results: {} };
    saveProgress();
    lesson = null;
    renderSettings();
  },
  testVoice: () => { stopSound(); speak(T.voiceTest); },

  // recording page
  rec: key => toggleRecording(key),
  playRec: key => playKey(key, '', true),
};

$app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el.dataset.value, el);
});

/* ---------- Start ---------- */
loadAudioIndex().finally(() => render(true));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
