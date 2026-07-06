// The PROVIDER ("laptop") — run this on the machine that does the heavy synthesis.
//
//   node src/provider.js
//
// It prints its DHT public key. Give that key to the capture device (the "phone")
// via GAFFER_PROVIDER=<key> and half-time synthesis will run here, over pure P2P —
// no server, no cloud. Optionally restrict to specific consumer keys with a firewall.

import { startQVACProvider, stopQVACProvider } from '@qvac/sdk';

const allow = (process.env.GAFFER_ALLOW || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const params = {};
if (allow.length) params.firewall = { mode: 'allow', publicKeys: allow };

const res = await startQVACProvider(params);
if (!res?.success) {
  console.error('Failed to start provider:', res?.error ?? res);
  process.exit(1);
}

console.log('\n=== Gaffer provider ready ===');
console.log('Provider public key:\n  ' + res.publicKey);
console.log('\nOn the capture device, run:');
console.log('  GAFFER_PROVIDER=' + res.publicKey + ' npm run demo');
if (allow.length) console.log('\nFirewall: only allowing ' + allow.length + ' consumer key(s).');
console.log('\nLeave this running. Ctrl+C to stop.\n');

async function shutdown() {
  console.log('\nStopping provider...');
  try {
    await stopQVACProvider();
  } catch {
    /* ignore */
  }
  process.exit(0);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
