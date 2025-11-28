import { assert } from './assert.ts';
import { ImmutableMap } from '../runtime/common/map/immutable.ts';
import { ImmutableSet } from '../runtime/common/set/immutable.ts';
import { ADD_UPDATE_LISTENER } from '../runtime/symbols.ts';
import { Message } from '../runtime/message.ts';

// Mock message class for testing
class TestMessage extends Message<{ value: string }> {
  #value: string;

  constructor(
    props: { value: string },
    listeners?: Set<(val: TestMessage) => void>
  ) {
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

  protected $fromEntries(entries: Record<string, unknown>) {
    return { value: entries.value as string };
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
  let currentMap: ImmutableMap<string, TestMessage>;

  const updateHandler = (newMap: ImmutableMap<string, TestMessage>) => {
    currentMap = newMap;
  };

  currentMap = map[ADD_UPDATE_LISTENER](updateHandler);

  // Update child
  currentMap.get('k1')!.setValue('one-updated');

  assert(currentMap !== map, 'Map should have updated identity');
  assert(currentMap.get('k1')!.getValue() === 'one-updated', 'Item value should be updated');

  // Update another child
  currentMap.get('k2')!.setValue('two-updated');

  assert(currentMap.get('k2')!.getValue() === 'two-updated', 'Map should reflect second update');

  console.log('ImmutableMap deep updates passed.');
}

function testSetDeepUpdate() {
  console.log('Testing ImmutableSet deep updates...');

  const item1 = new TestMessage({ value: 'one' });
  const item2 = new TestMessage({ value: 'two' });

  const set = new ImmutableSet([item1, item2]);
  let currentSet: ImmutableSet<TestMessage>;

  const updateHandler = (newSet: ImmutableSet<TestMessage>) => {
    currentSet = newSet;
  };

  currentSet = set[ADD_UPDATE_LISTENER](updateHandler);

  // Need to get the item from currentSet that corresponds to item1
  // since item1 doesn't have listeners, but currentSet's copy does
  let currentItem1: TestMessage | undefined;
  for (const item of currentSet) {
    if (item.getValue() === 'one') {
      currentItem1 = item;
      break;
    }
  }
  currentItem1!.setValue('one-updated');

  assert(currentSet !== set, 'Set should have updated identity');
  // Verify updated value exists in set
  let hasUpdatedItem1 = false;
  for (const item of currentSet) {
    if (item.getValue() === 'one-updated') {
      hasUpdatedItem1 = true;
      break;
    }
  }
  assert(hasUpdatedItem1, 'Set should contain updated item');

  // Need to get the item from currentSet that corresponds to item2
  let currentItem2: TestMessage | undefined;
  for (const item of currentSet) {
    if (item.getValue() === 'two') {
      currentItem2 = item;
      break;
    }
  }
  currentItem2!.setValue('two-updated');

  // Verify updated value exists in set
  let hasUpdatedItem2 = false;
  for (const item of currentSet) {
    if (item.getValue() === 'two-updated') {
      hasUpdatedItem2 = true;
      break;
    }
  }
  assert(hasUpdatedItem2, 'Set should reflect second update');

  console.log('ImmutableSet deep updates passed.');
}
