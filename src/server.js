// Local web UI for the demo — zero dependencies (Node http). Serves a single page
// and streams the live pipeline over Server-Sent Events. This is a LOCAL tool
// (localhost only); no data leaves the machine.
//
//   npm run ui                          # everything local
//   GAFFER_PROVIDER=<key> npm run ui    # half-time synthesis delegated to a laptop
//
// Open http://localhost:4600

import http from 'node:http';
import { verifyModels, MODELS, MODEL_TYPES, TTS_SAMPLE_RATE } from './qvac/models.js';
import { runMatch } from './matchRunner.js';
import { loadLLM, synthesizeSpeech } from './qvac/runtime.js';
import { wavBuffer } from './wav.js';
import { translateText, SUPPORTED_LANGS } from './translate.js';
import { tagUtterance } from './tagger.js';
import { demoMatch } from './fixtures/demo-match.js';
import { PAGE } from './web/page.js';

const PORT = Number(process.env.PORT || 4600);
const providerKey = process.env.GAFFER_PROVIDER?.trim() || null;

verifyModels();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(PAGE);
    return;
  }

  if (url.pathname === '/api/config') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      delegated: Boolean(providerKey),
      providerKey,
      langs: SUPPORTED_LANGS,
      team: demoMatch.team,
      opponent: demoMatch.opponent,
      roster: demoMatch.roster,
    }));
    return;
  }

  // Live single-remark tagging — the "type your own touchline remark" widget.
  if (url.pathname === '/api/tag') {
    const text = (url.searchParams.get('text') || '').slice(0, 400).trim();
    if (!text) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'empty remark' }));
      return;
    }
    try {
      const tags = await tagUtterance({ text }, demoMatch.roster);
      const players = tags.players.map((n) => ({
        n,
        name: demoMatch.roster.find((p) => p.number === n)?.name ?? '',
      }));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ players, phase: tags.phase, themes: tags.themes, sentiment: tags.sentiment ?? 0 }));
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // On-device TTS → WAV audio for the given text.
  if (url.pathname === '/api/tts') {
    const text = (url.searchParams.get('text') || '').slice(0, 1200);
    try {
      const id = await loadLLM({ key: 'tts', modelSrc: MODELS.tts, modelType: MODEL_TYPES.tts });
      const pcm = await synthesizeSpeech(id, text);
      const wav = wavBuffer(pcm, { sampleRate: TTS_SAMPLE_RATE });
      res.writeHead(200, { 'content-type': 'audio/wav', 'content-length': wav.length });
      res.end(wav);
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // On-device translation of the given text.
  if (url.pathname === '/api/translate') {
    const text = (url.searchParams.get('text') || '').slice(0, 2000);
    const to = url.searchParams.get('to') || 'es';
    try {
      const out = await translateText(text, to);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ text: out }));
    } catch (err) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/stream') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    const emit = (e) => res.write(`data: ${JSON.stringify(e)}\n\n`);
    try {
      await runMatch({ emit, providerKey });
    } catch (err) {
      emit({ type: 'error', message: err.message });
    }
    res.end();
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`\n  Gaffer UI → http://localhost:${PORT}`);
  console.log(providerKey ? `  Half-time synthesis will be DELEGATED to ${providerKey.slice(0, 12)}…\n` : '  Running fully local. Set GAFFER_PROVIDER=<key> to delegate half-time synthesis.\n');
});
