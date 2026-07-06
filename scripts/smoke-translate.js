// Smoke: on-device EN->ES translation of a coaching line.
import { translateText, SUPPORTED_LANGS } from '../src/translate.js';

console.error('Supported:', SUPPORTED_LANGS.join(', '));
const src = 'Keep Priya tight on the right and win the second balls.';
const t0 = Date.now();
const es = await translateText(src, 'es');
console.log(`EN: ${src}`);
console.log(`ES: ${es}`);
console.error(`(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(0);
