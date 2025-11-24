type EqualsFn = (a: unknown, b: unknown) => boolean;

function supportsEquals(value: unknown): value is { equals: (other: unknown) => boolean } {
  return (
    !!value
    && typeof value === 'object'
    && typeof (value as { equals?: unknown }).equals === 'function'
  );
}

function isImmutableLike(value: unknown, tag: string): boolean {
  return (
    !!value
    && typeof value === 'object'
    && (
      (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === tag
      || Object.prototype.toString.call(value) === `[object ${tag}]`
    )
  );
}

function isMapLike(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return (
    value instanceof Map
    || isImmutableLike(value, 'ImmutableMap')
  );
}

function isSetLike(value: unknown): value is ReadonlySet<unknown> {
  return (
    value instanceof Set
    || isImmutableLike(value, 'ImmutableSet')
  );
}

function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return Array.isArray(value) || isImmutableLike(value, 'ImmutableArray');
}

function isArrayBufferLike(value: unknown): value is ArrayBuffer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof ArrayBuffer
    || Object.prototype.toString.call(value) === '[object ArrayBuffer]'
    || Object.prototype.toString.call(value) === '[object ImmutableArrayBuffer]'
  );
}

function arrayBufferEquals(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < viewA.length; i += 1) {
    if (viewA[i] !== viewB[i]) {
      return false;
    }
  }

  return true;
}

export const equals: EqualsFn = (a, b): boolean => {
  if (a === b || Object.is(a, b)) {
    return true;
  }

  if (supportsEquals(a)) {
    return a.equals(b);
  }

  if (supportsEquals(b)) {
    return b.equals(a);
  }

  if (isArrayBufferLike(a) && isArrayBufferLike(b)) {
    return arrayBufferEquals(a, b);
  }

  if (isMapLike(a) && isMapLike(b)) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key)) return false;
      if (!equals(val, b.get(key))) return false;
    }
    return true;
  }

  if (isSetLike(a) && isSetLike(b)) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (![...b].some((entry) => equals(entry, val))) return false;
    }
    return true;
  }

  if (isArrayLike(a) && isArrayLike(b)) {
    const arrA = [...a];
    const arrB = [...b];
    if (arrA.length !== arrB.length) return false;
    for (const [i, val] of arrA.entries()) {
      if (!equals(val, arrB[i])) return false;
    }
    return true;
  }

  return false;
};
