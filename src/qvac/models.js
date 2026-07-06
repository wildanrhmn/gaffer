// Central registry of the QVAC model constants Gaffer uses.
//
// We import the whole SDK namespace and pick constants by name so a missing/renamed
// export surfaces as a clear runtime error ("model constant X is undefined") instead
// of crashing the whole module at import time. `verifyModels()` checks them up front.

import * as qvac from '@qvac/sdk';

export const MODELS = {
  // Runs LOCALLY on the capture device for real-time tagging. 1.7B follows the
  // "resolve names/numbers, ignore the opponent" instruction far better than 1B,
  // and is still sub-second on a GPU.
  tag: qvac.QWEN3_1_7B_INST_Q4,
  // Larger LLM for half/full-time synthesis — runs on the PROVIDER (laptop) via delegate,
  // with local fallback. Bigger model = better tactical reasoning.
  synth: qvac.QWEN3_1_7B_INST_Q4,
  // Speech-to-text for touchline narration.
  stt: qvac.WHISPER_TINY,
  // Text-to-speech for reading adjustments aloud (Supertonic: single file, 44.1kHz).
  tts: qvac.TTS_EN_SUPERTONIC_Q8_0,
};

export const MODEL_TYPES = {
  tag: 'llm',
  synth: 'llm',
  stt: 'whisper',
  tts: 'tts',
};

// Per-model load config. The default context window is tiny, so we must size it
// for our prompts: the tagger uses a few-shot prompt (~500 tok); synthesis ingests
// the whole match timeline (grows over the game) so it gets a much larger window.
export const MODEL_CONFIG = {
  // reasoning_budget: 0 disables Qwen3's <think> channel — we want direct JSON, fast.
  tag: { ctx_size: 4096, reasoning_budget: 0 },
  synth: { ctx_size: 8192 },
  // TTS: Supertonic engine, English. loadModel validates ttsEngine strictly.
  tts: { ttsEngine: 'supertonic', language: 'en' },
};

// Supertonic outputs 44.1kHz PCM Int16; Chatterbox would be 24kHz. Used when writing WAV.
export const TTS_SAMPLE_RATE = 44_100;

/** Throw early with a helpful message if any expected constant is missing in this SDK build. */
export function verifyModels() {
  const missing = Object.entries(MODELS)
    .filter(([, v]) => v == null)
    .map(([k]) => k);
  if (missing.length) {
    const available = Object.keys(qvac)
      .filter((k) => /^[A-Z0-9_]+$/.test(k))
      .join(', ');
    throw new Error(
      `QVAC model constant(s) missing for: ${missing.join(', ')}.\n` +
        `This SDK build may use different names. Available UPPER_CASE exports:\n${available}`
    );
  }
}
