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
//               if left out: ⭐ 4, ⭐⭐ 5, ⭐⭐⭐ 6
//   quiz      : (optional) questions in the syllable quiz;
//               if left out: ⭐ 4, ⭐⭐ twice the new syllables/words (3 to 6), ⭐⭐⭐ 6
//   syllables : NEW syllables to read and hear (only letters learned so far)
//   words     : NEW short words to read and hear (only letters learned so far)
// At most 2 new syllables and words together per level.
// Leave syllables / words empty ([]) when there are none.

const LEVELS = [
  { letters: 'i', stars: 1, syllables: [],                         words: [] },

  { letters: 's', stars: 1, syllables: ['si', 'is'],               words: [] },
  { letters: 's', stars: 2, syllables: ['si', 'is'],               words: [] },  // no other syllables possible yet: repeats

  { letters: 'u', stars: 1, syllables: [],                         words: ['sus', 'Isus'] },
  { letters: 'u', stars: 2, quiz: 4, syllables: ['su', 'us'],      words: [] },
  { letters: 'u', stars: 3, syllables: [],                         words: [] },  // nothing new possible: the quiz mixes all earlier ones

  { letters: 'm', stars: 1, syllables: ['mi', 'mu'],               words: [] },
  { letters: 'm', stars: 2, quiz: 4, syllables: ['um'],            words: ['mii'] },
  { letters: 'm', stars: 3, syllables: ['im'],                     words: [] },

  { letters: 'a', stars: 1, syllables: ['ma', 'sa'],               words: [] },
  { letters: 'a', stars: 2, syllables: ['am'],                     words: ['mama'] },
  { letters: 'a', stars: 3, syllables: [],                         words: ['ai', 'sau'] },

  { letters: 'n', stars: 1, syllables: ['nu', 'un'],               words: [] },
  { letters: 'n', stars: 2, syllables: [],                         words: ['nas', 'Ana'] },
  { letters: 'n', stars: 3, syllables: [],                         words: ['sun', 'Manu'] },
];

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
  mai:  'pictures/mai.svg',   // the month of May: a calendar page (drawn for Bibcit)
  mama: '👩‍👧',                // mother and child
  nas:  '👃',                 // nose
  Ana:  '👧',                 // a girl's name
  una:  '1️⃣',                 // one
  sun:  '📞',                 // I call (on the phone)
};
