/**
 * Test that demonstrates the stale reference bug with real React components
 * using memoPropane.
 *
 * This test uses @testing-library/react to render actual React components
 * and verify the bug occurs in a real React environment.
 */

import './react-dom-test-setup.js';

import React, { useRef, useEffect, act } from 'react';
import { render, cleanup } from '@testing-library/react';
import { usePropaneState, memoPropane, update } from '../react/index.js';
import { InnerMessage, OuterMessage } from './nested-memo-state.pmsg.js';
import { assert } from './assert.js';
import { test } from 'node:test';

// Track render counts
let innerRenderCount = 0;
let outerRenderCount = 0;

// Store references for test assertions
let capturedInnerRef: InnerMessage | null = null;
let capturedOuterState: OuterMessage | null = null;
let triggerCounterChange: (() => void) | null = null;
let triggerInnerChange: ((value: string) => void) | null = null;

// Reset test state
function resetTestState() {
  innerRenderCount = 0;
  outerRenderCount = 0;
  capturedInnerRef = null;
  capturedOuterState = null;
  triggerCounterChange = null;
  triggerInnerChange = null;
}

/**
 * Inner component wrapped with memoPropane.
 * It holds onto its inner prop reference and exposes a way to call setValue on it.
 */
const InnerComponent = memoPropane(({ inner }: { inner: InnerMessage }) => {
  innerRenderCount++;

  // Store the inner reference that this component receives
  // In a real app, this might be captured in a click handler closure
  const innerRef = useRef(inner);

  // Update ref on each render (but memoPropane may skip renders!)
  innerRef.current = inner;

  // On first render, capture the ref for testing
  useEffect(() => {
    capturedInnerRef = innerRef.current;
  }, []);

  // Expose a way to trigger setValue on the HELD reference
  // This simulates a user clicking a button that was rendered with old props
  triggerInnerChange = (value: string) => {
    update(() => {
      // Use the ref that was captured when component last rendered
      // If memoPropane skipped re-render, this is STALE
      innerRef.current.setValue(value);
    });
  };

  return React.createElement('div', null, `Inner: ${inner.value}`);
});

/**
 * Outer component that uses usePropaneState with nested messages.
 */
function OuterComponent() {
  outerRenderCount++;

  const [state] = usePropaneState<OuterMessage>(
    () => new OuterMessage({
      counter: 0,
      inner: new InnerMessage({ value: 'initial' }),
    })
  );

  // Expose current state for assertions
  capturedOuterState = state;

  // Expose a way to change counter
  triggerCounterChange = () => {
    update(() => {
      state.setCounter(state.counter + 10);
    });
  };

  return React.createElement(
    'div',
    null,
    React.createElement('span', null, `Counter: ${state.counter}`),
    React.createElement(InnerComponent, { inner: state.inner })
  );
}

export default function runReactMemoStaleRefTests() {
  testMemoPropaneSkipsRerenderOnEqualInner();
  testStaleRefCausesStateReversion();
  console.log('All React memo stale ref tests completed!');
}

function testMemoPropaneSkipsRerenderOnEqualInner() {
  console.log('Testing: memoPropane skips re-render when inner is equal...');
  resetTestState();

  // Initial render
  const { unmount } = render(React.createElement(OuterComponent));

  console.log(`  Initial render: outer=${outerRenderCount}, inner=${innerRenderCount}`);
  assert(outerRenderCount === 1, 'Outer should render once initially');
  assert(innerRenderCount === 1, 'Inner should render once initially');
  assert(capturedOuterState!.counter === 0, 'Counter should be 0');

  // Change counter (inner content unchanged)
  act(() => {
    triggerCounterChange!();
  });

  console.log(`  After setCounter(10): outer=${outerRenderCount}, inner=${innerRenderCount}`);
  console.log(`  Counter value: ${capturedOuterState!.counter}`);

  // Cast needed: previous asserts narrow to literal types, but act() mutates these
  assert((outerRenderCount as number) === 2, 'Outer should re-render when counter changes');
  assert((capturedOuterState!.counter as number) === 10, 'Counter should be 10');

  // Key assertion: inner should NOT re-render because inner.equals(newInner) is true
  assert(
    innerRenderCount === 1,
    `Inner should NOT re-render (memoPropane skip), but rendered ${innerRenderCount} times`
  );

  console.log('memoPropane skips re-render when inner is equal: PASSED');

  unmount();
  cleanup();
}

function testStaleRefCausesStateReversion() {
  console.log('Testing: stale ref causes state reversion (THE BUG)...');
  resetTestState();

  // Initial render
  const { unmount } = render(React.createElement(OuterComponent));

  const initialInnerRef = capturedInnerRef;
  console.log(`  Initial: counter=${capturedOuterState!.counter}, inner="${initialInnerRef!.value}"`);

  // Change counter to 10
  act(() => {
    triggerCounterChange!();
  });

  console.log(`  After setCounter(10): counter=${capturedOuterState!.counter}`);
  assert(capturedOuterState!.counter === 10, 'Counter should be 10');

  // Verify memoPropane skipped re-render (inner ref is stale)
  assert(innerRenderCount === 1, 'Inner should not have re-rendered');

  // The capturedInnerRef is now STALE - it's from the first render
  // when counter was 0
  console.log(`  Inner component's held ref is from render #${innerRenderCount}`);
  console.log(`  This ref's listener captures OuterState with counter=0`);

  // Trigger inner change using the stale reference
  console.log(`  Calling setValue('changed') via stale inner ref...`);
  act(() => {
    triggerInnerChange!('changed');
  });

  const finalCounter = capturedOuterState!.counter;
  const finalInnerValue = capturedOuterState!.inner.value;

  console.log(`  Final state: counter=${finalCounter}, inner="${finalInnerValue}"`);

  // Verify inner value changed
  assert(
    finalInnerValue === 'changed',
    `Inner value should be 'changed', got '${finalInnerValue}'`
  );

  // THE BUG: Counter should be 10, but reverts to 0
  if (finalCounter === 10) {
    console.log('  RESULT: Counter persisted correctly (10)');
    console.log('Stale ref causes state reversion: PASSED (no bug!)');
  } else if (finalCounter === 0) {
    console.log('  RESULT: Counter REVERTED to 0!');
    console.log('  ');
    console.log('  BUG CONFIRMED with real React components:');
    console.log('  1. OuterComponent rendered with counter=0');
    console.log('  2. InnerComponent (memoPropane) captured inner ref');
    console.log('  3. OuterComponent changed counter to 10');
    console.log('  4. memoPropane saw inner.equals(newInner)=true, skipped re-render');
    console.log('  5. InnerComponent still has OLD inner ref (with listener capturing counter=0)');
    console.log('  6. setValue called on old ref → counter reverted to 0');
    console.log('  ');
    assert(
      false,
      `BUG: Counter reverted from 10 to ${finalCounter} due to stale ref in memoPropane`
    );
  } else {
    assert(false, `Unexpected counter value: ${finalCounter}`);
  }

  unmount();
  cleanup();
}

test('runReactMemoStaleRefTests', () => {
  runReactMemoStaleRefTests();
});
