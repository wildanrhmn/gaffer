// Smoke: on-device TTS produces a playable WAV. First run downloads the TTS model.
import { loadLLM, synthesizeSpeech } from '../src/qvac/runtime.js';
import { MODELS, MODEL_TYPES, TTS_SAMPLE_RATE } from '../src/qvac/models.js';
import { writeWav } from '../src/wav.js';
import { statSync } from 'node:fs';

const t0 = Date.now();
const id = await loadLLM({ key: 'tts', modelSrc: MODELS.tts, modelType: MODEL_TYPES.tts });
console.error(`TTS model loaded in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const pcm = await synthesizeSpeech(id, 'Second half. Keep Priya tight on the right, and win those second balls.');
console.error(`PCM bytes: ${pcm?.length ?? 'none'} (type ${pcm?.constructor?.name})`);

const path = await writeWav(pcm, { sampleRate: TTS_SAMPLE_RATE, path: 'data/tts-smoke.wav' });
const size = statSync(path).size;
console.log(`WROTE ${path} — ${size} bytes, ~${(size / (TTS_SAMPLE_RATE * 2)).toFixed(1)}s audio`);
process.exit(0);
