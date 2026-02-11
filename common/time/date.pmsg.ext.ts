/* eslint-disable @typescript-eslint/no-namespace */

import { ImmutableDate$Base } from './date.pmsg.base.js';
import type { ImmutableDate as ImmutableDateTypes } from './date.pmsg.base.js';

const IMMUTABLE_DATE_BRAND = Symbol.for('propane.ImmutableDate');

// Simple deterministic string hash (Java-style).
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

export namespace ImmutableDate {
  export type Data = ImmutableDateTypes.Data;
  export type Value = ImmutableDateTypes.Value;
}

export class ImmutableDate extends ImmutableDate$Base {
  readonly [IMMUTABLE_DATE_BRAND] = true;
  readonly [Symbol.toStringTag] = 'ImmutableDate';
  #iso?: string;
  #hash?: number;

  /**
   * Returns an ImmutableDate from the input.
   * If the input is already an ImmutableDate, returns it as-is.
   */
  static override from(
    input: ImmutableDateTypes.Value | Date | string | number
  ): ImmutableDate {
    return ImmutableDate.isInstance(input) ? input : new ImmutableDate(input);
  }

  constructor(
    input: ImmutableDateTypes.Value | Date | string | number = 0,
    options?: { skipValidation?: boolean }
  ) {
    const epochMs = coerceEpochMs(input);
    super({ epochMs }, { skipValidation: options?.skipValidation });
    Object.freeze(this);
  }

  override $fromEntries(
    entries: Record<string, unknown>,
    options?: { skipValidation: boolean }
  ): { epochMs: number } {
    const props = super.$fromEntries(entries, options) as { epochMs: number };
    if (options?.skipValidation) {
      return props;
    }
    const epochMs = coerceEpochMs(props.epochMs);
    return { epochMs };
  }

  override toCompact(): string {
    return this.toString();
  }

  static override fromCompact(
    value: string,
    options?: { skipValidation?: boolean }
  ): ImmutableDate {
    if (typeof value !== 'string') {
      throw new TypeError('ImmutableDate.fromCompact expects a string value.');
    }
    return new ImmutableDate(value, options);
  }

  override valueOf(): number {
    return this.epochMs;
  }

  override toString(): string {
    if (this.#iso === undefined) {
      this.#iso = new Date(this.epochMs).toISOString();
    }
    return this.#iso;
  }

  override toJSON(): string {
    return this.toString();
  }

  toDate(): Date {
    return new Date(this.epochMs);
  }

  // Read-only component getters mirroring Date APIs
  getTime(): number { return this.epochMs; }
  getUTCFullYear(): number { return this.toDate().getUTCFullYear(); }
  getUTCMonth(): number { return this.toDate().getUTCMonth(); }
  getUTCDate(): number { return this.toDate().getUTCDate(); }
  getUTCHours(): number { return this.toDate().getUTCHours(); }
  getUTCMinutes(): number { return this.toDate().getUTCMinutes(); }
  getUTCSeconds(): number { return this.toDate().getUTCSeconds(); }
  getUTCMilliseconds(): number { return this.toDate().getUTCMilliseconds(); }

  override equals(other: unknown): boolean {
    if (ImmutableDate.isInstance(other)) {
      return this.epochMs === other.epochMs;
    }
    if (other instanceof Date) {
      return this.epochMs === other.getTime();
    }
    if (typeof other === 'string' || typeof other === 'number') {
      const candidate = new Date(other);
      if (Number.isNaN(candidate.getTime())) return false;
      return this.epochMs === candidate.getTime();
    }
    return false;
  }

  override hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.toString());
    return this.#hash;
  }

}

export function isImmutableDate(value: unknown): value is ImmutableDate {
  return ImmutableDate.isInstance(value);
}

function coerceEpochMs(
  input: ImmutableDateTypes.Value | Date | string | number
): number {
  if (ImmutableDate.isInstance(input)) {
    const immutableDateInput = input as ImmutableDate;
    return immutableDateInput.epochMs;
  }

  if (input && typeof input === 'object') {
    const epochValue = (input as { epochMs?: unknown }).epochMs;
    if (typeof epochValue === 'number') {
      const date = new Date(epochValue);
      if (!Number.isNaN(date.getTime())) {
        return date.getTime();
      }
    }
  }

  const date = new Date(input as Date | string | number);
  const epochMs = date.getTime();
  if (Number.isNaN(epochMs)) {
    throw new TypeError('Invalid date value.');
  }
  return epochMs;
}
