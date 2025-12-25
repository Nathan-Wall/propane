// An immutable wrapper around the built-in Date. Stores time as epoch millis,
// exposes common read-only accessors, and provides stable equals/hashCode.

// Simple deterministic string hash (Java-style).
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

export class ImmutableDate {
  #epochMs: number;
  #iso: string;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableDate';

  /**
   * Returns an ImmutableDate from the input.
   * If the input is already an ImmutableDate, returns it as-is.
   */
  static from(input: ImmutableDate | Date | string | number): ImmutableDate {
    return input instanceof ImmutableDate ? input : new ImmutableDate(input);
  }

  constructor(input: Date | string | number = 0) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid date value.');
    }
    this.#epochMs = date.getTime();
    this.#iso = date.toISOString();
    Object.freeze(this);
  }

  // Core representations
  valueOf(): number {
    return this.#epochMs;
  }

  toString(): string {
    return this.#iso;
  }

  toJSON(): string {
    return this.#iso;
  }

  toDate(): Date {
    return new Date(this.#epochMs);
  }

  // Read-only component getters mirroring Date APIs
  getTime(): number { return this.#epochMs; }
  getUTCFullYear(): number { return this.toDate().getUTCFullYear(); }
  getUTCMonth(): number { return this.toDate().getUTCMonth(); }
  getUTCDate(): number { return this.toDate().getUTCDate(); }
  getUTCHours(): number { return this.toDate().getUTCHours(); }
  getUTCMinutes(): number { return this.toDate().getUTCMinutes(); }
  getUTCSeconds(): number { return this.toDate().getUTCSeconds(); }
  getUTCMilliseconds(): number { return this.toDate().getUTCMilliseconds(); }

  equals(other: unknown): boolean {
    if (other instanceof ImmutableDate) {
      return this.#epochMs === other.#epochMs;
    }
    if (other instanceof Date) {
      return this.#epochMs === other.getTime();
    }
    if (typeof other === 'string' || typeof other === 'number') {
      const candidate = new Date(other);
      if (Number.isNaN(candidate.getTime())) return false;
      return this.#epochMs === candidate.getTime();
    }
    return false;
  }

  hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.#iso);
    return this.#hash;
  }
}

export function isImmutableDate(value: unknown): value is ImmutableDate {
  return value instanceof ImmutableDate;
}
