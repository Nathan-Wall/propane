/**
 * Tests for generic message types.
 */

import { assert } from './assert.ts';
import { Item, Container, Optional, Pair, Parent } from './generic-types.propane.ts';

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
    const deleted = opt.deleteValue();
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
    const outerContainer = new Container(BoundContainer, { inner: innerContainer });

    assert(outerContainer.inner.inner.id === 1, 'Nested inner.inner.id');
    assert(outerContainer.$typeName === 'Container<Container<Item>>', 'Nested outer $typeName');
    console.log('[PASS] Nested Container<Container<Item>>');
  }

  console.log('\nAll generic type tests passed!');
}
