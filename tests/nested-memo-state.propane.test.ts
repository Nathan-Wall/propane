/**
 * Test for nested message updates with real Propane-generated classes.
 *
 * This test verifies that when an inner message changes, the outer message's
 * other properties (like 'counter') are preserved correctly.
 *
 * Uses the new hybrid approach with SET_UPDATE_LISTENER for update propagation.
 */

import { assert } from './assert.ts';
import { InnerMessage, OuterMessage } from './nested-memo-state.propane.ts';
import { SET_UPDATE_LISTENER, REACT_LISTENER_KEY } from '../runtime/symbols.ts';
import type { Message, DataObject } from '../runtime/message.ts';

// Type for state objects that support the hybrid listener approach
interface HybridListenable {
  [SET_UPDATE_LISTENER]: (
    key: symbol,
    callback: (val: Message<DataObject>) => void
  ) => void;
}

function hasHybridListener<S>(value: S): value is S & HybridListenable {
  return (
    value !== null
    && typeof value === 'object'
    && SET_UPDATE_LISTENER in value
  );
}

/**
 * Simulates usePropaneState behavior using the new hybrid approach
 */
function simulateUsePropaneState<S extends object>(initialState: S): {
  getState: () => S;
  getRenderCount: () => number;
} {
  let currentState = initialState;
  let renderCount = 0;

  const setupListener = (root: S) => {
    if (hasHybridListener(root)) {
      root[SET_UPDATE_LISTENER](REACT_LISTENER_KEY, (next) => {
        currentState = next as unknown as S;
        renderCount++;
        setupListener(currentState);
      });
    }
  };

  setupListener(currentState);

  return {
    getState: () => currentState,
    getRenderCount: () => renderCount,
  };
}

export default function runNestedMemoStateTests() {
  testBasicOuterStateWithInner();
  testOuterStatePersistsAfterInnerChange();
  testMultipleOuterChangesPreservedAfterInnerChange();
  console.log('All nested memo state tests passed!');
}

function testBasicOuterStateWithInner() {
  console.log('Testing: basic outer state with inner message...');

  const inner = new InnerMessage({ value: 'hello' });
  const outer = new OuterMessage({ counter: 0, inner });

  assert(outer.counter === 0, 'Counter should be 0');
  assert(outer.inner.value === 'hello', 'Inner value should be hello');

  console.log('Basic outer state with inner message: PASSED');
}

function testOuterStatePersistsAfterInnerChange() {
  console.log('Testing: outer state persists after inner change (real Propane)...');

  const inner = new InnerMessage({ value: 'initial' });
  const outer = new OuterMessage({ counter: 0, inner });

  const component = simulateUsePropaneState(outer);

  // Change counter
  component.getState().setCounter(42);
  assert(component.getState().counter === 42, 'Counter should be 42');

  // Now change inner value
  component.getState().inner.setValue('changed');

  // Verify both changes are preserved
  const finalState = component.getState();
  const counterAfterInnerChange = finalState.counter;
  const innerValueAfterChange = finalState.inner.value;

  console.log(`  Counter after inner change: ${counterAfterInnerChange} (expected: 42)`);
  console.log(`  Inner value after change: ${innerValueAfterChange} (expected: changed)`);

  assert(
    innerValueAfterChange === 'changed',
    `Inner value should be 'changed', got '${innerValueAfterChange}'`
  );

  assert(
    counterAfterInnerChange === 42,
    `Counter should be 42 after inner change, but got ${counterAfterInnerChange}`
  );

  console.log('Outer state persists after inner change: PASSED');
}

function testMultipleOuterChangesPreservedAfterInnerChange() {
  console.log('Testing: multiple outer changes preserved after inner change...');

  const inner = new InnerMessage({ value: 'start' });
  const outer = new OuterMessage({ counter: 0, inner });

  const component = simulateUsePropaneState(outer);

  // Make several counter changes
  component.getState().setCounter(10);
  component.getState().setCounter(20);
  component.getState().setCounter(30);

  assert(component.getState().counter === 30, 'Counter should be 30 before inner change');

  const rendersBefore = component.getRenderCount();

  // Change inner
  component.getState().inner.setValue('end');

  const rendersAfter = component.getRenderCount();
  const finalCounter = component.getState().counter;
  const finalInnerValue = component.getState().inner.value;

  console.log(`  Renders before inner change: ${rendersBefore}`);
  console.log(`  Renders after inner change: ${rendersAfter}`);
  console.log(`  Final counter: ${finalCounter} (expected: 30)`);
  console.log(`  Final inner value: ${finalInnerValue} (expected: end)`);

  assert(
    finalInnerValue === 'end',
    `Inner value should be 'end', got '${finalInnerValue}'`
  );

  assert(
    finalCounter === 30,
    `Counter should still be 30 after inner change, but got ${finalCounter}`
  );

  console.log('Multiple outer changes preserved after inner change: PASSED');
}
