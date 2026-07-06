// Diagnostic: does modelConfig.ctx_size actually apply, and how big is the few-shot prompt?
import { loadModel, completion, LLAMA_3_2_1B_INST_Q4_0 } from '@qvac/sdk';
import { taggerMessages } from '../src/prompts.js';
import { demoRoster } from '../src/fixtures/demo-match.js';

const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelType: 'llm',
  modelConfig: { ctx_size: 4096 },
  onProgress: () => {},
});
console.error('loaded', modelId);

const cases = [
  ['short', [{ role: 'user', content: 'Reply with one word: ok' }]],
  ['fewshot', taggerMessages({ text: 'Their 7 beat Priya again down our right' }, demoRoster)],
];

for (const [label, history] of cases) {
  try {
    const t = Date.now();
    const run = completion({ modelId, history, stream: true });
    const f = await run.final;
    const dt = ((Date.now() - t) / 1000).toFixed(1);
    console.log(`\n[${label}] ${dt}s`);
    console.log('  text:', JSON.stringify((f.contentText ?? '').slice(0, 220)));
    console.log('  stats:', JSON.stringify(f.stats ?? {}));
  } catch (e) {
    console.log(`\n[${label}] ERROR: ${e.message}`);
  }
}
process.exit(0);
