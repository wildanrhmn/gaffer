// LLM tagger — annotates each raw utterance with player / phase / theme / sentiment.
// Runs the SMALL model LOCALLY (real-time, offline, free). No delegation here.

import { loadLLM, chat } from './qvac/runtime.js';
import { MODELS } from './qvac/models.js';
import { taggerMessages, extractJson } from './prompts.js';
import { opponentNumbers, normalizeTheme } from './football.js';

/** Coerce a small model's loose JSON into the tag shape timeline.applyTags expects. */
export function normalizeTags(json) {
  if (!json || typeof json !== 'object') return { players: [], phase: 'general', themes: [] };
  const players = Array.isArray(json.players)
    ? json.players.map((n) => parseInt(n, 10)).filter((n) => Number.isInteger(n))
    : [];
  const themes = Array.isArray(json.themes)
    ? [...new Set(json.themes.map(normalizeTheme).filter(Boolean))].slice(0, 3)
    : [];
  const phase = typeof json.phase === 'string' ? json.phase : 'general';
  const sentiment = typeof json.sentiment === 'number' ? json.sentiment : undefined;
  return { players, phase, themes, sentiment };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Deterministically resolve which of OUR players a remark is about. Small models
 * reliably grab "their number 7" as if it were ours; a regex + the roster does not.
 * The LLM's guesses are kept only if not flagged as the opponent; players named in
 * the squad are always kept (and immune to the opponent-number filter).
 * @param {string} text
 * @param {{number:number,name:string}[]} roster
 * @param {number[]} [llmPlayers]
 * @returns {number[]}
 */
export function resolvePlayers(text, roster, llmPlayers = []) {
  const lower = ` ${text.toLowerCase()} `;
  const onRoster = new Set(roster.map((p) => p.number));

  // Numbers attributed to the opponent (shared, tested detector).
  const oppNums = opponentNumbers(lower);

  // Numbers explicitly ours: "our (number) N".
  const ourNums = new Set();
  const ourRe = /\bour\b(?:\s+[a-z']+){0,2}?\s+(?:number\s+|no\.?\s*|#)?(\d{1,2})\b/g;
  for (const m of lower.matchAll(ourRe)) {
    const n = parseInt(m[1], 10);
    if (onRoster.has(n)) ourNums.add(n);
  }

  // Players named in the squad — always ours, always kept.
  const keep = new Set(ourNums);
  for (const p of roster) {
    if (new RegExp(`\\b${escapeRe(p.name.toLowerCase())}(?:'s)?\\b`).test(lower)) keep.add(p.number);
  }
  // Keep the LLM's numbers unless they're on the roster-miss list or flagged opponent.
  for (const n of llmPlayers) if (onRoster.has(n) && !oppNums.has(n)) keep.add(n);

  return [...keep].slice(0, 4);
}

/**
 * Tag one utterance object ({ text, ... }). Returns the normalized tags.
 * @param {{text:string}} utterance
 * @param {{number:number,name:string}[]} roster
 */
export async function tagUtterance(utterance, roster) {
  const modelId = await loadLLM({ key: 'tag', modelSrc: MODELS.tag, modelType: 'llm' });
  const raw = await chat(modelId, taggerMessages(utterance, roster));
  const tags = normalizeTags(extractJson(raw));
  // Override player identity with the deterministic resolver — the model is
  // unreliable on "their <number>"; the roster + text are not.
  tags.players = resolvePlayers(utterance.text, roster, tags.players);
  return tags;
}

/**
 * Tag every untagged utterance in a timeline in-place. Sequential on purpose:
 * one shared Bare worker, and grassroots volume is low — clarity over parallelism.
 * @param {import('./timeline.js').MatchTimeline} timeline
 * @param {(u:any, tags:any)=>void} [onTagged]
 */
export async function tagTimeline(timeline, onTagged) {
  for (const u of timeline.untagged) {
    const tags = await tagUtterance(u, timeline.roster);
    timeline.applyTags(u.id, tags);
    onTagged?.(u, tags);
  }
  return timeline;
}
