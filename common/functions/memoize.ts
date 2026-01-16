import { assert } from '@/common/assert';
import { ImmutableMap } from '@/runtime/common/map/immutable.js';

const UNSET: {mem__UNSET: true} = {mem__UNSET: true};

type GenericFunction<This, T, A extends unknown[]> = (
  this: This,
  ...args: A
) => T;
type Responses<T> = {
  value: T|typeof UNSET,
  next?: ImmutableMap<unknown, Responses<T>>,
};

export function memoize<This, T, A extends unknown[]>(
  fn: GenericFunction<This, T, A>,
  {cacheSize}: {cacheSize: number},
): GenericFunction<This, T, A> {
  // TODO(nathan): This cache size limit is enforced by blocking new inserts
  // once the limit is reached. In the future consider a dedicated
  // memoizeLRU/TTL helper rather than complicating this implementation with
  // full eviction logic.
  const caches = new WeakMap<object, {size: number; responses: Responses<T>}>();
  return function memoized(this: This, ...args: A): T {
    if (cacheSize <= 0) {
      return fn.apply(this, args);
    }
    const target = (typeof this === 'object' && this !== null)
      || typeof this === 'function'
      ? (this as object)
      : null;
    if (target === null) {
      return fn.apply(this, args);
    }
    let cache = caches.get(target);
    if (!cache) {
      cache = {
        size: 0,
        // We use ImmutableMap rather than Map for structural equality (it can
        // determine if two Messages contain the same data).
        responses: {
          value: UNSET,
          next: new ImmutableMap<unknown, Responses<T>>(),
        },
      };
      caches.set(target, cache);
    }
    let r = cache.responses;
    for (const arg of args) {
      if (r.next == null) {
        if (cache.size < cacheSize) {
          r.next = new ImmutableMap<unknown, Responses<T>>();
        } else {
          return fn.apply(this, args);
        }
      }
      if (r.next.has(arg)) {
        r = assert(r.next.get(arg));
      } else if (cache.size < cacheSize) {
        const newR: Responses<T> = {value: UNSET};
        r.next = r.next.set(arg, newR);
        r = newR;
      } else {
        return fn.apply(this, args);
      }
    }
    if (r.value === UNSET) {
      const value = fn.apply(this, args);
      if (cache.size < cacheSize) {
        r.value = value;
        cache.size++;
      }
      return value;
    }
    return <Exclude<typeof r.value, typeof UNSET>> r.value;
  };
}
