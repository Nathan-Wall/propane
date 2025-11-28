import { assert } from './assert.ts';
import { ImmutableMap } from '../runtime/common/map/immutable.ts';

export default function runImmutableMapTests() {
  testConstruction();
  testBasicAccess();
  testMutatingMethods();
  testIterators();
  testEqualsAndHashCode();
  testMessageKeys();
  testEdgeCases();
  console.log('All ImmutableMap tests passed!');
}

function testConstruction() {
  // Empty construction
  const empty = new ImmutableMap<string, number>();
  assert(empty.size === 0, 'Empty map should have size 0');

  // From array of entries
  const fromArray = new ImmutableMap([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]);
  assert(fromArray.size === 3, 'Should have size 3');
  assert(fromArray.get('a') === 1, 'Should get value for key "a"');

  // From Map
  const regularMap = new Map([
    ['x', 10],
    ['y', 20],
  ]);
  const fromMap = new ImmutableMap(regularMap);
  assert(fromMap.size === 2, 'Should have size 2 from Map');
  assert(fromMap.get('x') === 10, 'Should get value from Map source');

  // From another ImmutableMap
  const fromImmutable = new ImmutableMap(fromArray);
  assert(fromImmutable.size === 3, 'Should have size 3 from ImmutableMap');
  assert(fromImmutable.get('b') === 2, 'Should get value from ImmutableMap source');

  // From iterable
  function* entries(): Generator<[string, number]> {
    yield ['p', 100];
    yield ['q', 200];
  }
  const fromIterable = new ImmutableMap(entries());
  assert(fromIterable.size === 2, 'Should have size 2 from generator');
  assert(fromIterable.get('q') === 200, 'Should get value from generator source');

  // Null/undefined construction
  const fromNull = new ImmutableMap<string, number>(null);
  assert(fromNull.size === 0, 'Null should create empty map');

  // Duplicate keys - last wins
  const withDupes = new ImmutableMap([
    ['key', 1],
    ['key', 2],
    ['key', 3],
  ]);
  assert(withDupes.size === 1, 'Duplicate keys should be deduplicated');
  assert(withDupes.get('key') === 3, 'Last value should win for duplicate keys');
}

function testBasicAccess() {
  const map = new ImmutableMap([
    ['one', 1],
    ['two', 2],
    ['three', 3],
  ]);

  // get()
  assert(map.get('one') === 1, 'get should return value');
  assert(map.get('missing') === undefined, 'get missing key should return undefined');

  // has()
  assert(map.has('two'), 'has should return true for existing key');
  assert(!map.has('missing'), 'has should return false for missing key');

  // size
  assert(map.size === 3, 'size should be 3');

  // Symbol.toStringTag
  assert(
    Object.prototype.toString.call(map) === '[object ImmutableMap]',
    'Should have correct toStringTag'
  );
}

function testMutatingMethods() {
  const original = new ImmutableMap([
    ['a', 1],
    ['b', 2],
  ]);

  // set() - new key
  const withNewKey = original.set('c', 3);
  assert(withNewKey.size === 3, 'set new key should increase size');
  assert(withNewKey.get('c') === 3, 'set should add new entry');
  assert(original.size === 2, 'Original should be unchanged');
  assert(!original.has('c'), 'Original should not have new key');

  // set() - existing key with new value
  const withUpdated = original.set('a', 100);
  assert(withUpdated.size === 2, 'set existing key should not change size');
  assert(withUpdated.get('a') === 100, 'set should update value');
  assert(original.get('a') === 1, 'Original should retain old value');

  // set() - existing key with same value returns same instance
  const sameValue = original.set('a', 1);
  assert(sameValue === original, 'set with same value should return same instance');

  // delete() - existing key
  const afterDelete = original.delete('a');
  assert(afterDelete.size === 1, 'delete should decrease size');
  assert(!afterDelete.has('a'), 'delete should remove key');
  assert(original.has('a'), 'Original should retain deleted key');

  // delete() - missing key returns same instance
  const deleteNonExistent = original.delete('missing');
  assert(deleteNonExistent === original, 'delete missing key should return same instance');

  // clear()
  const cleared = original.clear();
  assert(cleared.size === 0, 'clear should empty map');
  assert(original.size === 2, 'Original should be unchanged after clear');

  // clear() - empty map returns same instance
  const empty = new ImmutableMap<string, number>();
  const clearedEmpty = empty.clear();
  assert(clearedEmpty === empty, 'clear on empty should return same instance');
}

function testIterators() {
  const map = new ImmutableMap([
    ['alpha', 1],
    ['beta', 2],
    ['gamma', 3],
  ]);

  // entries()
  const entries = [...map.entries()];
  assert(entries.length === 3, 'entries should have 3 items');
  const entryKeys = entries.map(([k]) => k);
  assert(entryKeys.includes('alpha'), 'entries should include alpha');
  assert(entryKeys.includes('beta'), 'entries should include beta');
  assert(entryKeys.includes('gamma'), 'entries should include gamma');

  // keys()
  const keys = [...map.keys()];
  assert(keys.length === 3, 'keys should have 3 items');
  assert(keys.includes('alpha'), 'keys should include alpha');
  assert(keys.includes('beta'), 'keys should include beta');

  // values()
  const values = [...map.values()];
  assert(values.length === 3, 'values should have 3 items');
  assert(values.includes(1), 'values should include 1');
  assert(values.includes(2), 'values should include 2');
  assert(values.includes(3), 'values should include 3');

  // Symbol.iterator
  const iterated = [...map];
  assert(iterated.length === 3, 'Spread should have 3 items');

  // forEach
  const collected: [string, number][] = [];
  map.forEach((value, key) => collected.push([key, value]));
  assert(collected.length === 3, 'forEach should visit 3 items');

  // forEach with thisArg
  const context = { results: [] as number[] };
  map.forEach(function(this: typeof context, value) {
    this.results.push(value);
  }, context);
  assert(context.results.length === 3, 'forEach should respect thisArg');
}

function testEqualsAndHashCode() {
  const map1 = new ImmutableMap([
    ['a', 1],
    ['b', 2],
  ]);
  const map2 = new ImmutableMap([
    ['a', 1],
    ['b', 2],
  ]);
  const map3 = new ImmutableMap([
    ['b', 2],
    ['a', 1],
  ]);
  const map4 = new ImmutableMap([
    ['a', 1],
    ['b', 999],
  ]);
  const map5 = new ImmutableMap([
    ['a', 1],
  ]);

  // equals - identical contents
  assert(map1.equals(map2), 'Maps with same entries should be equal');

  // equals - different order, same contents
  assert(map1.equals(map3), 'Maps with same entries in different order should be equal');

  // equals - different values
  assert(!map1.equals(map4), 'Maps with different values should not be equal');

  // equals - different sizes
  assert(!map1.equals(map5), 'Maps with different sizes should not be equal');

  // equals - plain Map
  const plainMap = new Map([
    ['a', 1],
    ['b', 2],
  ]);
  assert(map1.equals(plainMap), 'Should equal plain Map with same entries');

  // equals - null/undefined
  assert(!map1.equals(null), 'Should not equal null');
  assert(!map1.equals(undefined), 'Should not equal undefined');

  // hashCode - same for equal maps
  assert(map1.hashCode() === map2.hashCode(), 'Equal maps should have same hashCode');

  // hashCode - same for different order
  assert(map1.hashCode() === map3.hashCode(), 'Same entries different order should have same hashCode');

  // hashCode - stable
  assert(map1.hashCode() === map1.hashCode(), 'hashCode should be stable');

  // hashCode - caching
  const hash1 = map1.hashCode();
  const hash2 = map1.hashCode();
  assert(hash1 === hash2, 'hashCode should be cached');
}

function testMessageKeys() {
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

  // Message keys should be compared by equals, not identity
  const map = new ImmutableMap([
    [msgA, 'first'],
    [msgB, 'second'],
  ]);
  assert(map.size === 1, 'Equal message keys should be deduplicated');
  assert(map.get(msgA) === 'second', 'Should get value using equal message key');
  assert(map.get(msgB) === 'second', 'Should get same value with equivalent key');
  assert(map.has(msgB), 'has should work with equivalent key');

  // Different message keys should be separate
  const mapWithDiff = new ImmutableMap([
    [msgA, 'A'],
    [msgC, 'C'],
  ]);
  assert(mapWithDiff.size === 2, 'Different message keys should be separate');

  // Message values should be compared by equals
  const msgVal1 = {
    name: 'test',
    equals(other: unknown) {
      return other && typeof other === 'object' && 'name' in other && (other as { name: unknown }).name === this.name;
    },
  };
  const msgVal2 = {
    name: 'test',
    equals(other: unknown) {
      return other && typeof other === 'object' && 'name' in other && (other as { name: unknown }).name === this.name;
    },
  };
  const valMap1 = new ImmutableMap([['key', msgVal1]]);
  const valMap2 = new ImmutableMap([['key', msgVal2]]);
  assert(valMap1.equals(valMap2), 'Maps with equal message values should be equal');

  // set with equal message value returns same instance
  const sameMsg = valMap1.set('key', msgVal2);
  assert(sameMsg === valMap1, 'set with equal message value should return same instance');
}

function testEdgeCases() {
  // Numeric keys
  const numericKeys = new ImmutableMap<number, string>([
    [1, 'one'],
    [2, 'two'],
    [-0, 'negative zero'],
    [0, 'zero'],
  ]);
  assert(numericKeys.has(1), 'Should handle numeric keys');
  assert(numericKeys.has(-0), 'Should handle -0 key');
  assert(numericKeys.has(0), 'Should handle 0 key');
  // -0 and 0 should be distinguished
  assert(numericKeys.size === 4, '-0 and 0 should be separate keys');

  // Boolean keys
  const booleanKeys = new ImmutableMap<boolean, string>([
    [true, 'yes'],
    [false, 'no'],
  ]);
  assert(booleanKeys.get(true) === 'yes', 'Should handle boolean true key');
  assert(booleanKeys.get(false) === 'no', 'Should handle boolean false key');

  // null/undefined values
  const nullValues = new ImmutableMap<string, string | null | undefined>([
    ['null', null],
    ['undefined', undefined],
  ]);
  assert(nullValues.has('null'), 'Should store null value');
  assert(nullValues.get('null') === null, 'Should retrieve null value');
  assert(nullValues.has('undefined'), 'Should store undefined value');
  assert(nullValues.get('undefined') === undefined, 'Should retrieve undefined value');

  // null/undefined keys
  const nullKeys = new ImmutableMap<string | null | undefined, number>([
    [null, 1],
    [undefined, 2],
  ]);
  assert(nullKeys.get(null) === 1, 'Should handle null key');
  assert(nullKeys.get(undefined) === 2, 'Should handle undefined key');

  // Symbol keys
  const sym1 = Symbol('test');
  const sym2 = Symbol('test');
  const symbolKeys = new ImmutableMap<symbol, string>([
    [sym1, 'sym1'],
    [sym2, 'sym2'],
  ]);
  // Symbols with same description are still different
  assert(symbolKeys.size === 2, 'Different symbols should be separate keys');
  assert(symbolKeys.get(sym1) === 'sym1', 'Should retrieve by symbol key');

  // BigInt keys
  const bigIntKeys = new ImmutableMap<bigint, string>([
    [1n, 'one'],
    [BigInt(Number.MAX_SAFE_INTEGER) + 1n, 'big'],
  ]);
  assert(bigIntKeys.get(1n) === 'one', 'Should handle bigint key');
  assert(bigIntKeys.size === 2, 'Should handle large bigint keys');

  // toMap conversion
  const original = new ImmutableMap([
    ['a', 1],
    ['b', 2],
  ]);
  const mutable = original.toMap();
  assert(mutable instanceof Map, 'toMap should return Map');
  assert(mutable.size === 2, 'toMap should copy entries');
  mutable.set('c', 3);
  assert(!original.has('c'), 'Mutating toMap result should not affect original');

  // toJSON
  const forJson = new ImmutableMap([
    ['x', 10],
    ['y', 20],
  ]);
  const json = forJson.toJSON();
  assert(Array.isArray(json), 'toJSON should return array');
  assert((json as [string, number][]).length === 2, 'toJSON should have 2 entries');

  // Map as key (structural equality)
  const innerMap1 = new Map([['inner', 1]]);
  const innerMap2 = new Map([['inner', 1]]);
  const mapKeys = new ImmutableMap<ReadonlyMap<string, number>, string>([
    [innerMap1, 'first'],
    [innerMap2, 'second'],
  ]);
  assert(mapKeys.size === 1, 'Equal map keys should be deduplicated');
  assert(mapKeys.get(innerMap1) === 'second', 'Should find by equal map key');

  // detach
  const withListeners = new ImmutableMap([
    ['key', 'value'],
  ]);
  const detached = withListeners.detach();
  assert(detached.get('key') === 'value', 'detach should preserve entries');
}
