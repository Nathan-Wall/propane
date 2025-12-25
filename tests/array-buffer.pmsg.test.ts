import { assert } from './assert.js';
import { ArrayBufferMessage } from './array-buffer.pmsg.js';
import { test } from 'node:test';

function makeBuffer(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

function buffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);
  for (let i = 0; i < viewA.length; i += 1) {
    if (viewA[i] !== viewB[i]) return false;
  }
  return true;
}

function toBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }

  let binary = '';
  const view = new Uint8Array(buffer);
  for (const byte of view) {
    // eslint-disable-next-line unicorn/prefer-code-point
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  throw new Error('Base64 encoding unavailable in this environment.');
}

export default function runArrayBufferTests() {
  const data = makeBuffer([1, 2, 3, 4]);
  const extra = makeBuffer([9, 8, 7]);
  const chunkA = makeBuffer([255]);
  const chunkB = makeBuffer([5, 6]);

  const message = new ArrayBufferMessage({
    id: 42,
    data,
    extra,
    chunks: [chunkA, chunkB],
  });

  const serialized = message.serialize();
  const expectedChunks = [chunkA, chunkB].map((chunk) => `B"${toBase64(chunk)}"`).join(',');
  const expected = `:{42,B"${toBase64(data)}",B"${toBase64(extra)}",[${expectedChunks}]}`;

  assert(serialized === expected, 'ArrayBuffer should serialize using B"<base64>" tokens.');

  const roundTrip = ArrayBufferMessage.deserialize(serialized);

  assert(buffersEqual(roundTrip.data, data), 'Deserialization should restore primary ArrayBuffer.');
  assert(roundTrip.extra && buffersEqual(roundTrip.extra, extra), 'Optional ArrayBuffer should be preserved.');

  const roundTripChunks = [...roundTrip.chunks];
  assert(roundTripChunks.length === 2, 'Chunk array should retain length.');
  assert(buffersEqual(roundTripChunks[0], chunkA), 'First chunk should match.');
  assert(buffersEqual(roundTripChunks[1], chunkB), 'Second chunk should match.');

  const json = JSON.parse(JSON.stringify(message));
  assert(json.data === `base64:${toBase64(data)}`, 'ArrayBuffer should normalize to base64 string in JSON.');
  assert(json.extra === `base64:${toBase64(extra)}`, 'Optional ArrayBuffer should normalize to base64 string in JSON.');
  assert(JSON.stringify(json.chunks) === JSON.stringify([
    `base64:${toBase64(chunkA)}`,
    `base64:${toBase64(chunkB)}`,
  ]), 'ArrayBuffer arrays should normalize to base64 strings in JSON.');

  const withoutExtra = new ArrayBufferMessage({
    id: 7,
    data: data,
    chunks: [],
  });
  const serializedWithoutExtra = withoutExtra.serialize();
  assert(!serializedWithoutExtra.includes('undefined'), 'Optional ArrayBuffer should be omitted when undefined.');
}

test('runArrayBufferTests', () => {
  runArrayBufferTests();
});
