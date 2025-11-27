interface Detachable { detach: () => unknown }

export function isDetachable(value: unknown): value is Detachable {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof (value as { detach?: unknown }).detach === 'function'
  );
}

export function detachValue<T>(value: T): T {
  return isDetachable(value) ? (value.detach() as T) : value;
}
