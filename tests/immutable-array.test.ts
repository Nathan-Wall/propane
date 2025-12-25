import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ImmutableArray } from '../runtime/common/array/immutable.js';

describe('ImmutableArray', () => {
  describe('construction', () => {
    it('creates empty array', () => {
      const empty = new ImmutableArray<number>();
      assert.strictEqual(empty.length, 0);
    });

    it('creates from array', () => {
      const fromArray = new ImmutableArray([1, 2, 3]);
      assert.strictEqual(fromArray.length, 3);
      assert.strictEqual(fromArray[0], 1);
    });

    it('creates from iterable', () => {
      const set = new Set([4, 5, 6]);
      const fromIterable = new ImmutableArray(set);
      assert.strictEqual(fromIterable.length, 3);
    });

    it('creates from array-like', () => {
      const arrayLike = { length: 2, 0: 'a', 1: 'b' };
      const fromArrayLike = new ImmutableArray(arrayLike);
      assert.strictEqual(fromArrayLike.length, 2);
      assert.strictEqual(fromArrayLike[0], 'a');
    });
  });

  describe('basic access', () => {
    const arr = new ImmutableArray([10, 20, 30, 40, 50]);

    it('at() returns correct values', () => {
      assert.strictEqual(arr.at(0), 10);
      assert.strictEqual(arr.at(-1), 50);
      assert.strictEqual(arr.at(10), undefined);
    });

    it('get() returns correct values', () => {
      assert.strictEqual(arr.get(1), 20);
    });

    it('set() creates modified copy', () => {
      const modified = arr.set(2, 999);
      assert.strictEqual(modified[2], 999);
      assert.strictEqual(arr[2], 30, 'Original should be unchanged');
    });

    it('set() out of bounds returns same instance', () => {
      assert.strictEqual(arr.set(100, 1), arr);
    });

    it('length is correct', () => {
      assert.strictEqual(arr.length, 5);
    });
  });

  describe('iterators', () => {
    const arr = new ImmutableArray(['a', 'b', 'c']);

    it('entries() works', () => {
      const entries = [...arr.entries()];
      assert.strictEqual(entries.length, 3);
      assert.deepStrictEqual(entries[0], [0, 'a']);
    });

    it('keys() works', () => {
      const keys = [...arr.keys()];
      assert.deepStrictEqual(keys, [0, 1, 2]);
    });

    it('values() works', () => {
      const values = [...arr.values()];
      assert.deepStrictEqual(values, ['a', 'b', 'c']);
    });

    it('Symbol.iterator works', () => {
      const iterated = [...arr];
      assert.deepStrictEqual(iterated, ['a', 'b', 'c']);
    });

    it('for...of works', () => {
      const collected: string[] = [];
      for (const v of arr) collected.push(v);
      assert.strictEqual(collected.length, 3);
    });
  });

  describe('read-only methods', () => {
    const nums = new ImmutableArray([1, 2, 3, 4, 5]);
    const strs = new ImmutableArray(['apple', 'banana', 'cherry']);

    it('map() returns ImmutableArray with transformed values', () => {
      const doubled = nums.map((n) => n * 2);
      assert.ok(doubled instanceof ImmutableArray);
      assert.deepStrictEqual([...doubled], [2, 4, 6, 8, 10]);
    });

    it('filter() returns ImmutableArray with filtered values', () => {
      const evens = nums.filter((n) => n % 2 === 0);
      assert.ok(evens instanceof ImmutableArray);
      assert.deepStrictEqual([...evens], [2, 4]);
    });

    it('concat() combines arrays', () => {
      const concatenated = nums.concat([6, 7], [8]);
      assert.strictEqual(concatenated.length, 8);
      assert.strictEqual(concatenated[7], 8);
    });

    it('every() tests all elements', () => {
      assert.ok(nums.every((n) => n > 0));
      assert.ok(!nums.every((n) => n > 3));
    });

    it('some() tests for any match', () => {
      assert.ok(nums.some((n) => n > 4));
      assert.ok(!nums.some((n) => n > 10));
    });

    it('find() returns first match', () => {
      assert.strictEqual(nums.find((n) => n > 3), 4);
      assert.strictEqual(nums.find((n) => n > 10), undefined);
    });

    it('findIndex() returns index of first match', () => {
      assert.strictEqual(nums.findIndex((n) => n > 3), 3);
      assert.strictEqual(nums.findIndex((n) => n > 10), -1);
    });

    it('findLast() returns last match', () => {
      assert.strictEqual(nums.findLast((n) => n < 4), 3);
    });

    it('findLastIndex() returns index of last match', () => {
      assert.strictEqual(nums.findLastIndex((n) => n < 4), 2);
    });

    it('flat() flattens nested arrays', () => {
      const nested = new ImmutableArray([[1, 2], [3, 4]]);
      const flattened = nested.flat();
      assert.strictEqual(flattened.length, 4);
    });

    it('flatMap() maps and flattens', () => {
      const flatMapped = nums.flatMap((n) => [n, n * 10]);
      assert.strictEqual(flatMapped.length, 10);
    });

    it('includes() checks membership', () => {
      assert.ok(nums.includes(3));
      assert.ok(!nums.includes(10));
    });

    it('indexOf() returns index', () => {
      assert.strictEqual(nums.indexOf(3), 2);
      assert.strictEqual(nums.indexOf(10), -1);
    });

    it('lastIndexOf() returns last index', () => {
      const withDupes = new ImmutableArray([1, 2, 3, 2, 1]);
      assert.strictEqual(withDupes.lastIndexOf(2), 3);
    });

    it('join() concatenates elements', () => {
      assert.strictEqual(strs.join(', '), 'apple, banana, cherry');
      assert.strictEqual(nums.join(','), '1,2,3,4,5');
    });

    it('reduce() accumulates values', () => {
      const sum = nums.reduce((acc, n) => acc + n, 0);
      assert.strictEqual(sum, 15);
      const sumNoInit = nums.reduce((acc, n) => acc + n);
      assert.strictEqual(sumNoInit, 15);
    });

    it('reduceRight() accumulates from right', () => {
      const rightJoin = strs.reduceRight((acc, s) => acc + s, '');
      assert.strictEqual(rightJoin, 'cherrybananaapple');
    });

    it('slice() returns ImmutableArray subset', () => {
      const sliced = nums.slice(1, 4);
      assert.ok(sliced instanceof ImmutableArray);
      assert.deepStrictEqual([...sliced], [2, 3, 4]);
    });

    it('toReversed() returns reversed copy', () => {
      const reversed = nums.toReversed();
      assert.deepStrictEqual([...reversed], [5, 4, 3, 2, 1]);
    });

    it('toSorted() returns sorted copy', () => {
      const unsorted = new ImmutableArray([3, 1, 4, 1, 5]);
      const sorted = unsorted.toSorted((a, b) => a - b);
      assert.deepStrictEqual([...sorted], [1, 1, 3, 4, 5]);
    });

    it('toSpliced() returns spliced copy', () => {
      const spliced = nums.toSpliced(2, 1, 99, 100);
      assert.strictEqual(spliced.length, 6);
      assert.strictEqual(spliced[2], 99);
      assert.strictEqual(spliced[3], 100);
    });

    it('with() returns copy with replaced value', () => {
      const withReplaced = nums.with(2, 999);
      assert.strictEqual(withReplaced[2], 999);
      assert.strictEqual(nums[2], 3, 'original unchanged');
    });

    it('toString() returns string representation', () => {
      assert.strictEqual(nums.toString(), '1,2,3,4,5');
    });

    it('toLocaleString() returns string', () => {
      assert.strictEqual(typeof nums.toLocaleString(), 'string');
    });

    it('toArray() returns plain array', () => {
      const plain = nums.toArray();
      assert.ok(Array.isArray(plain));
      assert.strictEqual(plain.length, 5);
    });
  });

  describe('mutating methods (return new instances)', () => {
    it('copyWithin() returns modified copy', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const copied = nums.copyWithin(0, 3);
      assert.strictEqual(copied[0], 4);
      assert.strictEqual(copied[1], 5);
      assert.strictEqual(nums[0], 1, 'original unchanged');
    });

    it('fill() returns filled copy', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const filled = nums.fill(0, 1, 4);
      assert.deepStrictEqual([...filled], [1, 0, 0, 0, 5]);
      assert.strictEqual(nums[2], 3, 'original unchanged');
    });

    it('pop() returns [value, newArray]', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const [popped, afterPop] = nums.pop();
      assert.strictEqual(popped, 5);
      assert.strictEqual(afterPop.length, 4);
      assert.strictEqual(nums.length, 5, 'original unchanged');
    });

    it('pop() on empty returns [undefined, same instance]', () => {
      const emptyArr = new ImmutableArray<number>();
      const [emptyPopped, afterEmptyPop] = emptyArr.pop();
      assert.strictEqual(emptyPopped, undefined);
      assert.strictEqual(afterEmptyPop, emptyArr);
    });

    it('push() returns new array with added elements', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const pushed = nums.push(6, 7);
      assert.strictEqual(pushed.length, 7);
      assert.strictEqual(pushed[5], 6);
      assert.strictEqual(pushed[6], 7);
      assert.strictEqual(nums.length, 5, 'original unchanged');
    });

    it('push() with no args returns same instance', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      assert.strictEqual(nums.push(), nums);
    });

    it('reverse() returns reversed copy', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      // eslint-disable-next-line unicorn/no-array-reverse -- testing ImmutableArray.reverse
      const reversed = nums.reverse();
      assert.deepStrictEqual([...reversed], [5, 4, 3, 2, 1]);
      assert.strictEqual(nums[0], 1, 'original unchanged');
    });

    it('shift() returns [value, newArray]', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const [shifted, afterShift] = nums.shift();
      assert.strictEqual(shifted, 1);
      assert.strictEqual(afterShift.length, 4);
      assert.strictEqual(afterShift[0], 2);
      assert.strictEqual(nums.length, 5, 'original unchanged');
    });

    it('shift() on empty returns [undefined, same instance]', () => {
      const emptyArr = new ImmutableArray<number>();
      const [emptyShifted, afterEmptyShift] = emptyArr.shift();
      assert.strictEqual(emptyShifted, undefined);
      assert.strictEqual(afterEmptyShift, emptyArr);
    });

    it('sort() returns sorted copy', () => {
      const unsorted = new ImmutableArray([3, 1, 4, 1, 5]);
      // eslint-disable-next-line unicorn/no-array-sort -- testing ImmutableArray.sort
      const sorted = unsorted.sort((a, b) => a - b);
      assert.deepStrictEqual([...sorted], [1, 1, 3, 4, 5]);
      assert.strictEqual(unsorted[0], 3, 'original unchanged');
    });

    it('splice() returns [removed, newArray]', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const [removed, afterSplice] = nums.splice(2, 2, 99);
      assert.deepStrictEqual([...removed], [3, 4]);
      assert.strictEqual(afterSplice.length, 4);
      assert.strictEqual(afterSplice[2], 99);
      assert.strictEqual(nums.length, 5, 'original unchanged');
    });

    it('unshift() returns new array with prepended elements', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      const unshifted = nums.unshift(-1, 0);
      assert.strictEqual(unshifted.length, 7);
      assert.strictEqual(unshifted[0], -1);
      assert.strictEqual(unshifted[1], 0);
      assert.strictEqual(nums.length, 5, 'original unchanged');
    });

    it('unshift() with no args returns same instance', () => {
      const nums = new ImmutableArray([1, 2, 3, 4, 5]);
      assert.strictEqual(nums.unshift(), nums);
    });
  });

  describe('equals and hashCode', () => {
    const arr1 = new ImmutableArray([1, 2, 3]);
    const arr2 = new ImmutableArray([1, 2, 3]);
    const arr3 = new ImmutableArray([1, 2, 4]);
    const arr4 = new ImmutableArray([1, 2]);

    it('equals() returns true for same contents', () => {
      assert.ok(arr1.equals(arr2));
    });

    it('equals() works with plain array', () => {
      assert.ok(arr1.equals([1, 2, 3]));
    });

    it('equals() returns false for different contents', () => {
      assert.ok(!arr1.equals(arr3));
    });

    it('equals() returns false for different lengths', () => {
      assert.ok(!arr1.equals(arr4));
    });

    it('equals() returns false for null/undefined', () => {
      assert.ok(!arr1.equals(null));
      assert.ok(!arr1.equals(undefined));
    });

    it('hashCode() is same for equal arrays', () => {
      assert.strictEqual(arr1.hashCode(), arr2.hashCode());
    });

    it('hashCode() is stable', () => {
      assert.strictEqual(arr1.hashCode(), arr1.hashCode());
    });
  });

  describe('immutability', () => {
    it('is frozen', () => {
      const arr = new ImmutableArray([1, 2, 3]);
      assert.ok(Object.isFrozen(arr));
    });

    it('operations return new instances', () => {
      const arr = new ImmutableArray([1, 2, 3]);
      const modified = arr.set(0, 99);
      assert.notStrictEqual(modified, arr);
      assert.strictEqual(arr[0], 1, 'Original unchanged');
    });

    it('toArray() returns mutable copy', () => {
      const arr = new ImmutableArray([1, 2, 3]);
      const plain = arr.toArray();
      plain[0] = 999;
      assert.strictEqual(arr[0], 1, 'Mutating toArray result does not affect original');
    });
  });
});
