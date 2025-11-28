import { assert } from './assert.ts';
import { ImmutableArray } from '../runtime/common/array/immutable.ts';
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

export default function runArrayListenerTests() {
  testArrayDeepUpdate();
}

function testArrayDeepUpdate() {
  console.log('Testing ImmutableArray deep updates...');

  const item1 = new TestMessage({ value: 'one' });
  const item2 = new TestMessage({ value: 'two' });

  // Create array
  const array = new ImmutableArray([item1, item2]);

  // Simulate React state update
  // We subscribe to the *current* array.
  // If it updates, we update our reference and (in real React) re-subscribe.
  // Here we just keep the reference updated.

  let currentArray: ImmutableArray<TestMessage>;

  const updateHandler = (newArray: ImmutableArray<TestMessage>) => {
    currentArray = newArray;
  };

  // Initial subscription - returns new instance with listener
  currentArray = array[ADD_UPDATE_LISTENER](updateHandler);

  // Trigger update 1
  currentArray.get(0)!.setValue('one-updated');

  // Check propagation - currentArray should be updated via the listener
  assert(currentArray !== array, 'Array should have updated identity');
  assert(currentArray.get(0)!.getValue() === 'one-updated', 'Item value should be updated');

  // Trigger update 2
  currentArray.get(1)!.setValue('two-updated');

  // Check propagation
  assert(currentArray.get(1)!.getValue() === 'two-updated', 'Item 2 value should be updated');

  console.log('ImmutableArray deep updates passed.');
}
