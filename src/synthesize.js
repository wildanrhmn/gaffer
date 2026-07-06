// Half/full-time synthesis — the P2P showcase.
//
// This is the ONE heavy call. It runs the larger `synth` model, and if a provider
// public key is supplied it offloads to that peer over the DHT (delegate), with
// graceful fallback to local. The calling code is identical either way — that
// symmetry is QVAC's signature feature.

import { loadLLM, chat } from './qvac/runtime.js';
import { MODELS } from './qvac/models.js';
import { synthesisMessages } from './prompts.js';

/**
 * Split the model's "1. ... 2. ... 3. ..." output into clean adjustment strings.
 */
export function parseAdjustments(text) {
  if (!text) return [];
  // Backstop: strip any reasoning-model <think> block that leaked into content
  // (captureThinking should already keep it out, but small models sometimes stray).
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
  // Split on leading "1." / "2)" / "3 -" style markers.
  const parts = text
    .split(/(?:^|\n)\s*\d+\s*[.)\-]\s*/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  // If the model didn't number them, fall back to non-empty lines.
  const list = parts.length >= 2 ? parts : text.split('\n').map((s) => s.trim()).filter(Boolean);
  return list.slice(0, 3);
}

/**
 * @param {import('./timeline.js').MatchTimeline} timeline
 * @param {Object} [opts]
 * @param {boolean} [opts.half=true]
 * @param {{providerPublicKey:string,timeout?:number,fallbackToLocal?:boolean}} [opts.delegate]
 * @returns {Promise<{ adjustments: string[], raw: string, delegated: boolean }>}
 */
export async function synthesize(timeline, { half = true, delegate } = {}) {
  const modelId = await loadLLM({
    key: 'synth',
    modelSrc: MODELS.synth,
    modelType: 'llm',
    delegate,
  });
  const raw = await chat(modelId, synthesisMessages(timeline, { half }));
  return { adjustments: parseAdjustments(raw), raw, delegated: Boolean(delegate) };
}
