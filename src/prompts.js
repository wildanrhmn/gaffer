// Prompt construction — pure functions, no SDK. Kept separate so prompts can be
// unit-tested and tuned without touching model plumbing.
//
// Design note: grassroots synthesis quality on a 1-4B model lives or dies on the
// prompt and on feeding STRUCTURED tagged events rather than raw transcript. These
// prompts are terse, role-anchored, and demand a fixed output shape.

import { PHASES } from './timeline.js';
import { THEME_VOCAB } from './football.js';

/**
 * Messages for tagging a single utterance. Small models (1B) ramble and over-tag,
 * so we use tight rules + two few-shot turns (one praise, one concern) and demand
 * minimal output. The roster is inlined so "number 7" / "Priya" both resolve.
 * @param {import('./timeline.js').Utterance} utterance
 * @param {{number:number,name:string,position?:string}[]} roster
 */
export function taggerMessages(utterance, roster) {
  const squad = roster
    .map((p) => `#${p.number} ${p.name}${p.position ? ` (${p.position})` : ''}`)
    .join(', ');

  const rules =
    'You label ONE football coach touchline remark as JSON. Output ONLY the JSON object.\n' +
    'Schema: {"players":[int],"phase":str,"themes":[str],"sentiment":number}\n' +
    '- players: shirt numbers of OUR players only. Match names to the squad (e.g. "Priya" -> her number). Usually 0, 1 or 2 numbers. NEVER list the whole squad.\n' +
    '- CRITICAL: a number or role after "their"/"they"/"opponent" (e.g. "their 7", "their number 4", "their winger") is an OPPONENT — NEVER put it in players. If our player was beaten/affected, include OUR player (by name) instead.\n' +
    `- phase: one of ${JSON.stringify(PHASES)}.\n` +
    `- themes: choose 0 to 3 ONLY from this list: ${THEME_VOCAB.join(', ')}. Use [] if none apply. Never invent themes.\n` +
    '- sentiment: -1 for concern/criticism, 0 neutral, +1 for praise.';

  // Few-shot: the squad differs from the real one on purpose so the model learns the
  // TASK, not specific numbers. Cases chosen to teach the "their <number>" trap.
  const exSquad = '#2 Ben (RB), #6 Tom (DM), #9 Sam (ST)';
  const shots = [
    { role: 'user', content: `${rules}\n\nSquad: ${exSquad}\nRemark: "Their number 7 got in behind Ben again down our right, that's twice."\nJSON:` },
    { role: 'assistant', content: '{"players":[2],"phase":"defence","themes":["marking","transition-defence"],"sentiment":-1}' },
    { role: 'user', content: `Squad: ${exSquad}\nRemark: "Lovely press Sam, that's exactly it."\nJSON:` },
    { role: 'assistant', content: '{"players":[9],"phase":"attack","themes":["pressing"],"sentiment":1}' },
    { role: 'user', content: `Squad: ${exSquad}\nRemark: "Mark their number 4 at the throw-in, they've got a routine."\nJSON:` },
    { role: 'assistant', content: '{"players":[],"phase":"set-piece","themes":["marking","set-piece"],"sentiment":0}' },
    { role: 'user', content: `Squad: ${squad}\nRemark: "${utterance.text}"\nJSON:` },
  ];
  return shots;
}

/**
 * Messages for half/full-time synthesis. Consumes the whole tagged timeline
 * (via timeline.toPromptContext()) and demands exactly three concrete adjustments.
 * @param {import('./timeline.js').MatchTimeline} timeline
 * @param {{ half?: boolean }} [opts]
 */
export function synthesisMessages(timeline, { half = true } = {}) {
  const when = half ? 'It is half-time' : 'The match has finished';
  const themes = timeline.themeFrequencies();
  const themeHint = themes.length
    ? `\nRecurring themes by frequency: ${themes.map(([t, n]) => `${t}(${n})`).join(', ')}.`
    : '';

  const system =
    'You are an experienced football coach\'s analyst. You are given a coach\'s own ' +
    'timestamped touchline notes from the match. ' +
    `${when}. Give the coach exactly THREE concrete tactical adjustments for the next period. ` +
    'Rules: each adjustment must reference a SPECIFIC pattern from the notes (name the player number ' +
    'and the recurring issue), then a SPECIFIC instruction. No generic advice ("play better", ' +
    '"stay focused" are banned). Each adjustment must cover a DIFFERENT player and a DIFFERENT ' +
    'issue — do not repeat a player across adjustments. One sentence each. Number them 1., 2., 3. Nothing else. ' +
    'Every #N in the Squad line is YOUR player; "the opposition" means opponents — never advise ' +
    'coaching an opponent player.';

  const user = `${timeline.toPromptContext()}${themeHint}\n\nThree adjustments:`;

  return [
    { role: 'user', content: `${system}\n\n${user}` },
  ];
}

/**
 * Best-effort JSON extraction from a small model's text output.
 * Handles code fences and leading/trailing prose.
 * @returns {any|null}
 */
export function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
