/**
 * Tests for generic message types.
 */

import { assert } from './assert.js';
import { Item, Container, Optional, Pair, Parent, Timestamped } from './generic-types.pmsg.js';
import { ImmutableDate } from '../runtime/index.js';
import { test } from 'node:test';

export default function runGenericTypesTests() {
  // Test 1: Basic Item type (non-generic)
  {
    const item = new Item({ id: 1, name: 'test' });
    assert(item.id === 1, 'Item id');
    assert(item.name === 'test', 'Item name');
    assert(Item.$typeName === 'Item', 'Item static $typeName');
    assert(item.$typeName === 'Item', 'Item instance $typeName');
    console.log('[PASS] Basic Item creation and accessors');
  }

  // Test 2: Container with single type parameter
  {
    const inner = new Item({ id: 1, name: 'inner' });
    const container = new Container(Item, { inner });
    assert(container.inner.id === 1, 'Container inner.id');
    assert(container.inner.name === 'inner', 'Container inner.name');
    assert(container.$typeName === 'Container<Item>', 'Container instance $typeName');
    console.log('[PASS] Container<Item> creation');
  }

  // Test 3: Container default value
  {
    const container = new Container(Item, undefined);
    assert(container.inner.id === 0, 'Container default inner.id');
    assert(container.inner.name === '', 'Container default inner.name');
    console.log('[PASS] Container<Item> with default inner');
  }

  // Test 4: Container setter preserves constructor refs
  {
    const container = new Container(Item, { inner: new Item({ id: 1, name: 'first' }) });
    const newInner = new Item({ id: 2, name: 'second' });
    const updated = container.setInner(newInner);
    assert(updated.inner.id === 2, 'setInner updated inner.id');
    assert(updated.inner.name === 'second', 'setInner updated inner.name');
    assert(updated.$typeName === 'Container<Item>', 'setInner updated $typeName');
    console.log('[PASS] Container setInner preserves constructor ref');
  }

  // Test 5: Container.bind() creates bound constructor
  {
    const BoundContainer = Container.bind(Item);
    assert(BoundContainer.$typeName === 'Container<Item>', 'Container.bind $typeName');

    const container = BoundContainer({ inner: new Item({ id: 1, name: 'bound' }) });
    assert(container.inner.id === 1, 'Bound container inner.id');
    assert(container.$typeName === 'Container<Item>', 'Bound container instance $typeName');
    console.log('[PASS] Container.bind() creates bound constructor');
  }

  // Test 6: Optional with optional field
  {
    const inner = new Item({ id: 1, name: 'optional' });
    const opt = new Optional(Item, { value: inner });
    assert(opt.value?.id === 1, 'Optional value.id');
    console.log('[PASS] Optional<Item> with value');
  }

  // Test 7: Optional without value
  {
    const opt = new Optional(Item, {});
    assert(opt.value === undefined, 'Optional value undefined');
    console.log('[PASS] Optional<Item> without value');
  }

  // Test 8: Optional deleteValue
  {
    const opt = new Optional(Item, { value: new Item({ id: 1, name: 'test' }) });
    const deleted = opt.unsetValue();
    assert(deleted.value === undefined, 'deleteValue result');
    console.log('[PASS] Optional<Item> deleteValue');
  }

  // Test 9: Pair with two type parameters
  {
    const item = new Item({ id: 1, name: 'item' });
    const parent = new Parent({ name: 'parent' });
    const pair = new Pair(Item, Parent, { first: item, second: parent });
    assert(pair.first.id === 1, 'Pair first.id');
    assert(pair.second.name === 'parent', 'Pair second.name');
    assert(pair.$typeName === 'Pair<Item,Parent>', 'Pair $typeName');
    console.log('[PASS] Pair<Item, Parent> creation');
  }

  // Test 10: Pair setters
  {
    const pair = new Pair(Item, Parent, {
      first: new Item({ id: 1, name: 'first' }),
      second: new Parent({ name: 'second' })
    });
    const updated = pair.setFirst(new Item({ id: 2, name: 'updated' }));
    assert(updated.first.id === 2, 'Pair setFirst first.id');
    assert(updated.second.name === 'second', 'Pair setFirst second unchanged');
    assert(updated.$typeName === 'Pair<Item,Parent>', 'Pair setFirst $typeName');
    console.log('[PASS] Pair setters preserve constructor refs');
  }

  // Test 11: Pair.bind() creates bound constructor
  {
    const BoundPair = Pair.bind(Item, Parent);
    assert(BoundPair.$typeName === 'Pair<Item,Parent>', 'Pair.bind $typeName');

    const pair = BoundPair({
      first: new Item({ id: 1, name: 'bound' }),
      second: new Parent({ name: 'pair' })
    });
    assert(pair.first.id === 1, 'Bound pair first.id');
    console.log('[PASS] Pair.bind() creates bound constructor');
  }

  // Test 12: Serialization works for generic messages
  {
    const container = new Container(Item, { inner: new Item({ id: 1, name: 'test' }) });
    const serialized = container.serialize();
    assert(typeof serialized === 'string', 'serialized is string');
    assert(serialized.length > 0, 'serialized is non-empty');
    console.log('[PASS] Serialization works for generic messages');
  }

  // Test 12b: Deserialization of generic messages via bind()
  {
    const original = new Container(Item, { inner: new Item({ id: 42, name: 'deserialize-test' }) });
    const serialized = original.serialize();

    const BoundContainer = Container.bind(Item);
    const deserialized = BoundContainer.deserialize(serialized);

    // Values are accessible
    assert(deserialized.inner.id === 42, 'Deserialized inner.id');
    assert(deserialized.inner.name === 'deserialize-test', 'Deserialized inner.name');

    // Inner should be a proper Item instance
    assert(deserialized.inner instanceof Item, 'Deserialized inner is Item instance');
    assert(original.equals(deserialized), 'Original equals deserialized');

    console.log('[PASS] Deserialization of generic messages via bind()');
  }

  // Test 12c: Deserialization via static deserialize with type class parameter
  {
    const original = new Container(Item, { inner: new Item({ id: 99, name: 'static-deserialize' }) });
    const serialized = original.serialize();

    // Use static deserialize with type class parameter
    const deserialized = Container.deserialize(Item, serialized);

    assert(deserialized.inner.id === 99, 'Static deserialize inner.id');
    assert(deserialized.inner.name === 'static-deserialize', 'Static deserialize inner.name');
    assert(deserialized.inner instanceof Item, 'Static deserialize inner is Item instance');
    assert(original.equals(deserialized), 'Static deserialize equals original');

    console.log('[PASS] Static Container.deserialize(Item, data)');
  }

  // Test 12d: Pair deserialization via static deserialize with multiple type classes
  {
    const original = new Pair(Item, Parent, {
      first: new Item({ id: 1, name: 'first' }),
      second: new Parent({ name: 'second' })
    });
    const serialized = original.serialize();

    const deserialized = Pair.deserialize(Item, Parent, serialized);

    assert(deserialized.first.id === 1, 'Pair deserialize first.id');
    assert(deserialized.first instanceof Item, 'Pair deserialize first is Item');
    assert(deserialized.second.name === 'second', 'Pair deserialize second.name');
    assert(deserialized.second instanceof Parent, 'Pair deserialize second is Parent');
    assert(original.equals(deserialized), 'Pair deserialize equals original');

    console.log('[PASS] Static Pair.deserialize(Item, Parent, data)');
  }

  // Test 12e: Optional deserialization with value
  {
    const original = new Optional(Item, { value: new Item({ id: 7, name: 'optional-value' }) });
    const serialized = original.serialize();

    const deserialized = Optional.deserialize(Item, serialized);

    assert(deserialized.value !== undefined, 'Optional deserialize has value');
    assert(deserialized.value?.id === 7, 'Optional deserialize value.id');
    assert(deserialized.value instanceof Item, 'Optional deserialize value is Item');
    assert(original.equals(deserialized), 'Optional deserialize equals original');

    console.log('[PASS] Static Optional.deserialize(Item, data) with value');
  }

  // Test 12f: Optional deserialization without value
  {
    const original = new Optional(Item, {});
    const serialized = original.serialize();

    const deserialized = Optional.deserialize(Item, serialized);

    assert(deserialized.value === undefined, 'Optional deserialize value is undefined');
    assert(original.equals(deserialized), 'Optional deserialize equals original (empty)');

    console.log('[PASS] Static Optional.deserialize(Item, data) without value');
  }

  // Test 12g: Bound constructor with raw object data
  {
    const BoundContainer = Container.bind(Item);
    // Pass raw object data instead of Item instance
    const container = BoundContainer({ inner: { id: 55, name: 'raw-object' } as Item });

    assert(container.inner.id === 55, 'Bound constructor raw object inner.id');
    assert(container.inner.name === 'raw-object', 'Bound constructor raw object inner.name');
    assert(container.inner instanceof Item, 'Bound constructor reconstructs Item from raw object');

    console.log('[PASS] Bound constructor with raw object data');
  }

  // Test 13: Equality works for generic messages
  {
    const a = new Container(Item, { inner: new Item({ id: 1, name: 'test' }) });
    const b = new Container(Item, { inner: new Item({ id: 1, name: 'test' }) });
    const c = new Container(Item, { inner: new Item({ id: 2, name: 'test' }) });

    assert(a.equals(b), 'Container a equals b');
    assert(!a.equals(c), 'Container a not equals c');
    console.log('[PASS] Container equality');
  }

  // Test 14: Nested generic messages
  {
    const innerItem = new Item({ id: 1, name: 'nested' });
    const innerContainer = new Container(Item, { inner: innerItem });
    const BoundContainer = Container.bind(Item);
    const outerContainer = new Container(
      // @ts-expect-error BoundContainer is a callable function, not a class constructor
      BoundContainer, { inner: innerContainer }
    );

    assert(outerContainer.inner.inner.id === 1, 'Nested inner.inner.id');
    assert(outerContainer.$typeName === 'Container<Container<Item>>', 'Nested outer $typeName');
    console.log('[PASS] Nested Container<Container<Item>>');
  }

  // Test 15: Timestamped - generic with both generic and non-generic fields
  {
    const item = new Item({ id: 1, name: 'timestamped-item' });
    const now = new Date();
    const timestamped = new Timestamped(Item, { inner: item, timestamp: now, label: 'test' });
    assert(timestamped.inner.id === 1, 'Timestamped inner.id');
    assert(timestamped.inner.name === 'timestamped-item', 'Timestamped inner.name');
    assert(timestamped.timestamp instanceof ImmutableDate, 'Timestamped timestamp is ImmutableDate');
    assert(timestamped.timestamp.getTime() === now.getTime(), 'Timestamped timestamp value');
    assert(timestamped.label === 'test', 'Timestamped label');
    assert(timestamped.$typeName === 'Timestamped<Item>', 'Timestamped $typeName');
    console.log('[PASS] Timestamped<Item> creation');
  }

  // Test 16: Timestamped deserialization with validation of non-generic fields
  {
    const item = new Item({ id: 42, name: 'serialize-test' });
    const timestamp = new Date('2024-01-15T12:00:00Z');
    const original = new Timestamped(Item, { inner: item, timestamp, label: 'serialized' });
    const serialized = original.serialize();

    const deserialized = Timestamped.deserialize(Item, serialized);

    // Verify all fields were properly deserialized with validation
    assert(deserialized.inner.id === 42, 'Timestamped deserialized inner.id');
    assert(deserialized.inner.name === 'serialize-test', 'Timestamped deserialized inner.name');
    assert(deserialized.inner instanceof Item, 'Timestamped deserialized inner is Item instance');
    assert(deserialized.timestamp instanceof ImmutableDate, 'Timestamped deserialized timestamp is ImmutableDate');
    assert(deserialized.timestamp.getTime() === timestamp.getTime(), 'Timestamped deserialized timestamp value');
    assert(deserialized.label === 'serialized', 'Timestamped deserialized label');
    assert(original.equals(deserialized), 'Timestamped original equals deserialized');
    console.log('[PASS] Timestamped.deserialize(Item, data) with non-generic field validation');
  }

  // Test 17: Timestamped bind().deserialize
  {
    const original = new Timestamped(Item, {
      inner: new Item({ id: 99, name: 'bound-test' }),
      timestamp: new Date('2024-06-01T00:00:00Z'),
      label: 'bound'
    });
    const serialized = original.serialize();

    const BoundTimestamped = Timestamped.bind(Item);
    const deserialized = BoundTimestamped.deserialize(serialized);

    assert(deserialized.inner.id === 99, 'Bound Timestamped deserialized inner.id');
    assert(deserialized.timestamp instanceof ImmutableDate, 'Bound Timestamped deserialized timestamp is ImmutableDate');
    assert(deserialized.label === 'bound', 'Bound Timestamped deserialized label');
    console.log('[PASS] Timestamped.bind(Item).deserialize()');
  }

  console.log('\nAll generic type tests passed!');
}

test('runGenericTypesTests', () => {
  runGenericTypesTests();
});
