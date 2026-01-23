/* eslint-disable @typescript-eslint/no-namespace */

import { ImmutableArrayBuffer$Base } from './immutable-array-buffer.pmsg.base.js';
import type { ImmutableArrayBuffer as ImmutableArrayBufferTypes } from './immutable-array-buffer.pmsg.base.js';

const IMMUTABLE_ARRAY_BUFFER_BRAND = Symbol.for('propane.ImmutableArrayBuffer');

// Simple deterministic string hash (Java-style).
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
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

function coerceBuffer(
  input: ImmutableArrayBufferTypes.Value | ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number> | undefined
): ArrayBuffer {
  if (!input) {
    return new ArrayBuffer(0);
  }

  if (ImmutableArrayBuffer.isInstance(input)) {
    return input.toArrayBuffer();
  }

  if (input instanceof ArrayBuffer) {
    return cloneBuffer(input);
  }

  if (ArrayBuffer.isView(input)) {
    return cloneBuffer(input.buffer);
  }

  if (input && typeof input === 'object') {
    const valueProp = (input as { value?: unknown }).value;
    if (valueProp !== undefined) {
      if (ImmutableArrayBuffer.isInstance(valueProp)) {
        return valueProp.toArrayBuffer();
      }
      if (valueProp instanceof ArrayBuffer) {
        return cloneBuffer(valueProp);
      }
      if (ArrayBuffer.isView(valueProp)) {
        return cloneBuffer(valueProp.buffer);
      }
      return fromInput(valueProp as ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number>);
    }
  }

  return fromInput(input as ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number>);
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

function base64ToArrayBuffer(encoded: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(encoded, 'base64');
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  if (typeof atob === 'function') {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      // eslint-disable-next-line unicorn/prefer-code-point
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  throw new Error('Base64 decoding is not supported in this environment.');
}

export namespace ImmutableArrayBuffer {
  export type Data = ImmutableArrayBufferTypes.Data;
  export type Value = ImmutableArrayBufferTypes.Value;
}

export class ImmutableArrayBuffer extends ImmutableArrayBuffer$Base {
  readonly [IMMUTABLE_ARRAY_BUFFER_BRAND] = true;
  readonly [Symbol.toStringTag] = 'ImmutableArrayBuffer';
  #hash?: number;

  static override $serialize(value: ArrayBuffer): string {
    if (!(value instanceof ArrayBuffer)) {
      throw new Error('ImmutableArrayBuffer.$serialize expects an ArrayBuffer.');
    }
    return arrayBufferToBase64(value);
  }

  static override $deserialize(value: string): ArrayBuffer {
    if (typeof value !== 'string') {
      throw new Error('ImmutableArrayBuffer.$deserialize expects a string value.');
    }
    return base64ToArrayBuffer(value);
  }

  /**
   * Returns an ImmutableArrayBuffer from the input.
   * If the input is already an ImmutableArrayBuffer, returns it as-is.
   */
  static override from(
    input: ImmutableArrayBufferTypes.Value | ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number>
  ): ImmutableArrayBuffer {
    return ImmutableArrayBuffer.isInstance(input) ? input : new ImmutableArrayBuffer(input);
  }

  constructor(
    input: ImmutableArrayBufferTypes.Value | ArrayBuffer | ArrayBufferView | ArrayLike<number> | Iterable<number> = new ArrayBuffer(0),
    options?: { skipValidation?: boolean }
  ) {
    const buffer = coerceBuffer(input);
    super({ value: buffer }, { skipValidation: options?.skipValidation });
    Object.freeze(this);
  }

  override $fromEntries(
    entries: Record<string, unknown>,
    options?: { skipValidation: boolean }
  ): { value: ArrayBuffer } {
    const valueValue = entries['value'];
    if (valueValue === undefined) {
      throw new Error('Missing required property \"value\".');
    }
    if (
      !options?.skipValidation
      && !(valueValue instanceof ArrayBuffer || ImmutableArrayBuffer.isInstance(valueValue))
    ) {
      throw new Error('Invalid value for property \"value\".');
    }
    return { value: coerceBuffer(valueValue as ImmutableArrayBufferTypes.Value) };
  }

  get byteLength(): number {
    return this.value.byteLength;
  }

  toArrayBuffer(): ArrayBuffer {
    return cloneBuffer(this.value);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.value.slice(0));
  }

  override toString(): string {
    return `base64:${arrayBufferToBase64(this.value)}`;
  }

  override toJSON(): string {
    return this.toString();
  }

  override equals(other: unknown): boolean {
    if (ImmutableArrayBuffer.isInstance(other)) {
      return arrayBufferEquals(this.value, other.value);
    }
    if (other instanceof ArrayBuffer) {
      return arrayBufferEquals(this.value, other);
    }
    if (ArrayBuffer.isView(other)) {
      return arrayBufferEquals(this.value, other.buffer);
    }
    return false;
  }

  override hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.toString());
    return this.#hash;
  }
}

export function isImmutableArrayBuffer(
  value: unknown
): value is ImmutableArrayBuffer {
  return ImmutableArrayBuffer.isInstance(value);
}
