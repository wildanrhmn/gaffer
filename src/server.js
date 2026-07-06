// Local web server (zero dependencies, Node http). Serves the landing page, the app,
// and the logo page, plus the on-device inference endpoints. Localhost only — no data
// leaves the machine.
//
//   npm run ui                          # everything local
//   GAFFER_PROVIDER=<key> npm run ui    # half-time synthesis delegated to a laptop
//
// Open http://localhost:4600

import http from 'node:http';
import { verifyModels, MODELS, MODEL_TYPES, TTS_SAMPLE_RATE } from './qvac/models.js';
import { loadLLM, synthesizeSpeech } from './qvac/runtime.js';
import { wavBuffer } from './wav.js';
import { translateText, SUPPORTED_LANGS } from './translate.js';
import { tagUtterance } from './tagger.js';
import { synthesize } from './synthesize.js';
import { MatchTimeline } from './timeline.js';
import { demoMatch } from './fixtures/demo-match.js';
import { LANDING } from './web/landing.js';
import { APP_PAGE } from './web/app-page.js';
import { LOGO_PAGE } from './web/logo.js';

const PORT = Number(process.env.PORT || 4600);
const providerKey = process.env.GAFFER_PROVIDER?.trim() || null;

verifyModels();

function html(res, body) {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(body);
}
function json(res, obj, code = 200) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1_000_000) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  // --- pages ---
  if (p === '/') return html(res, LANDING);
  if (p === '/app') return html(res, APP_PAGE);
  if (p === '/logo') return html(res, LOGO_PAGE);

  // --- config ---
  if (p === '/api/config') {
    return json(res, {
      delegated: Boolean(providerKey),
      providerKey,
      langs: SUPPORTED_LANGS,
      team: demoMatch.team,
      opponent: demoMatch.opponent,
      roster: demoMatch.roster,
    });
  }

  // --- live single-remark tagging ---
  if (p === '/api/tag') {
    const text = (url.searchParams.get('text') || '').slice(0, 400).trim();
    if (!text) return json(res, { error: 'empty remark' }, 400);
    try {
      const tags = await tagUtterance({ text }, demoMatch.roster);
      const players = tags.players.map((n) => ({
        n,
        name: demoMatch.roster.find((pl) => pl.number === n)?.name ?? '',
      }));
      return json(res, { players, phase: tags.phase, themes: tags.themes, sentiment: tags.sentiment ?? 0 });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  // --- half-time synthesis over the coach's actual remarks ---
  if (p === '/api/synthesize' && req.method === 'POST') {
    try {
      const { utterances = [], half = true } = await readJson(req);
      const tl = new MatchTimeline({ team: demoMatch.team, opponent: demoMatch.opponent, roster: demoMatch.roster });
      for (const u of utterances.slice(0, 60)) {
        const uu = tl.addUtterance({ text: String(u.text || '').slice(0, 400), tMs: Number(u.tMs) || 0 });
        tl.applyTags(uu.id, {
          players: Array.isArray(u.players) ? u.players : [],
          phase: u.phase,
          themes: Array.isArray(u.themes) ? u.themes : [],
          sentiment: u.sentiment,
        });
      }
      const delegate = providerKey
        ? { providerPublicKey: providerKey, timeout: 60_000, fallbackToLocal: true }
        : undefined;
      const t0 = Date.now();
      const { adjustments, delegated } = await synthesize(tl, { half, delegate });
      return json(res, { adjustments, delegated, ms: Date.now() - t0 });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  // --- on-device TTS → WAV ---
  if (p === '/api/tts') {
    const text = (url.searchParams.get('text') || '').slice(0, 1200);
    try {
      const id = await loadLLM({ key: 'tts', modelSrc: MODELS.tts, modelType: MODEL_TYPES.tts });
      const pcm = await synthesizeSpeech(id, text);
      const wav = wavBuffer(pcm, { sampleRate: TTS_SAMPLE_RATE });
      res.writeHead(200, { 'content-type': 'audio/wav', 'content-length': wav.length });
      res.end(wav);
    } catch (err) {
      json(res, { error: err.message }, 500);
    }
    return;
  }

  // --- on-device translation ---
  if (p === '/api/translate') {
    const text = (url.searchParams.get('text') || '').slice(0, 2000);
    const to = url.searchParams.get('to') || 'es';
    try {
      return json(res, { text: await translateText(text, to) });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`\n  Gaffer UI → http://localhost:${PORT}`);
  console.log(providerKey ? `  Half-time synthesis will be DELEGATED to ${providerKey.slice(0, 12)}…\n` : '  Running fully local. Set GAFFER_PROVIDER=<key> to delegate half-time synthesis.\n');
});
