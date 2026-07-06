// Smoke test: prove the QVAC runtime actually loads a model and runs inference on
// this machine, end-to-end through our tagger. First run downloads the 1B model.
import { verifyModels } from '../src/qvac/models.js';
import { MatchTimeline } from '../src/timeline.js';
import { tagUtterance } from '../src/tagger.js';
import { demoMatch } from '../src/fixtures/demo-match.js';

verifyModels();
console.error('Models verified. Loading 1B model + tagging one utterance...');

const tl = new MatchTimeline(demoMatch);
const u = tl.addUtterance({
  text: 'Their number 7 got in behind Priya again down our right, that\'s twice now.',
  tMs: 260_000,
});

const t0 = Date.now();
const tags = await tagUtterance(u, tl.roster);
console.error(`Tagged in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(JSON.stringify(tags, null, 2));
process.exit(0);
