/**
 * Test demonstrating that the stale closure problem is fixed with the hybrid approach.
 *
 * This test verifies that when a memoized component holds a reference to an
 * old inner message, updates still work correctly because the hybrid approach
 * uses back-pointer chains instead of accumulating listeners.
 */

import { assert } from './assert.js';
import { InnerMessage, OuterMessage } from './nested-memo-state.pmsg.js';
import {
  SET_UPDATE_LISTENER,
  REACT_LISTENER_KEY,
} from '../runtime/symbols.js';
import type { Message, DataObject } from '../runtime/message.js';
import { test } from 'node:test';

type Unsubscribe = () => void;

export default function runListenerAccumulationTests() {
  testStaleInnerReferenceFromMemo();
  console.log('All stale closure tests passed!');
}

/**
 * This test simulates what happens when memoPropane prevents re-render
 * because the new inner is `equals()` to the old inner.
 *
 * Scenario:
 * 1. Parent component has state: { counter: 0, inner: { value: 'hello' } }
 * 2. InnerComponent receives state.inner as prop, holds reference to it
 * 3. Parent changes counter to 10 (inner content unchanged)
 * 4. Parent re-renders, passes new state.inner to InnerComponent
 * 5. memoPropane: oldInner.equals(newInner) === true, so InnerComponent doesn't re-render
 * 6. InnerComponent still has reference to OLD inner (from step 2)
 * 7. User interaction calls oldInner.setValue('world')
 *
 * Question: Does the state update correctly? What counter value ends up in state?
 */
function testStaleInnerReferenceFromMemo() {
  console.log('Testing: stale inner reference from memoPropane skip...');

  // Track all state updates
  const stateHistory: { counter: number; innerValue: string }[] = [];

  // Step 1: Create initial state
  const inner = new InnerMessage({ value: 'hello' });
  const outer = new OuterMessage({ counter: 0, inner });

  // Simulate usePropaneState subscription using hybrid approach (SET_UPDATE_LISTENER)
  // This uses back-pointer chains instead of accumulating listeners
  interface HybridListenable {
    [SET_UPDATE_LISTENER]: (
      key: symbol,
      callback: (val: Message<DataObject>) => void
    ) => Unsubscribe;
  }

  let currentState = outer;
  let currentUnsubscribe: Unsubscribe | null = null;

  // Setup listener recursively using hybrid approach
  const setupListener = (root: OuterMessage) => {
    const nextUnsubscribe = (root as unknown as HybridListenable)[SET_UPDATE_LISTENER](
      REACT_LISTENER_KEY,
      (next) => {
        const nextTyped = next as unknown as OuterMessage;
        setupListener(nextTyped);
        currentState = nextTyped;
        stateHistory.push({
          counter: nextTyped.counter,
          innerValue: nextTyped.inner.value,
        });
      }
    );
    const previousUnsubscribe = currentUnsubscribe;
    currentUnsubscribe = nextUnsubscribe;
    previousUnsubscribe?.();
  };

  setupListener(currentState);

  console.log(`  Initial state: counter=${currentState.counter}, inner="${currentState.inner.value}"`);

  // Step 2: InnerComponent receives inner and holds reference
  const innerComponentRef = currentState.inner;
  console.log(`  InnerComponent holds reference to inner with value="${innerComponentRef.value}"`);

  // Step 3: Parent changes counter (inner content unchanged)
  currentState.setCounter(10);
  console.log(`  After setCounter(10): counter=${currentState.counter}, inner="${currentState.inner.value}"`);

  // Step 4-5: Parent would re-render and pass new inner to InnerComponent
  // memoPropane compares: innerComponentRef.equals(currentState.inner)
  const wouldRerender = !innerComponentRef.equals(currentState.inner);
  console.log(`  innerComponentRef.equals(currentState.inner) = ${!wouldRerender}`);
  console.log(`  memoPropane would re-render InnerComponent: ${wouldRerender}`);

  // Verify memoPropane would NOT re-render (values are equal)
  assert(
    !wouldRerender,
    'memoPropane should skip re-render since inner values are equal'
  );

  // Step 6: InnerComponent still has OLD reference
  console.log(`  InnerComponent still has reference with value="${innerComponentRef.value}"`);

  // Clear history to track only the setValue update
  stateHistory.length = 0;

  // Step 7: User interaction calls setValue on the OLD inner reference
  console.log(`  Calling setValue('world') on OLD inner reference...`);
  innerComponentRef.setValue('world');

  // Check results
  console.log(`  State updates received: ${stateHistory.length}`);
  for (const [i, state] of stateHistory.entries()) {
    console.log(`    Update ${i + 1}: counter=${state.counter}, inner="${state.innerValue}"`);
  }

  console.log(`  Final state: counter=${currentState.counter}, inner="${currentState.inner.value}"`);

  // The critical question: what is the final counter value?
  // With the hybrid approach, counter should still be 10 (not reverted to 0)

  const finalCounter = currentState.counter;
  const finalInnerValue = currentState.inner.value;

  assert(
    finalInnerValue === 'world',
    `Expected inner value to be 'world', got '${finalInnerValue}'`
  );

  // This is the key assertion - the counter should persist at 10
  assert(
    finalCounter === 10,
    `Counter should persist at 10 after inner change, got ${finalCounter}`
  );

  console.log('  RESULT: Counter persisted correctly (10)');
  console.log('Stale inner reference from memoPropane skip: PASSED');
}

test('runListenerAccumulationTests', () => {
  runListenerAccumulationTests();
});
