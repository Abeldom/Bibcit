// ---------------------------------------------------------------------
// 1. ALL LETTERS, in alphabetical order (used by the "Alfabetul" overview)
// ---------------------------------------------------------------------
//   upper / lower : the letter
//   say           : what the phone's built-in voice says for this letter, but
//                   only until you have recorded the letter's sound yourself
//                   (Setări -> Înregistrări). The phone voice can only say the
//                   letter names (me, ne, ce...), not the sounds.
//   word / pic    : an example word and an emoji picture (alphabet overview).
//                   Leave both as '' to show no word.
//
// Use the Romanian letters with a comma below (ș ț), not a cedilla (ş ţ).

const LETTERS = [
  { upper: 'A', lower: 'a', say: 'a',        word: 'avion',     pic: '✈️' },
  { upper: 'Ă', lower: 'ă', say: 'ă',        word: 'pălărie',   pic: '🎩' },
  { upper: 'Â', lower: 'â', say: 'â',        word: 'pâine',     pic: '🍞' },
  { upper: 'B', lower: 'b', say: 'be',       word: 'banană',    pic: '🍌' },
  { upper: 'C', lower: 'c', say: 'ce',       word: 'casă',      pic: '🏠' },
  { upper: 'D', lower: 'd', say: 'de',       word: 'dinte',     pic: '🦷' },
  { upper: 'E', lower: 'e', say: 'e',        word: 'elefant',   pic: '🐘' },
  { upper: 'F', lower: 'f', say: 'fe',       word: 'foc',       pic: '🔥' },
  { upper: 'G', lower: 'g', say: 'ge',       word: 'gogoașă',   pic: '🍩' },
  { upper: 'H', lower: 'h', say: 'ha',       word: 'haină',     pic: '🧥' },
  { upper: 'I', lower: 'i', say: 'i',        word: 'inimă',     pic: '❤️' },
  { upper: 'Î', lower: 'î', say: 'î',        word: 'înghețată', pic: '🍦' },
  { upper: 'J', lower: 'j', say: 'je',       word: 'jucărie',   pic: '🧸' },
  { upper: 'K', lower: 'k', say: 'ca',       word: 'kiwi',      pic: '🥝' },
  { upper: 'L', lower: 'l', say: 'le',       word: 'lună',      pic: '🌙' },
  { upper: 'M', lower: 'm', say: 'me',       word: 'măr',       pic: '🍎' },
  { upper: 'N', lower: 'n', say: 'ne',       word: 'nas',       pic: '👃' },
  { upper: 'O', lower: 'o', say: 'o',        word: 'ou',        pic: '🥚' },
  { upper: 'P', lower: 'p', say: 'pe',       word: 'pește',     pic: '🐟' },
  { upper: 'Q', lower: 'q', say: 'chiu',     word: '',          pic: ''   },
  { upper: 'R', lower: 'r', say: 're',       word: 'roșie',     pic: '🍅' },
  { upper: 'S', lower: 's', say: 'se',       word: 'soare',     pic: '☀️' },
  { upper: 'Ș', lower: 'ș', say: 'șe',       word: 'șarpe',     pic: '🐍' },
  { upper: 'T', lower: 't', say: 'te',       word: 'telefon',   pic: '📱' },
  { upper: 'Ț', lower: 'ț', say: 'țe',       word: 'țap',       pic: '🐐' },
  { upper: 'U', lower: 'u', say: 'u',        word: 'urs',       pic: '🐻' },
  { upper: 'V', lower: 'v', say: 've',       word: 'vacă',      pic: '🐄' },
  { upper: 'W', lower: 'w', say: 'dublu ve', word: '',          pic: ''   },
  { upper: 'X', lower: 'x', say: 'ics',      word: 'taxi',      pic: '🚕' },
  { upper: 'Y', lower: 'y', say: 'i grec',   word: 'yoga',      pic: '🧘' },
  { upper: 'Z', lower: 'z', say: 'ze',       word: 'zebră',     pic: '🦓' },
];

// ---------------------------------------------------------------------
// 2. LEVELS ("Niveluri"), in the order they are taught
// ---------------------------------------------------------------------
// One block = one level. Each letter has up to 3 levels, shown with stars:
//   ⭐   introduction: learn the letter (with an example word), first exercises
//   ⭐⭐  practice: no introduction page, more questions
//   ⭐⭐⭐ mastery: mixes everything learned so far, more choices (extra, not required)
// A letter's ⭐⭐ opens after its ⭐, its ⭐⭐⭐ after its ⭐⭐.
// The NEXT letter opens after ⭐⭐ (or after ⭐ for a letter that has only ⭐).
//
//   letters   : the letter(s) of this level ('m', or 'm n' for two)
//   stars     : 1, 2 or 3 (see above)
//   find      : (optional) questions in "find the letter by sound";
//               if left out: ⭐ 4, ⭐⭐ 5, ⭐⭐⭐ 6 (choosing from 2, 2, 3, 3, 4, 4 letters)
//   choices   : (optional) how many letters to choose from in each of those questions,
//               e.g. [2, 3, 3, 4]; if left out: 2, 2, 3, 3, 4, 4
//   quiz      : (optional) questions in the syllable quiz;
//               if left out: ⭐ 4, ⭐⭐ 5, ⭐⭐⭐ 6
//   syllables : NEW syllables to read and hear (only letters learned so far)
//   words     : NEW short words to read and hear (only letters learned so far)
// At most 2 new syllables and words together per level.
// Leave syllables / words empty ([]) when there are none.

const LEVELS = [
  // letter order: a, m, i, n, d, e
  { letters: 'a', stars: 1, find: 6, syllables: [],                words: [] },  // one letter alone: nothing to combine yet

  { letters: 'm', stars: 1, find: 6, quiz: 2, syllables: ['ma'],   words: ['mama'] },
  { letters: 'm', stars: 2, find: 6, quiz: 4, syllables: ['am'],   words: [] },

  { letters: 'i', stars: 1, syllables: ['mi'],                     words: [] },
  { letters: 'i', stars: 2, syllables: ['ia'],                     words: [] },
  { letters: 'i', stars: 3, syllables: ['ai'],                     words: ['Mai'] },

  { letters: 'n', stars: 1, syllables: ['ni'],                     words: ['an'] },  // an = year (with a picture)
  { letters: 'n', stars: 2, syllables: [],                         words: ['Ana', 'ani'] },
  { letters: 'n', stars: 3, syllables: [],                         words: ['inimă'] },  // ă is shown, not taught yet

  { letters: 'd', stars: 1, syllables: ['da', 'di'],               words: [] },
  { letters: 'd', stars: 2, syllables: [],                         words: ['dai', 'iad'] },
  { letters: 'd', stars: 3, syllables: [],                         words: ['Nadia'] },

  { letters: 'e', stars: 1, syllables: ['me', 'ne'],               words: [] },
  { letters: 'e', stars: 2, syllables: [],                         words: ['ea', 'mea'] },  // ea = she (with a picture)
  { letters: 'e', stars: 3, syllables: [],                         words: ['mine', 'Ema'] },
];

// Letters that look alike (small letters). In "find the letter by sound", when one of them is
// asked and the other is already learned, both are among the choices (shown as small letters),
// so the learner practises telling them apart. Add more pairs later, e.g. ['b', 'd'], ['n', 'm'].
const SIMILAR_LETTERS = [
  ['a', 'd'],
];

// Words that are split into syllables wrongly by the app's simple rule can be split
// here by hand, with "-" between the syllables (the app shows them as Na + di + a).
const SYLLABLE_SPLIT = {
  Nadia: 'Na-di-a',
  ani: 'ani',      // one syllable: shown letter by letter, a + n + i
};

// ---------------------------------------------------------------------
// 3. PICTURES for the words in the levels (shown on the words screen)
// ---------------------------------------------------------------------
// Write the word exactly as in LEVELS. The picture is an emoji, or an image
// file in the pictures/ folder. A word without a picture here is shown without one.

const WORD_PICTURES = {
  // "ai" has no picture on purpose.
  sus:  '⬆️',                 // up
  Isus: 'pictures/isus.jpg',  // icon of Christ Pantocrator, Russian, 19th century (public domain,
                               // Wikimedia Commons: File:Christ_Pantocrator_Russian_icon.jpg)
  mii:  'pictures/mii.svg',   // thousands: 1000 and coins (drawn for Bibcit)
  Mai:  'pictures/mai.svg',   // the month of May: a calendar page (drawn for Bibcit)
  mama: '👩‍👧',                // mother and child
  nu:   '❌',                 // no
  nas:  '👃',                 // nose
  Ana:  '👧',                 // a girl's name
  una:  '1️⃣',                 // one
  sun:  '📞',                 // I call (on the phone)
  an:   'pictures/an.jpg',    // a year: a calendar of the whole year (picture added by the user)
  ani:  'pictures/ani.jpg',   // years: a woman with a birthday cake full of candles (picture added by the
                               // user; photo marked MAZKO VADIM / mazkovadim.com; whole photo, 640 px copy of ani-original.jpg)
  dai:  'pictures/dai.jpg',   // you give: one person gives another a present (picture added by the user)
  iad:  'pictures/iad.jpg',   // hell: flames (picture added by the user)
  inimă: '❤️',               // the heart (as in Alfabetul)
  ea:   'pictures/ea.jpg',    // she: a woman's face (picture added by the user)
  mine: 'pictures/mine.png',  // me: a person pointing at himself (picture added by the user)
};

// ---------------------------------------------------------------------
// 4. More words for "Cu ce literă începe?" (a picture, its word is spoken, tap the first letter)
// ---------------------------------------------------------------------
// The task also uses the words of WORD_PICTURES and the example words of Alfabetul.
// Add easy, everyday words here, with an emoji or a picture file. Avoid words that start
// with "ea", "ia", "ie" (their first sound is not the letter you see).
const INITIAL_WORDS = {
  albină: '🐝', ananas: '🍍',
  mașină: '🚗', minge: '⚽',
  inel: '💍',
  nor: 'pictures/nor.svg',   // a big cloud in a blue sky (drawn for Bibcit; ☁️ alone was too plain)
  delfin: '🐬', dovleac: 'pictures/dovleac.svg',   // a plain pumpkin (drawn for Bibcit; 🎃 has a carved face)
  elicopter: '🚁',
};
