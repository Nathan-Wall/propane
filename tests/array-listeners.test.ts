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
  
  let currentArray = array;
  
  const updateHandler = (newArray: ImmutableArray<TestMessage>) => {
    currentArray = newArray;
    // In React, we would unsubscribe from old and subscribe to new here (via useEffect).
    // But for this test, since we are just verifying data propagation, we can assume the chain works.
    // However, to be robust against the "double notification" issue I found, we should rely on the *latest* value.
  };

  // Initial subscription
  let subscription = currentArray[ADD_UPDATE_LISTENER](updateHandler);

  // Trigger update 1
  const item1Next = currentArray.get(0)!.setValue('one-updated');
  
  // Check propagation
  assert(currentArray !== array, 'Array should have updated identity');
  assert(currentArray.get(0) === item1Next, 'Array should contain updated item');
  assert(currentArray.get(0)!.getValue() === 'one-updated', 'Item value should be updated');

  // Simulate React re-subscription (cleanup old, sub new)
  subscription.unsubscribe();
  subscription = currentArray[ADD_UPDATE_LISTENER](updateHandler);

  // Trigger update 2
  const item2Next = currentArray.get(1)!.setValue('two-updated');

  // Check propagation
  assert(currentArray.get(1) === item2Next, 'Array should reflect second update');
  assert(currentArray.get(1)!.getValue() === 'two-updated', 'Item 2 value should be updated');
  
  subscription.unsubscribe();
  console.log('ImmutableArray deep updates passed.');
}
