import { assert } from './assert.ts';
import { Message } from '../runtime/message.ts';
import { ADD_UPDATE_LISTENER } from '../runtime/symbols.ts';
import { equals } from '../runtime/common/data/equals.ts';

// Shared type tag for UserState - must be the same symbol for equals() to work
const USER_STATE_TAG = Symbol('UserState');

// Test message class
class UserState extends Message<{ name: string; age: number }> {
  #name: string;
  #age: number;

  constructor(
    props: { name: string; age: number },
    listeners?: Set<(val: UserState) => void>
  ) {
    super(USER_STATE_TAG, 'UserState', listeners);
    this.#name = props.name;
    this.#age = props.age;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  protected $getPropDescriptors() {
    return [
      { name: 'name' as const, fieldNumber: 1, getValue: () => this.#name },
      { name: 'age' as const, fieldNumber: 2, getValue: () => this.#age },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return { name: entries.name as string, age: entries.age as number };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected $enableChildListeners() {}

  get name() {
    return this.#name;
  }

  get age() {
    return this.#age;
  }

  setName(name: string) {
    const next = new UserState({ name, age: this.#age }, this.$listeners);
    return this.$update(next);
  }

  setAge(age: number) {
    const next = new UserState({ name: this.#name, age }, this.$listeners);
    return this.$update(next);
  }
}

/**
 * Simulates usePropaneSelector behavior without React.
 * Tests the core subscription and equality logic that the hook relies on.
 */
function simulateSelector<S extends object, R>(
  initialState: S,
  selector: (state: S) => R
): {
  getSelectedValue: () => R;
  getUpdateCount: () => number;
  getCurrentState: () => S;
} {
  let currentState = initialState;
  let selectedValue = selector(initialState);
  let updateCount = 0;

  // Subscribe if state is listenable
  if (
    initialState
    && typeof initialState === 'object'
    && ADD_UPDATE_LISTENER in initialState
  ) {
    type Listenable<T> = { [ADD_UPDATE_LISTENER](l: (v: T) => void): T };
    const listenable = initialState as unknown as Listenable<S>;
    currentState = listenable[ADD_UPDATE_LISTENER]((next: S) => {
      currentState = next;
      const nextSelected = selector(next);
      // Only trigger update if selected value changed (using structural equality)
      if (!equals(selectedValue, nextSelected)) {
        selectedValue = nextSelected;
        updateCount++;
      }
    });
  }

  return {
    getSelectedValue: () => selectedValue,
    getUpdateCount: () => updateCount,
    getCurrentState: () => currentState,
  };
}

export default function runUsePropaneSelectorTests() {
  testSelectorBasicSelection();
  testSelectorOnlyUpdatesOnChange();
  testSelectorStructuralEquality();
  testSelectorComputedValues();
  testSelectorWithNonListenable();
  testSelectorArraySelection();
  console.log('All usePropaneSelector tests passed!');
}

function testSelectorBasicSelection() {
  console.log('Testing basic selection...');

  const user = new UserState({ name: 'Alice', age: 30 });
  const { getSelectedValue } = simulateSelector(user, (s) => s.name);

  assert(getSelectedValue() === 'Alice', 'Selector should return the name');
  console.log('Basic selection passed.');
}

function testSelectorOnlyUpdatesOnChange() {
  console.log('Testing selector only updates on relevant changes...');

  const user = new UserState({ name: 'Alice', age: 30 });
  const { getSelectedValue, getUpdateCount, getCurrentState } = simulateSelector(
    user,
    (s) => s.name
  );

  assert(getSelectedValue() === 'Alice', 'Initial name should be Alice');
  assert(getUpdateCount() === 0, 'No updates yet');

  // Update age (should NOT trigger selector update since we're selecting name)
  getCurrentState().setAge(31);
  assert(getCurrentState().age === 31, 'Age should be updated');
  assert(getUpdateCount() === 0, 'Update count should be 0 when name unchanged');
  assert(getSelectedValue() === 'Alice', 'Selected name should still be Alice');

  // Update name (SHOULD trigger selector update)
  getCurrentState().setName('Bob');
  assert(getCurrentState().name === 'Bob', 'Name should be updated');
  assert(getUpdateCount() === 1, 'Update count should be 1 when name changes');
  assert(getSelectedValue() === 'Bob', 'Selected name should be Bob');

  // Update name to same value (should NOT trigger update)
  getCurrentState().setName('Bob');
  assert(getUpdateCount() === 1, 'Update count unchanged when name set to same value');

  console.log('Selector only updates on relevant changes passed.');
}

function testSelectorStructuralEquality() {
  console.log('Testing structural equality for selector results...');

  // equals() uses structural equality for Propane messages and arrays
  // Primitive values compare by value
  assert(equals(42, 42), 'Same numbers should be equal');
  assert(equals('hello', 'hello'), 'Same strings should be equal');
  assert(!equals(42, 43), 'Different numbers should not be equal');

  // Arrays get deep comparison
  assert(equals([1, 2, 3], [1, 2, 3]), 'Arrays with same content should be equal');
  assert(!equals([1, 2, 3], [1, 2, 4]), 'Arrays with different content should not be equal');

  // Test with message instances (have .equals() method)
  const user1 = new UserState({ name: 'Alice', age: 30 });
  const user2 = new UserState({ name: 'Alice', age: 30 });
  const user3 = new UserState({ name: 'Bob', age: 30 });

  assert(equals(user1, user2), 'Messages with same data should be equal');
  assert(!equals(user1, user3), 'Messages with different data should not be equal');

  console.log('Structural equality passed.');
}

function testSelectorComputedValues() {
  console.log('Testing computed selector values...');

  const user = new UserState({ name: 'Alice', age: 30 });
  const { getSelectedValue, getUpdateCount, getCurrentState } = simulateSelector(
    user,
    (s) => s.age >= 18
  );

  assert(getSelectedValue() === true, 'Initial isAdult should be true');
  assert(getUpdateCount() === 0, 'No updates yet');

  // Update age but still adult - should NOT trigger update
  getCurrentState().setAge(35);
  assert(getUpdateCount() === 0, 'No update when computed value unchanged (still adult)');
  assert(getSelectedValue() === true, 'isAdult still true');

  // Update age to minor - SHOULD trigger update
  getCurrentState().setAge(15);
  assert(getUpdateCount() === 1, 'Update when computed value changes (now minor)');
  assert(getSelectedValue() === false, 'isAdult should now be false');

  // Update age back to adult - SHOULD trigger update
  getCurrentState().setAge(18);
  assert(getUpdateCount() === 2, 'Update when computed value changes (adult again)');
  assert(getSelectedValue() === true, 'isAdult should be true again');

  console.log('Computed selector values passed.');
}

function testSelectorWithNonListenable() {
  console.log('Testing selector with non-listenable state...');

  // Plain object (not a Propane message)
  const plainState = { name: 'Alice', age: 30 };
  const { getSelectedValue, getUpdateCount } = simulateSelector(
    plainState,
    (s) => s.name
  );

  assert(getSelectedValue() === 'Alice', 'Selector should work with plain objects');
  assert(getUpdateCount() === 0, 'No updates for non-listenable');
  assert(
    !(ADD_UPDATE_LISTENER in plainState),
    'Plain object should not be listenable'
  );

  console.log('Non-listenable state passed.');
}

function testSelectorArraySelection() {
  console.log('Testing selecting arrays with structural equality...');

  // Create a state that returns arrays from selector (arrays get deep comparison)
  const user = new UserState({ name: 'Alice', age: 30 });
  const { getSelectedValue, getUpdateCount, getCurrentState } = simulateSelector(
    user,
    // Return array: [name, isAdult] - arrays are compared structurally
    (s) => [s.name, s.age >= 18] as [string, boolean]
  );

  const initial = getSelectedValue();
  assert(initial[0] === 'Alice', 'Initial name correct');
  assert(initial[1] === true, 'Initial isAdult correct');
  assert(getUpdateCount() === 0, 'No updates yet');

  // Update age but keep same array structure [Alice, true]
  getCurrentState().setAge(35);
  // Array is structurally equal: ['Alice', true]
  assert(getUpdateCount() === 0, 'No update when selected array structurally equal');

  // Update name - array changes to ['Bob', true]
  getCurrentState().setName('Bob');
  assert(getUpdateCount() === 1, 'Update when selected array changes');
  const updated = getSelectedValue();
  assert(updated[0] === 'Bob', 'Updated name correct');
  assert(updated[1] === true, 'Updated isAdult correct');

  // Update age to minor - array changes to ['Bob', false]
  getCurrentState().setAge(15);
  assert(getUpdateCount() === 2, 'Update when isAdult changes');
  const minor = getSelectedValue();
  assert(minor[0] === 'Bob', 'Name still Bob');
  assert(minor[1] === false, 'Now minor');

  console.log('Array selection passed.');
}
