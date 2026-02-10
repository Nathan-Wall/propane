import { assert } from './assert.js';
import { Message } from '../runtime/message.js';
import type { DataObject } from '../runtime/message.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import {
  SET_UPDATE_LISTENER,
  GET_MESSAGE_CHILDREN,
  WITH_CHILD,
  REACT_LISTENER_KEY,
} from '../runtime/symbols.js';
import type { ImmutableArray as ImmutableArrayType } from '../runtime/common/array/immutable.js';
import type { ImmutableMap as ImmutableMapType } from '../runtime/common/map/immutable.js';
import type { ImmutableSet as ImmutableSetType } from '../runtime/common/set/immutable.js';
import { test } from 'node:test';

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
  items: CollectionRegressionItem[] | Iterable<CollectionRegressionItem>;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#ArrayRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#ArrayRoot@v1';

  #items: ImmutableArrayType<CollectionRegressionItem>;
  #revision: number;

  constructor(props: {
    items: CollectionRegressionItem[] | Iterable<CollectionRegressionItem>;
    revision: number;
  }) {
    super(ARRAY_ROOT_TAG, 'ArrayRoot');
    this.#items = new ImmutableArray(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as CollectionRegressionItem[] | Iterable<CollectionRegressionItem>,
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
      items: entries['items'] as CollectionRegressionItem[] | Iterable<CollectionRegressionItem>,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new ArrayRoot({
          items: child as CollectionRegressionItem[] | Iterable<CollectionRegressionItem>,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      Message<DataObject>
      | ImmutableArrayType<unknown>
      | ImmutableMapType<unknown, unknown>
      | ImmutableSetType<unknown>,
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
  items: Map<string, CollectionRegressionItem> | Iterable<[string, CollectionRegressionItem]>;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#MapRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#MapRoot@v1';

  #items: ImmutableMapType<string, CollectionRegressionItem>;
  #revision: number;

  constructor(props: {
    items: Map<string, CollectionRegressionItem> | Iterable<[string, CollectionRegressionItem]>;
    revision: number;
  }) {
    super(MAP_ROOT_TAG, 'MapRoot');
    this.#items = new ImmutableMap(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as Map<string, CollectionRegressionItem> | Iterable<[string, CollectionRegressionItem]>,
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
      items: entries['items'] as Map<string, CollectionRegressionItem> | Iterable<[string, CollectionRegressionItem]>,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new MapRoot({
          items: child as Map<string, CollectionRegressionItem> | Iterable<[string, CollectionRegressionItem]>,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      Message<DataObject>
      | ImmutableArrayType<unknown>
      | ImmutableMapType<unknown, unknown>
      | ImmutableSetType<unknown>,
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
  items: Map<unknown, CollectionRegressionItem> | Iterable<[unknown, CollectionRegressionItem]>;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#CollisionMapRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#CollisionMapRoot@v1';

  #items: ImmutableMapType<unknown, CollectionRegressionItem>;
  #revision: number;

  constructor(props: {
    items: Map<unknown, CollectionRegressionItem> | Iterable<[unknown, CollectionRegressionItem]>;
    revision: number;
  }) {
    super(MAP_ROOT_TAG, 'CollisionMapRoot');
    this.#items = new ImmutableMap(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as Map<unknown, CollectionRegressionItem> | Iterable<[unknown, CollectionRegressionItem]>,
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
      items: entries['items'] as Map<unknown, CollectionRegressionItem> | Iterable<[unknown, CollectionRegressionItem]>,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new CollisionMapRoot({
          items: child as Map<unknown, CollectionRegressionItem> | Iterable<[unknown, CollectionRegressionItem]>,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      Message<DataObject>
      | ImmutableArrayType<unknown>
      | ImmutableMapType<unknown, unknown>
      | ImmutableSetType<unknown>,
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
  items: Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>;
  revision: number;
}> {
  static readonly $typeId = 'tests/collection-propagation-regression#SetRoot';
  static readonly $typeHash = 'tests/collection-propagation-regression#SetRoot@v1';

  #items: ImmutableSetType<CollectionRegressionItem>;
  #revision: number;

  constructor(props: {
    items: Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>;
    revision: number;
  }) {
    super(SET_ROOT_TAG, 'SetRoot');
    this.#items = new ImmutableSet(props.items);
    this.#revision = props.revision;
  }

  protected $getPropDescriptors() {
    return [
      {
        name: 'items' as const,
        fieldNumber: 1,
        getValue: () => this.#items as Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>,
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
      items: entries['items'] as Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>,
      revision: entries['revision'] as number,
    };
  }

  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case 'items':
        return new SetRoot({
          items: child as Set<CollectionRegressionItem> | Iterable<CollectionRegressionItem>,
          revision: this.#revision,
        }) as this;
      default:
        throw new Error(`Unknown key: ${String(key)}`);
    }
  }

  override *[GET_MESSAGE_CHILDREN]() {
    yield ['items', this.#items] as unknown as [
      string,
      Message<DataObject>
      | ImmutableArrayType<unknown>
      | ImmutableMapType<unknown, unknown>
      | ImmutableSetType<unknown>,
    ];
  }

  get items() {
    return this.#items;
  }

  get revision() {
    return this.#revision;
  }
}

function collectUpdates<T extends Message<any>>(state: T): Message<any>[] {
  const updates: Message<any>[] = [];
  type Listenable = {
    [SET_UPDATE_LISTENER]: (key: symbol, cb: (next: Message<any>) => void) => void;
  };
  (state as unknown as Listenable)[SET_UPDATE_LISTENER](
    REACT_LISTENER_KEY,
    (next) => updates.push(next)
  );
  return updates;
}

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
    [...(next as SetRoot).items].some((item) => item.value === 'after'),
    'Nested set value update should be applied'
  );
});
