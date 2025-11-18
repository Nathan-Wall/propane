import { assert } from './assert.ts';
import { ImmutableArray } from '../common/array/immutable.ts';
import { ImmutableSet } from '../common/set/immutable.ts';
import { ImmutableArraySet } from './immutable-array-set.propane.ts';

export default function runImmutableArraySetTests() {
  const arr = new ImmutableArray([1, 2, 3]);
  const set = new ImmutableSet(['a', 'b', 'a']);

  const instance: ImmutableArraySetInstance = new ImmutableArraySet({ arr, set });

  // toJSON normalization
  const json = JSON.parse(JSON.stringify(instance));
  assert(JSON.stringify(json.arr) === JSON.stringify([1, 2, 3]), 'ImmutableArray should JSONify to plain array');
  assert(JSON.stringify(json.set) === JSON.stringify(['a', 'b']), 'ImmutableSet should JSONify to array of unique values');

  // equals / hashCode semantics
  const arrSame = new ImmutableArray([1, 2, 3]);
  const arrDiff = new ImmutableArray([1, 2, 4]);
  assert(arr.equals(arrSame), 'ImmutableArray equals should match identical values');
  assert(!arr.equals(arrDiff), 'ImmutableArray equals should detect differences');
  assert(arr.hashCode() === arrSame.hashCode(), 'ImmutableArray hashCode should match identical values');

  const setSame = new ImmutableSet(['b', 'a']);
  const setDiff = new ImmutableSet(['a', 'c']);
  assert(set.equals(setSame), 'ImmutableSet equals should be order insensitive');
  assert(!set.equals(setDiff), 'ImmutableSet equals should detect differences');
  assert(set.hashCode() === setSame.hashCode(), 'ImmutableSet hashCode should match identical values');

  // immutability helpers
  const arrOut = arr.toArray();
  arrOut.push(99);
  assert(arr.length === 3, 'toArray should not mutate original');

  const setOut = set.toSet();
  setOut.add('c');
  assert(!set.has('c'), 'toSet should not mutate original');
}
