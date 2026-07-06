// Gaffer end-to-end CLI demo — runs the whole pipeline on the scripted match so it
// works without a live microphone.
//
//   npm run demo                       # everything local
//   GAFFER_PROVIDER=<key> npm run demo # half-time synthesis offloaded to a laptop (P2P)
//   GAFFER_TTS=1 npm run demo          # also render the adjustments to a WAV via on-device TTS

import { verifyModels, MODELS, MODEL_TYPES, TTS_SAMPLE_RATE } from './qvac/models.js';
import { runMatch } from './matchRunner.js';
import { loadLLM, synthesizeSpeech } from './qvac/runtime.js';
import { writeWav } from './wav.js';
import { bold, cyan, green, dim, yellow, red, magenta, rule } from './ui.js';

const providerKey = process.env.GAFFER_PROVIDER?.trim();
const doTTS = process.env.GAFFER_TTS === '1';

verifyModels();

let adjustments = [];

function tone(s, sentiment) {
  return sentiment < -0.15 ? red(s) : sentiment > 0.15 ? green(s) : s;
}

function render(e) {
  switch (e.type) {
    case 'match':
      console.log('\n' + bold(magenta('  GAFFER')) + dim('  — private, offline AI film room for grassroots football'));
      console.log(rule(`${e.team} vs ${e.opponent}`));
      console.log(dim('  Squad: ') + e.roster.map((p) => `#${p.number} ${p.name}`).join(', '));
      console.log('\n' + bold('  ● Live touchline capture ') + dim('(transcribe → tag, on-device, no cloud)\n'));
      break;
    case 'utterance': {
      const who = e.players.length ? e.players.map((p) => `#${p.n}`).join(',') : '·';
      const themes = e.themes.length ? dim(` [${e.themes.join(', ')}]`) : '';
      console.log(
        `  ${dim(e.clock)} ${cyan(e.phase.padEnd(10))} ${yellow(who.padEnd(6))} ${tone(e.text, e.sentiment)}${themes}`
      );
      break;
    }
    case 'halftime':
      console.log('\n' + rule('HALF-TIME'));
      console.log(dim('  Recurring themes: ') + e.themes.slice(0, 6).map(([t, n]) => `${t} ×${n}`).join('  '));
      console.log(
        '\n' + bold('  ● Synthesizing adjustments ') +
          (providerKey ? magenta('→ delegated to provider over P2P ') + dim(`(${providerKey.slice(0, 12)}…)`) : dim('(local)'))
      );
      break;
    case 'adjustments':
      adjustments = e.items;
      console.log(dim(`  done in ${(e.ms / 1000).toFixed(1)}s ${e.delegated ? '(ran on the laptop, not this device)' : ''}\n`));
      console.log(bold(green('  Coach — three things for the second half:\n')));
      e.items.forEach((a, i) => console.log('  ' + yellow(`${i + 1}.`) + ' ' + a));
      break;
    case 'done':
      console.log('\n' + rule(''));
      break;
  }
}

await runMatch({ emit: render, providerKey });

if (doTTS && adjustments.length) {
  console.log('\n' + bold('  ● Reading it back ') + dim('(on-device TTS → data/halftime.wav)'));
  try {
    const ttsId = await loadLLM({ key: 'tts', modelSrc: MODELS.tts, modelType: MODEL_TYPES.tts });
    const pcm = await synthesizeSpeech(ttsId, adjustments.map((a, i) => `${i + 1}. ${a}`).join(' '));
    const path = await writeWav(pcm, { sampleRate: TTS_SAMPLE_RATE, path: 'data/halftime.wav' });
    console.log(dim('  wrote ') + cyan(path));
  } catch (err) {
    console.log(dim('  TTS skipped: ') + err.message);
  }
}

console.log('');
process.exit(0);
