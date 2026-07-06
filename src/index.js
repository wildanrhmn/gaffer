// Entry point / usage. The live-microphone capture path is a stretch goal; the
// scripted demo is the runnable end-to-end path today.
import { bold, magenta, dim, cyan } from './ui.js';

console.log(`
${bold(magenta('GAFFER'))} ${dim('— private, offline AI film room for grassroots football')}

${bold('Run the end-to-end demo:')}
  ${cyan('npm run demo')}                         everything local
  ${cyan('GAFFER_PROVIDER=<key> npm run demo')}   half-time synthesis offloaded to a laptop (P2P)
  ${cyan('GAFFER_TTS=1 npm run demo')}            also read the adjustments aloud (on-device TTS)

${bold('Run the provider ("laptop") to enable P2P delegation:')}
  ${cyan('npm run provider')}                     prints a public key to pass as GAFFER_PROVIDER

${bold('Tests (pure logic, no models):')}
  ${cyan('npm test')}
`);
