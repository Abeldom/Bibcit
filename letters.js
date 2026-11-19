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
// One block = one level. A level opens when the level before it is passed.
//   letters   : the letter(s) of this level ('m', or 'm n' for two)
//   practice  : true = the second, harder level of the same letter
//               (no "learn" screen; shown as "Mm+")
//   find      : how many questions in "find the letter by its sound"
//   syllables : NEW syllables to read and hear (only letters learned so far)
//   words     : NEW short words to read and hear (only letters learned so far)
// Leave syllables / words empty ([]) when there are none.

const LEVELS = [
  { letters: 'i', find: 4, syllables: [],                         words: [] },
  { letters: 's', find: 6, syllables: ['si', 'is'],               words: [] },
  { letters: 'u', find: 4, syllables: [],                         words: ['sus', 'Isus'] },

  { letters: 'm', find: 4, syllables: ['mi', 'mu'],               words: [] },
  { letters: 'm', find: 6, syllables: ['im', 'um'],               words: ['mii'],                       practice: true },

  { letters: 'a', find: 4, syllables: ['ma', 'sa'],               words: [] },
  { letters: 'a', find: 8, syllables: ['am', 'as'],               words: ['ai', 'mai', 'mama'],         practice: true },

  { letters: 'n', find: 4, syllables: ['na', 'nu'],               words: [] },
  { letters: 'n', find: 8, syllables: ['ni', 'in', 'an', 'un'],   words: ['nas', 'Ana', 'una', 'sun'],  practice: true },
];
