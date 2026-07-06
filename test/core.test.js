import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MatchTimeline } from '../src/timeline.js';
import { taggerMessages, synthesisMessages, extractJson } from '../src/prompts.js';
import { resolvePlayers, normalizeTags } from '../src/tagger.js';
import { parseAdjustments } from '../src/synthesize.js';
import { opponentNumbers, maskOpponentRefs } from '../src/football.js';
import { demoMatch, demoNarration } from '../src/fixtures/demo-match.js';

test('timeline: kickoff + tMs from now', () => {
  const tl = new MatchTimeline({ team: 'A', opponent: 'B', roster: [{ number: 7, name: 'Zara' }] });
  tl.kickoff(1000);
  const u = tl.addUtterance({ text: 'go', now: 4000 });
  assert.equal(u.tMs, 3000);
});

test('timeline: applyTags filters unknown players and clamps sentiment', () => {
  const tl = new MatchTimeline({ team: 'A', roster: [{ number: 7, name: 'Zara' }] });
  const u = tl.addUtterance({ text: 'x', tMs: 0 });
  tl.applyTags(u.id, { players: [7, 99], phase: 'defence', themes: ['pressing'], sentiment: -5 });
  assert.deepEqual(u.players, [7]); // 99 not on roster
  assert.equal(u.phase, 'defence');
  assert.deepEqual(u.themes, ['pressing']);
  assert.equal(u.sentiment, -1); // clamped
  assert.equal(u.tagged, true);
});

test('timeline: themeFrequencies sorts by count', () => {
  const tl = new MatchTimeline({ team: 'A', roster: [{ number: 6, name: 'Nadia' }] });
  for (const t of [['a'], ['a'], ['b']]) {
    const u = tl.addUtterance({ text: 't', tMs: 0 });
    tl.applyTags(u.id, { themes: t });
  }
  assert.deepEqual(tl.themeFrequencies(), [['a', 2], ['b', 1]]);
});

test('timeline: toPromptContext resolves names', () => {
  const tl = new MatchTimeline({ team: 'Riverside', opponent: 'Oak', roster: demoMatch.roster });
  const u = tl.addUtterance({ text: 'Priya tighter', tMs: 95_000 });
  tl.applyTags(u.id, { players: [2], phase: 'defence', themes: ['marking'] });
  const ctx = tl.toPromptContext();
  assert.match(ctx, /Riverside vs Oak/);
  assert.match(ctx, /01:35 \(defence, #2 Priya\) \[marking\]/);
});

test('prompts: tagger message inlines roster, few-shots, and demands JSON', () => {
  const msgs = taggerMessages({ text: 'number 7 quick' }, demoMatch.roster);
  assert.ok(msgs.length >= 3, 'should include few-shot turns');
  assert.match(msgs[0].content, /Output ONLY the JSON object/);
  const last = msgs.at(-1);
  assert.equal(last.role, 'user');
  assert.match(last.content, /#7 Zara/); // real squad appears in the final turn
  assert.match(last.content, /number 7 quick/);
});

test('prompts: synthesis demands exactly three adjustments', () => {
  const tl = new MatchTimeline(demoMatch);
  const u = tl.addUtterance({ text: 'second balls', tMs: 210_000 });
  tl.applyTags(u.id, { players: [6], phase: 'transition', themes: ['second-balls'] });
  const [msg] = synthesisMessages(tl, { half: true });
  assert.match(msg.content, /exactly THREE/);
  assert.match(msg.content, /half-time/);
  assert.match(msg.content, /second-balls\(1\)/);
});

test('prompts: extractJson survives code fences and prose', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('sure! {"players":[7],"phase":"defence"} done'), {
    players: [7],
    phase: 'defence',
  });
  assert.equal(extractJson('no json here'), null);
});

test('resolvePlayers: excludes opponent numbers, keeps named players', () => {
  const roster = demoMatch.roster; // Priya #2, Nadia #6, Grace #8
  // "their number 7 ... Priya" — model wrongly guessed [7]; should resolve to [2].
  assert.deepEqual(
    resolvePlayers("Their number 7 got in behind Priya again down our right.", roster, [7]),
    [2]
  );
  // "mark their big number 4" — model guessed [4]; opponent → [].
  assert.deepEqual(
    resolvePlayers('Watch the throw-in, mark their big number 4 short.', roster, [4]),
    []
  );
  // Named player, praise — Grace is #8.
  assert.deepEqual(resolvePlayers('Lovely play Grace.', roster, [8]), [8]);
  // "our number 6" explicit.
  assert.deepEqual(resolvePlayers('Push our number 6 higher.', roster, []), [6]);
});

test('resolvePlayers: a named player is immune to opponent-number collision', () => {
  const roster = [{ number: 2, name: 'Priya' }];
  // opponent also wears 2, but Priya is named → keep her.
  assert.deepEqual(resolvePlayers('Their 2 fouled Priya there.', roster, [2]), [2]);
});

test('tagger.normalizeTags: snaps themes to vocab, aliases, caps at 3', () => {
  const t = normalizeTags({ players: [6], phase: 'transition', themes: ['keep', 'second-ball', 'Pressing', 'rush', 'marking'] });
  // filler ("keep","rush") dropped, "second-ball"->"second-balls", cap 3
  assert.deepEqual(t.themes, ['second-balls', 'pressing', 'marking']);
});

test('football: opponentNumbers + maskOpponentRefs', () => {
  assert.deepEqual([...opponentNumbers('Their number 7 got behind Priya')], [7]);
  assert.deepEqual([...opponentNumbers('mark their big number 4 short')], [4]);
  assert.equal(opponentNumbers('Push our number 6 higher').size, 0);
  assert.equal(maskOpponentRefs('Their 7 got in behind Priya again'), 'the opposition got in behind Priya again');
  assert.equal(maskOpponentRefs('mark their big number 4 short'), 'mark the opposition short');
  assert.equal(maskOpponentRefs('Lovely play Grace'), 'Lovely play Grace'); // untouched
});

test('parseAdjustments: strips leaked <think> and returns three items', () => {
  const raw =
    '<think>Let me reason about the notes and pick patterns.</think>\n\n' +
    '1. Transition-defence: step up Nadia and Grace to win second balls.\n' +
    '2. Marking: keep Priya compact to stop their 7 turning.\n' +
    '3. Pressing: press together so Fatima is not isolated.';
  const adj = parseAdjustments(raw);
  assert.equal(adj.length, 3);
  assert.match(adj[0], /^Transition-defence/);
  assert.doesNotMatch(adj.join(' '), /think/i);
});

test('fixtures: demo narration is well-formed and ordered', () => {
  assert.ok(demoNarration.length >= 12);
  for (let i = 1; i < demoNarration.length; i++) {
    assert.ok(demoNarration[i].tMs >= demoNarration[i - 1].tMs, 'narration must be time-ordered');
    assert.equal(typeof demoNarration[i].text, 'string');
  }
});
