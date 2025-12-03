import { assert } from './assert.ts';
import { ImmutableArray } from '../runtime/common/array/immutable.ts';

export default function runImmutableArrayTests() {
  testConstruction();
  testBasicAccess();
  testIterators();
  testReadOnlyMethods();
  testMutatingMethods();
  testEqualsAndHashCode();
  testImmutability();
  console.log('All ImmutableArray tests passed!');
}

function testConstruction() {
  // Empty construction
  const empty = new ImmutableArray<number>();
  assert(empty.length === 0, 'Empty array should have length 0');

  // From array
  const fromArray = new ImmutableArray([1, 2, 3]);
  assert(fromArray.length === 3, 'Should have length 3');
  assert(fromArray[0] === 1, 'Index 0 should be 1');

  // From iterable
  const set = new Set([4, 5, 6]);
  const fromIterable = new ImmutableArray(set);
  assert(fromIterable.length === 3, 'Should have length 3 from Set');

  // From array-like
  const arrayLike = { length: 2, 0: 'a', 1: 'b' };
  const fromArrayLike = new ImmutableArray(arrayLike);
  assert(fromArrayLike.length === 2, 'Should have length 2 from array-like');
  assert(fromArrayLike[0] === 'a', 'Index 0 should be "a"');
}

function testBasicAccess() {
  const arr = new ImmutableArray([10, 20, 30, 40, 50]);

  // at()
  assert(arr.at(0) === 10, 'at(0) should be 10');
  assert(arr.at(-1) === 50, 'at(-1) should be 50');
  assert(arr.at(10) === undefined, 'at(10) should be undefined');

  // get()
  assert(arr.get(1) === 20, 'get(1) should be 20');

  // set()
  const modified = arr.set(2, 999);
  assert(modified[2] === 999, 'set should change value');
  assert(arr[2] === 30, 'Original should be unchanged');
  assert(arr.set(100, 1) === arr, 'set out of bounds returns same instance');

  // length
  assert(arr.length === 5, 'length should be 5');
}

function testIterators() {
  const arr = new ImmutableArray(['a', 'b', 'c']);

  // entries()
  const entries = [...arr.entries()];
  assert(entries.length === 3, 'entries should have 3 items');
  assert(entries[0][0] === 0 && entries[0][1] === 'a', 'First entry should be [0, "a"]');

  // keys()
  const keys = [...arr.keys()];
  assert(keys.length === 3, 'keys should have 3 items');
  assert(keys[0] === 0 && keys[2] === 2, 'Keys should be indices');

  // values()
  const values = [...arr.values()];
  assert(values.length === 3, 'values should have 3 items');
  assert(values[0] === 'a' && values[2] === 'c', 'Values should match');

  // Symbol.iterator
  const iterated = [...arr];
  assert(iterated.length === 3, 'Spread should have 3 items');
  assert(iterated[1] === 'b', 'Second item should be "b"');

  // forEach
  const collected: string[] = [];
  for (const v of arr) collected.push(v);
  assert(collected.length === 3, 'forEach should visit 3 items');
}

function testReadOnlyMethods() {
  const nums = new ImmutableArray([1, 2, 3, 4, 5]);
  const strs = new ImmutableArray(['apple', 'banana', 'cherry']);

  // map
  const doubled = nums.map((n) => n * 2);
  assert(doubled instanceof ImmutableArray, 'map should return ImmutableArray');
  assert(doubled.length === 5 && doubled[0] === 2 && doubled[4] === 10, 'map should double');

  // filter
  const evens = nums.filter((n) => n % 2 === 0);
  assert(evens instanceof ImmutableArray, 'filter should return ImmutableArray');
  assert(evens.length === 2 && evens[0] === 2 && evens[1] === 4, 'filter should get evens');

  // concat
  const concatenated = nums.concat([6, 7], [8]);
  assert(concatenated.length === 8, 'concat should have 8 items');
  assert(concatenated[7] === 8, 'Last item should be 8');

  // every
  assert(nums.every((n) => n > 0), 'every: all positive');
  assert(!nums.every((n) => n > 3), 'every: not all > 3');

  // some
  assert(nums.some((n) => n > 4), 'some: has item > 4');
  assert(!nums.some((n) => n > 10), 'some: none > 10');

  // find
  assert(nums.find((n) => n > 3) === 4, 'find first > 3');
  // eslint-disable-next-line unicorn/prefer-array-some -- testing find() behavior
  assert(nums.find((n) => n > 10) === undefined, 'find returns undefined');

  // findIndex
  assert(nums.findIndex((n) => n > 3) === 3, 'findIndex of first > 3');
  assert(!nums.some((n) => n > 10) , 'findIndex returns -1');

  // findLast
  assert(nums.findLast((n) => n < 4) === 3, 'findLast < 4');

  // findLastIndex
  assert(nums.findLastIndex((n) => n < 4) === 2, 'findLastIndex < 4');

  // flat
  const nested = new ImmutableArray([[1, 2], [3, 4]]);
  const flattened = nested.flat();
  assert(flattened.length === 4, 'flat should have 4 items');

  // flatMap
  const flatMapped = nums.flatMap((n) => [n, n * 10]);
  assert(flatMapped.length === 10, 'flatMap should have 10 items');

  // includes
  assert(nums.includes(3), 'includes 3');
  assert(!nums.includes(10), 'does not include 10');

  // indexOf
  assert(nums.indexOf(3) === 2, 'indexOf 3');
  assert(!nums.includes(10), 'indexOf missing');

  // lastIndexOf
  const withDupes = new ImmutableArray([1, 2, 3, 2, 1]);
  assert(withDupes.lastIndexOf(2) === 3, 'lastIndexOf 2');

  // join
  assert(strs.join(', ') === 'apple, banana, cherry', 'join with comma');
  assert(nums.join(',') === '1,2,3,4,5', 'join default separator');

  // reduce
  const sum = nums.reduce((acc, n) => acc + n, 0);
  assert(sum === 15, 'reduce sum');
  const sumNoInit = nums.reduce((acc, n) => acc + n);
  assert(sumNoInit === 15, 'reduce sum without initial');

  // reduceRight
  const rightJoin = strs.reduceRight((acc, s) => acc + s, '');
  assert(rightJoin === 'cherrybanannapple' || rightJoin === 'cherrybananaapple', 'reduceRight joins from right');

  // slice
  const sliced = nums.slice(1, 4);
  assert(sliced instanceof ImmutableArray, 'slice returns ImmutableArray');
  assert(sliced.length === 3 && sliced[0] === 2, 'slice 1-4');

  // toReversed
  const reversed = nums.toReversed();
  assert(reversed[0] === 5 && reversed[4] === 1, 'toReversed');

  // toSorted
  const unsorted = new ImmutableArray([3, 1, 4, 1, 5]);
  const sorted = unsorted.toSorted((a, b) => a - b);
  assert(sorted[0] === 1 && sorted[4] === 5, 'toSorted');

  // toSpliced
  const spliced = nums.toSpliced(2, 1, 99, 100);
  assert(spliced.length === 6, 'toSpliced length');
  assert(spliced[2] === 99 && spliced[3] === 100, 'toSpliced values');

  // with
  const withReplaced = nums.with(2, 999);
  assert(withReplaced[2] === 999, 'with replaces value');
  assert(nums[2] === 3, 'original unchanged');

  // toString
  assert(nums.toString() === '1,2,3,4,5', 'toString');

  // toLocaleString
  assert(typeof nums.toLocaleString() === 'string', 'toLocaleString returns string');

  // toArray
  const plain = nums.toArray();
  assert(Array.isArray(plain), 'toArray returns plain array');
  assert(plain.length === 5, 'toArray has correct length');
}

function testMutatingMethods() {
  const nums = new ImmutableArray([1, 2, 3, 4, 5]);

  // copyWithin
  const copied = nums.copyWithin(0, 3);
  assert(copied[0] === 4 && copied[1] === 5, 'copyWithin copies from index 3');
  assert(nums[0] === 1, 'original unchanged after copyWithin');

  // fill
  const filled = nums.fill(0, 1, 4);
  assert(filled[1] === 0 && filled[2] === 0 && filled[3] === 0, 'fill replaces range');
  assert(filled[0] === 1 && filled[4] === 5, 'fill preserves outside range');
  assert(nums[2] === 3, 'original unchanged after fill');

  // pop
  const [popped, afterPop] = nums.pop();
  assert(popped === 5, 'pop returns last element');
  assert(afterPop.length === 4, 'afterPop has length 4');
  assert(nums.length === 5, 'original unchanged after pop');

  const emptyArr = new ImmutableArray<number>();
  const [emptyPopped, afterEmptyPop] = emptyArr.pop();
  assert(emptyPopped === undefined, 'pop on empty returns undefined');
  assert(afterEmptyPop === emptyArr, 'pop on empty returns same instance');

  // push
  const pushed = nums.push(6, 7);
  assert(pushed.length === 7, 'push adds elements');
  assert(pushed[5] === 6 && pushed[6] === 7, 'push appends correctly');
  assert(nums.length === 5, 'original unchanged after push');
  assert(nums.push() === nums, 'push with no args returns same instance');

  // reverse
  // eslint-disable-next-line unicorn/no-array-reverse -- testing ImmutableArray.reverse()
  const reversed = nums.reverse();
  assert(reversed[0] === 5 && reversed[4] === 1, 'reverse reverses');
  assert(nums[0] === 1, 'original unchanged after reverse');

  // shift
  const [shifted, afterShift] = nums.shift();
  assert(shifted === 1, 'shift returns first element');
  assert(afterShift.length === 4, 'afterShift has length 4');
  assert(afterShift[0] === 2, 'afterShift starts with second element');
  assert(nums.length === 5, 'original unchanged after shift');

  const [emptyShifted, afterEmptyShift] = emptyArr.shift();
  assert(emptyShifted === undefined, 'shift on empty returns undefined');
  assert(afterEmptyShift === emptyArr, 'shift on empty returns same instance');

  // sort
  const unsorted = new ImmutableArray([3, 1, 4, 1, 5]);
  // eslint-disable-next-line unicorn/no-array-sort -- testing ImmutableArray.sort()
  const sorted = unsorted.sort((a, b) => a - b);
  assert(sorted[0] === 1 && sorted[4] === 5, 'sort sorts');
  assert(unsorted[0] === 3, 'original unchanged after sort');

  // splice
  const [removed, afterSplice] = nums.splice(2, 2, 99);
  assert(removed.length === 2 && removed[0] === 3 && removed[1] === 4, 'splice returns removed');
  assert(afterSplice.length === 4, 'splice adjusts length');
  assert(afterSplice[2] === 99, 'splice inserts value');
  assert(nums.length === 5, 'original unchanged after splice');

  // unshift
  const unshifted = nums.unshift(-1, 0);
  assert(unshifted.length === 7, 'unshift adds elements');
  assert(unshifted[0] === -1 && unshifted[1] === 0, 'unshift prepends');
  assert(nums.length === 5, 'original unchanged after unshift');
  assert(nums.unshift() === nums, 'unshift with no args returns same instance');
}

function testEqualsAndHashCode() {
  const arr1 = new ImmutableArray([1, 2, 3]);
  const arr2 = new ImmutableArray([1, 2, 3]);
  const arr3 = new ImmutableArray([1, 2, 4]);
  const arr4 = new ImmutableArray([1, 2]);

  // equals
  assert(arr1.equals(arr2), 'Same contents should be equal');
  assert(arr1.equals([1, 2, 3]), 'Should equal plain array');
  assert(!arr1.equals(arr3), 'Different contents not equal');
  assert(!arr1.equals(arr4), 'Different lengths not equal');
  assert(!arr1.equals(null), 'Not equal to null');
  assert(!arr1.equals(undefined), 'Not equal to undefined');

  // hashCode
  assert(arr1.hashCode() === arr2.hashCode(), 'Equal arrays should have same hash');
  assert(arr1.hashCode() === arr1.hashCode(), 'hashCode should be stable');
}

function testImmutability() {
  const arr = new ImmutableArray([1, 2, 3]);

  // Verify frozen
  assert(Object.isFrozen(arr), 'ImmutableArray should be frozen');

  // Verify operations return new instances
  const modified = arr.set(0, 99);
  assert(modified !== arr, 'set should return new instance');
  assert(arr[0] === 1, 'Original should be unchanged');

  // toArray returns mutable copy
  const plain = arr.toArray();
  plain[0] = 999;
  assert(arr[0] === 1, 'Mutating toArray result should not affect original');
}
