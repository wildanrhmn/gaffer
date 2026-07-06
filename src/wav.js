// Minimal PCM Int16 -> WAV wrapper so TTS output is playable. No dependencies.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Build a WAV file as an in-memory Buffer.
 * @param {Buffer|Uint8Array|Int16Array} pcm  raw little-endian PCM Int16 samples
 * @param {{ sampleRate?: number, channels?: number }} [opts]
 * @returns {Buffer}
 */
export function wavBuffer(pcm, { sampleRate = 44_100, channels = 1 } = {}) {
  const data = Buffer.isBuffer(pcm) ? pcm : Buffer.from(pcm.buffer ?? pcm);
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/**
 * @param {Buffer|Uint8Array|Int16Array} pcm  raw little-endian PCM Int16 samples
 * @param {{ sampleRate?: number, channels?: number, path: string }} opts
 */
export async function writeWav(pcm, { sampleRate = 44_100, channels = 1, path }) {
  const data = Buffer.isBuffer(pcm) ? pcm : Buffer.from(pcm.buffer ?? pcm);
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // audio format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.concat([header, data]));
  return path;
}
