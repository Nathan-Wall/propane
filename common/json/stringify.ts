export function normalizeForJson(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return null;
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (value instanceof Date) {
    return value.toJSON();
  }

  if (isArrayBuffer(value)) {
    return `base64:${arrayBufferToBase64(value)}`;
  }

  if (
    value
    && typeof value === 'object'
    && typeof (value as { toJSON?: unknown }).toJSON === 'function'
  ) {
    const jsonValue = (value as { toJSON: () => unknown }).toJSON();

    // Avoid infinite recursion when toJSON returns the receiver.
    if (jsonValue === value) {
      return jsonValue;
    }

    return normalizeForJson(jsonValue);
  }

  if (isImmutableMapLike(value)) {
    return [...value.entries()].map(([k, v]) => [normalizeForJson(k), normalizeForJson(v)]);
  }

  if (isImmutableSetLike(value)) {
    return [...value.values()].map((v) => normalizeForJson(v));
  }

  if (isImmutableArrayLike(value)) {
    return [...value.values()].map((v) => normalizeForJson(v));
  }

  if (value instanceof Map) {
    return [...value.entries()].map(([k, v]) => [normalizeForJson(k), normalizeForJson(v)]);
  }

  if (value instanceof Set) {
    return [...value.values()].map((v) => normalizeForJson(v));
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForJson(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = normalizeForJson(v);
    }
    return result;
  }

  return value;
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return value instanceof ArrayBuffer || Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }

  if (typeof btoa === 'function') {
    let binary = '';
    const view = new Uint8Array(buffer);
    for (const byte of view) {
      // eslint-disable-next-line unicorn/prefer-code-point
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  throw new Error('Base64 encoding is not supported in this environment.');
}

function isImmutableMapLike(value: unknown): value is { entries: () => IterableIterator<unknown[]> } {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as { entries?: unknown }).entries === 'function'
    && (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === 'ImmutableMap'
  );
}

function isImmutableSetLike(value: unknown): value is { values: () => IterableIterator<unknown> } {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as { values?: unknown }).values === 'function'
    && (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === 'ImmutableSet'
  );
}

function isImmutableArrayLike(value: unknown): value is { values: () => IterableIterator<unknown> } {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as { values?: unknown }).values === 'function'
    && (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === 'ImmutableArray'
  );
}
