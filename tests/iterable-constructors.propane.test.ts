import { assert } from './assert.ts';
import { ImmutableArray } from '../common/array/immutable.ts';
import { ImmutableSet } from '../common/set/immutable.ts';
import { ImmutableMap } from '../common/map/immutable.ts';

export default function runIterableConstructorTests() {
  // Iterable with a misleading length property should still use Symbol.iterator
  const arrayIterable: Iterable<number> & { length: number } = {
    length: 0,
    *[Symbol.iterator]() {
      yield 1;
      yield 2;
    },
  };

  const arr = new ImmutableArray(arrayIterable);
  assert(arr.length === 2, 'ImmutableArray should consume iterable values.');
  assert(arr.get(0) === 1 && arr.get(1) === 2, 'ImmutableArray should preserve iterable order.');

  const setIterable: Iterable<string> & { length: number } = {
    length: 0,
    *[Symbol.iterator]() {
      yield 'a';
      yield 'b';
    },
  };

  const set = new ImmutableSet(setIterable);
  assert(set.size === 2, 'ImmutableSet should consume iterable values.');
  assert(set.has('a') && set.has('b'), 'ImmutableSet should contain iterable entries.');

  const mapIterable: Iterable<readonly [string, number]>
    & { length: number } = {
    length: 0,
    *[Symbol.iterator]() {
      yield ['x', 1] as const;
      yield ['y', 2] as const;
    },
  };

  const map = new ImmutableMap(mapIterable);
  assert(map.size === 2, 'ImmutableMap should consume iterable entries.');
  assert(map.get('x') === 1 && map.get('y') === 2, 'ImmutableMap should preserve iterable key/value pairs.');
}
