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
const MAX_OPTIONS = 4;      // most letters to choose from (first 2, then 3, then 4)
const PASS_RATIO = { 1: 0.8, 2: 0.85, 3: 0.9 }; // right on the first try needed to pass: ⭐ 80%, ⭐⭐ 85%, ⭐⭐⭐ 90%
const FIND_BY_STARS = { 1: 4, 2: 5, 3: 6 };      // "find the letter" questions (choices 2, 2, 3, 3, 4, 4), unless a level sets its own
const READQUIZ_BY_STARS = { 1: 4, 2: 5, 3: 6 };  // "find the syllable / word" questions, unless a level sets its own
const PRACTICE_LENGTH = 16; // tasks in "Exersează" (tracing + letters by sound + syllables/words)
const PRACTICE_TRACE = 3;   // of which tracing (3 different letters, big or small)
const PRACTICE_TEXT = 7;    // and syllables / words (when enough are learned)
const MAX_NEW_ITEMS = 2;    // most new syllables + words in one level (more gives a warning in the console)
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
  syllables: 'Silabe',
  words: 'Cuvinte',
  locked: name => `Mai întâi trebuie trecut nivelul ${name}. (Toate nivelurile se pot deschide din Setări.)`,
  settings: 'Setări',
  levelsHelp: (done, total) => `${done} din ${total} niveluri trecute. Fiecare literă are până la 3 niveluri: ⭐ introducere, ⭐⭐ exerciții, ⭐⭐⭐ (în plus). Un nivel ⭐ este trecut cu 80% răspunsuri corecte din prima încercare, ⭐⭐ cu 85%, ⭐⭐⭐ cu 90%. Litera următoare se deschide după ⭐⭐.`,
  unlockAll: 'Deschide toate nivelurile',
  testMode: 'Mod de testare: butoane ◀ ▶ pentru a sări între exerciții',
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
  recorderHelp: 'Apasă ● și vorbește, apoi apasă ■ (se oprește singur după 4 secunde; instrucțiunile după 8). Pentru litere spune sunetul („mmm”, „sss”), nu numele literei („me”, „se”). Înregistrarea se aude imediat, ca s-o poți verifica. Dacă nu-ți place, înregistreaz-o din nou.',
  recLetter: 'sunetul literei',
  recExample: 'cuvânt exemplu',
  recSplit: 'silabă din cuvântul despărțit',
  otherLetters: 'Alte litere (pentru alfabet)',
  instructions: 'Instrucțiuni (vocea ta)',
  practice: 'Exersează',
  comingSoon: 'Litere noi în curând',
  newRibbon: 'NOU',
  theme: 'Aspect',
  themeLight: 'Luminos',
  themeDark: 'Întunecat',
  themeAuto: 'Automat',
  difficulty: 'dificultate',
  practiceLocked: 'Exersarea se deschide după primul nivel trecut.',
  overview: 'Prezentare niveluri',
  openOverview: 'Prezentarea nivelurilor',
  overviewHelp: (n, total) => `${n} niveluri, ${total} sarcini în total. Litera nivelului este roșie. Procentul arată cât trebuie să fie corect din prima încercare.`,
  ovLearn: 'Prezentarea literei',
  ovTrace: 'Scrie litera',
  ovFind: 'Găsește litera după sunet',
  ovAllNew: l => `toate cu ${l} · 2, 2, 3, 3, 4, 4 variante`,
  ovSomeNew: (n, l) => `${n} cu ${l}, restul litere învățate · 2, 2, 3, 3, 4, 4 variante`,
  ovPair: 'Perechi: literă mare – mică',
  ovAnyLetters: 'orice litere învățate',
  ovLearnPage: n => `pagină de învățare (${n} ${n === 1 ? 'nouă' : 'noi'}), nu se punctează`,
  ovPairs: n => `${n} perechi, o singură sarcină`,
  ovRead: 'Ascultă silabe și cuvinte noi',
  ovQuiz: 'Găsește silaba / cuvântul',
  ovChoices: n => `${n} variante`,
  ovAllSoFar: 'din tot ce s-a învățat',
  ovMatch: 'Perechi: imagine – cuvânt',
  ovNoNew: 'fără silabe sau cuvinte noi',
  ovTotal: 'Total sarcini',
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
  top: '<polyline points="18 15 12 9 6 15"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  steps: '<polyline points="3 20 8 20 8 15 13 15 13 10 18 10 18 5 21 5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  cross: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
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

const settings = Object.assign({ unlockAll: false, testMode: false, theme: 'auto' }, store.get('bibcit.settings', {}));

// Light / dark mode: 'light', 'dark', or 'auto' (follow the phone).
function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'light' || settings.theme === 'dark') root.dataset.theme = settings.theme;
  else delete root.dataset.theme;
  // the phone's status bar colour follows the page
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
    if (settings.theme === 'auto') m.setAttribute('content', m.media.includes('dark') ? '#15171A' : '#F7F4EE');
    else m.setAttribute('content', bg);
  });
}
applyTheme();
let progress = Object.assign({ done: {}, results: {} }, store.get('bibcit.progress', {}));

const saveSettings = () => store.set('bibcit.settings', settings);
const saveProgress = () => store.set('bibcit.progress', progress);

const recentResults = l => (progress.results[l.lower] || []).slice(-5);
// How well a letter is known, from its last 5 answers in "find the letter by sound"
// (1 = asked and tapped right on the first try; 0 = asked but needed more tries, or tapped by mistake):
//   0 not practised yet · 1 learning (under 60% right) · 2 almost (60–79%) · 3 known (80%+, at least 4 answers)
function letterKnowledge(l) {
  const r = recentResults(l);
  if (!r.length) return 0;
  const ratio = r.filter(Boolean).length / r.length;
  if (ratio >= 0.8 && r.length >= 4) return 3;
  return ratio >= 0.6 ? 2 : 1;
}

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
  if (syllables.length + words.length > MAX_NEW_ITEMS) console.warn(`letters.js: level ${level.letters} ${'⭐'.repeat(level.stars || 1)} has more than ${MAX_NEW_ITEMS} new syllables/words`);
  return {
    letters,
    syllables,
    words,
    items: [...new Set([...syllables, ...words])],
    stars: Math.min(3, Math.max(1, level.stars || (level.practice ? 2 : 1))),
    find: level.find,
    choices: level.choices,
    quiz: level.quiz,
  };
}).filter(level => level.letters.length);

// Saved progress uses e.g. "m", "m+" (⭐⭐), "m++" (⭐⭐⭐).
const levelKey = i => LEVEL_DATA[i].letters.map(l => l.lower).join(' ') + '+'.repeat(LEVEL_DATA[i].stars - 1);
const stars = i => '⭐'.repeat(LEVEL_DATA[i].stars);
const levelName = i => `${levelText(i)} ${stars(i)}`;           // e.g. "Mm ⭐⭐"
const passRatio = i => PASS_RATIO[LEVEL_DATA[i].stars];
// How a level is shown on its tile: "Mm", or "Mm+" for the practice level.
const levelText = i => LEVEL_DATA[i].letters.map(pairText).join(' ');
const isDone = i => !!progress.done[levelKey(i)];
// The level that must be passed before level i opens (-1: none).
//   ⭐⭐ / ⭐⭐⭐: the level of the same letter with one star less.
//   ⭐ of a new letter: the previous letter's ⭐⭐ (or its ⭐ if it has no ⭐⭐).
function requiredLevel(i) {
  if (i === 0) return -1;
  if (LEVEL_DATA[i].stars > 1) return i - 1;
  let k = i - 1;
  while (k > 0 && LEVEL_DATA[k].stars > 2) k--;   // skip the previous letter's ⭐⭐⭐ (it is extra)
  return k;
}
const isOpen = i => settings.unlockAll || isDone(i) || requiredLevel(i) === -1 || isDone(requiredLevel(i));
const doneCount = () => LEVEL_DATA.filter((_, i) => isDone(i)).length;
// The level to do next: the first open one not passed yet (⭐⭐⭐ levels only when nothing else is left).
function nextLevel() {
  const todo = LEVEL_DATA.map((_, i) => i).filter(i => isOpen(i) && !isDone(i));
  const main = todo.find(i => LEVEL_DATA[i].stars < 3);
  return main ?? todo[0] ?? -1;
}
// How many different letters come before this level's letter (0 for i, 1 for s, …).
function letterRank(i) {
  const seen = [];
  for (let k = 0; k <= i; k++) LEVEL_DATA[k].letters.forEach(l => { if (!seen.includes(l)) seen.push(l); });
  return seen.indexOf(LEVEL_DATA[i].letters[0]);
}

// The levels grouped by letter: ⭐, ⭐⭐, ⭐⭐⭐ of the same letter belong together.
function letterGroups() {
  const groups = [];
  LEVEL_DATA.forEach((level, i) => {
    const last = groups[groups.length - 1];
    if (level.stars > 1 && last && LEVEL_DATA[last.levels[0]].letters.join() === level.letters.join()) last.levels.push(i);
    else groups.push({ levels: [i] });
  });
  return groups;
}

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

// Splits a word into syllables, the simple way: a consonant between two vowels starts
// a new syllable (ma-ma, A-na, I-sus, Ma-nu); of two consonants, the second one does.
// Vowels next to each other stay together (sau, mii, ia).
const isVowel = ch => 'aeiouăâî'.includes(ch.toLocaleLowerCase('ro'));
function syllablesOf(word) {
  const byHand = typeof SYLLABLE_SPLIT === 'object' && SYLLABLE_SPLIT[word];
  if (byHand) return byHand.split('-');
  const ch = [...word];
  const out = [];
  let cur = '';
  ch.forEach((c, k) => {
    cur += c;
    const next = ch[k + 1];
    const after = ch[k + 2];
    if (!next || !after || isVowel(next) || !isVowel(after)) return; // only before consonant + vowel
    // ma | ma (vowel, then consonant + vowel), ar | bo (vowel + consonant, then consonant + vowel)
    if (isVowel(c) || (k > 0 && isVowel(ch[k - 1]))) { out.push(cur); cur = ''; }
  });
  out.push(cur);
  return out;
}

// What a syllable or word is built from when it is presented:
// its letters (nu → n + u), or its syllables when it has more than one (Manu → Ma + nu).
function presentParts(text) {
  const syl = syllablesOf(text);
  return syl.length > 1 ? syl : [...text];
}
// The sound of one part: a letter's sound, or a syllable's.
function partSound(part) {
  if ([...part].length > 1) return { key: textKey(part), text: part };
  const l = BY_LOWER.get(part.toLocaleLowerCase('ro'));
  return l ? { key: letterKey(l), text: l.say } : null;
}
// Syllables that are needed only because a longer word is split (e.g. "ma" for "mama").
const splitSyllables = items => [...new Set(items.flatMap(t => presentParts(t).filter(p => [...p].length > 1)
  .map(p => p.toLocaleLowerCase('ro'))))].filter(p => !items.includes(p));

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
    if (typeof WORD_PICTURES === 'object') {
      setTimeout(() => Object.values(WORD_PICTURES).filter(p => /\.(svg|png|jpe?g|webp)$/i.test(p)).forEach(p => fetch(p).catch(() => {})), 3500);
    }
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

// Recordings are played through Web Audio. Once the first tap has switched it on,
// it can also play sounds a moment later (the next question, a repeat after a
// wrong answer) – phone browsers such as Brave block that for normal audio.
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

const buffers = new Map(); // key -> Promise<AudioBuffer>
function loadBuffer(key, fresh = false) {
  if (fresh) buffers.delete(key);
  if (!buffers.has(key)) {
    const url = audioUrl(key) + (fresh ? `?v=${audioVersion}` : '');
    const p = fetch(url)
      .then(res => { if (!res.ok) throw new Error(res.status); return res.arrayBuffer(); })
      .then(data => new Promise((resolve, reject) => getCtx().decodeAudioData(data, resolve, reject)));
    p.catch(() => buffers.delete(key));
    buffers.set(key, p);
  }
  return buffers.get(key);
}

// Load the sounds of a level in advance, so they play without delay.
function preloadSounds(keys) {
  if (!getCtx()) return;
  keys.filter(k => audioFiles.has(k)).forEach(k => loadBuffer(k).catch(() => {}));
}

let playToken = 0;
let currentSource = null;

// While a sound (or a row of sounds) is playing, the sound buttons can't be pressed again.
let soundEndsAt = 0;   // when the sound now playing ends (performance.now() time)
let holdToken = -1;    // a row of sounds in progress (instruction, then letter…)
const holdSound = token => { holdToken = token; };
const releaseSound = token => {
  if (holdToken !== token) return;
  holdToken = -1;
  soundEndsAt = Math.max(soundEndsAt, performance.now());
};
const SOUND_GAP = 500;  // ms to wait after a sound ends or is stopped (and after a press) before the next press
let lastSoundPress = 0;
// a sound (or a row of sounds) is playing right now
const soundPlaying = () => holdToken === playToken || performance.now() < soundEndsAt
  || (hasSpeech && speechSynthesis.speaking);
// too soon after the last sound, or the last press, to start a new one
const soundTooSoon = () => performance.now() < soundEndsAt + SOUND_GAP || performance.now() < lastSoundPress + SOUND_GAP;

function stopSound() {
  playToken++;
  soundEndsAt = 0;
  if (hasSpeech && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
  audioEl.pause();
}

function speak(text, delay = 0) {
  if (!hasSpeech || !text) return;
  if (!roVoice) findVoice();
  if (!roVoice) return; // a non-Romanian voice would teach the wrong sounds
  const say = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ro-RO';
    u.voice = roVoice;
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };
  if (delay) {
    const token = playToken;
    setTimeout(() => { if (token === playToken) say(); }, delay * 1000);
  } else {
    say();
  }
}

// Plays a recording (or the phone voice if there is none). delay in seconds.
function playKey(key, fallbackText, fresh = false, delay = 0) {
  stopSound();
  const token = playToken;
  if (!audioFiles.has(key)) return speak(fallbackText, delay);
  const ctx = getCtx();
  if (!ctx) {
    // very old browser: normal audio
    audioEl.src = audioUrl(key);
    soundEndsAt = performance.now() + 1500;
    return audioEl.play().catch(() => speak(fallbackText));
  }
  const when = ctx.currentTime + delay;
  soundEndsAt = performance.now() + delay * 1000 + 500; // until the recording is loaded
  loadBuffer(key, fresh).then(buffer => {
    if (token !== playToken) return; // something else was played meanwhile
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const start = Math.max(when, ctx.currentTime);
    source.start(start);
    soundEndsAt = performance.now() + (start - ctx.currentTime + buffer.duration) * 1000;
    currentSource = source;
  }).catch(() => { if (token === playToken) speak(fallbackText); });
}
const playLetter = (l, delay) => playKey(letterKey(l), l.say, false, delay);
const playText = (text, delay) => playKey(textKey(text), text, false, delay);

// Plays one sound and waits until it has finished (used to read a list aloud).
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function playAndWait(key, fallbackText, token) {
  const ctx = audioFiles.has(key) ? getCtx() : null;
  if (ctx) {
    try {
      const buffer = await loadBuffer(key);
      if (token !== playToken) return;
      await new Promise(resolve => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = resolve;
        currentSource = source;
        source.start();
        soundEndsAt = performance.now() + buffer.duration * 1000;
        setTimeout(resolve, buffer.duration * 1000 + 400); // in case "ended" never comes
      });
      return;
    } catch { /* fall back to the phone voice */ }
  }
  if (!roVoice) findVoice();
  if (hasSpeech && roVoice && fallbackText) {
    await new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(fallbackText);
      u.lang = 'ro-RO';
      u.voice = roVoice;
      u.rate = 0.8;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      setTimeout(resolve, 4000);
    });
    return;
  }
  await pause(700);
}

// Spoken instructions for the learner (record them on the recording page).
const VOICE = {
  pair: { key: 'V_pair', text: 'Formează perechi din litere mari și mici.' },
  trace: { key: 'V_trace', text: 'Scrie litera cu degetul, pe linia gri. Începe de la cifra unu.' },
  good: { key: 'V_good', text: 'Bravo!' },
  again: { key: 'V_again', text: 'Mai încearcă o dată.' },
  match: { key: 'V_match', text: 'Formează perechi din imagini și cuvinte.' },
  find: { key: 'V_find', text: 'Ascultă și apasă pe litera pe care o auzi.' },
  // short versions for ⭐⭐ and ⭐⭐⭐ levels (the learner knows the tasks by then)
  traceShort: { key: 'V_trace3', text: 'Scrie litera.' },
  findShort: { key: 'V_find3', text: 'Găsește litera.' },
  pairShort: { key: 'V_pair3', text: 'Formează perechi.' },
  practice: { key: 'V_practice', text: 'Exersează.' },  // said when Exersează starts
};
const playVoice = (name, delay) => playKey(VOICE[name].key, VOICE[name].text, false, delay);

// A sound button sends out soft waves when it is pressed, and also when its sound
// plays by itself (at the start of a task, or again after a wrong answer).
function rippleSound(b = $app.querySelector('.listen-btn:not(.demo)'), delay = 0) {
  if (!b) return;
  const start = () => {
    b.classList.remove('ripple');
    void b.offsetWidth; // restart the animation
    b.classList.add('ripple');
  };
  if (delay) setTimeout(start, delay * 1000); else start();
}
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.listen-btn:not(.demo)');
  if (b && !soundPlaying() && !soundTooSoon()) rippleSound(b);
});

// Phones only allow sound after a tap: switch sound on with the first tap.
document.addEventListener('click', () => {
  getCtx();
  audioEl.src = SILENT_WAV;
  audioEl.play().catch(() => {});
}, { once: true, capture: true });

// Short tones for right / wrong / level passed.
function tones(freqs, type, dur, vol) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    let t = ctx.currentTime;
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
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
           #/prezentare    overview of all levels (new words, number of tasks)
           #/exercitiu     practice: 12 mixed questions on everything learned so far
   The back button on a page goes to its parent page; the phone's own back
   button behaves the same way. */
// Version shown at the bottom of Setări: raise it together with CACHE in sw.js on each publish,
// so you can see on the phone which version is running.
const APP_VERSION = 15;
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

// Page turn: when the page changes, the old page slides out while the new one slides in,
// side by side like a turned page (from the right when going deeper, from the left going back).
const pageDepth = path => (path === '/' ? 0 : /^\/(letter|level)\/|^\/(prezentare|inregistrare)$/.test(path) ? 2 : 1);
let shownPath = null;
// where the page was scrolled to before it changed (the old copy keeps that position)
let pageScroll = 0;
window.addEventListener('scroll', () => { pageScroll = window.scrollY; }, { passive: true });
let turnAnims = [];
function pageTurn(dir) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!$app.animate) return; // very old browser: pages just change
  const back = dir === 'back';
  turnAnims.forEach(a => a.cancel());
  document.querySelectorAll('.page-old').forEach(el => el.remove());
  // a still copy of the old page slides out while the new page is drawn in $app
  const old = document.createElement('div');
  old.className = 'page-old';
  const copy = $app.cloneNode(true);
  copy.style.marginTop = -pageScroll + 'px';
  // drawings are not copied with the page: copy them over by hand
  const from = $app.querySelectorAll('canvas'), to = copy.querySelectorAll('canvas');
  to.forEach((c, k) => { try { c.getContext('2d').drawImage(from[k], 0, 0); } catch (e) {} });
  old.appendChild(copy);
  document.body.appendChild(old);
  pageScroll = 0;
  // Going deeper the new page comes in from the right (its left side first) and the old one leaves
  // to the left; going back the opposite. Both start together after a short wait (60 ms), so a
  // slower phone can draw the new page first. Played from here, not from style.css: on some phones
  // the new page's CSS animation did not run and it was only uncovered instead of sliding in.
  const side = back ? -1 : 1;
  const timing = { duration: 300, delay: 60, easing: 'cubic-bezier(.3,.6,.3,1)' };
  const outAnim = old.animate([{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${-side * 100}vw,0,0)` }],
    { ...timing, fill: 'both' });
  const inAnim = $app.animate([{ transform: `translate3d(${side * 100}vw,0,0)` }, { transform: 'translate3d(0,0,0)' }],
    { ...timing, fill: 'backwards' });
  turnAnims = [outAnim, inAnim];
  const end = () => { old.remove(); };
  outAnim.finished.then(end, end);
  setTimeout(() => { // also when animations never run (e.g. a hidden tab): end it anyway
    old.remove();
    if (inAnim.playState !== 'finished') inAnim.cancel();
  }, 1000);
}

// Position of an element in the page's layout, ignoring animations (getBoundingClientRect
// would give a moving, tilted position while the page turns).
function layoutLeft(el) {
  let x = 0;
  for (; el; el = el.offsetParent) x += el.offsetLeft;
  return x;
}

function render(entering = false) {
  const path = currentPath();
  if (shownPath !== null && path !== shownPath) pageTurn(pageDepth(path) < pageDepth(shownPath) ? 'back' : 'next');
  shownPath = path;
  let m;
  if (path === '/letters') renderAlphabet();
  else if ((m = path.match(/^\/letter\/(\d+)$/)) && LETTERS[+m[1]]) renderLetter(+m[1]);
  else if (path === '/levels') renderLevels();
  else if ((m = path.match(/^\/level\/(\d+)$/)) && LEVEL_DATA[+m[1]]) renderLevel(+m[1], entering);
  else if (path === '/settings') renderSettings();
  else if (path === '/inregistrare') renderRecorder();
  else if (path === '/prezentare') renderOverview();
  else if (path === '/exercitiu') renderPractice(entering);
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
const pairText = l => `${l.upper} ${l.lower}`; // "M m": a space between, never split over two lines

// The level's letter is shown in red inside syllables and words: always in ⭐ and ⭐⭐ levels;
// in ⭐⭐⭐ only where the new syllables and words are presented (not in the exercises).
function markLevelLetter(text, presenting = false) {
  if (!lesson || lesson.practice || (LEVEL_DATA[lesson.level].stars > 2 && !presenting)) return text;
  const letters = LEVEL_DATA[lesson.level].letters.map(l => l.lower);
  return [...text].map(ch => (letters.includes(ch.toLocaleLowerCase('ro')) ? `<mark>${ch}</mark>` : ch)).join('');
}

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
  const next = nextLevel();
  // One line of 4 letters around where you are: the 2 last learned, the one being learned (big),
  // and the next one. (Learned = the level that opens the next letter is passed.)
  const groups = letterGroups();
  const learned = g => isDone(g.levels.find(i => LEVEL_DATA[i].stars === 2) ?? g.levels[0]);
  const cur = groups.findIndex(g => !learned(g));
  // the letter being learned jumps on its red line (the letter and the line move separately)
  const cell = (g, cls) => `<span class="${cls}">${cls === 'now' ? `<span class="jump">${levelText(g.levels[0])}</span>` : levelText(g.levels[0])}</span>`;
  // Always 4 when there are enough letters: near the start more coming letters, near the end more learned ones.
  const SHOW = 4;
  const from = cur === -1 ? 0 : Math.max(0, Math.min(cur - 2, groups.length - SHOW));
  const miniMap = cur === -1
    ? groups.slice(-(SHOW - 1)).map(g => cell(g, 'before')).join('') + '<span class="now">🏆</span>'
    : groups.slice(from, from + SHOW).map((g, k) => cell(g, from + k < cur ? 'before' : from + k === cur ? 'now' : 'after')).join('');
  $app.innerHTML = `
    ${topBar({ title: 'Bibcit', right: iconButton('go', 'settings', T.settings, '/settings') })}
    <div class="home">
      <button class="home-card" data-action="go" data-value="/letters">
        <span class="art"><span class="glyphs abc">A&nbsp;a&ensp;B&nbsp;b&ensp;C&nbsp;c</span></span>
        <span class="label">${icon('grid')}<span>${T.alphabet}</span></span>
      </button>
      <button class="home-card levels-card" data-action="go" data-value="/levels">
        <span class="art"><span class="mini-map">${miniMap}</span></span>
        <span class="label">${icon('steps')}<span>${T.levels}</span></span>
      </button>
      <!-- Exersează: its symbol and its name (the name is also said aloud when it starts) -->
      <button class="home-card practice-card${done ? '' : ' locked'}" data-action="go" data-value="/exercitiu">
        <span class="flying" aria-hidden="true">${flyingBits()}</span>
        <span class="label"><span class="big" aria-hidden="true">🔁</span><span>${T.practice}</span></span>
      </button>
    </div>`;
}

/* ---------- Part 1: alphabet overview ---------- */
let letterIndex = 0;

function renderAlphabet() {
  const tiles = LETTERS.map((l, i) => {
    const k = letterKnowledge(l); // shown as 3 small dots: ●○○ learning, ●●○ almost, ●●● known
    return `<button class="tile" data-action="openLetter" data-value="${i}" aria-label="${l.upper}">
      ${glyphs(l)}
      ${k ? `<span class="know" aria-hidden="true">${[1, 2, 3].map(n => `<i${n <= k ? ' class="on"' : ''}></i>`).join('')}</span>` : ''}
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

/* ---------- Part 2: levels ----------
   One row per letter: the letter's box shows one star per sublevel (most letters 3,
   Ii 1, Ss 2) – golden for the sublevels passed, shadowy for the rest. Tapping the box shows its sublevels ⭐ / ⭐⭐ / ⭐⭐⭐
   to its right (grey stars until passed, then golden); tapping again hides them. */
let openGroup = -1; // the letter whose sublevels are shown (-1: none)

function renderLevels() {
  const next = nextLevel();
  const row = (g, k) => {
    const earned = g.levels.filter(isDone).length;
    const open = isOpen(g.levels[0]);
    const shown = k === openGroup;
    const state = (!open ? ' locked' : g.levels.includes(next) ? ' current' : '') + (shown ? ' open' : '');
    const mark = !open ? icon('lock')
      : g.levels.map((_, n) => `<i class="${n < earned ? 'gold' : ''}">⭐</i>`).join(''); // one star per sublevel (Ii 1, Ss 2)
    const subs = g.levels.map(i => {
      const done = isDone(i);
      const subOpen = isOpen(i);
      const st = !subOpen ? ' locked' : i === next ? ' current' : '';
      const starRow = Array.from({ length: LEVEL_DATA[i].stars }, () => `<i class="${done ? 'gold' : ''}">⭐</i>`).join('');
      return `<button class="sub-level${st}" data-action="openLevel" data-value="${i}" aria-label="${levelName(i)}">
        <span class="sub-stars">${starRow}</span>
        ${!subOpen ? `<span class="badge">${icon('lock')}</span>` : ''}
      </button>`;
    }).join('');
    return `<div class="letter-row${shown ? ' open' : ''}">
      <button class="letter-box${state}" data-action="toggleLetter" data-value="${k}" aria-expanded="${shown}">
        ${open && !earned ? `<span class="ribbon">${T.newRibbon}</span>` : ''}
        <span class="glyphs">${levelText(g.levels[0])}</span>
        <span class="earned">${mark}</span>
      </button>
      ${shown ? `<div class="sub-col">${subs}</div>` : ''}
    </div>`;
  };

  $app.innerHTML = `
    ${topBar({ left: backButton('/'), title: T.levels })}
    <div class="letter-grid">${letterGroups().map(row).join('')}
      <!-- after the last letter: more letters are coming -->
      <div class="letter-row"><div class="letter-box soon" role="note">
        <span class="soon-icon" aria-hidden="true">⏳</span>
        <span class="soon-text">${T.comingSoon}</span>
      </div></div>
    </div>`;
}

/* ---------- One level ----------
   learn → trace → find → pair → read (syllables & words) → readquiz → result */
let lesson = null;

// The steps of level i. Only the ⭐ level has the introduction page.
function levelSteps(i) {
  const lv = LEVEL_DATA[i];
  const steps = lv.stars === 1 ? ['learn', 'trace', 'find', 'pair'] : ['trace', 'find', 'pair'];
  if (lv.items.length) steps.push('read');
  // the syllable quiz needs at least 2 different syllables/words learned (else there is nothing to choose between)
  if (itemsUpTo(i).length >= 2 && (lv.stars === 3 || lv.items.length)) steps.push('readquiz');
  if (matchWords(i).length >= 2) steps.push('match'); // connect the picture with the word
  steps.push('result');
  return steps;
}

// How many tasks the steps have (the exercises and the overview page both use these).
const findLength = i => LEVEL_DATA[i].find || FIND_BY_STARS[LEVEL_DATA[i].stars];
const pairCount = i => (LEVEL_DATA[i].stars === 1 && letterRank(i) < 3 ? 2 : 3); // ⭐ of i, s, u: 2, otherwise 3
// "Find the letter": how many questions ask the level's own letter.
function findFresh(i) {
  const lv = LEVEL_DATA[i];
  if (lv.stars === 1 || lettersUpTo(i).length <= lv.letters.length) return findLength(i);
  return Math.floor(findLength(i) / 2) + 1;
}

function startLesson(i) {
  const steps = levelSteps(i);
  preloadSounds([
    ...lettersUpTo(i).map(letterKey),
    ...LEVEL_DATA[i].items.map(textKey),
    ...splitSyllables(LEVEL_DATA[i].items).map(textKey),
    ...Object.values(VOICE).map(v => v.key),
  ]);
  // tracing: each letter of the level, first big, then small
  const traceList = LEVEL_DATA[i].letters.flatMap(l => [{ l, small: false }, { l, small: true }]);
  lesson = { level: i, steps, step: 0, pos: 0, part: 0, right: 0, total: 0, log: [], traceList, find: null, pair: null, rq: null, passed: false };
}

const stepName = () => lesson.steps[lesson.step];

// Not passed: 👍 (good effort) when at least half was right, 🌱 (still growing) when less.
const notPassedEmoji = () => (lesson.total && lesson.right / lesson.total >= 0.5 ? '👍' : '🌱');

// One task done: right (on the first try) or not. The result screen shows them in order as dots.
function scoreTask(right) {
  lesson.total++;
  if (right) lesson.right++;
  lesson.log.push(!!right);
  (lesson.logSteps = lesson.logSteps || []).push(lesson.step); // which task it belongs to
}

// Test mode (◀ ▶): forget the results of the task being entered and of all after it,
// so redoing a task does not count it twice.
function forgetFromStep(k) {
  const steps = lesson.logSteps || [];
  const keep = steps.map((s, n) => s < k ? n : -1).filter(n => n >= 0);
  lesson.log = keep.map(n => lesson.log[n]);
  lesson.logSteps = keep.map(n => steps[n]);
  lesson.total = lesson.log.length;
  lesson.right = lesson.log.filter(Boolean).length;
}

// The result without numbers: one dot per task in order, green = right, orange = not right.
// Up to 8 dots in one line; more in two lines of equal length (with an odd number, the second has one less).
const resultDots = () => {
  const n = lesson.log.length;
  const dot = (ok, k) => `<i class="${ok ? 'ok' : 'miss'}" style="animation-delay:${0.15 + k * 0.06}s"></i>`;
  const first = n > 8 ? Math.ceil(n / 2) : n;
  const row = (from, to) => `<div class="row">${lesson.log.slice(from, to).map((ok, k) => dot(ok, from + k)).join('')}</div>`;
  return `<div class="result-dots" style="--cols:${Math.max(1, first)}" aria-label="${lesson.right} / ${lesson.total}">${
    row(0, first)}${first < n ? row(first, n) : ''}</div>`;
};

// The level's name at the top.
const levelHeader = () => (lesson.practice
  ? `<div class="level-label" aria-label="${T.practice}">🔁</div>`
  : `<div class="level-label">${levelText(lesson.level)}</div>`);
// The level's stars, in the top right corner, labelled as its difficulty.
const difficultyBadge = () => (lesson.practice ? ''
  : `<div class="difficulty"><span class="stars">${stars(lesson.level)}</span><small>${T.difficulty}</small></div>`);

// Test mode: go straight to exercise k of the level.
function jumpToStep(k) {
  const last = lesson.steps.length - 2;
  k = Math.max(0, Math.min(last, k));
  stopSound();
  stopPairDemo();
  if (trace) stopDemo();
  const back = k < lesson.step;
  forgetFromStep(k);
  lesson.step = k - 1;
  nextStep(back ? 'back' : 'next'); // sets the exercise up and starts its sound (◀ turns the page back)
}

// The steps of the level, as a row of dots under the top bar: done, now, still to come.
// In test mode with ◀ ▶ beside the dots, to jump to the previous / next exercise.
// Each kind of exercise always has the same icon, so the learner knows what comes before it starts.
const STEP_ICONS = {
  learn: '👀',                       // a new letter: look
  trace: '✍️',                       // write with the finger
  find: '👂',                        // listen and find the letter
  pair: '🧩',                        // big and small letters that belong together
  read: '📖',                        // new syllables and words: listen and read
  readquiz: '👂',                    // listen and find the syllable / word
  match: '🖼️',                       // picture and word
};
function stepDots() {
  const dots = lesson.steps.slice(0, -1)
    .map((name, k) => `<i class="step-ic s-${name} ${k < lesson.step ? 'ok' : k === lesson.step ? 'now' : 'next'}"><span class="e">${STEP_ICONS[name] || ''}</span></i>`).join('');
  const row = `<div class="step-icons">${dots}</div>`;
  if (!settings.testMode) return row;
  const last = lesson.steps.length - 2; // the last exercise before the result
  return `<div class="step-jump">
    <button class="jump-btn" data-action="stepPrev" aria-label="${T.previous}"${lesson.step <= 0 ? ' disabled' : ''}>${icon('left')}</button>
    ${row}
    <button class="jump-btn" data-action="stepNext" aria-label="${T.next}"${lesson.step >= last ? ' disabled' : ''}>${icon('right')}</button>
  </div>`;
}

const levelTopBar = () => topBar({ left: backButton(lesson.practice ? '/' : '/levels'), center: levelHeader(), right: difficultyBadge() }) + stepDots();

function renderLevel(i, entering) {
  if (!isOpen(i)) {
    toast(T.locked(levelName(requiredLevel(i))));
    return navigate('/levels', { replace: true });
  }
  if (!lesson || lesson.practice || lesson.level !== i) startLesson(i);
  const name = stepName();
  if (name === 'learn') renderLearn();
  else if (name === 'trace') renderTrace();
  else if (name === 'find') renderChoice(lesson.find);
  else if (name === 'pair') renderPair();
  else if (name === 'match') renderMatch();
  else if (name === 'read') renderRead();
  else if (name === 'readquiz') renderChoice(lesson.rq);
  else renderResult();
  if (entering) playStepStart();
}

// Move on to the next step of the level.
function nextStep(turn = 'next') {
  lesson.step++;
  lesson.pos = 0;
  lesson.part = 0;
  const name = stepName();
  const i = lesson.level;
  if (lesson.practice) {
    if (name === 'result') finishLevel();
    window.scrollTo(0, 0);
    pageTurn(turn);
    renderPractice(false);
    return playStepStart();
  }
  if (name === 'find') lesson.find = makeFindQuiz(i);
  if (name === 'pair') lesson.pair = makePair(i);
  if (name === 'match') lesson.match = makeMatch(i);
  if (name === 'readquiz') lesson.rq = makeReadQuiz(i);
  if (name === 'result') finishLevel();
  window.scrollTo(0, 0);
  pageTurn(turn);
  renderLevel(i, false);
  playStepStart();
}

// Spoken instructions at the start of a task: the full one in ⭐ levels,
// a short one from ⭐⭐ on and in Exersează (e.g. "Formează perechi.").
const withIntro = () => !lesson.practice && LEVEL_DATA[lesson.level].stars === 1;
const instruction = name => (withIntro() ? name : { trace: 'traceShort', find: 'findShort', pair: 'pairShort', match: 'pairShort' }[name]);
// From ⭐⭐ on, a moment of quiet after entering a task, before anything is said.
const START_QUIET = 600; // ms
const withQuiet = () => !lesson.practice && LEVEL_DATA[lesson.level].stars >= 2;

function playStepStart() {
  // from ⭐⭐ on: a moment of quiet after entering the task, then its sound
  if (withQuiet()) {
    if (stepName() === 'trace') return; // tracing waits and speaks by itself (sayTraceLetter)
    stopSound();
    const token = playToken, here = lesson, step = lesson.step;
    setTimeout(() => { if (token === playToken && lesson === here && lesson.step === step) startStepSound(); }, START_QUIET);
    return;
  }
  startStepSound();
}

function startStepSound() {
  const name = stepName();
  // the sound starts by itself (in "find the letter" the waves wait for the letter's sound, not the instruction)
  // (spoken instructions start their own waves: see speakInstruction)
  if (['readquiz', 'read'].includes(name)) rippleSound();
  const letters = LEVEL_DATA[lesson.level].letters;
  if (name === 'learn') playLetter(letters[lesson.pos]);
  // spoken instructions start by themselves: in ⭐ the full one (pairing: with the finger demo),
  // from ⭐⭐ on a short one without the demo (the 🔊 button still plays the full instruction and demo)
  const intro = withIntro();
  if (name === 'find') instructionThenQuestion(instruction('find'), lesson.find);
  if (name === 'pair' || name === 'match') {
    speakInstruction(instruction(name));
    if (intro) setTimeout(() => { if (lesson && stepName() === name) playPairDemo(); }, 700);
  }
  if (name === 'read') readAllAloud();
  if (name === 'readquiz') playQuestion(lesson.rq);
}

/* Step 1: learn the new letter(s) */
function renderLearn() {
  const letters = LEVEL_DATA[lesson.level].letters;
  const l = letters[lesson.pos];
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      <button class="card-btn big-letter${l.word ? '' : ' huge'}" data-action="playShown" aria-label="${T.listen}">
        ${glyphs(l)}<span class="corner">${icon('volume')}</span>
      </button>
      ${l.word ? `
        <button class="card-btn word-card" data-action="playLearnWord" aria-label="${T.listen}">
          <span class="pic">${l.pic}</span>
          <span class="word">${wordHTML(l)}</span>
          <span class="corner">${icon('volume')}</span>
        </button>` : ''}
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
  I: { w: 24, strokes: [line(12, 0, 12, 100)] },   // a single straight line (no cross-bars)
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
  E: { w: 50, strokes: [[[50, 0], [0, 0], [0, 100], [50, 100]], line(0, 50, 42, 50)] },
  e: { w: 40, strokes: [join(line(0, 70, 40, 70), arc(20, 70, 20, 30, 0, -320))] },
  D: { w: 56, strokes: [join(line(0, 0, 0, 100), line(0, 100, 20, 100), arc(20, 50, 36, 50, 90, -90), line(20, 0, 0, 0))] },  // one stroke: down, then round the belly
  d: { w: 40, strokes: [arc(20, 70, 20, 30, 330, -20), line(40, 0, 40, 100)] },
};

const TRACE_COVER = 0.7;    // at least this share of the middle of the grey line must be covered
const TRACE_OUTSIDE = 0.2;  // at most this share of the drawing may be off the grey line
const TRACE_TRIES = 3;      // after this many tries the learner may go on anyway

// The strokes of "M m", placed in a box of W × H pixels.
// The strokes of one letter shape (e.g. "M" or "m"), as big as fits in W × H pixels.
// One letter shape ("S" or "s") in a box of W × H pixels. The big and the small
// letter use the same scale and stand on the same line, like in writing, so the
// small letter is clearly smaller than the big one.
function traceLayout(l, ch, W, H) {
  const glyph = STROKES[ch];
  if (!glyph) return null;
  const bounds = g => {
    const pts = g.strokes.flat();
    return {
      minX: Math.min(...pts.map(p => p[0])),
      maxX: Math.max(...pts.map(p => p[0])),
    };
  };
  // the same scale for both shapes: fit the wider of the two, and the full letter height (0–100)
  const shapes = [STROKES[l.upper], STROKES[l.lower]].filter(Boolean);
  const widest = Math.max(...shapes.map(g => { const b = bounds(g); return b.maxX - b.minX; }), 1);
  const s = Math.min((W * 0.7) / widest, (H * 0.58) / 100);
  const b = bounds(glyph);
  const ox = (W - (b.maxX - b.minX) * s) / 2 - b.minX * s;
  const oy = (H - 100 * s) / 2 + H * 0.04; // y=0 top of big letters, y=100 the writing line
  return {
    strokes: glyph.strokes.map(stroke => stroke.map(([x, y]) => [ox + x * s, oy + y * s])),
    numbers: glyph.strokes.map((_, k) => k + 1),
    width: Math.min(22 * s, W * 0.125), // thickness of the grey line
    baseline: oy + 100 * s,            // the line the letters stand on
    left: W * 0.08,
    right: W * 0.92,
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
  // layout size, not getBoundingClientRect: that one is off while the page-turn animation runs
  const box = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, W: box.width, H: box.height };
}

let trace = null; // { layout, guide, demo, ink, tries, demoId }

function renderTrace() {
  const { l, small } = lesson.traceList[lesson.pos]; // in a level: first the big letter, then the small one
  const ch = small ? l.lower : l.upper;
  if (lesson.pos === 0) lesson.traceRes = []; // first try right or not, per letter of the step
  // one dot per letter of this step, as in the other tasks: the one being written has a blue ring,
  // then green (right the first time) or orange
  const dots = lesson.traceList.map((t, k) => {
    const r = lesson.traceRes[k];
    return `<i class="${r === true ? 'ok' : r === false ? 'retry' : k === lesson.pos ? 'now' : ''}"></i>`;
  }).join('');
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      <div class="q-bubble trace-bubble"><span class="q-tip"></span><div class="dots${lesson.traceList.length > 6 ? ' many' : ''}">${dots}</div></div>
      <div class="trace-wrap">
        <div class="trace-guide-text"><span class="glyphs">${ch}</span></div>
        <canvas class="trace-guide"></canvas>
        <canvas class="trace-demo"></canvas>
        <canvas class="trace-canvas"></canvas>
        <div class="trace-result" aria-hidden="true"></div>
      </div>
      <div class="nav-row">
        <button class="nav-btn" data-action="traceDemo" aria-label="${T.traceShow}"><span class="finger">👆</span></button>
        <button class="nav-btn" data-action="traceClear" aria-label="${T.clear}">${icon('refresh')}</button>
        <button class="nav-btn primary finish" data-action="traceCheck" aria-label="${T.next}" disabled>${icon('check')}</button>
      </div>
    </div>`;

  placeBubbleTip();
  const wrap = $app.querySelector('.trace-wrap');
  const guide = sizeCanvas(wrap.querySelector('.trace-guide'));
  const layout = traceLayout(l, ch, guide.W, guide.H);
  trace = { layout, tries: 0, demoId: 0, inked: false, done: false };

  if (layout) {
    wrap.querySelector('.trace-guide-text').remove();
    drawGuide(guide.ctx, layout);
    trace.demo = sizeCanvas(wrap.querySelector('.trace-demo')).ctx;
  } else {
    // No stroke shapes for this letter yet: plain grey letter, not checked.
    wrap.querySelector('.trace-guide').remove();
    fitGuide(wrap, wrap.querySelector('.trace-guide-text .glyphs'));
    setFinishEnabled(true); // not checked, so the learner can always go on
  }
  setupInk(wrap.querySelector('.trace-canvas'), layout ? layout.width * 0.9 : null);
  if (layout) {
    sayTraceLetter(l);
    // the finger shows how to write it (⭐⭐⭐ and Exersează: only with 👆)
    if (!lesson.practice && LEVEL_DATA[lesson.level].stars < 3) setTimeout(() => playDemo(), 400);
  }
}

// Tracing: the spoken instruction (at the first letter of the step), then the letter's own sound.
async function sayTraceLetter(l) {
  stopSound();
  const token = playToken;
  if (withQuiet()) {                // from ⭐⭐ on: a moment of quiet first
    await pause(START_QUIET);
    if (token !== playToken) return;
  }
  // Exersează: its name is said first, so the learner hears what this part is called
  if (lesson.practice && !lesson.nameSaid) {
    lesson.nameSaid = true;
    holdSound(token);
    await playAndWait(VOICE.practice.key, VOICE.practice.text, token);
    if (token !== playToken) return;
    await pause(400);
    releaseSound(token);
  }
  if (lesson.pos === 0) {
    const v = VOICE[instruction('trace')];
    holdSound(token);
    await playAndWait(v.key, v.text, token);
    if (token !== playToken) return;
    await pause(300);
    releaseSound(token);
  }
  if (token === playToken) playLetter(l);
}

// Grey letter with a numbered dot where each stroke starts.
function drawGuide(ctx, layout) {
  // the writing line, so you can see the small letter is lower than the big one
  ctx.strokeStyle = cssVar('--line');
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(layout.left, layout.baseline + layout.width * 0.6);
  ctx.lineTo(layout.right, layout.baseline + layout.width * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);
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
    const r = canvas.getBoundingClientRect(); // scaled back to layout size (right even mid page-turn)
    return { x: (e.clientX - r.left) * canvas.offsetWidth / r.width, y: (e.clientY - r.top) * canvas.offsetHeight / r.height };
  };
  canvas.addEventListener('pointerdown', e => {
    stopDemo();
    canvas.setPointerCapture(e.pointerId);
    last = point(e);
    trace.inked = true;
    setFinishEnabled(true);
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

// The ✓ button can only be pressed once something is drawn.
function setFinishEnabled(on) {
  const btn = $app.querySelector('[data-action="traceCheck"]'); // (not the → skip button)
  if (btn) btn.disabled = !on;
}

function clearInk() {
  const ctx = trace.ink.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, trace.ink.width, trace.ink.height);
  ctx.restore();
  trace.inked = false;
  if (trace.layout) setFinishEnabled(false);
}

// Big ✓ (good) or ✗ (try again) over the drawing; '' hides it.
function traceResult(kind) {
  const el = $app.querySelector('.trace-result');
  if (!el) return;
  el.className = 'trace-result' + (kind ? ' show ' + kind : '');
  el.innerHTML = kind === 'good' ? icon('check') : kind === 'bad' ? icon('cross') : '';
}

// Finger demo: draws the letter stroke by stroke, with a finger moving along.
function playDemo() {
  if (!trace || !trace.layout || !trace.demo) return;
  const id = ++trace.demoId;
  const ctx = trace.demo;
  const { strokes, width } = trace.layout;
  const canvas = ctx.canvas;
  const lengths = strokes.map(st => st.reduce((sum, p, k) => (k ? sum + Math.hypot(p[0] - st[k - 1][0], p[1] - st[k - 1][1]) : 0), 0));
  const speed = canvas.offsetHeight * 0.55; // pixels per second
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
  const box = { width: trace.ink.offsetWidth, height: trace.ink.offsetHeight };
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
    playVoice('trace');
    return playDemo();
  }
  const good = traceGood(scoreTrace());
  trace.tries++;
  if (trace.tries === 1) {
    scoreTask(good);
    lesson.traceRes[lesson.pos] = good;
    const dot = $app.querySelectorAll('.trace-bubble .dots i')[lesson.pos];
    if (dot) dot.className = good ? 'ok' : 'retry';
  }
  if (good) {
    trace.done = true;
    soundRight();
    playVoice('good', 0.35);
    traceResult('good');
    $app.querySelector('.trace-wrap').classList.add('good');
    const here = lesson;
    const step = lesson.step;
    setTimeout(() => { if (stillHere(here, step)) traceNextLetter(); }, 1600);
    return;
  }
  soundWrong();
  playVoice('again', 0.35);
  traceResult('bad');
  if (trace.tries >= TRACE_TRIES) {
    // Don't get stuck: the check button now moves on.
    const btn = $app.querySelector('[data-action="traceCheck"]');
    btn.dataset.action = 'traceSkip';
    btn.innerHTML = icon('right');
  }
  setTimeout(() => {
    if (!trace || trace.done) return;
    traceResult('');
    clearInk();
    playDemo();
  }, 1800);
}

function traceNextLetter() {
  if (lesson.pos < lesson.traceList.length - 1) {
    lesson.pos++;
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
    focus: LEVEL_DATA[i].letters,                               // the level's letter
    extras: lettersAfter(i, pool),                              // wrong choices while few letters are known
    length: findLength(i),
    options: MAX_OPTIONS,                                       // choices grow every 2 questions: 2, 2, 3, 3, 4, 4
    choices: LEVEL_DATA[i].choices,                             // or the level's own list, e.g. [2, 2, 3, 3]
    grow: true,
    newFirst: LEVEL_DATA[i].stars === 1 ? Infinity : 0,         // ⭐ introduction: every question asks the new letter
    weight: letterWeight,
    results: [],
    last: null,
    q: null,
  };
  // ⭐⭐ / ⭐⭐⭐: most questions (more than half) ask the level's letter, the first one always;
  // the others ask earlier letters, in a random order.
  if (LEVEL_DATA[i].stars > 1 && pool.length > LEVEL_DATA[i].letters.length) {
    const fresh = findFresh(i);
    quiz.plan = [true, ...shuffle(Array.from({ length: quiz.length - 1 }, (_, k) => k < fresh - 1))];
  }
  nextQuestion(quiz);
  return quiz;
}

// All syllables and words up to level i (this level's new ones first).
function itemsUpTo(i) {
  const out = [...LEVEL_DATA[i].items];
  for (let k = i - 1; k >= 0; k--) for (const t of LEVEL_DATA[k].items) if (!out.includes(t)) out.push(t);
  return out;
}

// The syllable quiz of level i: what it asks, how many questions, how many choices.
function readQuizSize(i) {
  const lv = LEVEL_DATA[i];
  const all = itemsUpTo(i);
  const mastery = lv.stars === 3;
  const pool = mastery ? all : lv.items;                     // ⭐⭐⭐ mixes everything so far
  const earlier = all.filter(t => !pool.includes(t));
  const defaultLength = READQUIZ_BY_STARS[lv.stars];
  return {
    pool,
    earlier,
    length: lv.quiz || defaultLength,
    options: Math.min(mastery ? 3 : 2, pool.length + earlier.length), // ⭐/⭐⭐: 2 choices, ⭐⭐⭐: 3
  };
}

function makeReadQuiz(i) {
  const lv = LEVEL_DATA[i];
  const { pool, earlier, length, options } = readQuizSize(i);
  const quiz = {
    kind: 'text',
    pool,
    focus: lv.stars === 3 && lv.items.length ? lv.items : pool,
    extras: earlier,
    length,
    options,
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
  const planned = quiz.plan ? quiz.plan[quiz.results.length] : undefined;
  const askNew = planned !== undefined ? planned : quiz.results.length < (quiz.newFirst || 0);
  let candidates = !askNew && earlier.length && (planned !== undefined || Math.random() < 0.5) ? earlier : quiz.focus;
  if (candidates.length > 1) candidates = candidates.filter(x => x !== quiz.last);
  const target = pickWeighted(candidates, quiz.weight);

  const count = quiz.choices && quiz.choices[quiz.results.length]
    ? quiz.choices[quiz.results.length]                                    // the level's own number of choices
    : quiz.grow ? Math.min(quiz.options, 2 + Math.floor(quiz.results.length / 2)) : quiz.options; // 2, 2, 3, 3, 4, 4
  const need = count - 1;
  let others;
  if (quiz.kind === 'text') {
    // syllables / words: the wrong choices are this lesson's other new ones (half of the time first)
    // or earlier syllables and words of about the same length (so the length doesn't give it away)
    const fresh = shuffle(quiz.pool.filter(x => x !== target));
    const old = quiz.extras.filter(x => x !== target && !fresh.includes(x));
    const similar = shuffle(old.filter(x => Math.abs(x.length - target.length) <= 1));
    const rest = shuffle(old.filter(x => !similar.includes(x)));
    const order = Math.random() < 0.5 ? [...fresh, ...similar, ...rest] : [...similar, ...fresh, ...rest];
    others = order.slice(0, need);
  } else {
    others = shuffle(quiz.pool.filter(x => x !== target)).slice(0, need);
    if (others.length < need) others = others.concat(quiz.extras.slice(0, need - others.length));
  }

  // letters that look alike (a and d): the look-alike is always one of the choices, in small letters
  let twin = null;
  if (quiz.kind === 'letter') {
    twin = lookAlike(target, quiz.pool);
    if (twin && need > 0) {
      if (!others.includes(twin)) others = [twin, ...others.filter(x => x !== twin)].slice(0, need);
    } else twin = null;
  }

  // the choices in a new order: never the same order more than twice in a row
  const keyOf = list => list.map(x => (quiz.kind === 'text' ? x : x.lower)).join('|');
  let options = shuffle([target, ...others]);
  for (let t = 0; t < 10 && quiz.sameRun >= 1 && keyOf(options) === quiz.lastKey; t++) options = shuffle(options);
  const key = keyOf(options);
  quiz.sameRun = key === quiz.lastKey ? (quiz.sameRun || 0) + 1 : 0;
  quiz.lastKey = key;

  quiz.q = {
    target,
    options,
    cases: quiz.kind === 'letter' ? letterCases(options, !!twin) : null, // big or small, per choice
    firstTry: true,
    wrong: [],
    done: false,
  };
  quiz.last = target;
}

// The learned letter that looks like letter l (see SIMILAR_LETTERS), if there is one.
function lookAlike(l, pool) {
  const pair = SIMILAR_LETTERS.find(p => p.includes(l.lower));
  if (!pair) return null;
  const other = pair.find(x => x !== l.lower);
  return pool.find(x => x.lower === other) || null;
}

// Big or small letters for the choices of a question: all big, all small, or (sometimes) mixed.
// Look-alike letters (a and d) are only alike as small letters, so then all are small.
function letterCases(options, smallOnly) {
  const cases = {};
  const r = Math.random();
  const mixed = !smallOnly && options.length > 1 && r >= 0.7;
  options.forEach(l => { cases[l.lower] = smallOnly ? false : mixed ? Math.random() < 0.5 : r < 0.35; });
  if (mixed) {
    const vals = Object.values(cases);
    if (vals.every(v => v) || vals.every(v => !v)) cases[options[0].lower] = !cases[options[0].lower]; // really mixed
  }
  return cases;
}

function optionText(quiz, item) {
  if (quiz.kind === 'text') return item;
  return quiz.q.cases[item.lower] ? item.upper : item.lower;
}

function playQuestion(quiz, delay = 0) {
  const t = quiz.q.target;
  rippleSound(undefined, delay);
  if (quiz.kind === 'text') playText(t, delay);
  else playLetter(t, delay);
}

function renderChoice(quiz) {
  const q = quiz.q;
  const cols = q.options.length === 3 ? 3 : 2;
  const options = q.options.map((item, i) => {
    const wrong = q.wrong.includes(i);
    const correct = q.done && item === q.target;
    return `<button class="option${quiz.kind === 'text' ? ' text' : ''}${wrong ? ' wrong' : ''}${correct ? ' correct' : ''}" data-action="answer" data-value="${i}"${wrong ? ' disabled' : ''}>${quiz.kind === 'text' ? markLevelLetter(item) : optionText(quiz, item)}</button>`;
  }).join('');
  let dots = '';
  for (let k = 0; k < quiz.length; k++) {
    const r = quiz.results[k];
    dots += `<i class="${r === true ? 'ok' : r === false ? 'retry' : k === quiz.results.length ? 'now' : ''}"></i>`;
  }

  $app.innerHTML = `
    ${levelTopBar()}
    <div class="quiz">
      <div class="q-bubble"><span class="q-tip"></span><div class="dots${quiz.length > 6 ? ' many' : ''}">${dots}</div></div>
      <button class="listen-btn" data-action="listen" aria-label="${T.listen}">${icon('volume')}</button>
      <div class="options" style="--cols:${cols}">${options}</div>
    </div>`;
  placeBubbleTip();
}

// The questions of a step sit in a rounded box under the step dots; its little
// tip points up at the current step's dot.
function placeBubbleTip() {
  const now = $app.querySelector('.step-icons .step-ic.now');
  const bubble = $app.querySelector('.q-bubble');
  if (!now || !bubble) return;
  bubble.style.transform = '';
  const box = el => { const left = layoutLeft(el); return { left, right: left + el.offsetWidth, width: el.offsetWidth, height: el.offsetHeight }; };
  const a = box(now), b = box(bubble), page = box(bubble.parentElement);
  const center = a.left + a.width / 2;
  // a short box (2 dots) slides sideways until the current step is above it, staying on screen
  // the pointer stays on the straight part of the outline, clear of the rounded ends
  const m = Math.max(22, b.height / 2 + 12);
  let shift = 0;
  if (center < b.left + m) shift = Math.max(page.left - b.left, center - m - b.left);
  else if (center > b.right - m) shift = Math.min(page.right - b.right, center + m - b.right);
  if (shift) bubble.style.transform = `translateX(${shift}px)`;
  const x = Math.min(b.width - m, Math.max(m, center - b.left - shift));
  bubble.querySelector('.q-tip').style.left = x + 'px';
}
window.addEventListener('resize', placeBubbleTip);



// Saves one answer for a letter (its last 10 are kept): how well it is known (Alfabetul dots)
// and how often it is asked come from these.
function recordLetter(l, right) {
  const r = progress.results[l.lower] || [];
  r.push(right ? 1 : 0);
  progress.results[l.lower] = r.slice(-10);
  saveProgress();
}

// Plays a spoken instruction; the sound button sends out its waves as it starts.
// Returns the play token (to see afterwards whether something else started meanwhile).
async function speakInstruction(name) {
  stopSound();
  const token = playToken;
  rippleSound();
  holdSound(token);
  await playAndWait(VOICE[name].key, VOICE[name].text, token);
  releaseSound(token);
  return token;
}

// At the start of a quiz: the spoken instruction first, then the first sound.
async function instructionThenQuestion(name, quiz) {
  const token = await speakInstruction(name);
  if (token !== playToken || !lesson || currentQuiz() !== quiz) return;
  holdSound(token);
  await pause(350);
  releaseSound(token);
  if (token === playToken) playQuestion(quiz);
}

const currentQuiz = () => (stepName() === 'find' ? lesson.find : lesson.rq);
const stillHere = (l, step) => lesson === l && l.step === step && currentPath() === (l.practice ? '/exercitiu' : '/level/' + l.level);

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
    if (quiz.kind === 'letter') recordLetter(q.target, q.firstTry); // the asked letter: right on the first try or not
    quiz.results.push(q.firstTry);
    scoreTask(q.firstTry);

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
    if (quiz.kind === 'letter') recordLetter(q.options[i], false); // the letter tapped by mistake is not known well either
    button.classList.add('wrong', 'shake');
    button.disabled = true;
    soundWrong();
    playQuestion(quiz, 0.45); // say the sound again
  }
}

/* Step 4: pair each big letter with its small letter */
function makePair(i) {
  const pool = lettersUpTo(i);
  const fresh = LEVEL_DATA[i].letters;
  const lv = LEVEL_DATA[i];
  const count = pairCount(i);
  let chosen = lv.stars === 3
    ? shuffle(pool).slice(0, count)                                       // ⭐⭐⭐: any letters so far
    : [...fresh, ...shuffle(pool.filter(l => !fresh.includes(l)))].slice(0, count);
  if (chosen.length < count) chosen = chosen.concat(lettersAfter(i, pool).slice(0, count - chosen.length));
  const [left, right] = twoOrders(chosen);
  return { left, right, cards: mixCards(chosen), matched: [], missed: [], sel: null };
}

// Demo for the pairing games, showing exactly what to do: the finger taps a card
// on the left (it lights up), moves to its partner on the right and taps it,
// and both turn green – like a right answer. Then everything goes back.
const pairDemoLayer = `<div class="pair-demo" aria-hidden="true">
  <span class="demo-finger">👆</span>
</div>`;
let pairDemoId = 0;

function stopPairDemo() {
  pairDemoId++;
  const layer = $app.querySelector('.pair-demo');
  if (layer) layer.classList.remove('show');
  $app.querySelectorAll('.pair-btn.demo, .pair-btn.demo-ok').forEach(b => b.classList.remove('demo', 'demo-ok'));
}

function playPairDemo() {
  stopPairDemo();
  const id = pairDemoId;
  const isMatch = stepName() === 'match';
  const game = isMatch ? lesson.match : lesson.pair;
  if (!game) return;
  const open = game.left.filter(x => !game.matched.includes(x)); // show it on a pair not done yet
  if (!open.length) return;
  const key = isMatch ? open[0] : open[0].lower;
  const from = $app.querySelector(`[data-value="${isMatch ? 'P' : 'L'}:${key}"]`);
  const to = $app.querySelector(`[data-value="${isMatch ? 'W' : 'R'}:${key}"]`);
  const box = $app.querySelector('.pair');
  const layer = $app.querySelector('.pair-demo');
  if (!from || !to || !box || !layer) return;
  const b = box.getBoundingClientRect();
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; };
  const [x1, y1] = centre(from);
  const [x2, y2] = centre(to);
  const finger = layer.querySelector('.demo-finger');
  layer.classList.add('show');

  // timeline (ms): appear on the first card, tap it, move, tap the partner, show green, hold
  const TAP1 = 500, MOVE_END = 1600, TAP2 = 1900, END = 3100;
  const start = performance.now();
  function frame(now) {
    if (pairDemoId !== id) return;
    const t = now - start;
    let x = x1, y = y1;
    if (t > TAP1 + 150) {
      const k = Math.min(1, (t - TAP1 - 150) / (MOVE_END - TAP1 - 150));
      const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      x = x1 + (x2 - x1) * ease;
      y = y1 + (y2 - y1) * ease;
    }
    // a little "press" at each tap
    const pressed = (t > TAP1 - 120 && t < TAP1 + 80) || (t > TAP2 - 120 && t < TAP2 + 80);
    finger.style.transform = `translate(${x}px, ${y}px) scale(${pressed ? 0.85 : 1})`;
    from.classList.toggle('demo', t >= TAP1 && t < TAP2);         // first card selected
    from.classList.toggle('demo-ok', t >= TAP2);                  // then both green
    to.classList.toggle('demo-ok', t >= TAP2);
    if (t < END) return requestAnimationFrame(frame);
    stopPairDemo();
  }
  requestAnimationFrame(frame);
}

// Two different orders for the left and right column, so no answer is simply
// "straight across" for every row.
function twoOrders(items) {
  const left = shuffle(items);
  let right = shuffle(items);
  for (let tries = 0; items.length > 1 && tries < 20 && right.some((x, k) => x === left[k]); tries++) right = shuffle(items);
  return [left, right];
}

// The cards of the pairing game in two columns, but the big and small letters anywhere
// (not all big ones on the left); a letter's two cards are never side by side in one row.
function mixCards(letters) {
  const all = letters.flatMap(l => [{ side: 'L', l }, { side: 'R', l }]); // L = big letter, R = small letter
  let cards = shuffle(all);
  const bad = c => {
    for (let k = 0; k + 1 < c.length; k += 2) if (c[k].l === c[k + 1].l) return true;          // partners in one row
    const leftCol = c.filter((_, k) => k % 2 === 0);
    return leftCol.every(x => x.side === 'L') || leftCol.every(x => x.side === 'R');            // a column of only big / only small
  };
  for (let t = 0; t < 50 && letters.length > 1 && bad(cards); t++) cards = shuffle(all);
  return cards;
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
    <button class="listen-btn pair-listen" data-action="pairVoice" aria-label="${T.listen}">${icon('volume')}</button>
    <div class="pair mixed">
      ${p.cards.map(c => cell(c.l, c.side)).join('')}
      ${pairDemoLayer}
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
    p.sel = null;
    soundRight();
    renderPair();
    markJustMatched([`L:${l.lower}`, `R:${l.lower}`]);
    if (p.matched.length === p.left.length) {
      // the whole pairing game counts as one exercise: right if there was no mistake
      scoreTask(!p.missed.length);
      const here = lesson;
      const step = lesson.step;
      setTimeout(() => { if (stillHere(here, step)) nextStep(); }, 900);
    }
  } else {
    const first = p.sel.l;
    if (!p.missed.includes(first)) p.missed.push(first);
    p.sel = null;
    soundWrong();
    playLetter(first, 0.45); // say the letter they were matching again
    renderPair();
    const again = $app.querySelector(`[data-value="${value}"]`);
    if (again) again.classList.add('shake');
  }
}

// The two cards that were just paired turn green smoothly (the others are already green).
function markJustMatched(values) {
  values.forEach(v => {
    const b = [...$app.querySelectorAll('.pair-btn')].find(el => el.dataset.value === v);
    if (b) b.classList.add('just');
  });
}

/* Last step: connect the picture with the word */
const wordPicture = word => (typeof WORD_PICTURES === 'object' ? WORD_PICTURES[word] : null);

// The words for this level's matching game: its new words that have a picture,
// filled up with picture words from earlier levels. No new picture word = no game.
function matchWords(i) {
  const fresh = LEVEL_DATA[i].words.filter(wordPicture);
  if (LEVEL_DATA[i].stars === 3) {
    // ⭐⭐⭐: any picture words learned so far
    const all = [];
    for (let k = 0; k <= i; k++) for (const w of LEVEL_DATA[k].words) if (wordPicture(w) && !all.includes(w)) all.push(w);
    return shuffle(all).slice(0, 3);
  }
  if (!fresh.length) return [];
  const count = pairCount(i);
  const earlier = [];
  for (let k = i - 1; k >= 0; k--) {
    for (const w of LEVEL_DATA[k].words) if (wordPicture(w) && !fresh.includes(w) && !earlier.includes(w)) earlier.push(w);
  }
  return [...shuffle(fresh), ...earlier].slice(0, count);
}

function makeMatch(i) {
  const words = matchWords(i);
  const [left, right] = twoOrders(words);
  return { left, right, matched: [], missed: [], sel: null };
}

function renderMatch() {
  const m = lesson.match;
  const cell = (word, side) => {
    const matched = m.matched.includes(word);
    const selected = m.sel && m.sel.side === side && m.sel.word === word;
    const inside = side === 'P' ? pictureHTML(wordPicture(word)) : markLevelLetter(word);
    return `<button class="pair-btn match-btn${side === 'P' ? ' picture' : ''}${matched ? ' correct' : ''}${selected ? ' selected' : ''}" data-action="pickMatch" data-value="${side}:${word}"${matched ? ' disabled' : ''}>${inside}</button>`;
  };
  $app.innerHTML = `
    ${levelTopBar()}
    <button class="listen-btn pair-listen" data-action="matchVoice" aria-label="${T.listen}">${icon('volume')}</button>
    <div class="pair">
      <div class="pair-col">${m.left.map(w => cell(w, 'P')).join('')}</div>
      <div class="pair-col">${m.right.map(w => cell(w, 'W')).join('')}</div>
      ${pairDemoLayer}
    </div>`;

}

function pickMatch(value) {
  const m = lesson.match;
  const side = value.slice(0, 1);
  const word = value.slice(2);
  // No sound when tapping: the learner has to read the word.
  if (!m.sel || m.sel.side === side) {
    m.sel = { side, word };
    return renderMatch();
  }
  if (m.sel.word === word) {
    m.matched.push(word);
    m.sel = null;
    soundRight();
    playText(word, 0.3); // say the word as a reward
    renderMatch();
    markJustMatched([`P:${word}`, `W:${word}`]);
    if (m.matched.length === m.left.length) {
      // the whole picture–word game counts as one exercise: right if there was no mistake
      scoreTask(!m.missed.length);
      const here = lesson;
      const step = lesson.step;
      setTimeout(() => { if (stillHere(here, step)) nextStep(); }, 1400);
    }
  } else {
    const first = m.sel.word;
    if (!m.missed.includes(first)) m.missed.push(first);
    m.sel = null;
    soundWrong();
    renderMatch();
    const again = $app.querySelector(`[data-value="${value}"]`);
    if (again) again.classList.add('shake');
  }
}

/* Step 5: read and hear syllables and words */
function renderRead() {
  const level = LEVEL_DATA[lesson.level];
  const pictures = typeof WORD_PICTURES === 'object' ? WORD_PICTURES : {};
  const tiles = (list, withPictures) => list.map(t => {
    const pic = withPictures && pictures[t];
    // under the syllable or word, the letters it is made of: nu → n + u
    const parts = presentParts(t).map(p => `<span class="p">${markLevelLetter(p, true)}</span>`).join('<i>+</i>');
    return `<button class="read-btn${pic ? ' with-pic' : ''}" data-action="readItem" data-value="${t}">${pic ? pictureHTML(pic) : ''}<span class="w">${markLevelLetter(t, true)}</span><span class="parts">${parts}</span><span class="corner">${icon('volume')}</span></button>`;
  }).join('');
  $app.innerHTML = `
    ${levelTopBar()}
    <div class="page">
      <button class="listen-btn small" data-action="readAll" aria-label="${T.listen}">${icon('volume')}</button>
      ${level.syllables.length ? `<h2 class="section">${T.syllables}</h2><div class="read-grid">${tiles(level.syllables)}</div>` : ''}
      ${level.words.length ? `<h2 class="section">${T.words}</h2><div class="read-grid">${tiles(level.words, true)}</div>` : ''}
      <div class="nav-row">
        <button class="nav-btn primary" data-action="nextStep" aria-label="${T.next}">${icon('right')}</button>
      </div>
    </div>`;
}

// Presents one syllable or word: each part's sound, then the whole – s… u… su, or Ma… nu… Manu.
// The part being said lights up in the small line under the word; while the whole is said,
// the big word itself turns blue.
async function presentItem(text, token) {
  const btn = [...$app.querySelectorAll('.read-btn')].find(b => b.dataset.value === text);
  const spans = btn ? [...btn.querySelectorAll('.parts .p')] : [];
  const light = on => spans.forEach((p, j) => p.classList.toggle('on', j === on));
  if (btn) btn.classList.add('playing');
  const parts = presentParts(text);
  for (let k = 0; k < parts.length && token === playToken; k++) {
    light(k);
    const sound = partSound(parts[k]);
    if (sound) await playAndWait(sound.key, sound.text, token);
    if (token === playToken) await pause(250);
  }
  if (token === playToken) {
    light(-1);
    if (btn) btn.classList.add('whole'); // the big word above turns blue
    await pause(150);
    await playAndWait(textKey(text), text, token);
  }
  // Only tidy up if nothing new has started meanwhile (a new press restarts the effect itself).
  if (token !== playToken) return;
  light(-1);
  if (btn) btn.classList.remove('playing', 'whole');
}

// Switches every highlight off at once, so a new press starts the effect from the beginning.
function clearPresentation() {
  $app.querySelectorAll('.read-btn').forEach(b => b.classList.remove('playing', 'whole'));
  $app.querySelectorAll('.parts .p.on').forEach(p => p.classList.remove('on'));
}

function presentOne(text) {
  stopSound();
  clearPresentation();
  const token = playToken;
  holdSound(token);
  presentItem(text, token).finally(() => releaseSound(token));
}

// Presents every syllable, then every word, in order.
async function readAllAloud() {
  stopSound();
  clearPresentation();
  const token = playToken;
  const here = lesson;
  const level = LEVEL_DATA[lesson.level];
  holdSound(token);
  await pause(300);
  for (const text of [...level.syllables, ...level.words]) {
    if (token !== playToken || lesson !== here || stepName() !== 'read') break;
    await presentItem(text, token);
    if (token !== playToken) break;
    await pause(600);
  }
  releaseSound(token);
}

// A word picture: an emoji, or an image file (e.g. 'pictures/mai.svg').
const isImageFile = pic => /\.(svg|png|jpe?g|webp)$/i.test(pic);
const pictureHTML = pic => (isImageFile(pic)
  ? `<img class="pic-img" src="${pic}" alt="" draggable="false">`
  : `<span class="pic">${pic}</span>`);

/* ---------- Exersează: practice everything learned so far ----------
   12 questions: letters by sound (the less known letters come up more often),
   then syllables and words. Nothing is unlocked; it only shows how it went. */
// The last level passed: everything up to it counts as learned (-1: none yet).
// Exersează card: learned letters and syllables drift slowly across its background, in a random mix.
function flyingBits() {
  const base = lastDoneLevel();
  const letters = base >= 0 ? lettersUpTo(base) : [...new Set(LEVEL_DATA.flatMap(lv => lv.letters))].slice(0, 3);
  const words = base >= 0 ? itemsUpTo(base).filter(t => t.length <= 3) : [];
  const pool = shuffle([
    ...letters.map(l => (Math.random() < 0.5 ? l.upper : l.lower)),
    ...shuffle(words).slice(0, 4),
  ]).slice(0, 8);
  // each one enters at a random point of a random edge and leaves through another edge, spinning
  const edgePoint = side => {
    const r = Math.round(Math.random() * 100);
    return [[-12, r], [108, r], [r, -45], [r, 125]][side];   // left, right, top, bottom (in % of the card)
  };
  const colors = ['#1E4FB5', '#C2412D', '#23864B', '#D98A00', '#7B4FC9', '#0E8A8A', '#C23C7E'];
  return pool.map(t => {
    const color = colors[Math.floor(Math.random() * colors.length)];  // each one its own colour
    const from = Math.floor(Math.random() * 4);
    const to = (from + 1 + Math.floor(Math.random() * 3)) % 4;  // any other edge
    const [x0, y0] = edgePoint(from);
    const [x1, y1] = edgePoint(to);
    const dur = 7 + Math.random() * 15;                // seconds for one trip: some quick, some very slow
    const delay = -Math.random() * dur;                // already on the way when the screen opens
    const size = Math.random() < 0.3 ? 2.4 + Math.random() * 1 : 1 + Math.random() * 1;  // a few big ones, the rest small
    // and it spins slowly on the way: a quarter to three quarters of a turn,
    // half of them clockwise, half anticlockwise
    const r0 = Math.round(Math.random() * 40 - 20);
    const r1 = r0 + (Math.random() < 0.5 ? -1 : 1) * Math.round(90 + Math.random() * 180);
    return `<i style="color:${color};--x0:${x0}%;--y0:${y0}%;--x1:${x1}%;--y1:${y1}%;--r0:${r0}deg;--r1:${r1}deg;font-size:${size.toFixed(2)}rem;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s">${t}</i>`;
  }).join('');
}

function lastDoneLevel() {
  for (let i = LEVEL_DATA.length - 1; i >= 0; i--) if (isDone(i)) return i;
  return -1;
}

function startPractice() {
  const base = lastDoneLevel();
  const letters = lettersUpTo(base);
  const items = itemsUpTo(base);
  const textLength = items.length >= 2 ? PRACTICE_TEXT : 0;
  // tracing: PRACTICE_TRACE different letters (the less known ones more often), each big or small at random
  const traceList = [];
  const traceable = letters.filter(l => STROKES[l.upper] && STROKES[l.lower]);
  while (traceList.length < Math.min(PRACTICE_TRACE, traceable.length)) {
    const l = pickWeighted(traceable.filter(x => !traceList.some(t => t.l === x)), letterWeight);
    traceList.push({ l, small: Math.random() < 0.5 });
  }
  const find = {
    kind: 'letter',
    pool: letters,
    focus: letters,
    extras: lettersAfter(base, letters),        // wrong choices while few letters are known
    length: PRACTICE_LENGTH - textLength - traceList.length,
    options: Math.min(MAX_OPTIONS, Math.max(3, letters.length)),
    weight: letterWeight,
    results: [], last: null, q: null,
  };
  nextQuestion(find);
  let rq = null;
  if (textLength) {
    rq = { kind: 'text', pool: items, focus: items, extras: [], length: textLength,
      options: Math.min(3, items.length), weight: () => 1, results: [], last: null, q: null };
    nextQuestion(rq);
  }
  preloadSounds([...letters.map(letterKey), ...items.map(textKey), ...Object.values(VOICE).map(v => v.key)]);
  const steps = [...(traceList.length ? ['trace'] : []), 'find', ...(rq ? ['readquiz'] : []), 'result'];
  lesson = { practice: true, level: base, steps,
    step: 0, pos: 0, part: 0, right: 0, total: 0, log: [], traceList, find, rq, passed: false };
}

function renderPractice(entering) {
  if (lastDoneLevel() < 0) {
    toast(T.practiceLocked);
    return navigate('/', { replace: true });
  }
  if (!lesson || !lesson.practice || entering) startPractice();
  const name = stepName();
  if (name === 'trace') renderTrace();
  else if (name === 'find') renderChoice(lesson.find);
  else if (name === 'readquiz') renderChoice(lesson.rq);
  else renderResult();
  if (entering && name !== 'trace') playStepStart(); // tracing says its letter by itself
}

/* Result */
function finishLevel() {
  if (lesson.practice) { // practice opens nothing: it only shows how it went
    lesson.passed = lesson.total > 0 && lesson.right / lesson.total >= 0.8;
    if (lesson.passed) soundPassed();
    return;
  }
  lesson.passed = lesson.total > 0 && lesson.right / lesson.total >= passRatio(lesson.level);
  if (lesson.passed) {
    progress.done[levelKey(lesson.level)] = true;
    saveProgress();
    soundPassed();
  }
}

function renderResult() {
  if (lesson.practice) {
    $app.innerHTML = `
      ${topBar({ left: backButton('/'), center: levelHeader() })}
      <div class="results">
        <div class="emoji${lesson.passed ? ' cheer' : ''}">${lesson.passed ? '🎉' : notPassedEmoji()}</div>
        ${resultDots()}
        <div class="btn-row">
          <button class="btn" data-action="up" data-value="/" aria-label="${T.back}">${icon('back')}</button>
          <button class="btn primary" data-action="retry" aria-label="${T.again}">${icon('refresh')}</button>
        </div>
      </div>`;
    if (lesson.passed) celebrate();
    return;
  }
  const isLast = lesson.level === LEVEL_DATA.length - 1;
  const emoji = lesson.passed ? (isLast ? '🏆' : '🎉') : notPassedEmoji();
  const toLevels = `<button class="btn" data-action="up" data-value="/levels" aria-label="${T.levels}">${icon('steps')}</button>`;
  let buttons;
  if (!lesson.passed) {
    buttons = `${toLevels}<button class="btn primary" data-action="retry" aria-label="${T.again}">${icon('refresh')}</button>`;
  } else {
    // passed: back to the levels map (the next level is chosen there, not started automatically)
    buttons = `<button class="btn primary" data-action="up" data-value="/levels" aria-label="${T.levels}">${icon('steps')}</button>`;
  }
  $app.innerHTML = `
    ${topBar({ left: backButton('/levels'), center: `<div class="level-label"><span>${levelName(lesson.level)}</span></div>` })}
    <div class="results">
      <div class="emoji${lesson.passed ? ' cheer' : ''}">${emoji}</div>
      ${resultDots()}
      <div class="btn-row">${buttons}</div>
    </div>`;
  if (lesson.passed) celebrate();
}

// Celebration for a passed level: colourful confetti falls over the screen for about 3 seconds.
function celebrate() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.confetti').forEach(el => el.remove());
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#F2B705', '#E8553D', '#2FA866', '#3D7BE8', '#B25BE0', '#FF8FB1'];
  for (let k = 0; k < 70; k++) {
    const p = document.createElement('i');
    const size = 7 + Math.random() * 8;
    p.style.left = Math.random() * 100 + '%';
    p.style.width = size + 'px';
    p.style.height = size * (Math.random() < 0.5 ? 0.45 : 1) + 'px';
    p.style.background = colors[k % colors.length];
    p.style.borderRadius = Math.random() < 0.3 ? '50%' : '2px';
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--spin', (Math.random() * 900 - 450) + 'deg');
    p.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    p.style.animationDelay = Math.random() * 0.6 + 's';
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4000);
}

/* ---------- Settings ---------- */
function allSoundKeys() {
  const keys = new Set(Object.values(VOICE).map(v => v.key));
  LETTERS.forEach(l => {
    keys.add(letterKey(l));
    if (l.word) keys.add(textKey(l.word));
  });
  LEVEL_DATA.forEach(level => [...level.items, ...splitSyllables(level.items)].forEach(t => keys.add(textKey(t))));
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
        <div class="switch-row"><span>${T.testMode}</span><button class="switch${settings.testMode ? ' on' : ''}" data-action="toggleTest" role="switch" aria-checked="${settings.testMode}" aria-label="${T.testMode}"></button></div>
        <button class="text-btn" data-action="go" data-value="/prezentare">${icon('steps')}${T.openOverview}</button>
        <button class="text-btn danger" data-action="resetProgress">${icon('refresh')}${T.resetProgress}</button>
      </section>
      <section>
        <h2>${T.theme}</h2>
        <div class="theme-row">
          ${[['light', '☀️', T.themeLight], ['dark', '🌙', T.themeDark], ['auto', '📱', T.themeAuto]].map(([v, ico, label]) =>
            `<button class="theme-btn${settings.theme === v ? ' on' : ''}" data-action="setTheme" data-value="${v}"><span class="ico">${ico}</span><span>${label}</span></button>`).join('')}
        </div>
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
      <p class="version">Bibcit 0.3 · v${APP_VERSION}</p>
    </div>`;
}

/* ---------- Overview of the levels (for the teacher) ----------
   Made from letters.js and the same rules the exercises use, so it is always up to date. */
function overviewText(text, letters) {
  return [...text].map(ch => (letters.includes(ch.toLocaleLowerCase('ro')) ? `<mark>${ch}</mark>` : ch)).join('');
}

function renderOverview() {
  let grand = 0;
  const totals = [];
  const cards = LEVEL_DATA.map((lv, i) => {
    const steps = levelSteps(i);
    const own = lv.letters.map(l => l.lower);
    const rows = [];
    const add = (label, count, note = '') => {
      rows.push(`<tr><td>${label}${note ? `<small>${note}</small>` : ''}</td><td class="num">${count}</td></tr>`);
      return count;
    };
    let total = 0;
    if (steps.includes('learn')) rows.push(`<tr><td>${T.ovLearn}</td><td class="num">–</td></tr>`);
    total += add(T.ovTrace, lv.letters.length * 2, lv.letters.map(l => `${l.upper}, ${l.lower}`).join(' · '));
    const fresh = findFresh(i);
    const findNote = fresh === findLength(i) ? T.ovAllNew(own.join(' ')) : T.ovSomeNew(fresh, own.join(' '));
    // the choices of this level's questions (2, 2, 3, 3 … or the level's own list)
    const choiceList = lv.choices || Array.from({ length: findLength(i) }, (_, k) => Math.min(MAX_OPTIONS, 2 + Math.floor(k / 2)));
    total += add(T.ovFind, findLength(i), findNote.replace('2, 2, 3, 3, 4, 4', choiceList.join(', ')));
    total += add(T.ovPair, 1, T.ovPairs(pairCount(i)) + (lv.stars === 3 ? ` · ${T.ovAnyLetters}` : ''));
    // a learning page, not an exercise: shown, but not counted
    if (steps.includes('read')) rows.push(`<tr><td>${T.ovRead}<small>${T.ovLearnPage(lv.items.length)}</small></td><td class="num">–</td></tr>`);
    if (steps.includes('readquiz')) {
      const rq = readQuizSize(i);
      total += add(T.ovQuiz, rq.length, T.ovChoices(rq.options) + (lv.stars === 3 ? ` · ${T.ovAllSoFar}` : ''));
    }
    if (steps.includes('match')) total += add(T.ovMatch, 1, T.ovPairs(matchWords(i).length) + (lv.stars === 3 ? ` · ${T.ovAllSoFar}` : ''));
    grand += total;
    totals[i] = total;

    const items = lv.items.map(t => {
      const pic = wordPicture(t);
      const picHTML = !pic ? '' : isImageFile(pic) ? `<img src="${pic}" alt="">` : `<span>${pic}</span>`;
      return `<span class="ov-item">${picHTML}${overviewText(t, own)}</span>`;
    }).join('');
    return `<section class="ov-level${isDone(i) ? ' done' : ''}" id="ov-${i}">
      <h2><span>${levelName(i)}</span><span class="ov-pass">${Math.round(passRatio(i) * 100)}%</span></h2>
      <div class="ov-items">${items || `<span class="ov-none">${T.ovNoNew}</span>`}</div>
      <table>${rows.join('')}<tr class="ov-total"><td>${T.ovTotal}</td><td class="num">${total}</td></tr></table>
    </section>`;
  }).join('');

  // the summary first: tasks per level, one row per letter (⭐ / ⭐⭐ / ⭐⭐⭐)
  const summary = letterGroups().map(g => {
    const byStars = { 1: '', 2: '', 3: '' };
    // each number jumps to that level's details below
    g.levels.forEach(i => { byStars[LEVEL_DATA[i].stars] = `<button class="ov-jump" data-action="ovJump" data-value="${i}" aria-label="${levelName(i)}">${totals[i]}</button>`; });
    return `<tr><td>${levelText(g.levels[0])}</td>${[1, 2, 3].map(n => `<td class="num">${byStars[n]}</td>`).join('')}</tr>`;
  }).join('');

  $app.innerHTML = `
    ${topBar({ left: backButton('/settings'), title: T.overview })}
    <div class="settings overview">
      <section>
        <table class="ov-summary">
          <tr><th></th><th>⭐</th><th>⭐⭐</th><th>⭐⭐⭐</th></tr>
          ${summary}
          <tr class="ov-total"><td>Total</td><td class="num" colspan="3">${grand}</td></tr>
        </table>
        <p>${T.overviewHelp(LEVEL_DATA.length, grand)}</p>
      </section>
      ${cards}
    </div>
    <button class="to-top" data-action="toTop" aria-label="Sus">${icon('top')}</button>`;
  showToTop();
}

// The overview is long: a round ↑ button in the corner jumps back to the top (shown once you scroll down).
function showToTop() {
  const b = $app.querySelector('.to-top');
  if (b) b.classList.toggle('show', window.scrollY > 300);
}
window.addEventListener('scroll', showToTop, { passive: true });

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
  const sections = [{
    title: T.instructions,
    rows: Object.values(VOICE).map(v => ({ key: v.key, text: v.text, small: true })),
  }];
  const inLevels = new Set();
  LEVEL_DATA.forEach((level, i) => {
    const rows = [];
    level.letters.forEach(l => {
      inLevels.add(l);
      rows.push(...letterRows(l));
    });
    level.items.forEach(t => rows.push({ key: textKey(t), text: t }));
    splitSyllables(level.items).forEach(t => rows.push({ key: textKey(t), text: t, note: T.recSplit }));
    sections.push({ title: levelName(i), rows });
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
          <span class="rec-text${r.small ? ' sentence' : ''}">${r.text}${r.note ? `<small>${r.note}</small>` : ''}</span>
          ${has ? `<button class="rec-btn icon-only${isRec ? ' hold' : ''}" data-action="playRec" data-value="${r.key}" aria-label="Play"${isRec ? ' disabled' : ''}>${icon('play')}</button>` : ''}
          <button class="rec-btn rec-main${isRec ? ' recording' : ''}" data-action="rec" data-value="${r.key}"${busy ? ' disabled' : ''}>${isRec ? icon('stop') + `<span class="lbl">${T.stop}</span>` : icon('mic') + `<span class="lbl">${T.record}</span>`}</button>
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
  const seconds = key.startsWith('V_') ? 8 : MAX_REC_SECONDS; // instructions are longer
  recorder = { key, mr, timer: setTimeout(stopRecording, seconds * 1000) };
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
  toTop: () => window.scrollTo(0, 0), // a direct jump: smooth scrolling is not reliable on every phone

  // alphabet
  openLetter(value) {
    navigate('/letter/' + value);
    playLetter(LETTERS[+value]);
  },
  prevLetter: () => showLetter(letterIndex - 1),
  nextLetter: () => showLetter(letterIndex + 1),
  playLetter: value => playLetter(LETTERS[+value]),
  playExample: value => playText(LETTERS[+value].word),

  // overview: scroll to a level's details and light them up for a moment
  ovJump(value) {
    const card = document.getElementById('ov-' + value);
    if (!card) return;
    card.scrollIntoView({ block: 'start' }); // a direct jump: smooth scrolling is not reliable on every phone
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
  },
  // levels
  toggleLetter(value) {
    openGroup = openGroup === +value ? -1 : +value;
    renderLevels();
  },
  openLevel(value, button) {
    const i = +value;
    if (!isOpen(i)) {
      button.classList.remove('shake');
      void button.offsetWidth; // restart the animation
      button.classList.add('shake');
      return toast(T.locked(levelName(requiredLevel(i))));
    }
    startLesson(i);
    navigate('/level/' + i);
  },
  playShown: () => playLetter(LEVEL_DATA[lesson.level].letters[lesson.pos]),
  playLearnWord: () => playText(LEVEL_DATA[lesson.level].letters[lesson.pos].word),
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
    traceResult('');
  },
  traceDemo() {
    clearInk();
    traceResult('');
    playVoice('trace');
    playDemo();
  },
  pairVoice: () => { speakInstruction('pair'); const t = playToken; setTimeout(() => { if (t === playToken && lesson && stepName() === 'pair') playPairDemo(); }, 700); },
  traceCheck: () => traceCheck(),
  traceSkip: () => traceNextLetter(),
  listen: () => playQuestion(currentQuiz()),
  answer: (value, button) => answer(+value, button),
  pick: (value, button) => { stopPairDemo(); pick(value, button); },
  pickMatch: value => { stopPairDemo(); pickMatch(value); },
  pairDemo: () => playPairDemo(),
  matchVoice: () => { speakInstruction('match'); const t = playToken; setTimeout(() => { if (t === playToken && lesson && stepName() === 'match') playPairDemo(); }, 700); },
  readItem: value => presentOne(value), // s… u… su
  readAll: () => readAllAloud(),
  nextStep: () => nextStep(),
  retry() {
    if (lesson.practice) { // a new practice round, with new questions
      startPractice();
      renderPractice(false);
      return playStepStart();
    }
    // Do the exercises again (without learning and tracing again).
    lesson.step = lesson.steps.indexOf('find') - 1;
    lesson.right = 0;
    lesson.total = 0;
    lesson.log = [];
    lesson.logSteps = [];
    nextStep();
  },
  nextLevel() {
    const i = lesson.level + 1;
    startLesson(i);
    navigate('/level/' + i, { replace: true });
  },

  // settings
  toggleTest() {
    settings.testMode = !settings.testMode;
    saveSettings();
    renderSettings();
  },
  stepPrev: () => jumpToStep(lesson.step - 1),
  stepNext: () => jumpToStep(lesson.step + 1),
  setTheme(value) {
    settings.theme = value;
    saveSettings();
    applyTheme();
    renderSettings();
  },
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

// Stops the sound and what goes with it (highlighted syllables, waves, the pairing demo).
function silence() {
  stopSound();
  clearPresentation();
  stopPairDemo();
  $app.querySelectorAll('.listen-btn.ripple').forEach(b => b.classList.remove('ripple'));
}

// Buttons that only play a sound: they can't be pressed again while a sound is playing.
const SOUND_ACTIONS = new Set(['listen', 'pairVoice', 'matchVoice', 'readAll', 'readItem',
  'playLetter', 'playExample', 'playShown', 'playLearnWord']);

$app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (SOUND_ACTIONS.has(el.dataset.action)) {
    if (soundPlaying()) {
      // pressed while a sound plays: stop it; it can start again half a second later
      silence();
      lastSoundPress = performance.now();
      return;
    }
    if (soundTooSoon()) return;
    lastSoundPress = performance.now();
  }
  if (fn) fn(el.dataset.value, el);
});

/* ---------- Start ---------- */
loadAudioIndex().finally(() => render(true));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
