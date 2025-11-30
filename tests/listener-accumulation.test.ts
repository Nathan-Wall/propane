/**
 * Test demonstrating listener accumulation on nested messages.
 *
 * This test directly verifies that when a message is wrapped multiple times
 * with listeners, ALL listeners fire when the inner message changes.
 */

import { assert } from './assert.ts';
import { InnerMessage, OuterMessage } from './nested-memo-state.propane.ts';
import { ADD_UPDATE_LISTENER } from '../runtime/symbols.ts';

export default function runListenerAccumulationTests() {
  testMultipleListenersAccumulate();
  testListenerCallOrder();
  testCapturedValuesInListeners();
  testStaleInnerReferenceFromMemo();
  console.log('All listener accumulation tests passed!');
}

function testMultipleListenersAccumulate() {
  console.log('Testing: multiple listeners accumulate on inner message...');

  const handlerCalls: string[] = [];

  // Create initial inner message
  const inner = new InnerMessage({ value: 'initial' });

  // Wrap with first listener (simulating first usePropaneState subscription)
  const inner1 = inner[ADD_UPDATE_LISTENER](() => {
    handlerCalls.push('handler1');
  });

  // Wrap with second listener (simulating state change creating new parent)
  const inner2 = inner1[ADD_UPDATE_LISTENER](() => {
    handlerCalls.push('handler2');
  });

  // Wrap with third listener (simulating another state change)
  const inner3 = inner2[ADD_UPDATE_LISTENER](() => {
    handlerCalls.push('handler3');
  });

  // Verify we have 3 listeners on inner3
  console.log(`  Listeners on inner3: ${inner3.$listeners.size}`);

  // Change the inner value
  inner3.setValue('changed');

  // Check how many handlers were called
  console.log(`  Handlers called: ${handlerCalls.length}`);
  console.log(`  Handler call order: [${handlerCalls.join(', ')}]`);

  assert(
    handlerCalls.length === 3,
    `Expected 3 handlers to be called, but got ${handlerCalls.length}`
  );

  assert(
    handlerCalls.includes('handler1'),
    'handler1 should have been called'
  );
  assert(
    handlerCalls.includes('handler2'),
    'handler2 should have been called'
  );
  assert(
    handlerCalls.includes('handler3'),
    'handler3 should have been called'
  );

  console.log('Multiple listeners accumulate: PASSED (all 3 handlers called)');
}

function testListenerCallOrder() {
  console.log('Testing: listener call order...');

  const callOrder: number[] = [];

  const inner = new InnerMessage({ value: 'start' });

  const inner1 = inner[ADD_UPDATE_LISTENER](() => callOrder.push(1));
  const inner2 = inner1[ADD_UPDATE_LISTENER](() => callOrder.push(2));
  const inner3 = inner2[ADD_UPDATE_LISTENER](() => callOrder.push(3));

  inner3.setValue('end');

  console.log(`  Call order: [${callOrder.join(', ')}]`);

  // Listeners should be called in insertion order (Set iteration order)
  assert(
    callOrder[0] === 1 && callOrder[1] === 2 && callOrder[2] === 3,
    `Expected call order [1, 2, 3], got [${callOrder.join(', ')}]`
  );

  console.log('Listener call order: PASSED (called in insertion order)');
}

function testCapturedValuesInListeners() {
  console.log('Testing: captured values in listeners (the stale closure problem)...');

  const capturedCounters: number[] = [];

  // Create initial state
  const inner = new InnerMessage({ value: 'initial' });
  const outer0 = new OuterMessage({ counter: 0, inner });

  // Simulate usePropaneState - subscribe to outer
  let currentOuter = outer0[ADD_UPDATE_LISTENER]((newOuter) => {
    // This simulates React setState
    currentOuter = newOuter;
  });

  // At this point, currentOuter.inner has a listener that captures
  // the OuterMessage with counter=0

  // Simulate setCounter(10) - creates new OuterMessage
  currentOuter.setCounter(10);
  // Now currentOuter.inner has TWO listeners:
  // - One capturing OuterMessage with counter=0
  // - One capturing OuterMessage with counter=10

  // Simulate setCounter(20)
  currentOuter.setCounter(20);
  // Now THREE listeners with counters 0, 10, 20

  // Add a diagnostic listener to see what counter values are captured
  // We'll intercept the setInner calls by adding our own listener
  const innerWithDiagnostic = currentOuter.inner[ADD_UPDATE_LISTENER]((newInner) => {
    // This runs AFTER all the OuterMessage listeners have fired
    // We can check what the final counter value is
    capturedCounters.push(currentOuter.counter);
  });

  console.log(`  Listeners on inner before change: ${currentOuter.inner.$listeners.size}`);

  // Change inner value - this will trigger all accumulated listeners
  currentOuter.inner.setValue('changed');

  console.log(`  Final counter value: ${currentOuter.counter}`);
  console.log(`  Inner value: ${currentOuter.inner.value}`);

  // The final counter should be 20 (last listener wins)
  assert(
    currentOuter.counter === 20,
    `Expected counter to be 20, got ${currentOuter.counter}`
  );

  assert(
    currentOuter.inner.value === 'changed',
    `Expected inner value to be 'changed', got ${currentOuter.inner.value}`
  );

  console.log('Captured values in listeners: PASSED (last listener wins)');
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
  const stateHistory: Array<{ counter: number; innerValue: string }> = [];

  // Step 1: Create initial state
  const inner = new InnerMessage({ value: 'hello' });
  const outer = new OuterMessage({ counter: 0, inner });

  // Simulate usePropaneState subscription
  let currentState = outer[ADD_UPDATE_LISTENER]((newState) => {
    currentState = newState;
    stateHistory.push({
      counter: newState.counter,
      innerValue: newState.inner.value,
    });
  });

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
  // If listeners work correctly with stale refs, counter should still be 10
  // If there's a bug, counter might revert to 0

  const finalCounter = currentState.counter;
  const finalInnerValue = currentState.inner.value;

  assert(
    finalInnerValue === 'world',
    `Expected inner value to be 'world', got '${finalInnerValue}'`
  );

  // This is the key assertion - does the counter persist?
  if (finalCounter === 10) {
    console.log('  RESULT: Counter persisted correctly (10)');
    console.log('Stale inner reference from memoPropane skip: PASSED');
  } else if (finalCounter === 0) {
    console.log('  RESULT: Counter REVERTED to 0 (stale closure problem!)');
    console.log(`  This means the old inner's listener used stale parent state.`);
    // This would be a bug - fail the test
    assert(false, `Counter reverted to ${finalCounter}, expected 10`);
  } else {
    console.log(`  RESULT: Unexpected counter value: ${finalCounter}`);
    assert(false, `Unexpected counter value: ${finalCounter}`);
  }
}
