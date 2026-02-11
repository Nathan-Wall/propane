/* eslint-disable @typescript-eslint/no-namespace */

import { ImmutableUrl$Base } from './url.pmsg.base.js';
import type { ImmutableUrl as ImmutableUrlTypes } from './url.pmsg.base.js';

const IMMUTABLE_URL_BRAND = Symbol.for('propane.ImmutableUrl');

// Simple deterministic string hash (Java-style).
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

export namespace ImmutableUrl {
  export type Data = ImmutableUrlTypes.Data;
  export type Value = ImmutableUrlTypes.Value;
}

export class ImmutableUrl extends ImmutableUrl$Base {
  readonly [IMMUTABLE_URL_BRAND] = true;
  readonly [Symbol.toStringTag] = 'ImmutableUrl';
  #url?: URL;
  #hash?: number;

  /**
   * Returns an ImmutableUrl from the input.
   * If the input is already an ImmutableUrl, returns it as-is.
   */
  static override from(
    input: ImmutableUrlTypes.Value | URL | string
  ): ImmutableUrl {
    return ImmutableUrl.isInstance(input) ? input : new ImmutableUrl(input);
  }

  constructor(
    input: ImmutableUrlTypes.Value | URL | string = 'about:blank',
    baseOrOptions?: string | URL | { skipValidation?: boolean },
    options?: { skipValidation?: boolean }
  ) {
    let base: string | URL | undefined;
    let resolvedOptions = options;
    if (
      baseOrOptions
      && typeof baseOrOptions === 'object'
      && 'skipValidation' in baseOrOptions
    ) {
      resolvedOptions = baseOrOptions as { skipValidation?: boolean };
    } else {
      base = baseOrOptions as string | URL | undefined;
    }
    const href = coerceHref(input, base);
    super({ href }, { skipValidation: resolvedOptions?.skipValidation });
    this.#url = new URL(href);
    Object.freeze(this);
  }

  override $fromEntries(
    entries: Record<string, unknown>,
    options?: { skipValidation: boolean }
  ): { href: string } {
    const props = super.$fromEntries(entries, options) as { href: string };
    if (options?.skipValidation) {
      return props;
    }
    const href = coerceHref(props.href);
    return { href };
  }

  override toCompact(): string {
    return this.toString();
  }

  static override fromCompact(
    value: string,
    options?: { skipValidation?: boolean }
  ): ImmutableUrl {
    if (typeof value !== 'string') {
      throw new TypeError('ImmutableUrl.fromCompact expects a string value.');
    }
    return new ImmutableUrl(value, undefined, options);
  }

  override toString(): string {
    return this.href;
  }

  override toJSON(): string {
    return this.href;
  }

  /**
   * Convert back to a mutable URL instance. A new URL is returned each call.
   */
  toURL(): URL {
    return new URL(this.href);
  }

  get origin(): string {
    return this.#getUrl().origin;
  }

  get protocol(): string {
    return this.#getUrl().protocol;
  }

  get username(): string {
    return this.#getUrl().username;
  }

  get password(): string {
    return this.#getUrl().password;
  }

  get host(): string {
    return this.#getUrl().host;
  }

  get hostname(): string {
    return this.#getUrl().hostname;
  }

  get port(): string {
    return this.#getUrl().port;
  }

  get pathname(): string {
    return this.#getUrl().pathname;
  }

  get search(): string {
    return this.#getUrl().search;
  }

  get hash(): string {
    return this.#getUrl().hash;
  }

  /**
   * Returns a fresh URLSearchParams instance so callers can manipulate params
   * without mutating internal state.
   */
  get searchParams(): URLSearchParams {
    return new URLSearchParams(this.#getUrl().searchParams.toString());
  }

  override equals(other: unknown): boolean {
    if (ImmutableUrl.isInstance(other)) {
      return this.href === other.href;
    }
    if (other instanceof URL) {
      return this.href === other.toString();
    }
    if (typeof other === 'string') {
      try {
        return this.href === new URL(other).toString();
      } catch {
        return false;
      }
    }
    return false;
  }

  override hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.href);
    return this.#hash;
  }

  #getUrl(): URL {
    if (!this.#url) {
      this.#url = new URL(this.href);
    }
    return this.#url;
  }
}

export function isImmutableUrl(value: unknown): value is ImmutableUrl {
  return ImmutableUrl.isInstance(value);
}

function coerceHref(
  input: ImmutableUrlTypes.Value | URL | string,
  base?: string | URL
): string {
  if (ImmutableUrl.isInstance(input)) {
    const immutableUrlInput = input as ImmutableUrl;
    return immutableUrlInput.href;
  }

  if (input && typeof input === 'object') {
    if (input instanceof URL) {
      return input.toString();
    }
    const hrefValue = (input as { href?: unknown }).href;
    if (typeof hrefValue === 'string') {
      return normalizeHref(hrefValue, base);
    }
  }

  if (typeof input === 'string') {
    return normalizeHref(input, base);
  }

  throw new TypeError('Invalid URL value.');
}

function normalizeHref(href: string, base?: string | URL): string {
  const baseHref = base instanceof URL ? base.toString() : base;
  try {
    return new URL(href, baseHref).toString();
  } catch {
    throw new TypeError('Invalid URL value.');
  }
}
