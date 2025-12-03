// An immutable wrapper around the standard URL object. Provides stable equality,
// hashing, and read-only access to URL components without exposing mutable state.

// Simple deterministic string hash (Java-style), reused across immutable helpers.
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

export class ImmutableUrl {
  #href: string;
  #url: URL;
  #hash?: number;
  readonly [Symbol.toStringTag] = 'ImmutableUrl';

  constructor(input: string | URL = 'about:blank', base?: string | URL) {
    const href = input instanceof URL ? input.toString() : String(input);
    this.#url = new URL(href, base ? base.toString() : undefined);
    this.#href = this.#url.toString();

    Object.freeze(this);
  }

  get href(): string {
    return this.#href;
  }

  get origin(): string {
    return this.#url.origin;
  }

  get protocol(): string {
    return this.#url.protocol;
  }

  get username(): string {
    return this.#url.username;
  }

  get password(): string {
    return this.#url.password;
  }

  get host(): string {
    return this.#url.host;
  }

  get hostname(): string {
    return this.#url.hostname;
  }

  get port(): string {
    return this.#url.port;
  }

  get pathname(): string {
    return this.#url.pathname;
  }

  get search(): string {
    return this.#url.search;
  }

  get hash(): string {
    return this.#url.hash;
  }

  /**
   * Returns a fresh URLSearchParams instance so callers can manipulate params
   * without mutating internal state.
   */
  get searchParams(): URLSearchParams {
    return new URLSearchParams(this.#url.searchParams.toString());
  }

  toString(): string {
    return this.#href;
  }

  toJSON(): string {
    return this.#href;
  }

  /**
   * Convert back to a mutable URL instance. A new URL is returned each call.
   */
  toURL(): URL {
    return new URL(this.#href);
  }

  equals(other: unknown): boolean {
    if (other instanceof ImmutableUrl) {
      return this.#href === other.#href;
    }
    if (other instanceof URL) {
      return this.#href === other.toString();
    }
    if (typeof other === 'string') {
      try {
        return this.#href === new URL(other).toString();
      } catch {
        return false;
      }
    }
    return false;
  }

  hashCode(): number {
    if (this.#hash !== undefined) return this.#hash;
    this.#hash = hashString(this.#href);
    return this.#hash;
  }
}

export function isImmutableUrl(value: unknown): value is ImmutableUrl {
  return value instanceof ImmutableUrl;
}
