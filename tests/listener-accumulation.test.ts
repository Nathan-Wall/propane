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
