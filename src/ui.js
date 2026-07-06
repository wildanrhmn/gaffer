// Tiny ANSI console helpers — zero dependencies. Keeps the demo readable.
const on = process.stdout.isTTY;
const c = (code) => (s) => (on ? `\x1b[${code}m${s}\x1b[0m` : String(s));

export const dim = c('2');
export const bold = c('1');
export const green = c('32');
export const cyan = c('36');
export const yellow = c('33');
export const red = c('31');
export const magenta = c('35');

export function rule(label = '') {
  const line = '─'.repeat(Math.max(4, 60 - label.length));
  return dim(label ? `── ${label} ${line}` : `──${line}────`);
}

export function mmss(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Colour an utterance line by sentiment: praise green, concern red. */
export function utteranceLine(u) {
  const who = u.players.length ? u.players.map((n) => `#${n}`).join(',') : '·';
  const themes = u.themes.length ? dim(` [${u.themes.join(', ')}]`) : '';
  const tone =
    u.sentiment == null ? (s) => s : u.sentiment < -0.15 ? red : u.sentiment > 0.15 ? green : (s) => s;
  return `${dim(mmss(u.tMs))} ${cyan(u.phase.padEnd(10))} ${yellow(who.padEnd(6))} ${tone(u.text)}${themes}`;
}
