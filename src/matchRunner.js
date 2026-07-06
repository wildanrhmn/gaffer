// Shared match pipeline used by BOTH the CLI demo and the web UI, so there is one
// source of truth. Emits structured events as it goes: match -> utterance* ->
// halftime -> adjustments -> done.

import { MatchTimeline } from './timeline.js';
import { tagUtterance } from './tagger.js';
import { synthesize } from './synthesize.js';
import { demoMatch, demoNarration } from './fixtures/demo-match.js';

function mmss(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Run capture+tagging over the narration, then half-time synthesis.
 * @param {Object} o
 * @param {(e:any)=>void} o.emit           event sink
 * @param {string} [o.providerKey]         provider public key → delegate synthesis
 * @param {object} [o.match]               { team, opponent, roster }
 * @param {{tMs:number,text:string}[]} [o.narration]
 */
export async function runMatch({ emit, providerKey, match = demoMatch, narration = demoNarration }) {
  const tl = new MatchTimeline(match);
  emit({ type: 'match', team: tl.team, opponent: tl.opponent, roster: tl.roster });

  for (const line of narration) {
    const u = tl.addUtterance({ text: line.text, tMs: line.tMs });
    const tags = await tagUtterance(u, tl.roster);
    tl.applyTags(u.id, tags);
    emit({
      type: 'utterance',
      id: u.id,
      clock: mmss(u.tMs),
      phase: u.phase,
      players: u.players.map((n) => ({ n, name: tl.playerByNumber(n)?.name ?? '' })),
      themes: u.themes,
      sentiment: u.sentiment ?? 0,
      text: u.text,
    });
  }

  emit({ type: 'halftime', themes: tl.themeFrequencies() });

  const delegate = providerKey
    ? { providerPublicKey: providerKey, timeout: 60_000, fallbackToLocal: true }
    : undefined;
  const t0 = Date.now();
  const { adjustments, delegated } = await synthesize(tl, { half: true, delegate });
  emit({ type: 'adjustments', items: adjustments, delegated, ms: Date.now() - t0, providerKey: providerKey ?? null });

  emit({ type: 'done' });
  return tl;
}
