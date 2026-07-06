// Smoke: on-device STT. Transcribe the TTS-generated clip back to text (round-trip).
import { transcribeClip } from '../src/stt.js';
import { existsSync } from 'node:fs';

const clip = 'data/tts-smoke.wav';
if (!existsSync(clip)) { console.error('run scripts/smoke-tts.js first'); process.exit(1); }

const t0 = Date.now();
const text = await transcribeClip(clip);
console.log('STT:', JSON.stringify(text));
console.error(`(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(0);
