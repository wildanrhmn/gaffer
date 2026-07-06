// Match timeline — the shared in-memory state of a match.
//
// Pure logic, no SDK. The capture pipeline (STT) appends utterances; the tagger
// annotates them; the synthesis step reads the whole timeline. Kept dependency-free
// so it is trivially testable and deterministic.

import { maskOpponentRefs } from './football.js';

/** @typedef {'attack'|'defence'|'transition'|'set-piece'|'general'} Phase */
/** @typedef {{ number: number, name: string, position?: string }} Player */

/**
 * @typedef {Object} Utterance
 * @property {string}   id
 * @property {number}   tMs        offset from kickoff in milliseconds
 * @property {string}   text       raw transcribed speech
 * @property {number[]} players    roster numbers referenced (filled by tagger)
 * @property {Phase}    phase      play phase (filled by tagger)
 * @property {string[]} themes     e.g. ['pressing','second-balls'] (filled by tagger)
 * @property {number}   [sentiment] -1..1, negative = concern (filled by tagger)
 * @property {boolean}  tagged
 */

const PHASES = ['attack', 'defence', 'transition', 'set-piece', 'general'];

export class MatchTimeline {
  /**
   * @param {Object} opts
   * @param {string} opts.team
   * @param {string} [opts.opponent]
   * @param {Player[]} [opts.roster]
   */
  constructor({ team, opponent = 'Opponent', roster = [] }) {
    this.team = team;
    this.opponent = opponent;
    /** @type {Player[]} */
    this.roster = roster;
    /** @type {Utterance[]} */
    this.utterances = [];
    this.half = 1;
    /** @type {number|null} epoch ms of kickoff, or null before kickoff */
    this.kickoffAt = null;
    this._seq = 0;
  }

  /** Mark kickoff. `now` is injected so the module stays deterministic/testable. */
  kickoff(now) {
    this.kickoffAt = now;
    return this;
  }

  /** Look up a roster player by shirt number. */
  playerByNumber(number) {
    return this.roster.find((p) => p.number === number) ?? null;
  }

  /**
   * Append a raw utterance. `tMs` may be given directly (demo/replay) or derived
   * from `now` relative to kickoff.
   * @param {Object} a
   * @param {string} a.text
   * @param {number} [a.tMs]
   * @param {number} [a.now]  epoch ms, used with kickoffAt if tMs omitted
   * @returns {Utterance}
   */
  addUtterance({ text, tMs, now }) {
    if (tMs == null) {
      if (now == null || this.kickoffAt == null) {
        throw new Error('addUtterance needs either tMs, or now + a prior kickoff()');
      }
      tMs = Math.max(0, now - this.kickoffAt);
    }
    /** @type {Utterance} */
    const u = {
      id: `u${++this._seq}`,
      tMs,
      text: text.trim(),
      players: [],
      phase: 'general',
      themes: [],
      tagged: false,
    };
    this.utterances.push(u);
    this.utterances.sort((a, b) => a.tMs - b.tMs);
    return u;
  }

  /**
   * Apply tagger output to an utterance.
   * @param {string} id
   * @param {{players?: number[], phase?: Phase, themes?: string[], sentiment?: number}} tags
   */
  applyTags(id, tags) {
    const u = this.utterances.find((x) => x.id === id);
    if (!u) throw new Error(`unknown utterance ${id}`);
    if (tags.players) u.players = tags.players.filter((n) => this.playerByNumber(n));
    if (tags.phase && PHASES.includes(tags.phase)) u.phase = tags.phase;
    if (tags.themes) u.themes = tags.themes.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (typeof tags.sentiment === 'number') u.sentiment = clamp(tags.sentiment, -1, 1);
    u.tagged = true;
    return u;
  }

  get untagged() {
    return this.utterances.filter((u) => !u.tagged);
  }

  /** Distinct themes seen so far, most frequent first. */
  themeFrequencies() {
    const counts = new Map();
    for (const u of this.utterances) {
      for (const t of u.themes) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }

  /** Utterances mentioning a given player number. */
  forPlayer(number) {
    return this.utterances.filter((u) => u.players.includes(number));
  }

  /**
   * Compact, model-friendly rendering of the timeline for the synthesis prompt.
   * Deterministic ordering; formats mm:ss so a small model reads it easily.
   */
  toPromptContext() {
    const lines = this.utterances.map((u) => {
      const who = u.players.length
        ? u.players.map((n) => `#${n}${nameSuffix(this.playerByNumber(n))}`).join(',')
        : '-';
      const themes = u.themes.length ? ` [${u.themes.join(',')}]` : '';
      // Mask "their 7" etc. so synthesis can't confuse it with our #7.
      return `${mmss(u.tMs)} (${u.phase}, ${who})${themes}: ${maskOpponentRefs(u.text)}`;
    });
    return [
      `Match: ${this.team} vs ${this.opponent} — half ${this.half}`,
      `Squad: ${this.roster.map((p) => `#${p.number} ${p.name}${p.position ? ` (${p.position})` : ''}`).join(', ') || '(none)'}`,
      '',
      'Coach notes (chronological):',
      ...lines,
    ].join('\n');
  }
}

function nameSuffix(p) {
  return p ? ` ${p.name}` : '';
}

function mmss(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x));
}

export { PHASES };
