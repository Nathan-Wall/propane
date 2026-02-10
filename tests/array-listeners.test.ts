import { assert } from './assert.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import {
  SET_UPDATE_LISTENER,
  WITH_CHILD,
  PROPAGATE_UPDATE,
  REACT_LISTENER_KEY,
} from '../runtime/symbols.js';
import type { Message, DataObject } from '../runtime/message.js';
import { test } from 'node:test';

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;
type Unsubscribe = () => void;

// Type for parent chain entry (parent can be Message or ImmutableArray)
interface ParentChainEntry {
  parent: WeakRef<object>;
  key: string | number;
}

// Mock message class for testing using hybrid approach
class TestMessage {
  #value: string;

  // Hybrid approach: parent chains and callbacks
  readonly #parentChains = new Map<symbol, ParentChainEntry>();
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();
  readonly #listenerTokens = new Map<symbol, symbol>();

  constructor(props: { value: string }) {
    this.#value = props.value;
  }

  getValue() {
    return this.#value;
  }

  // Required for isMessageLike check in ImmutableArray
  equals(other: unknown): boolean {
    return other instanceof TestMessage && other.#value === this.#value;
  }

  setValue(newValue: string) {
    const next = new TestMessage({ value: newValue });
    this.$propagateUpdates(next);
    return next;
  }

  // Hybrid: set up parent chain (parent can be Message/ImmutableArray)
  public $setParentChain(
    key: symbol, parent: object, parentKey: string | number
  ): void {
    this.#parentChains.set(key, {
      parent: new WeakRef(parent),
      key: parentKey,
    });
  }

  // Hybrid approach: set listener callback
  public [SET_UPDATE_LISTENER](
    key: symbol, callback: UpdateListenerCallback
  ): Unsubscribe {
    const token = Symbol('listenerRegistration');
    this.#listenerTokens.set(key, token);
    this.#callbacks.set(key, callback);
    return () => {
      if (this.#listenerTokens.get(key) !== token) {
        return;
      }
      this.#listenerTokens.delete(key);
      this.#callbacks.delete(key);
      this.#parentChains.delete(key);
    };
  }

  // Hybrid approach: propagate updates through parent chains
  // Note: Children don't call callbacks directly - they propagate through parent chains.
  // Only root-level items with no parent would call callbacks directly.
  private $propagateUpdates(newRoot: TestMessage): void {
    // Check if we have any parent chains - if so, propagate through them
    if (this.#parentChains.size > 0) {
      for (const [key, entry] of this.#parentChains) {
        const parent = entry.parent.deref();
        if (!parent) continue;
        type WithChildFn = {
          [WITH_CHILD]: (k: string | number, c: unknown) => unknown;
        };
        type PropagateFn = {
          [PROPAGATE_UPDATE]: (k: symbol, r: unknown) => void;
        };
        const newParent = (parent as unknown as WithChildFn)[WITH_CHILD](
          entry.key, newRoot
        );
        (parent as unknown as PropagateFn)[PROPAGATE_UPDATE](
          key, newParent
        );
      }
    } else {
      // No parent chains - this is a root-level item, call callbacks directly
      for (const [, callback] of this.#callbacks) {
        callback(newRoot as unknown as Message<DataObject>);
      }
    }
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

  // Track state updates
  let currentArray = array;

  // Named listener function for re-subscription
  const setupListener = (arr: ImmutableArray<TestMessage>) => {
    interface Listenable {
      [SET_UPDATE_LISTENER]: (
        key: symbol, cb: (val: unknown) => void
      ) => Unsubscribe;
    }
    const nextUnsubscribe = (arr as unknown as Listenable)[SET_UPDATE_LISTENER](
      REACT_LISTENER_KEY,
      (newArray) => {
        currentArray = newArray as ImmutableArray<TestMessage>;
        // Re-setup listener on new array (like usePropaneState does)
        setupListener(currentArray);
      }
    );
    const previousUnsubscribe = currentUnsubscribe;
    currentUnsubscribe = nextUnsubscribe;
    previousUnsubscribe?.();
  };

  let currentUnsubscribe: Unsubscribe | null = null;
  setupListener(array);

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

test('runArrayListenerTests', () => {
  runArrayListenerTests();
});
