// Local web server (zero dependencies, Node http). Serves the landing page, the app,
// and the logo page, plus the on-device inference endpoints. Localhost only — no data
// leaves the machine.
//
//   npm run ui                          # everything local
//   GAFFER_PROVIDER=<key> npm run ui    # half-time synthesis delegated to a laptop
//
// Open http://localhost:4600

import http from 'node:http';
import { readFileSync } from 'node:fs';
import { verifyModels, MODELS, MODEL_TYPES, TTS_SAMPLE_RATE } from './qvac/models.js';
import { loadLLM, synthesizeSpeech } from './qvac/runtime.js';
import { wavBuffer } from './wav.js';
import { translateText, SUPPORTED_LANGS } from './translate.js';
import { tagUtterance } from './tagger.js';
import { synthesize, generateReport } from './synthesize.js';
import { MatchTimeline } from './timeline.js';
import { LANDING } from './web/landing.js';
import { APP_PAGE } from './web/app-page.js';
import { LOGO_PAGE } from './web/logo.js';
import { faviconSvg } from './web/shared.js';

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

// Locally-served GSAP (vendored from node_modules so the site animates offline).
const VENDOR = {
  '/vendor/gsap.min.js': 'gsap.min.js',
  '/vendor/ScrollTrigger.min.js': 'ScrollTrigger.min.js',
  '/vendor/SplitText.min.js': 'SplitText.min.js',
};
const _vendorCache = {};
function vendorFile(name) {
  if (!_vendorCache[name]) {
    _vendorCache[name] = readFileSync(new URL('../node_modules/gsap/dist/' + name, import.meta.url));
  }
  return _vendorCache[name];
}

// The app owns its team/squad and sends it with each request — the server keeps no fixture.
function delegateOpts() {
  return providerKey ? { providerPublicKey: providerKey, timeout: 60_000, fallbackToLocal: true } : undefined;
}
function rosterOf(body) {
  return Array.isArray(body.roster)
    ? body.roster.slice(0, 40).map((pl) => ({
        number: Number(pl.number) || 0,
        name: String(pl.name || '').slice(0, 40),
        position: pl.position ? String(pl.position).slice(0, 12) : undefined,
      }))
    : [];
}
function buildTimeline(body) {
  const tl = new MatchTimeline({
    team: String(body.team || 'Our team').slice(0, 60),
    opponent: String(body.opponent || 'Opponent').slice(0, 60),
    roster: rosterOf(body),
  });
  for (const u of (Array.isArray(body.utterances) ? body.utterances : []).slice(0, 80)) {
    const uu = tl.addUtterance({ text: String(u.text || '').slice(0, 400), tMs: Number(u.tMs) || 0 });
    tl.applyTags(uu.id, {
      players: Array.isArray(u.players) ? u.players.map(Number).filter(Number.isFinite) : [],
      phase: u.phase,
      themes: Array.isArray(u.themes) ? u.themes : [],
      sentiment: u.sentiment,
    });
  }
  return tl;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  // --- vendored JS (GSAP) ---
  if (VENDOR[p]) {
    try {
      res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=31536000' });
      res.end(vendorFile(VENDOR[p]));
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
    return;
  }

  // --- favicon (from the picked mark) ---
  if (p === '/favicon.svg' || p === '/favicon.ico') {
    res.writeHead(200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=86400' });
    res.end(faviconSvg());
    return;
  }

  // --- pages ---
  if (p === '/') return html(res, LANDING);
  if (p === '/app') return html(res, APP_PAGE);
  if (p === '/logo') return html(res, LOGO_PAGE);

  // --- config (no team here — the app owns its own squad) ---
  if (p === '/api/config') {
    return json(res, { delegated: Boolean(providerKey), providerKey, langs: SUPPORTED_LANGS });
  }

  // --- live single-remark tagging against the coach's own squad ---
  if (p === '/api/tag' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const text = String(body.text || '').slice(0, 400).trim();
      if (!text) return json(res, { error: 'empty remark' }, 400);
      const roster = rosterOf(body);
      const tags = await tagUtterance({ text }, roster);
      const players = tags.players.map((n) => ({ n, name: roster.find((pl) => pl.number === n)?.name ?? '' }));
      return json(res, { players, phase: tags.phase, themes: tags.themes, sentiment: tags.sentiment ?? 0 });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  // --- half-time plan over the coach's actual remarks ---
  if (p === '/api/synthesize' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const t0 = Date.now();
      const { adjustments, delegated } = await synthesize(buildTimeline(body), { half: body.half !== false, delegate: delegateOpts() });
      return json(res, { adjustments, delegated, ms: Date.now() - t0 });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  // --- full-time report ---
  if (p === '/api/report' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const t0 = Date.now();
      const { report, delegated } = await generateReport(buildTimeline(body), { delegate: delegateOpts() });
      return json(res, { report, delegated, ms: Date.now() - t0 });
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
