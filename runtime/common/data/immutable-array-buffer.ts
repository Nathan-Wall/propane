// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { normalizeForJson } from '../json/stringify.js';
// (equals/hashCode) and safe cloning utilities.

// Simple deterministic string hash (Java-style) using UTF-16 code units.
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function toUint8(input: ArrayBuffer): Uint8Array {
  return new Uint8Array(input);
}

function cloneBuffer(input: ArrayBuffer): ArrayBuffer {
  return input.slice(0);
}

function fromInput(
  input?: ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number>
): ArrayBuffer {
  if (!input) {
    return new ArrayBuffer(0);
  }

  if (input instanceof ArrayBuffer) {
    return cloneBuffer(input);
  }

  if (ArrayBuffer.isView(input)) {
    return cloneBuffer(input.buffer);
  }

  // Iterable or array-like of numbers
  const bytes = Array.isArray(input)
    ? input
    : typeof (input as Iterable<number>)[Symbol.iterator] === 'function'
      ? [...(input as Iterable<number>)]
      : Array.from(
        { length: (input as ArrayLike<number>).length },
        (_, i) => (input as ArrayLike<number>)[i]
      );

  return new Uint8Array(bytes).buffer;
}

function arrayBufferEquals(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const va = toUint8(a);
  const vb = toUint8(b);
  for (let i = 0; i < va.length; i += 1) {
    if (va[i] !== vb[i]) return false;
  }
  return true;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }

  if (typeof btoa === 'function') {
    let binary = '';
    const view = toUint8(buffer);
    for (const byte of view) {
      // eslint-disable-next-line unicorn/prefer-code-point
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  throw new Error('Base64 encoding is not supported in this environment.');
}

export class ImmutableArrayBuffer {
  #buffer: ArrayBuffer;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableArrayBuffer';

  constructor(
    input?: ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number>
  ) {
    this.#buffer = fromInput(input);
    Object.freeze(this);
  }

  get byteLength(): number {
    return this.#buffer.byteLength;
  }

  toArrayBuffer(): ArrayBuffer {
    return cloneBuffer(this.#buffer);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.#buffer.slice(0));
  }

  toString(): string {
    return `base64:${arrayBufferToBase64(this.#buffer)}`;
  }

  toJSON(): string {
    return this.toString();
  }

  equals(other: unknown): boolean {
    if (other instanceof ImmutableArrayBuffer) {
      return arrayBufferEquals(this.#buffer, other.#buffer);
    }
    if (other instanceof ArrayBuffer) {
      return arrayBufferEquals(this.#buffer, other);
    }
    if (ArrayBuffer.isView(other)) {
      return arrayBufferEquals(this.#buffer, other.buffer);
    }
    return false;
  }

  hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.toString());
    return this.#hash;
  }
}

export function isImmutableArrayBuffer(
  value: unknown
): value is ImmutableArrayBuffer {
  return (
    value instanceof ImmutableArrayBuffer
    || Object.prototype.toString.call(value) === '[object ImmutableArrayBuffer]'
  );
}
