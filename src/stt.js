// Speech-to-text — turns touchline audio into utterances via QVAC (Whisper), on-device.
//
// v1 supports transcribing a recorded narration clip (a file path or PCM buffer),
// which proves the on-device STT path end-to-end. Live streaming mic capture
// (transcribeStream duplex session) is the mobile/Expo path on the roadmap.

import { loadLLM, transcribeAudio } from './qvac/runtime.js';
import { MODELS, MODEL_TYPES } from './qvac/models.js';

/**
 * Transcribe a single audio chunk to text using the on-device Whisper model.
 * @param {string|Buffer|Uint8Array} audio  file path or PCM buffer
 * @returns {Promise<string>}
 */
export async function transcribeClip(audio) {
  const modelId = await loadLLM({
    key: 'stt',
    modelSrc: MODELS.stt,
    modelType: MODEL_TYPES.stt,
  });
  return transcribeAudio(modelId, audio);
}

/**
 * Transcribe a clip and append it to a timeline as one utterance at time `tMs`.
 * Useful for a "recorded a voice note during the match" flow.
 * @param {import('./timeline.js').MatchTimeline} timeline
 * @param {string|Buffer|Uint8Array} audio
 * @param {number} tMs
 */
export async function captureClip(timeline, audio, tMs) {
  const text = await transcribeClip(audio);
  if (!text) return null;
  return timeline.addUtterance({ text, tMs });
}
