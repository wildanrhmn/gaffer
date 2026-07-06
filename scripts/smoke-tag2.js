// Steady-state tagging: load once, tag several diverse remarks, measure each.
import { MatchTimeline } from '../src/timeline.js';
import { loadLLM, chat } from '../src/qvac/runtime.js';
import { MODELS } from '../src/qvac/models.js';
import { taggerMessages, extractJson } from '../src/prompts.js';
import { normalizeTags } from '../src/tagger.js';
import { demoMatch } from '../src/fixtures/demo-match.js';

const tl = new MatchTimeline(demoMatch);
const cases = [
  "Their number 7 got in behind Priya again down our right, that's twice now.",
  'Lovely play Grace, that\'s the pass we want.',
  "We keep losing the second ball in midfield, Nadia you're too deep, step up.",
  "Watch the throw-in, they've got a routine, mark their big number 4 short.",
];

console.error('Loading tag model...');
const tLoad = Date.now();
const modelId = await loadLLM({ key: 'tag', modelSrc: MODELS.tag, modelType: 'llm' });
console.error(`Loaded in ${((Date.now() - tLoad) / 1000).toFixed(1)}s\n`);

for (const text of cases) {
  const u = tl.addUtterance({ text, tMs: 0 });
  const t0 = Date.now();
  const raw = await chat(modelId, taggerMessages(u, tl.roster));
  const tags = normalizeTags(extractJson(raw));
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[${dt}s] ${text}`);
  console.log('   ->', JSON.stringify(tags), '\n');
}
process.exit(0);
