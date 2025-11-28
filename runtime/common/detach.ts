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

/**
 * Returns true if detaching this value would produce a different result,
 * i.e., if the value or any of its children have listeners.
 */
export function needsDetach(value: unknown): boolean {
  if (!isDetachable(value)) {
    return false;
  }
  return value.detach() !== value;
}
