// Shared football-language helpers — pure, tested. The one tricky bit in this
// domain is that "their 7" / "their number 4" must never be confused with OUR
// shirt #7 / #4. Both the tagger (who is this about?) and the synthesis prompt
// (don't advise about the opponent's player) depend on getting that right.

// A number attributed to the opposition: within a few words after their/they/…
const OPP_SRC =
  "\\b(?:their|they|them|those|opposition|opponents?|opposing|the other(?:\\s+(?:team|lot|side))?)\\b" +
  "(?:\\s+[a-z']+){0,3}?\\s+(?:number\\s+|no\\.?\\s*|#)?(\\d{1,2})\\b";

const oppRe = () => new RegExp(OPP_SRC, 'gi');

// A fixed tactical vocabulary keeps the theme chips consistent and meaningful —
// small models otherwise emit filler words ("keep", "no", "rush") as "themes".
export const THEME_VOCAB = [
  'pressing', 'marking', 'second-balls', 'build-up', 'transition-defence', 'set-piece',
  'shape', 'width', 'finishing', 'passing', 'tempo', 'compactness', 'tracking-runs',
  'switch-play', 'crossing', 'counter-attack',
];

const THEME_ALIAS = {
  'second-ball': 'second-balls', 'transition': 'transition-defence',
  'transition-defense': 'transition-defence', 'press': 'pressing', 'pressing-together': 'pressing',
  'compact': 'compactness', 'compactness': 'compactness', 'set-pieces': 'set-piece',
  'defending': 'marking', 'defence': 'marking', 'possession': 'build-up', 'pass': 'passing',
  'play': 'build-up', 'tracking': 'tracking-runs', 'counter': 'counter-attack',
};

/** Snap a raw model theme onto the canonical vocabulary, or null if it isn't tactical. */
export function normalizeTheme(t) {
  const k = String(t).toLowerCase().trim().replace(/\s+/g, '-');
  const a = THEME_ALIAS[k] ?? k;
  return THEME_VOCAB.includes(a) ? a : null;
}

/** Shirt numbers the remark attributes to the OPPONENT. */
export function opponentNumbers(text) {
  const nums = new Set();
  for (const m of ` ${text} `.matchAll(oppRe())) nums.add(parseInt(m[1], 10));
  return nums;
}

/**
 * Replace opponent-number references with a neutral "the opposition" so a language
 * model reading the notes can't map "their 7" onto our #7. Keeps our own refs intact.
 */
export function maskOpponentRefs(text) {
  return text.replace(oppRe(), 'the opposition');
}
