import { assert } from './assert.js';
import { Message } from '../runtime/message.js';
import type { DataObject } from '../runtime/message.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import {
  SET_UPDATE_LISTENER,
  RETIRE_UPDATE_LISTENER,
  GET_MESSAGE_CHILDREN,
  WITH_CHILD,
  PROPAGATE_UPDATE,
  REACT_LISTENER_KEY,
  REGISTER_PATH,
  EQUALS_FROM_ROOT,
} from '../runtime/symbols.js';
import type { ImmutableArray as ImmutableArrayType } from '../runtime/common/array/immutable.js';
import type { ImmutableMap as ImmutableMapType } from '../runtime/common/map/immutable.js';
import type { ImmutableSet as ImmutableSetType } from '../runtime/common/set/immutable.js';
import { test } from 'node:test';

type Unsubscribe = () => void;
type AnyMessage = Message<object>;
type ArrayItemsInput =
  CollectionRegressionItem[] | Iterable<CollectionRegressionItem>;
type MapItemsInput =
  Map<string, CollectionRegressionItem>
  | Iterable<[string, CollectionRegressionItem]>;
type CollisionMapItemsInput =
  Map<unknown, CollectionRegressionItem>
  | Iterable<[unknown, CollectionRegressionItem]>;
type SetItemsInput =
  Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>;
type ParentChild =
  Message<DataObject>
  | ImmutableArrayType<unknown>
  | ImmutableMapType<unknown, unknown>
  | ImmutableSetType<unknown>;
type SetUpdateListener = (
  listenerKey: symbol,
  cb: (next: AnyMessage) => void
) => Unsubscribe;
type Listenable = {
  [SET_UPDATE_LISTENER]: SetUpdateListener;
};
type Propagator = {
  [PROPAGATE_UPDATE]: (listenerKey: symbol, replacement: AnyMessage) => void;
};
type Retirable = {
  [RETIRE_UPDATE_LISTENER]: (listenerKey: symbol) => void;
};

const ITEM_TAG = Symbol('CollectionRegressionItem');
const ARRAY_ROOT_TAG = Symbol('CollectionRegressionArrayRoot');
const MAP_ROOT_TAG = Symbol('CollectionRegressionMapRoot');
const SET_ROOT_TAG = Symbol('CollectionRegressionSetRoot');

class CollectionRegressionItem extends Message<{ value: string }> {
  static readonly $typeId = 'tests/collection-propagation-regression#CollectionRegressionItem';
  static readonly $typeHash = 'tests/collection-propagation-regression#CollectionRegressionItem@v1';

  #value: string;

  constructor(props: { value: string }) {
    super(ITEM_TAG, 'CollectionRegressionItem');
    this.#value = props.value;
  }

  protected $getPropDescriptors() {
    return [
      { name: 'value' as const, fieldNumber: 1, getValue: () => this.#value },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return { value: entries['value'] as string };
  }

  get value() {
    return this.#value;
  }

  setValue(value: string) {
    return this.$update(new CollectionRegressionItem({ value }) as this);
  }
}

class ArrayRoot extends Message<{
  items: ArrayItemsInput;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#ArrayRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#ArrayRoot@v1';

  #items: ImmutableArrayType<CollectionRegressionItem>;
  #revision: number;

  constructor(props: { items: ArrayItemsInput; revision: number }) {
    super(ARRAY_ROOT_TAG, 'ArrayRoot');
    this.#items = new ImmutableArray(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as ArrayItemsInput,
      },
      {
        name: 'revision' as const,
        fieldNumber: 2,
        getValue: () => this.#revision,
      },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      items: entries['items'] as ArrayItemsInput,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new ArrayRoot({
          items: child as ArrayItemsInput,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      ParentChild,
    ];
  }

  get items() {
    return this.#items;
  }

  get revision() {
    return this.#revision;
  }
}

class MapRoot extends Message<{
  items: MapItemsInput;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#MapRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#MapRoot@v1';

  #items: ImmutableMapType<string, CollectionRegressionItem>;
  #revision: number;

  constructor(props: { items: MapItemsInput; revision: number }) {
    super(MAP_ROOT_TAG, 'MapRoot');
    this.#items = new ImmutableMap(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as MapItemsInput,
      },
      {
        name: 'revision' as const,
        fieldNumber: 2,
        getValue: () => this.#revision,
      },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      items: entries['items'] as MapItemsInput,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new MapRoot({
          items: child as MapItemsInput,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      ParentChild,
    ];
  }

  get items() {
    return this.#items;
  }

  get revision() {
    return this.#revision;
  }
}

class CollisionMapRoot extends Message<{
  items: CollisionMapItemsInput;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#CollisionMapRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#CollisionMapRoot@v1';

  #items: ImmutableMapType<unknown, CollectionRegressionItem>;
  #revision: number;

  constructor(props: { items: CollisionMapItemsInput; revision: number }) {
    super(MAP_ROOT_TAG, 'CollisionMapRoot');
    this.#items = new ImmutableMap(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as CollisionMapItemsInput,
      },
      {
        name: 'revision' as const,
        fieldNumber: 2,
        getValue: () => this.#revision,
      },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      items: entries['items'] as CollisionMapItemsInput,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new CollisionMapRoot({
          items: child as CollisionMapItemsInput,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      ParentChild,
    ];
  }

  get items() {
    return this.#items;
  }

  get revision() {
    return this.#revision;
  }
}

class SetRoot extends Message<{
  items: SetItemsInput;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#SetRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#SetRoot@v1';

  #items: ImmutableSetType<CollectionRegressionItem>;
  #revision: number;

  constructor(props: { items: SetItemsInput; revision: number }) {
    super(SET_ROOT_TAG, 'SetRoot');
    this.#items = new ImmutableSet(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as SetItemsInput,
      },
      {
        name: 'revision' as const,
        fieldNumber: 2,
        getValue: () => this.#revision,
      },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>) {
    return {
      items: entries['items'] as SetItemsInput,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new SetRoot({
          items: child as SetItemsInput,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      ParentChild,
    ];
  }

  get items() {
    return this.#items;
  }

  get revision() {
    return this.#revision;
  }
}

function collectUpdates<T extends AnyMessage>(state: T): AnyMessage[] {
  const updates: AnyMessage[] = [];
  (state as unknown as Listenable)[SET_UPDATE_LISTENER](
    REACT_LISTENER_KEY,
    next => updates.push(next)
  );
  return updates;
}

test('set update listener returns unsubscribe and stops updates after cleanup', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 29,
  });

  const updates: AnyMessage[] = [];
  const unsubscribe = (state as unknown as Listenable)[SET_UPDATE_LISTENER](Symbol('unsubscribe-test'), next => updates.push(next));

  state.items.get(0)!.setValue('first');
  assert(updates.length === 1, `Expected 1 update before unsubscribe, got ${updates.length}`);

  unsubscribe();
  unsubscribe();

  state.items.get(0)!.setValue('second');
  assert(updates.length === 1, `Expected updates to stop after unsubscribe, got ${updates.length}`);
});

test('stale unsubscribe does not retire newer listener registration for same key', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 31,
  });

  const key = Symbol('shared-key');
  const updatesA: AnyMessage[] = [];
  const updatesB: AnyMessage[] = [];
  let currentState = state;

  const unsubscribeA = (state as unknown as Listenable)[SET_UPDATE_LISTENER](
    key,
    next => updatesA.push(next)
  );

  const unsubscribeB = (state as unknown as Listenable)[SET_UPDATE_LISTENER](
    key,
    next => {
      updatesB.push(next);
      currentState = next as ArrayRoot;
    }
  );

  // Stale unsubscribe should not affect active registration for this key.
  unsubscribeA();

  currentState.items.get(0)!.setValue('first');
  assert(updatesA.length === 0, `Expected replaced listener A to receive 0 updates, got ${updatesA.length}`);
  assert(Number(updatesB.length) === 1, `Expected active listener B to receive 1 update, got ${updatesB.length}`);

  unsubscribeA();
  currentState.items.get(0)!.setValue('second');
  assert(Number(updatesB.length) === 2, `Expected listener B to remain active after stale unsubscribe, got ${updatesB.length}`);

  (currentState as unknown as Retirable)[RETIRE_UPDATE_LISTENER](key);
  currentState.items.get(0)!.setValue('third');
  assert(Number(updatesB.length) === 2, `Expected listener B updates to stop after unsubscribe, got ${updatesB.length}`);

  // No-op after retirement should not throw.
  unsubscribeB();
});

test('retire update listener key stops callbacks on latest root after handoff', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 35,
  });
  const key = Symbol('retire-active-root');
  let callbackCount = 0;
  let currentState = state;

  (state as unknown as Listenable)[SET_UPDATE_LISTENER](key, next => {
    callbackCount += 1;
    currentState = next as ArrayRoot;
  });

  currentState.items.get(0)!.setValue('first');
  assert(callbackCount === 1, `Expected callback after first mutation, got ${callbackCount}`);

  (currentState as unknown as Retirable)[RETIRE_UPDATE_LISTENER](key);

  currentState.items.get(0)!.setValue('second');
  assert(callbackCount === 1, `Expected callbacks to stop after retiring key, got ${callbackCount}`);
});

test('stale ref for still-present child continues to update latest root', () => {
  const state = new ArrayRoot({
    items: [
      new CollectionRegressionItem({ value: 'one' }),
      new CollectionRegressionItem({ value: 'two' }),
    ],
    revision: 36,
  });
  const key = Symbol('still-present-stale-ref');
  let callbackCount = 0;
  let currentState = state;

  (state as unknown as Listenable)[SET_UPDATE_LISTENER](key, next => {
    callbackCount += 1;
    currentState = next as ArrayRoot;
  });

  const staleFirstRef = state.items.get(0)!;

  currentState.items.get(1)!.setValue('two-updated');
  assert(currentState.items.get(1)?.value === 'two-updated', 'Second item should update first');

  staleFirstRef.setValue('one-updated');
  assert(currentState.items.get(0)?.value === 'one-updated', 'Still-present stale ref should update latest root');
  assert(currentState.items.get(1)?.value === 'two-updated', 'Unrelated sibling updates should be preserved');
  assert(Number(callbackCount) === 2, `Expected 2 callbacks, got ${callbackCount}`);
});

test('key-specific handoff and retirement do not affect other active listener keys', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 39,
  });
  const keyA = Symbol('key-a');
  const keyB = Symbol('key-b');

  let callbacksA = 0;
  let callbacksB = 0;

  (state as unknown as Listenable)[SET_UPDATE_LISTENER](keyA, () => {
    callbacksA += 1;
  });

  (state as unknown as Listenable)[SET_UPDATE_LISTENER](keyB, () => {
    callbacksB += 1;
  });

  const replacementForA = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'replacement-a' })],
    revision: 40,
  });

  (state as unknown as Propagator)[PROPAGATE_UPDATE](
    keyA,
    replacementForA as unknown as AnyMessage
  );

  assert(Number(callbacksA) === 1, `Expected key A handoff to dispatch once, got ${callbacksA}`);
  assert(Number(callbacksB) === 0, `Key B should remain untouched by key A handoff, got ${callbacksB}`);

  state.items.get(0)!.setValue('after-a-handoff');
  assert(Number(callbacksA) === 1, `Expected key A to stay retired on old root, got ${callbacksA}`);
  assert(Number(callbacksB) === 1, `Expected key B to remain active on old root, got ${callbacksB}`);
});

test('shared initial node with distinct keys remains isolated across roots', () => {
  const sharedItem = new CollectionRegressionItem({ value: 'one' });
  const rootA = new ArrayRoot({
    items: [sharedItem],
    revision: 44,
  });
  const rootB = new ArrayRoot({
    items: [sharedItem],
    revision: 45,
  });

  const keyA = Symbol('root-a');
  const keyB = Symbol('root-b');

  let callbacksA = 0;
  let callbacksB = 0;
  let currentA = rootA;
  let currentB = rootB;

  (rootA as unknown as Listenable)[SET_UPDATE_LISTENER](keyA, next => {
    callbacksA += 1;
    currentA = next as ArrayRoot;
  });

  (rootB as unknown as Listenable)[SET_UPDATE_LISTENER](keyB, next => {
    callbacksB += 1;
    currentB = next as ArrayRoot;
  });

  sharedItem.setValue('two');
  assert(Number(callbacksA) === 1, `Expected root A to receive first shared-node update, got ${callbacksA}`);
  assert(Number(callbacksB) === 1, `Expected root B to receive first shared-node update, got ${callbacksB}`);

  // Replace root B's child through B's root chain only. This breaks shared-node identity.
  currentB.items.set(0, new CollectionRegressionItem({ value: 'two-b-only' }));
  assert(Number(callbacksA) === 1, `Root A should not receive root B root-only replacement, got ${callbacksA}`);
  assert(Number(callbacksB) === 2, `Root B should receive root-only replacement, got ${callbacksB}`);

  currentB.items.get(0)!.setValue('three-b-only');
  assert(Number(callbacksA) === 1, `Root A should not receive root B isolated child updates, got ${callbacksA}`);
  assert(Number(callbacksB) === 3, `Root B should continue receiving isolated keyed updates, got ${callbacksB}`);

  (currentA as unknown as Retirable)[RETIRE_UPDATE_LISTENER](keyA);

  currentB.items.get(0)!.setValue('four-b-only');
  assert(Number(callbacksA) === 1, `Retired root A key should remain silent, got ${callbacksA}`);
  assert(Number(callbacksB) === 4, `Retiring root A key must not silence root B key, got ${callbacksB}`);
});

test('root handoff binds replacement before callback dispatch', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 37,
  });
  const key = Symbol('handoff-order');

  let currentState = state;
  let callbackCount = 0;
  (state as unknown as Listenable)[SET_UPDATE_LISTENER](key, next => {
    callbackCount += 1;
    currentState = next as ArrayRoot;
    if (callbackCount === 1) {
      currentState.items.get(0)!.setValue('two');
    }
  });

  currentState.items.get(0)!.setValue('one-updated');

  assert(callbackCount === 2, `Expected 2 callbacks, got ${callbackCount}`);
  assert(currentState.items.get(0)?.value === 'two', 'Nested mutation during callback should publish via replacement root');
});

test('propagate update ignores no-op replacement and keeps listener active', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 41,
  });
  const key = Symbol('noop-replacement');
  let callbackCount = 0;
  (state as unknown as Listenable)[SET_UPDATE_LISTENER](key, () => {
    callbackCount += 1;
  });

  (state as unknown as Propagator)[PROPAGATE_UPDATE](
    key,
    state as unknown as AnyMessage
  );
  const callbacksAfterNoop = callbackCount;
  assert(callbacksAfterNoop === 0, `No-op replacement should not dispatch callback, got ${callbacksAfterNoop}`);

  state.items.get(0)!.setValue('after-noop');
  assert(callbackCount === 1, `Listener should remain active after no-op replacement, got ${callbackCount}`);
});

test('parent-chain entry suppresses callback fallback when propagation cannot continue', () => {
  const item = new CollectionRegressionItem({ value: 'one' });
  const key = Symbol('parent-chain-fallback');
  let callbackCount = 0;

  (item as unknown as Listenable)[SET_UPDATE_LISTENER](key, () => {
    callbackCount += 1;
  });

  // Intentionally provide a non-propagating parent placeholder to ensure that
  // chain presence suppresses root callback fallback.
  item.$setParentChain(key, {} as unknown as Message<DataObject>, 'value');
  item.setValue('two');

  assert(callbackCount === 0, `Expected callback fallback to be suppressed, got ${callbackCount}`);
});

test('array stale child ref cannot resurrect removed item', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 43,
  });
  const updates = collectUpdates(state);
  const staleRef = state.items.get(0)!;

  state.items.pop();
  const updatesAfterRemoval = updates.length;
  assert(updatesAfterRemoval === 1, `Expected 1 update after removal, got ${updatesAfterRemoval}`);

  staleRef.setValue('ghost');
  assert(updates.length === updatesAfterRemoval, `Removed stale ref should not publish updates. Got ${updates.length}`);

  const latest = updates.at(-1) as ArrayRoot;
  assert(latest.items.length === 0, 'Removed item should not reappear in the latest root');
});

test('map stale child ref cannot resurrect deleted entry', () => {
  const state = new MapRoot({
    items: [['one', new CollectionRegressionItem({ value: 'one' })]],
    revision: 47,
  });
  const updates = collectUpdates(state);
  const staleRef = state.items.get('one');
  assert(staleRef !== undefined, 'Expected map entry before deletion');

  state.items.delete('one');
  const updatesAfterDelete = updates.length;
  assert(updatesAfterDelete === 1, `Expected 1 update after delete, got ${updatesAfterDelete}`);

  staleRef.setValue('ghost');
  assert(updates.length === updatesAfterDelete, `Deleted stale ref should not publish updates. Got ${updates.length}`);

  const latest = updates.at(-1) as MapRoot;
  assert(latest.items.get('one') === undefined, 'Deleted entry should not reappear in latest root');
});

test('set stale child ref cannot resurrect deleted value', () => {
  const value = new CollectionRegressionItem({ value: 'one' });
  const state = new SetRoot({
    items: [value],
    revision: 53,
  });
  const updates = collectUpdates(state);
  const staleRef = [...state.items][0];
  assert(staleRef !== undefined, 'Expected set value before deletion');

  state.items.delete(staleRef);
  const updatesAfterDelete = updates.length;
  assert(updatesAfterDelete === 1, `Expected 1 update after set delete, got ${updatesAfterDelete}`);

  staleRef.setValue('ghost');
  assert(updates.length === updatesAfterDelete, `Deleted set stale ref should not publish updates. Got ${updates.length}`);

  const latest = updates.at(-1) as SetRoot;
  assert(latest.items.size === 0, 'Deleted set value should not reappear in latest root');
});

test('array mutation emits one root update payload', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 3,
  });
  const updates = collectUpdates(state);

  state.items.push(new CollectionRegressionItem({ value: 'two' }));

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof ArrayRoot, 'Array update payload should be ArrayRoot');
  assert((next as ArrayRoot).revision === 3, 'Sibling fields should be preserved');
  assert((next as ArrayRoot).items.length === 2, 'Array should include pushed item');
});

test('array child message update bubbles to root once', () => {
  const state = new ArrayRoot({
    items: [new CollectionRegressionItem({ value: 'before' })],
    revision: 5,
  });
  const updates = collectUpdates(state);

  state.items.get(0)!.setValue('after');

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof ArrayRoot, 'Array child update payload should be ArrayRoot');
  assert((next as ArrayRoot).revision === 5, 'Sibling fields should be preserved');
  assert((next as ArrayRoot).items.get(0)?.value === 'after', 'Nested item update should be applied');
});

test('map mutation emits one root update payload', () => {
  const state = new MapRoot({
    items: [['one', new CollectionRegressionItem({ value: 'one' })]],
    revision: 7,
  });
  const updates = collectUpdates(state);

  state.items.set('two', new CollectionRegressionItem({ value: 'two' }));

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof MapRoot, 'Map update payload should be MapRoot');
  assert((next as MapRoot).revision === 7, 'Sibling fields should be preserved');
  assert((next as MapRoot).items.size === 2, 'Map should include inserted entry');
});

test('map child message update bubbles to root once', () => {
  const state = new MapRoot({
    items: [['one', new CollectionRegressionItem({ value: 'before' })]],
    revision: 11,
  });
  const updates = collectUpdates(state);

  state.items.get('one')!.setValue('after');

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof MapRoot, 'Map child update payload should be MapRoot');
  assert((next as MapRoot).revision === 11, 'Sibling fields should be preserved');
  assert((next as MapRoot).items.get('one')?.value === 'after', 'Nested map value update should be applied');
});

test('map child update targets correct key when map keys share a hash code', () => {
  const key1 = {
    id: 1,
    equals(other: unknown) {
      return Boolean(
        other
        && typeof other === 'object'
        && 'id' in other
        && (other as { id?: unknown }).id === this.id
      );
    },
    hashCode() {
      return 123;
    },
  };

  const key2 = {
    id: 2,
    equals(other: unknown) {
      return Boolean(
        other
        && typeof other === 'object'
        && 'id' in other
        && (other as { id?: unknown }).id === this.id
      );
    },
    hashCode() {
      return 123;
    },
  };

  const state = new CollisionMapRoot({
    items: [
      [key1, new CollectionRegressionItem({ value: 'one' })],
      [key2, new CollectionRegressionItem({ value: 'two' })],
    ],
    revision: 19,
  });
  const updates = collectUpdates(state);

  const second = state.items.get(key2);
  assert(second !== undefined, 'Expected a map item for nested update');
  second.setValue('two-updated');

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof CollisionMapRoot, 'Collision map child update payload should be CollisionMapRoot');
  assert((next as CollisionMapRoot).items.get(key1)?.value === 'one', 'First key should remain unchanged');
  assert((next as CollisionMapRoot).items.get(key2)?.value === 'two-updated', 'Updated key should receive nested value change');
});

test('set mutation emits one root update payload', () => {
  const state = new SetRoot({
    items: [new CollectionRegressionItem({ value: 'one' })],
    revision: 13,
  });
  const updates = collectUpdates(state);

  state.items.add(new CollectionRegressionItem({ value: 'two' }));

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof SetRoot, 'Set update payload should be SetRoot');
  assert((next as SetRoot).revision === 13, 'Sibling fields should be preserved');
  assert((next as SetRoot).items.size === 2, 'Set should include inserted value');
});

test('set child message update bubbles to root once', () => {
  const state = new SetRoot({
    items: [new CollectionRegressionItem({ value: 'before' })],
    revision: 17,
  });
  const updates = collectUpdates(state);
  const first = [...state.items][0];
  assert(first !== undefined, 'Expected a set item for nested update');

  first.setValue('after');

  assert(updates.length === 1, `Expected exactly 1 update, got ${updates.length}`);
  const next = updates[0];
  assert(next instanceof SetRoot, 'Set child update payload should be SetRoot');
  assert((next as SetRoot).revision === 17, 'Sibling fields should be preserved');
  assert(
    [...(next as SetRoot).items].some(item => item.value === 'after'),
    'Nested set value update should be applied'
  );
});

test('array listener setup should support nested collection children', () => {
  const state = new ImmutableArray([
    new ImmutableMap([['one', 1]]),
  ]);

  let thrown: unknown;
  try {
    (state as unknown as Listenable)[SET_UPDATE_LISTENER](
      REACT_LISTENER_KEY,
      () => undefined
    );
  } catch (error) {
    thrown = error;
  }

  assert(
    thrown === undefined,
    `Nested collection listener setup should not throw for array children. Received: ${String(thrown)}`
  );
});

test('map listener setup should support nested collection children', () => {
  const state = new ImmutableMap([
    ['items', new ImmutableArray([1, 2])],
  ]);

  let thrown: unknown;
  try {
    (state as unknown as Listenable)[SET_UPDATE_LISTENER](
      REACT_LISTENER_KEY,
      () => undefined
    );
  } catch (error) {
    thrown = error;
  }

  assert(
    thrown === undefined,
    `Nested collection listener setup should not throw for map children. Received: ${String(thrown)}`
  );
});

test('set listener setup should support nested collection children', () => {
  const state = new ImmutableSet([
    new ImmutableArray([1, 2]),
  ]);

  let thrown: unknown;
  try {
    (state as unknown as Listenable)[SET_UPDATE_LISTENER](
      REACT_LISTENER_KEY,
      () => undefined
    );
  } catch (error) {
    thrown = error;
  }

  assert(
    thrown === undefined,
    `Nested collection listener setup should not throw for set children. Received: ${String(thrown)}`
  );
});

test('path-aware equality should distinguish map children with colliding hashed key paths', () => {
  const key1 = {
    id: 1,
    equals(other: unknown) {
      return Boolean(
        other
        && typeof other === 'object'
        && 'id' in other
        && (other as { id?: unknown }).id === this.id
      );
    },
    hashCode() {
      return 123;
    },
  };

  const key2 = {
    id: 2,
    equals(other: unknown) {
      return Boolean(
        other
        && typeof other === 'object'
        && 'id' in other
        && (other as { id?: unknown }).id === this.id
      );
    },
    hashCode() {
      return 123;
    },
  };

  const state = new CollisionMapRoot({
    items: [
      [key1, new CollectionRegressionItem({ value: 'same' })],
      [key2, new CollectionRegressionItem({ value: 'same' })],
    ],
    revision: 23,
  });

  const root = state as unknown as Message<DataObject>;
  state[REGISTER_PATH](root, 'root');

  const first = state.items.get(key1);
  const second = state.items.get(key2);
  assert(first !== undefined, 'Expected first map child');
  assert(second !== undefined, 'Expected second map child');
  assert(first.equals(second), 'Children must be content-equal for path-aware check');
  assert(
    !first[EQUALS_FROM_ROOT](root, second as unknown as Message<DataObject>),
    'Path-aware equality should return false for distinct map keys even when hashes collide'
  );
});
