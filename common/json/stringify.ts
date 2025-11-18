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

  if (isImmutableMapLike(value)) {
    return [...value.entries()].map(([k, v]) => [normalizeForJson(k), normalizeForJson(v)]);
  }

  if (value instanceof Map) {
    return [...value.entries()].map(([k, v]) => [normalizeForJson(k), normalizeForJson(v)]);
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

function isImmutableMapLike(value: unknown): value is { entries: () => IterableIterator<unknown[]> } {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { entries?: unknown }).entries === 'function' &&
    (value as { [Symbol.toStringTag]?: string })[Symbol.toStringTag] === 'ImmutableMap'
  );
}
