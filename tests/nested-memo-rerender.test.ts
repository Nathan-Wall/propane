/**
 * Test for nested message updates with memoPropane.
 *
 * This test simulates a React component hierarchy:
 * - OuterComponent uses usePropaneState with a nested message (OuterState containing InnerState)
 * - InnerComponent is wrapped with memoPropane and receives the inner message
 *
 * We test:
 * 1. Changing unrelated outer state doesn't re-render inner component
 * 2. Changing inner state re-renders inner component
 * 3. When inner state changes, outer state changes should persist
 */

import { assert } from './assert.ts';
import { Message } from '../runtime/message.ts';
import { ADD_UPDATE_LISTENER } from '../runtime/symbols.ts';
import { equals } from '../runtime/common/data/equals.ts';

// Type tags must be shared for equals() to work
const INNER_STATE_TAG = Symbol('InnerState');
const OUTER_STATE_TAG = Symbol('OuterState');

// Inner message class
class InnerState extends Message<{ value: string }> {
  #value: string;

  constructor(
    props: { value: string },
    listeners?: Set<(val: InnerState) => void>
  ) {
    super(INNER_STATE_TAG, 'InnerState', listeners);
    this.#value = props.value;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  protected $getPropDescriptors() {
    return [
      { name: 'value' as const, fieldNumber: 1, getValue: () => this.#value },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return { value: entries.value as string };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected $enableChildListeners() {}

  get value() {
    return this.#value;
  }

  setValue(value: string) {
    const next = new InnerState({ value }, this.$listeners);
    return this.$update(next);
  }
}

// Outer message class containing inner message
class OuterState extends Message<{ counter: number; inner: InnerState }> {
  #counter: number;
  #inner: InnerState;

  constructor(
    props: { counter: number; inner: InnerState },
    listeners?: Set<(val: OuterState) => void>
  ) {
    super(OUTER_STATE_TAG, 'OuterState', listeners);
    this.#counter = props.counter;
    this.#inner = props.inner;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
  }

  protected $getPropDescriptors() {
    return [
      { name: 'counter' as const, fieldNumber: 1, getValue: () => this.#counter },
      { name: 'inner' as const, fieldNumber: 2, getValue: () => this.#inner },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      counter: entries.counter as number,
      inner: entries.inner as InnerState,
    };
  }

  protected $enableChildListeners() {
    // Subscribe to inner message updates
    if (this.#inner && ADD_UPDATE_LISTENER in this.#inner) {
      this.#inner = this.#inner[ADD_UPDATE_LISTENER]((newInner: InnerState) => {
        // When inner updates, create new outer with updated inner
        const newOuter = new OuterState(
          { counter: this.#counter, inner: newInner },
          this.$listeners
        );
        this.$update(newOuter);
      });
    }
  }

  get counter() {
    return this.#counter;
  }

  get inner() {
    return this.#inner;
  }

  setCounter(counter: number) {
    const next = new OuterState(
      { counter, inner: this.#inner },
      this.$listeners
    );
    return this.$update(next);
  }

  setInner(inner: InnerState) {
    const next = new OuterState(
      { counter: this.#counter, inner },
      this.$listeners
    );
    return this.$update(next);
  }
}

/**
 * Simulates usePropaneState behavior
 */
function simulateUsePropaneState<S extends object>(initialState: S): {
  getState: () => S;
  getRenderCount: () => number;
} {
  let currentState = initialState;
  let renderCount = 0;

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
      renderCount++; // Simulates React re-render
    });
  }

  return {
    getState: () => currentState,
    getRenderCount: () => renderCount,
  };
}

/**
 * Simulates memoPropane behavior - only "re-renders" when props change
 * Uses the same shallowEqual logic as memoPropane
 */
function simulateMemoPropane<P extends object>(
  initialProps: P
): {
  updateProps: (newProps: P) => boolean; // returns true if re-rendered
  getRenderCount: () => number;
  getProps: () => P;
} {
  let currentProps = initialProps;
  let renderCount = 1; // Initial render

  const shallowEqual = (objA: unknown, objB: unknown): boolean => {
    if (Object.is(objA, objB)) {
      return true;
    }

    if (
      typeof objA !== 'object'
      || objA === null
      || typeof objB !== 'object'
      || objB === null
    ) {
      return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    const recordA = objA as Record<string, unknown>;
    const recordB = objB as Record<string, unknown>;
    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(objB, key)
        || !equals(recordA[key], recordB[key])
      ) {
        return false;
      }
    }

    return true;
  };

  return {
    updateProps: (newProps: P) => {
      if (shallowEqual(currentProps, newProps)) {
        // Props are equal, no re-render
        return false;
      }
      currentProps = newProps;
      renderCount++;
      return true;
    },
    getRenderCount: () => renderCount,
    getProps: () => currentProps,
  };
}

export default function runNestedMemoRerenderTests() {
  testUnrelatedOuterChangeDoesNotRerenderInner();
  testInnerChangeRerenderInner();
  testOuterStatePersistsWhenInnerChanges();
  testMultipleOuterChangesBeforeInnerChange();
  testStaleInnerRefWhenMemoSkipsRerender();
  console.log('All nested memo rerender tests passed!');
}

function testUnrelatedOuterChangeDoesNotRerenderInner() {
  console.log('Testing: unrelated outer change does not rerender inner...');

  // Setup: OuterComponent with usePropaneState
  const initialInner = new InnerState({ value: 'hello' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);

  // InnerComponent with memoPropane, receiving inner message as prop
  const innerComponent = simulateMemoPropane({ inner: outerComponent.getState().inner });

  assert(outerComponent.getRenderCount() === 0, 'Outer should have 0 re-renders initially');
  assert(innerComponent.getRenderCount() === 1, 'Inner should have 1 render (initial)');

  // Change unrelated outer state (counter)
  outerComponent.getState().setCounter(1);

  assert(outerComponent.getRenderCount() === 1, 'Outer should re-render when counter changes');
  assert(outerComponent.getState().counter === 1, 'Counter should be updated');

  // Simulate passing new props to inner component
  const didInnerRerender = innerComponent.updateProps({
    inner: outerComponent.getState().inner,
  });

  assert(!didInnerRerender, 'Inner should NOT re-render when only counter changed');
  assert(
    innerComponent.getRenderCount() === 1,
    'Inner render count should still be 1'
  );

  console.log('Unrelated outer change does not rerender inner: PASSED');
}

function testInnerChangeRerenderInner() {
  console.log('Testing: inner change rerenders inner component...');

  // Setup
  const initialInner = new InnerState({ value: 'hello' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);
  const innerComponent = simulateMemoPropane({ inner: outerComponent.getState().inner });

  assert(innerComponent.getRenderCount() === 1, 'Inner should have 1 render initially');

  // Change inner state value
  outerComponent.getState().inner.setValue('world');

  // Outer should have re-rendered due to inner change propagating up
  assert(
    outerComponent.getRenderCount() === 1,
    'Outer should re-render when inner changes'
  );
  assert(
    outerComponent.getState().inner.value === 'world',
    'Inner value should be updated in outer state'
  );

  // Simulate passing new props to inner component
  const didInnerRerender = innerComponent.updateProps({
    inner: outerComponent.getState().inner,
  });

  assert(didInnerRerender, 'Inner SHOULD re-render when inner value changed');
  assert(
    innerComponent.getRenderCount() === 2,
    'Inner render count should be 2'
  );

  console.log('Inner change rerenders inner component: PASSED');
}

function testOuterStatePersistsWhenInnerChanges() {
  console.log('Testing: outer state persists when inner changes...');

  // Setup
  const initialInner = new InnerState({ value: 'hello' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);

  // First, change the outer counter
  outerComponent.getState().setCounter(42);
  assert(outerComponent.getState().counter === 42, 'Counter should be 42');

  // Now change the inner state
  outerComponent.getState().inner.setValue('world');

  // Check if outer state changes persist
  // This is the key test: when inner updates propagate through the listener,
  // does the updated outer state include the counter=42 change?
  assert(
    outerComponent.getState().inner.value === 'world',
    'Inner value should be updated'
  );

  const counterAfterInnerChange = outerComponent.getState().counter;
  console.log(`  Counter after inner change: ${counterAfterInnerChange} (expected: 42)`);

  assert(
    counterAfterInnerChange === 42,
    `Counter should STILL be 42 after inner change, but got ${counterAfterInnerChange}`
  );

  console.log('Outer state persists when inner changes: PASSED');
}

function testMultipleOuterChangesBeforeInnerChange() {
  console.log('Testing: multiple outer changes before inner change...');

  // This test is more rigorous - we make multiple outer changes
  // and then verify they all persist after an inner change

  const initialInner = new InnerState({ value: 'initial' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);

  // Make first outer change
  outerComponent.getState().setCounter(10);
  assert(outerComponent.getState().counter === 10, 'Counter should be 10');

  // Make second outer change
  outerComponent.getState().setCounter(20);
  assert(outerComponent.getState().counter === 20, 'Counter should be 20');

  // Make third outer change
  outerComponent.getState().setCounter(30);
  assert(outerComponent.getState().counter === 30, 'Counter should be 30');

  const renderCountBeforeInnerChange = outerComponent.getRenderCount();
  console.log(`  Render count before inner change: ${renderCountBeforeInnerChange}`);

  // Now change inner
  outerComponent.getState().inner.setValue('changed');

  const counterAfter = outerComponent.getState().counter;
  const innerValueAfter = outerComponent.getState().inner.value;
  const renderCountAfter = outerComponent.getRenderCount();

  console.log(`  Counter after inner change: ${counterAfter} (expected: 30)`);
  console.log(`  Inner value after: ${innerValueAfter} (expected: changed)`);
  console.log(`  Render count after inner change: ${renderCountAfter}`);

  assert(
    innerValueAfter === 'changed',
    `Inner value should be 'changed', got '${innerValueAfter}'`
  );

  assert(
    counterAfter === 30,
    `Counter should be 30 after inner change, but got ${counterAfter}`
  );

  console.log('Multiple outer changes before inner change: PASSED');
}

/**
 * This test simulates the stale reference bug that occurs when memoPropane
 * skips re-rendering because the inner prop is structurally equal.
 *
 * Scenario:
 * 1. OuterComponent renders with state { counter: 0, inner: { value: 'hello' } }
 * 2. InnerComponent (memoPropane) receives inner prop, renders, holds reference
 * 3. OuterComponent changes counter to 10 (inner content unchanged)
 * 4. OuterComponent re-renders, passes new inner to InnerComponent
 * 5. memoPropane: oldInner.equals(newInner) === true → SKIP re-render
 * 6. InnerComponent still has OLD inner reference from step 2
 * 7. User interaction in InnerComponent calls oldInner.setValue('world')
 * 8. BUG: Counter reverts to 0 because old inner's listener has stale parent
 */
function testStaleInnerRefWhenMemoSkipsRerender() {
  console.log('Testing: stale inner ref when memoPropane skips re-render...');

  // Step 1: Setup OuterComponent with usePropaneState
  const initialInner = new InnerState({ value: 'hello' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);

  // Step 2: InnerComponent renders and holds reference to inner
  // This simulates what happens inside a memoized component
  const innerComponent = simulateMemoPropane({ inner: outerComponent.getState().inner });

  // The inner component holds onto its prop reference
  // (In real React, this would be via props or a ref)
  let innerComponentHeldRef = innerComponent.getProps().inner;

  console.log(`  Initial: counter=${outerComponent.getState().counter}, inner="${innerComponentHeldRef.value}"`);

  // Step 3: OuterComponent changes counter (inner content unchanged)
  outerComponent.getState().setCounter(10);

  console.log(`  After setCounter(10): counter=${outerComponent.getState().counter}`);
  assert(outerComponent.getState().counter === 10, 'Counter should be 10');

  // Step 4-5: OuterComponent re-renders, passes new inner to InnerComponent
  // memoPropane checks equality
  const newInnerProp = outerComponent.getState().inner;
  const didRerender = innerComponent.updateProps({ inner: newInnerProp });

  console.log(`  oldInner.equals(newInner) = ${innerComponentHeldRef.equals(newInnerProp)}`);
  console.log(`  memoPropane re-rendered: ${didRerender}`);

  // Verify memoPropane skipped re-render
  assert(!didRerender, 'memoPropane should skip re-render (inner values equal)');
  assert(innerComponent.getRenderCount() === 1, 'Inner should still have 1 render');

  // Step 6: InnerComponent still has OLD reference
  // (In real code, the component function didn't re-run, so props/refs are stale)
  // innerComponentHeldRef is still pointing to the old inner
  console.log(`  InnerComponent still holds ref to inner with value="${innerComponentHeldRef.value}"`);

  // Step 7: User interaction calls setValue on the OLD inner reference
  // This simulates a button click handler that was closed over the old props
  console.log(`  Calling setValue('world') on OLD inner reference...`);
  innerComponentHeldRef.setValue('world');

  // Step 8: Check final state
  const finalCounter = outerComponent.getState().counter;
  const finalInnerValue = outerComponent.getState().inner.value;

  console.log(`  Final state: counter=${finalCounter}, inner="${finalInnerValue}"`);

  // Verify inner value changed
  assert(
    finalInnerValue === 'world',
    `Inner value should be 'world', got '${finalInnerValue}'`
  );

  // THE KEY ASSERTION: Does counter persist or revert?
  // If the bug exists, counter will revert to 0
  // If fixed, counter should stay at 10
  if (finalCounter === 10) {
    console.log('  RESULT: Counter persisted correctly (10)');
    console.log('Stale inner ref when memoPropane skips re-render: PASSED');
  } else if (finalCounter === 0) {
    console.log('  RESULT: Counter REVERTED to 0!');
    console.log('  BUG: The old inner reference has a listener with stale parent state.');
    console.log('  When setValue was called on old inner, it used counter=0 from the');
    console.log('  original OuterState instead of counter=10 from current state.');
    assert(
      false,
      `BUG: Counter reverted from 10 to ${finalCounter} due to stale closure in listener`
    );
  } else {
    assert(false, `Unexpected counter value: ${finalCounter}`);
  }
}
