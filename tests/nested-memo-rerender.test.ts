/**
 * Test for nested message updates with memoPropane.
 *
 * This test simulates a React component hierarchy:
 * - OuterComponent uses usePropaneState with a nested message
 *   (OuterState containing InnerState)
 * - InnerComponent is wrapped with memoPropane and receives the
 *   inner message
 *
 * We test:
 * 1. Changing unrelated outer state doesn't re-render inner component
 * 2. Changing inner state re-renders inner component
 * 3. When inner state changes, outer state changes should persist
 */

import { assert } from './assert.js';
import { Message, DataObject } from '../runtime/message.js';
import {
  SET_UPDATE_LISTENER,
  WITH_CHILD,
  GET_MESSAGE_CHILDREN,
  PROPAGATE_UPDATE,
  REACT_LISTENER_KEY,
} from '../runtime/symbols.js';
import { equals } from '../runtime/common/data/equals.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { test } from 'node:test';

// Type tags are per-class; equality uses $typeId/$typeHash for identity
const INNER_STATE_TAG = Symbol('InnerState');
const OUTER_STATE_TAG = Symbol('OuterState');

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;

// Type for parent chain entry
interface ParentChainEntry {
  parent: WeakRef<Message<DataObject>>;
  key: string | number;
}

// Inner message class using hybrid approach
class InnerState extends Message<{ value: string }> {
  static readonly $typeId = 'tests/nested-memo-rerender#InnerState';
  static readonly $typeHash = 'tests/nested-memo-rerender#InnerState@v1';
  #value: string;

  // Hybrid approach: parent chains and callbacks
  readonly #parentChains = new Map<symbol, ParentChainEntry>();
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  constructor(props: { value: string }) {
    super(INNER_STATE_TAG, 'InnerState');
    this.#value = props.value;
  }

  protected override $getPropDescriptors() {
    return [
      { name: 'value' as const, fieldNumber: 1, getValue: () => this.#value },
    ];
  }

  protected override $fromEntries(entries: Record<string, unknown>) {
    return { value: entries['value'] as string };
  }

  get value() {
    return this.#value;
  }

  setValue(value: string) {
    const next = new InnerState({ value });
    this.$propagateUpdates(next);
    return next;
  }

  // Hybrid approach: set up parent chain
  public override $setParentChain(
    key: symbol,
    parent: Message<DataObject>,
    parentKey: string | number
  ): void {
    this.#parentChains.set(key, {
      parent: new WeakRef(parent),
      key: parentKey,
    });
  }

  // Hybrid approach: set listener callback
  public override [SET_UPDATE_LISTENER](
    key: symbol,
    callback: UpdateListenerCallback
  ): void {
    this.#callbacks.set(key, callback);
  }

  // Hybrid approach: propagate updates through parent chains
  protected override $propagateUpdates(newRoot: InnerState): void {
    for (const [key, entry] of this.#parentChains) {
      const parent = entry.parent.deref();
      if (!parent) continue;
      type WithChildFn = {
        [WITH_CHILD]: (k: string | number, c: unknown) => unknown;
      };
      type PropagateFn = {
        [PROPAGATE_UPDATE]: (k: symbol, r: unknown) => void;
      };
      const newParent = (parent as unknown as WithChildFn)
        [WITH_CHILD](entry.key, newRoot);
      (parent as unknown as PropagateFn)
        [PROPAGATE_UPDATE](key, newParent);
    }
    // Call direct callbacks at the root level
    for (const [, callback] of this.#callbacks) {
      callback(newRoot as unknown as Message<DataObject>);
    }
  }
}

// Outer message class containing inner message
class OuterState extends Message<{ counter: number; inner: InnerState }> {
  static readonly $typeId = 'tests/nested-memo-rerender#OuterState';
  static readonly $typeHash = 'tests/nested-memo-rerender#OuterState@v1';
  #counter: number;
  #inner: InnerState;

  // Hybrid approach: parent chains and callbacks
  readonly #parentChains = new Map<symbol, ParentChainEntry>();
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  constructor(props: { counter: number; inner: InnerState }) {
    super(OUTER_STATE_TAG, 'OuterState');
    this.#counter = props.counter;
    this.#inner = props.inner;
  }

  protected override $getPropDescriptors() {
    return [
      {
        name: 'counter' as const,
        fieldNumber: 1,
        getValue: () => this.#counter,
      },
      {
        name: 'inner' as const,
        fieldNumber: 2,
        getValue: () => this.#inner,
      },
    ];
  }

  protected override $fromEntries(entries: Record<string, unknown>) {
    return {
      counter: entries['counter'] as number,
      inner: entries['inner'] as InnerState,
    };
  }

  get counter() {
    return this.#counter;
  }

  get inner() {
    return this.#inner;
  }

  setCounter(counter: number) {
    const next = new OuterState({ counter, inner: this.#inner });
    this.$propagateUpdates(next);
    return next;
  }

  setInner(inner: InnerState) {
    const next = new OuterState({ counter: this.#counter, inner });
    this.$propagateUpdates(next);
    return next;
  }

  // Hybrid approach: create new OuterState with a child replaced
  public override [WITH_CHILD](
    key: string | number,
    child: Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>
  ): this {
    switch (key) {
      case 'inner':
        return new OuterState({
          counter: this.#counter,
          inner: child as unknown as InnerState,
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }

  // Hybrid approach: yield all message children
  public override *[GET_MESSAGE_CHILDREN](): Iterable<
    [string | number, Message<DataObject>]
  > {
    yield ['inner', this.#inner as unknown as Message<DataObject>];
  }

  // Hybrid approach: set up parent chain
  public override $setParentChain(
    key: symbol,
    parent: Message<DataObject>,
    parentKey: string | number
  ): void {
    this.#parentChains.set(key, {
      parent: new WeakRef(parent),
      key: parentKey,
    });
  }

  // Hybrid approach: set listener callback and set up parent chain
  public override [SET_UPDATE_LISTENER](
    key: symbol,
    callback: UpdateListenerCallback
  ): void {
    this.#callbacks.set(key, callback);
    // Set up parent chain for inner (no callback, only parent chain)
    this.#inner.$setParentChain(
      key,
      this as unknown as Message<DataObject>,
      'inner'
    );
  }

  // Hybrid approach: propagate update
  public override [PROPAGATE_UPDATE](key: symbol, replacement: Message<DataObject>): void {
    const chain = this.#parentChains.get(key);

    if (chain?.parent.deref()) {
      const parent = chain.parent.deref()!;
      type WithChildFn = {
        [WITH_CHILD]: (k: string | number, c: unknown) => unknown;
      };
      type PropagateFn = {
        [PROPAGATE_UPDATE]: (k: symbol, r: unknown) => void;
      };
      const newParent = (parent as unknown as WithChildFn)
        [WITH_CHILD](chain.key, replacement);
      (parent as unknown as PropagateFn)
        [PROPAGATE_UPDATE](key, newParent);
    } else {
      // Reached root - invoke callback
      const callback = this.#callbacks.get(key);
      if (callback) {
        callback(replacement as unknown as Message<DataObject>);
      }
    }
  }

  // Hybrid approach: propagate updates through parent chains
  protected override $propagateUpdates(newRoot: OuterState): void {
    for (const [key, entry] of this.#parentChains) {
      const parent = entry.parent.deref();
      if (!parent) continue;
      type WithChildFn = {
        [WITH_CHILD]: (k: string | number, c: unknown) => unknown;
      };
      type PropagateFn = {
        [PROPAGATE_UPDATE]: (k: symbol, r: unknown) => void;
      };
      const newParent = (parent as unknown as WithChildFn)
        [WITH_CHILD](entry.key, newRoot);
      (parent as unknown as PropagateFn)
        [PROPAGATE_UPDATE](key, newParent);
    }
    // Call direct callbacks at the root level
    for (const [, callback] of this.#callbacks) {
      callback(newRoot as unknown as Message<DataObject>);
    }
  }
}

/**
 * Simulates usePropaneState behavior using the hybrid approach
 * (SET_UPDATE_LISTENER with back-pointer chains)
 */
function simulateUsePropaneState<S extends object>(initialState: S): {
  getState: () => S;
  getRenderCount: () => number;
} {
  let currentState = initialState;
  let renderCount = 0;

  // Check for hybrid approach support
  interface HybridListenable {
    [SET_UPDATE_LISTENER]: (
      key: symbol,
      callback: (val: Message<DataObject>) => void
    ) => void;
  }

  const hasHybridListener = (value: S): value is S & HybridListenable => {
    return (
      value !== null
      && typeof value === 'object'
      && SET_UPDATE_LISTENER in value
    );
  };

  // Setup listener recursively using hybrid approach
  const setupListener = (root: S) => {
    if (hasHybridListener(root)) {
      root[SET_UPDATE_LISTENER](REACT_LISTENER_KEY, (next) => {
        const nextTyped = next as unknown as S;
        setupListener(nextTyped);
        currentState = nextTyped;
        renderCount++; // Simulates React re-render
      });
    }
  };

  setupListener(initialState);

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

  // eslint-disable-next-line unicorn/consistent-function-scoping -- test helper
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
  const innerComponent = simulateMemoPropane({
    inner: outerComponent.getState().inner,
  });

  assert(
    outerComponent.getRenderCount() === 0,
    'Outer should have 0 re-renders initially'
  );
  assert(
    innerComponent.getRenderCount() === 1,
    'Inner should have 1 render (initial)'
  );

  // Change unrelated outer state (counter)
  outerComponent.getState().setCounter(1);

  assert(
    outerComponent.getRenderCount() === 1,
    'Outer should re-render when counter changes'
  );
  assert(outerComponent.getState().counter === 1, 'Counter should be updated');

  // Simulate passing new props to inner component
  const didInnerRerender = innerComponent.updateProps({
    inner: outerComponent.getState().inner,
  });

  assert(
    !didInnerRerender,
    'Inner should NOT re-render when only counter changed'
  );
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
  const innerComponent = simulateMemoPropane({
    inner: outerComponent.getState().inner,
  });

  assert(
    innerComponent.getRenderCount() === 1,
    'Inner should have 1 render initially'
  );

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
  console.log(
    `  Counter after inner change: ${counterAfterInnerChange} (expected: 42)`
  );

  assert(
    counterAfterInnerChange === 42,
    `Counter should STILL be 42 after inner change, `
      + `but got ${counterAfterInnerChange}`
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
  console.log(
    `  Render count before inner change: ${renderCountBeforeInnerChange}`
  );

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
 * 1. OuterComponent renders with state:
 *    { counter: 0, inner: { value: 'hello' } }
 * 2. InnerComponent (memoPropane) receives inner prop, renders,
 *    holds reference
 * 3. OuterComponent changes counter to 10 (inner content unchanged)
 * 4. OuterComponent re-renders, passes new inner to InnerComponent
 * 5. memoPropane: oldInner.equals(newInner) === true → SKIP re-render
 * 6. InnerComponent still has OLD inner reference from step 2
 * 7. User interaction in InnerComponent calls oldInner.setValue('world')
 * 8. With hybrid approach: Counter should persist at 10
 */
function testStaleInnerRefWhenMemoSkipsRerender() {
  console.log('Testing: stale inner ref when memoPropane skips re-render...');

  // Step 1: Setup OuterComponent with usePropaneState
  const initialInner = new InnerState({ value: 'hello' });
  const initialOuter = new OuterState({ counter: 0, inner: initialInner });

  const outerComponent = simulateUsePropaneState(initialOuter);

  // Step 2: InnerComponent renders and holds reference to inner
  // This simulates what happens inside a memoized component
  const innerComponent = simulateMemoPropane({
    inner: outerComponent.getState().inner,
  });

  // The inner component holds onto its prop reference
  // (In real React, this would be via props or a ref)
  const innerComponentHeldRef = innerComponent.getProps().inner;

  const initCounter = outerComponent.getState().counter;
  console.log(
    `  Initial: counter=${initCounter}, inner="${innerComponentHeldRef.value}"`
  );

  // Step 3: OuterComponent changes counter (inner content unchanged)
  outerComponent.getState().setCounter(10);

  console.log(
    `  After setCounter(10): counter=${outerComponent.getState().counter}`
  );
  assert(outerComponent.getState().counter === 10, 'Counter should be 10');

  // Step 4-5: OuterComponent re-renders, passes new inner to InnerComponent
  // memoPropane checks equality
  const newInnerProp = outerComponent.getState().inner;
  const didRerender = innerComponent.updateProps({ inner: newInnerProp });

  const isEqual = innerComponentHeldRef.equals(newInnerProp);
  console.log(`  oldInner.equals(newInner) = ${isEqual}`);
  console.log(`  memoPropane re-rendered: ${didRerender}`);

  // Verify memoPropane skipped re-render
  assert(
    !didRerender,
    'memoPropane should skip re-render (inner values equal)'
  );
  assert(
    innerComponent.getRenderCount() === 1,
    'Inner should still have 1 render'
  );

  // Step 6: InnerComponent still has OLD reference
  // (In real code, component didn't re-run, so props/refs are stale)
  // innerComponentHeldRef is still pointing to the old inner
  console.log(
    `  InnerComponent still holds ref to inner `
      + `with value="${innerComponentHeldRef.value}"`
  );

  // Step 7: User interaction calls setValue on the OLD inner reference
  // This simulates a button click handler that was closed over the old props
  console.log(`  Calling setValue('world') on OLD inner reference...`);
  innerComponentHeldRef.setValue('world');

  // Step 8: Check final state
  const finalCounter = outerComponent.getState().counter;
  const finalInnerValue = outerComponent.getState().inner.value;

  console.log(
    `  Final state: counter=${finalCounter}, inner="${finalInnerValue}"`
  );

  // Verify inner value changed
  assert(
    finalInnerValue === 'world',
    `Inner value should be 'world', got '${finalInnerValue}'`
  );

  // THE KEY ASSERTION: Counter should persist at 10 with the hybrid approach
  assert(
    finalCounter === 10,
    `Counter should persist at 10, got ${finalCounter}`
  );

  console.log('  RESULT: Counter persisted correctly (10)');
  console.log('Stale inner ref when memoPropane skips re-render: PASSED');
}

test('runNestedMemoRerenderTests', () => {
  runNestedMemoRerenderTests();
});
