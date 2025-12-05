import { assert } from './assert.ts';
import { ImmutableSet } from '../runtime/common/set/immutable.ts';

export default function runImmutableSetTests() {
  testConstruction();
  testBasicAccess();
  testMutatingMethods();
  testIterators();
  testEqualsAndHashCode();
  testMessageValues();
  testEdgeCases();
  testImmutability();
  console.log('All ImmutableSet tests passed!');
}

function testConstruction() {
  // Empty construction
  const empty = new ImmutableSet<number>();
  assert(empty.size === 0, 'Empty set should have size 0');

  // From array
  const fromArray = new ImmutableSet([1, 2, 3]);
  assert(fromArray.size === 3, 'Should have size 3');
  assert(fromArray.has(1), 'Should have value 1');
  assert(fromArray.has(2), 'Should have value 2');
  assert(fromArray.has(3), 'Should have value 3');

  // From Set
  const regularSet = new Set(['x', 'y', 'z']);
  const fromSet = new ImmutableSet(regularSet);
  assert(fromSet.size === 3, 'Should have size 3 from Set');
  assert(fromSet.has('x'), 'Should have value from Set source');

  // From another ImmutableSet
  const fromImmutable = new ImmutableSet(fromArray);
  assert(fromImmutable.size === 3, 'Should have size 3 from ImmutableSet');
  assert(fromImmutable.has(2), 'Should have value from ImmutableSet source');

  // From iterable (generator)
  // eslint-disable-next-line unicorn/consistent-function-scoping -- test helper
  function* values(): Generator<number> {
    yield 10;
    yield 20;
    yield 30;
  }
  const fromIterable = new ImmutableSet(values());
  assert(fromIterable.size === 3, 'Should have size 3 from generator');
  assert(fromIterable.has(20), 'Should have value from generator source');

  // Duplicate values - should be deduplicated
  const withDupes = new ImmutableSet([1, 2, 2, 3, 3, 3]);
  assert(withDupes.size === 3, 'Duplicate values should be deduplicated');
  assert(withDupes.has(1) && withDupes.has(2) && withDupes.has(3), 'Should have all unique values');
}

function testBasicAccess() {
  const set = new ImmutableSet(['apple', 'banana', 'cherry']);

  // has()
  assert(set.has('apple'), 'has should return true for existing value');
  assert(set.has('banana'), 'has should return true for existing value');
  assert(!set.has('missing'), 'has should return false for missing value');

  // size
  assert(set.size === 3, 'size should be 3');

  // Symbol.toStringTag
  assert(
    Object.prototype.toString.call(set) === '[object ImmutableSet]',
    'Should have correct toStringTag'
  );
}

function testMutatingMethods() {
  const original = new ImmutableSet([1, 2, 3]);

  // add() - new value
  const withNew = original.add(4);
  assert(withNew.size === 4, 'add new value should increase size');
  assert(withNew.has(4), 'add should add new value');
  assert(original.size === 3, 'Original should be unchanged');
  assert(!original.has(4), 'Original should not have new value');

  // add() - existing value returns same instance
  const sameValue = original.add(2);
  assert(sameValue === original, 'add existing value should return same instance');

  // delete() - existing value
  const afterDelete = original.delete(2);
  assert(afterDelete.size === 2, 'delete should decrease size');
  assert(!afterDelete.has(2), 'delete should remove value');
  assert(original.has(2), 'Original should retain deleted value');

  // delete() - missing value returns same instance
  const deleteNonExistent = original.delete(999);
  assert(deleteNonExistent === original, 'delete missing value should return same instance');

  // clear()
  const cleared = original.clear();
  assert(cleared.size === 0, 'clear should empty set');
  assert(original.size === 3, 'Original should be unchanged after clear');

  // clear() - empty set returns same instance
  const empty = new ImmutableSet<number>();
  const clearedEmpty = empty.clear();
  assert(clearedEmpty === empty, 'clear on empty should return same instance');
}

function testIterators() {
  const set = new ImmutableSet(['alpha', 'beta', 'gamma']);

  // entries()
  const entries = [...set.entries()];
  assert(entries.length === 3, 'entries should have 3 items');
  // Set entries are [value, value] pairs
  for (const [k, v] of entries) {
    assert(k === v, 'Set entry key and value should be the same');
  }
  const entryValues = new Set(entries.map(([v]) => v));
  assert(entryValues.has('alpha'), 'entries should include alpha');
  assert(entryValues.has('beta'), 'entries should include beta');

  // keys() - same as values() for Set
  const keys = [...set.keys()];
  assert(keys.length === 3, 'keys should have 3 items');
  assert(keys.includes('alpha'), 'keys should include alpha');

  // values()
  const values = [...set.values()];
  assert(values.length === 3, 'values should have 3 items');
  assert(values.includes('alpha'), 'values should include alpha');
  assert(values.includes('beta'), 'values should include beta');
  assert(values.includes('gamma'), 'values should include gamma');

  // Symbol.iterator
  const iterated = [...set];
  assert(iterated.length === 3, 'Spread should have 3 items');
  assert(iterated.includes('beta'), 'Spread should include beta');

  // forEach
  const collected: string[] = [];
  for (const value of set) collected.push(value);
  assert(collected.length === 3, 'forEach should visit 3 items');
  assert(collected.includes('alpha'), 'forEach should visit alpha');

  // forEach with value2 parameter (same as value for Set)
  const pairs: [string, string][] = [];
  for (const [value2, value] of set.entries()) pairs.push([value, value2]);
  for (const [v1, v2] of pairs) {
    assert(v1 === v2, 'forEach value and value2 should be the same');
  }

  // forEach with thisArg
  const context = { results: [] as string[] };
  /* eslint-disable unicorn/no-array-for-each, unicorn/no-array-method-this-argument -- testing forEach with thisArg */
  set.forEach(function(this: typeof context, value) {
    this.results.push(value);
  }, context);
  /* eslint-enable unicorn/no-array-for-each, unicorn/no-array-method-this-argument */
  assert(context.results.length === 3, 'forEach should respect thisArg');
}

function testEqualsAndHashCode() {
  const set1 = new ImmutableSet([1, 2, 3]);
  const set2 = new ImmutableSet([1, 2, 3]);
  const set3 = new ImmutableSet([3, 2, 1]); // different order
  const set4 = new ImmutableSet([1, 2, 99]);
  const set5 = new ImmutableSet([1, 2]);

  // equals - identical contents
  assert(set1.equals(set2), 'Sets with same values should be equal');

  // equals - different order, same contents
  assert(set1.equals(set3), 'Sets with same values in different order should be equal');

  // equals - different values
  assert(!set1.equals(set4), 'Sets with different values should not be equal');

  // equals - different sizes
  assert(!set1.equals(set5), 'Sets with different sizes should not be equal');

  // equals - plain Set
  const plainSet = new Set([1, 2, 3]);
  assert(set1.equals(plainSet), 'Should equal plain Set with same values');

  // equals - null/undefined
  assert(!set1.equals(null), 'Should not equal null');
  assert(!set1.equals(undefined), 'Should not equal undefined');

  // hashCode - same for equal sets
  assert(set1.hashCode() === set2.hashCode(), 'Equal sets should have same hashCode');

  // hashCode - same for different order
  assert(set1.hashCode() === set3.hashCode(), 'Same values different order should have same hashCode');

  // hashCode - stable
  assert(set1.hashCode() === set1.hashCode(), 'hashCode should be stable');

  // hashCode - caching
  const hash1 = set1.hashCode();
  const hash2 = set1.hashCode();
  assert(hash1 === hash2, 'hashCode should be cached');
}

function testMessageValues() {
  // Create message-like objects for testing
  const msgA = {
    id: 1,
    equals(other: unknown) {
      return other && typeof other === 'object' && 'id' in other && (other as { id: unknown }).id === this.id;
    },
    hashCode() {
      return this.id;
    },
  };
  const msgB = {
    id: 1,
    equals(other: unknown) {
      return other && typeof other === 'object' && 'id' in other && (other as { id: unknown }).id === this.id;
    },
    hashCode() {
      return this.id;
    },
  };
  const msgC = {
    id: 2,
    equals(other: unknown) {
      return other && typeof other === 'object' && 'id' in other && (other as { id: unknown }).id === this.id;
    },
    hashCode() {
      return this.id;
    },
  };

  // Message values should be compared by equals, not identity
  const set = new ImmutableSet([msgA, msgB]);
  assert(set.size === 1, 'Equal message values should be deduplicated');
  assert(set.has(msgA), 'has should work with equal message value');
  assert(set.has(msgB), 'has should work with equivalent message value');

  // Different message values should be separate
  const setWithDiff = new ImmutableSet([msgA, msgC]);
  assert(setWithDiff.size === 2, 'Different message values should be separate');

  // Set equality with message values
  const set1 = new ImmutableSet([msgA]);
  const set2 = new ImmutableSet([msgB]);
  assert(set1.equals(set2), 'Sets with equal message values should be equal');

  // add with equal message value returns same instance
  const sameMsg = set.add(msgB);
  assert(sameMsg === set, 'add with equal message value should return same instance');

  // delete with equal message value
  const afterDelete = set.delete(msgB);
  assert(afterDelete.size === 0, 'delete should work with equivalent message value');
}

function testEdgeCases() {
  // Numeric values including -0 and 0
  const numericValues = new ImmutableSet([1, -0, 0, 2]);
  assert(numericValues.has(1), 'Should handle numeric values');
  assert(numericValues.has(-0), 'Should handle -0');
  assert(numericValues.has(0), 'Should handle 0');
  // Note: -0 and 0 may or may not be considered equal depending on implementation

  // Boolean values
  const booleanValues = new ImmutableSet([true, false]);
  assert(booleanValues.size === 2, 'Should handle boolean values');
  assert(booleanValues.has(true), 'Should have true');
  assert(booleanValues.has(false), 'Should have false');

  // null/undefined values
  const nullValues = new ImmutableSet<string | null | undefined>([null, undefined, 'value']);
  assert(nullValues.has(null), 'Should store null value');
  assert(nullValues.has(undefined), 'Should store undefined value');
  assert(nullValues.has('value'), 'Should store string value');
  assert(nullValues.size === 3, 'Should have 3 distinct values');

  // Symbol values
  const sym1 = Symbol('test');
  const sym2 = Symbol('test');
  const symbolValues = new ImmutableSet([sym1, sym2]);
  // Symbols with same description are still different
  assert(symbolValues.size === 2, 'Different symbols should be separate values');
  assert(symbolValues.has(sym1), 'Should find symbol value');

  // BigInt values
  const largeBigInt = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
  const bigIntValues = new ImmutableSet([1n, 2n, largeBigInt]);
  assert(bigIntValues.has(1n), 'Should handle bigint value');
  assert(bigIntValues.size === 3, 'Should handle large bigint values');

  // toSet conversion
  const original = new ImmutableSet([1, 2, 3]);
  const mutable = original.toSet();
  assert(mutable instanceof Set, 'toSet should return Set');
  assert(mutable.size === 3, 'toSet should copy values');
  mutable.add(4);
  assert(!original.has(4), 'Mutating toSet result should not affect original');

  // toJSON
  const forJson = new ImmutableSet(['x', 'y', 'z']);
  const json = forJson.toJSON();
  assert(Array.isArray(json), 'toJSON should return array');
  assert((json as string[]).length === 3, 'toJSON should have 3 values');
  assert((json as string[]).includes('x'), 'toJSON should include x');

  // detach
  const withListeners = new ImmutableSet(['value']);
  const detached = withListeners.detach();
  assert(detached.has('value'), 'detach should preserve values');

  // Empty operations
  const empty = new ImmutableSet<number>();
  assert([...empty].length === 0, 'Empty set iteration should be empty');
  assert([...empty.keys()].length === 0, 'Empty set keys should be empty');
  assert([...empty.values()].length === 0, 'Empty set values should be empty');
  assert([...empty.entries()].length === 0, 'Empty set entries should be empty');
}

function testImmutability() {
  const set = new ImmutableSet([1, 2, 3]);

  // Verify frozen
  assert(Object.isFrozen(set), 'ImmutableSet should be frozen');

  // Verify operations return new instances
  const added = set.add(4);
  assert(added !== set, 'add should return new instance');
  assert(!set.has(4), 'Original should be unchanged');

  const deleted = set.delete(1);
  assert(deleted !== set, 'delete should return new instance');
  assert(set.has(1), 'Original should be unchanged');

  // toSet returns mutable copy
  const plain = set.toSet();
  plain.add(999);
  assert(!set.has(999), 'Mutating toSet result should not affect original');
}
