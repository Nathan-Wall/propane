import { assert } from './assert.ts';
import { ImmutableMap } from '../runtime/common/map/immutable.ts';
import { ImmutableSet } from '../runtime/common/set/immutable.ts';
import { ADD_UPDATE_LISTENER } from '../runtime/symbols.ts';
import { Message } from '../runtime/message.ts';

// Mock message class for testing
class TestMessage extends Message<{ value: string }> {
  #value: string;

  constructor(props: { value: string }, listeners?: any) {
    super(Symbol('TestMessage'), 'TestMessage', listeners);
    this.#value = props.value;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  protected $getPropDescriptors() {
    return [{
      name: 'value' as const,
      fieldNumber: 1,
      getValue: () => this.#value,
    }];
  }

  protected $fromEntries(entries: any) {
    return { value: entries.value };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected $enableChildListeners() {}

  getValue() {
    return this.#value;
  }

  setValue(newValue: string) {
    const next = new TestMessage({ value: newValue }, this.$listeners);
    return this.$update(next);
  }
}

export default function runCollectionListenersTests() {
  testMapDeepUpdate();
  testSetDeepUpdate();
}

function testMapDeepUpdate() {
  console.log('Testing ImmutableMap deep updates...');

  const item1 = new TestMessage({ value: 'one' });
  const item2 = new TestMessage({ value: 'two' });
  
  const map = new ImmutableMap([['k1', item1], ['k2', item2]]);
  let currentMap = map;
  
  const updateHandler = (newMap: ImmutableMap<string, TestMessage>) => {
    currentMap = newMap;
  };

  let subscription = currentMap[ADD_UPDATE_LISTENER](updateHandler);

  // Update child
  const item1Next = currentMap.get('k1')!.setValue('one-updated');

  assert(currentMap !== map, 'Map should have updated identity');
  assert(currentMap.get('k1') === item1Next, 'Map should contain updated item');
  assert(currentMap.get('k1')!.getValue() === 'one-updated', 'Item value should be updated');

  subscription.unsubscribe();
  subscription = currentMap[ADD_UPDATE_LISTENER](updateHandler);

  // Update another child
  const item2Next = currentMap.get('k2')!.setValue('two-updated');

  assert(currentMap.get('k2') === item2Next, 'Map should reflect second update');
  
  subscription.unsubscribe();
  console.log('ImmutableMap deep updates passed.');
}

function testSetDeepUpdate() {
  console.log('Testing ImmutableSet deep updates...');

  const item1 = new TestMessage({ value: 'one' });
  const item2 = new TestMessage({ value: 'two' });
  
  const set = new ImmutableSet([item1, item2]);
  let currentSet = set;
  
  const updateHandler = (newSet: ImmutableSet<TestMessage>) => {
    currentSet = newSet;
  };

  let subscription = currentSet[ADD_UPDATE_LISTENER](updateHandler);

  // To update a set item, we need to find it first.
  // Since we don't have direct access by index, we iterate or use known reference.
  // But wait! ImmutableSet items are values.
  // If I have `item1`, and I call `item1.setValue()`, it returns `item1Next`.
  // `item1Next` is NOT in the set.
  // However, `item1` notifies the set.
  // The set should replace `item1` with `item1Next`?
  // For a Set, replacing an item is removing old and adding new.
  // But if `item1` and `item1Next` are "equal" (value semantics)?
  // Message equality depends on content. `item1` value 'one'. `item1Next` value 'one-updated'.
  // They are NOT equal.
  // So `set` should contain `item1Next` and NOT `item1`.
  
  const item1Next = item1.setValue('one-updated');

  assert(currentSet !== set, 'Set should have updated identity');
  assert(currentSet.has(item1Next), 'Set should contain updated item');
  assert(!currentSet.has(item1), 'Set should not contain old item');

  subscription.unsubscribe();
  subscription = currentSet[ADD_UPDATE_LISTENER](updateHandler);

  const item2Next = item2.setValue('two-updated');

  assert(currentSet.has(item2Next), 'Set should reflect second update');
  
  subscription.unsubscribe();
  console.log('ImmutableSet deep updates passed.');
}
