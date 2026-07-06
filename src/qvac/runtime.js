// Thin, well-documented layer over the QVAC SDK primitives.
//
// Everything in QVAC runs in a single shared Bare worker (one per app), so we cache
// loaded models by a caller-supplied key and reuse them. The delegate option is the
// ONE thing that turns a local call into a P2P-offloaded call — see loadLLM().

import { loadModel, unloadModel, completion, transcribe, textToSpeech } from '@qvac/sdk';
import { MODELS, MODEL_TYPES, MODEL_CONFIG } from './models.js';

/** @type {Map<string, Promise<string>>} key -> modelId promise */
const _cache = new Map();

function progressLogger(label) {
  let last = -1;
  return (p) => {
    // p may be a number (0..1) or an object; be tolerant.
    const pct = typeof p === 'number' ? Math.round(p * 100) : Math.round((p?.progress ?? 0) * 100);
    if (Number.isFinite(pct) && pct !== last && pct % 10 === 0) {
      last = pct;
      process.stderr.write(`  [${label}] ${pct}%\n`);
    }
  };
}

/**
 * Load an LLM (or any model) once and cache it. Pass `delegate` to offload inference
 * to a provider peer over the DHT — the rest of the code is identical to local.
 * @param {Object} o
 * @param {string} o.key            cache key (e.g. 'tag', 'synth')
 * @param {any}    o.modelSrc       a MODELS.* constant
 * @param {string} [o.modelType]    'llm' | 'whisper' | 'tts' | ...
 * @param {Object} [o.modelConfig]  passthrough (ctx_size, projectionModelSrc, ...)
 * @param {{providerPublicKey:string,timeout?:number,fallbackToLocal?:boolean}} [o.delegate]
 * @returns {Promise<string>} modelId
 */
export function loadLLM({ key, modelSrc, modelType = 'llm', modelConfig, delegate }) {
  const cacheKey = delegate ? `${key}@${delegate.providerPublicKey.slice(0, 8)}` : key;
  if (!_cache.has(cacheKey)) {
    const opts = { modelSrc, modelType, onProgress: progressLogger(cacheKey) };
    const cfg = modelConfig ?? MODEL_CONFIG[key];
    if (cfg) opts.modelConfig = cfg;
    if (delegate) opts.delegate = delegate;
    if (process.env.GAFFER_DEBUG) {
      process.stderr.write(`  [loadLLM] ${cacheKey} modelConfig=${JSON.stringify(cfg ?? null)}\n`);
    }
    _cache.set(cacheKey, loadModel(opts));
  }
  return _cache.get(cacheKey);
}

/**
 * Run a chat completion and return the aggregated assistant text.
 * @param {string} modelId
 * @param {{role:'user'|'assistant',content:string}[]} history
 * @param {{onToken?:(t:string)=>void}} [opts]
 * @returns {Promise<string>}
 */
export async function chat(modelId, history, { onToken, captureThinking = true } = {}) {
  // captureThinking routes a reasoning model's <think> channel into thinkingText so
  // it never pollutes contentText. Harmless for non-reasoning models.
  const run = completion({ modelId, history, stream: true, captureThinking });
  if (onToken) {
    // Stream tokens for live UX; final still resolves with the aggregate.
    for await (const tok of run.tokenStream) onToken(tok);
  }
  const final = await run.final;
  return (final?.contentText ?? final?.raw?.fullText ?? '').trim();
}

/**
 * Transcribe an audio chunk (file path or PCM buffer) to text.
 * @param {string} modelId
 * @param {string|Buffer|Uint8Array} audioChunk
 * @returns {Promise<string>}
 */
export async function transcribeAudio(modelId, audioChunk) {
  const out = await transcribe({ modelId, audioChunk });
  return typeof out === 'string' ? out.trim() : String(out ?? '').trim();
}

/**
 * Synthesize speech. Returns raw PCM Int16 buffer (sample rate per model).
 * @param {string} modelId
 * @param {string} text
 * @returns {Promise<Buffer>}
 */
export async function synthesizeSpeech(modelId, text) {
  // Stream mode: consume bufferStream (AsyncGenerator<number> of PCM Int16 samples)
  // and collect. This reliably drives synthesis to completion (the non-stream buffer
  // can resolve empty before the pipeline fills it).
  const result = textToSpeech({ modelId, text, inputType: 'text', stream: true });
  const samples = [];
  for await (const s of result.bufferStream) samples.push(s);
  return Int16Array.from(samples);
}

/** Convenience: default models from the registry. */
export const defaults = { MODELS, MODEL_TYPES };

export async function unload(modelId) {
  try {
    await unloadModel({ modelId });
  } catch {
    /* best effort */
  }
}
