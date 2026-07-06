// On-device translation for a multilingual bench — the assistant coach reads the
// adjustments in their own language. Uses QVAC's Bergamot NMT models, fully local.

import * as qvac from '@qvac/sdk';
import { translate as qvacTranslate } from '@qvac/sdk';
import { loadLLM } from './qvac/runtime.js';

// English → target. These are real exported Bergamot constants in @qvac/sdk.
const PAIRS = {
  es: qvac.BERGAMOT_EN_ES, // Spanish
  pt: qvac.BERGAMOT_EN_PT, // Portuguese
  fr: qvac.BERGAMOT_EN_FR, // French
  de: qvac.BERGAMOT_EN_DE, // German
  it: qvac.BERGAMOT_EN_IT, // Italian
};

export const SUPPORTED_LANGS = Object.keys(PAIRS);

/**
 * Translate English text to a supported language, on-device.
 * @param {string} text
 * @param {string} to  one of SUPPORTED_LANGS
 * @returns {Promise<string>}
 */
export async function translateText(text, to) {
  const modelSrc = PAIRS[to];
  if (!modelSrc) throw new Error(`unsupported target language: ${to} (have ${SUPPORTED_LANGS.join(', ')})`);
  const modelId = await loadLLM({
    key: `tr-${to}`,
    modelSrc,
    modelType: 'nmtcpp-translation',
    // Bergamot is directional — from/to are baked at load time.
    modelConfig: { engine: 'Bergamot', from: 'en', to },
  });
  // Collect the token stream (reliably drives completion, like TTS).
  const run = qvacTranslate({ modelId, text, from: 'en', to, modelType: 'nmtcpp-translation', stream: true });
  let out = '';
  for await (const tok of run.tokenStream) out += tok;
  out = out.trim() || String((await run.text) ?? '');
  // Bergamot multi-target models prepend a ">>lang<<" control token — strip it.
  return out.replace(/>>[a-z]{2,3}<</gi, '').replace(/\s+/g, ' ').trim();
}
