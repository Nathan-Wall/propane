import { ensure } from '../common/assert/index.js';
import { emsg } from '../common/strings/msg/index.js';
import { normalizeForJson } from './common/json/stringify.js';
import { ImmutableMap } from './common/map/immutable.js';
import { ImmutableSet } from './common/set/immutable.js';
import { ImmutableArray } from './common/array/immutable.js';
import type { ImmutableArrayBuffer } from '@/common/data/immutable-array-buffer.js';
import type { ImmutableDate } from '@/common/time/date.js';
import type { ImmutableUrl } from '@/common/web/url.js';
import type { Decimal, Rational } from '@/common/numbers/decimal.js';
import {
  SET_UPDATE_LISTENER,
  RETIRE_UPDATE_LISTENER,
  FROM_ROOT,
  REGISTER_PATH,
  PROPAGATE_UPDATE,
  WITH_CHILD,
  GET_MESSAGE_CHILDREN,
  EQUALS_FROM_ROOT,

} from './symbols.js';
import { needsDetach, detachValue } from './common/detach.js';

const SAFE_TOKEN_RE = /^[A-Za-z0-9!%&*+\-./=?@^_~]+$/;
const RESERVED_STRINGS = new Set(['true', 'false', 'null', 'undefined']);
const NUMERIC_STRING_RE = /^-?\d+(?:\.\d+)?$/;
const TINY_TAG_RE = /^[A-Za-z#]$/;
const MESSAGE_TAG = Symbol.for('propane:message');
const ENFORCED_TYPE_TAGS = new WeakSet<Function>();

export type DataPrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;
export type DataValue =
  | DataPrimitive
  | Date
  | ImmutableDate
  | URL
  | ImmutableUrl
  | Decimal<any, any>
  | Rational
  | ArrayBuffer
  | ImmutableArrayBuffer
  | ImmutableMap<unknown, unknown>
  | ImmutableSet<unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | Iterable<unknown>
  | TaggedMessageData
  | DataObject
  | DataArray
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Message<any>;
export type DataArray = DataValue[];
export interface DataObject {
  [key: string]: DataValue;
}
export type MapKey =
  | DataPrimitive
  | Date
  | ImmutableDate
  | URL
  | ImmutableUrl;

export interface TaggedMessageData {
  $tag: string;
  $data: DataObject | string;
}

// Wrapper type alias for .pmsg usage
export type MessageWrapper<T> = Message<{ value: T }>;


export function isTaggedMessageData(
  value: unknown
): value is TaggedMessageData {
  return (
    value !== null
    && typeof value === 'object'
    && '$tag' in value
    && '$data' in value
    && typeof (value as TaggedMessageData).$tag === 'string'
    && (
      typeof (value as TaggedMessageData).$data === 'string'
      || typeof (value as TaggedMessageData).$data === 'object'
    )
  );
}




export interface MessagePropDescriptor<T extends object> {
  name: keyof T;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
  /**
   * When present, indicates the value should be tagged for
   * union discrimination
   */
  unionMessageTypes?: string[];
  arrayElementUnionMessageTypes?: string[];
  setElementUnionMessageTypes?: string[];
  mapKeyUnionMessageTypes?: string[];
  mapValueUnionMessageTypes?: string[];
  /** When true, string values in the union should be quoted */
  unionHasString?: boolean;
  arrayElementUnionHasString?: boolean;
  setElementUnionHasString?: boolean;
  mapKeyUnionHasString?: boolean;
  mapValueUnionHasString?: boolean;
}

/**
 * Extract the Data type from a Message<Data> type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageData<T extends Message<any>> = T extends Message<infer D> ? D : never;

/**
 * Extract the instance type from a Message constructor.
 * Uses the prototype property to avoid constructor signature constraints.
 */
type MessageInstance<T> = T extends { prototype: infer P } ? P : never;

/**
 * The Value type for a Message: either the message instance or its data.
 * Exported for use in generated generic parse methods.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageValue<T extends Message<any>> = T | MessageData<T>;

/**
 * Interface for generic message constructors.
 * Used when passing constructors to generic message classes.
 * Uses structural AnyMessage constraint to avoid private field compatibility issues.
 */
export interface MessageConstructor<T extends AnyMessage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (props?: any, options?: { skipValidation?: boolean }): T;
  deserialize(data: string, options?: { skipValidation?: boolean }): T;
  fromCompact?(...args: unknown[]): AnyMessage;
  readonly $typeName: string;
  readonly $typeId?: string;
  readonly $typeHash?: string;
  readonly $compact?: boolean;
  readonly $compactTag?: string;
  isInstance(value: unknown): value is AnyMessage;
}

/**
 * Options for serializing a message.
 */
export interface SerializeOptions {
  /**
   * When true, includes the type tag in the serialized output.
   * - Without tag: `:{field:value}`
   * - With tag: `:$TypeName{field:value}`
   *
   * Use this when storing messages in contexts where the type needs to be
   * preserved, such as database union columns or RPC responses.
   */
  includeTag?: boolean;
}


// Intern pool for message instances, keyed by serialized form
// Uses WeakRef to allow garbage collection of unused instances
const internPool = new Map<string, WeakRef<Message<DataObject>>>();
const registry = new FinalizationRegistry<string>((key) => {
  const ref = internPool.get(key);
  if (ref && !ref.deref()) {
    internPool.delete(key);
  }
});

// Type for parent chain entry
type ParentType =
  | Message<DataObject>
  | ImmutableArray<unknown>
  | ImmutableMap<unknown, unknown>
  | ImmutableSet<unknown>;

interface ParentChainEntry {
  parent: WeakRef<ParentType>;
  key: unknown;
}

// Type for update listener callback
type UpdateListenerCallback = (msg: Message<DataObject>) => void;
type Unsubscribe = () => void;

/**
 * Structural type that matches any Message instance.
 * Use this as a type constraint instead of Message<any> to avoid
 * TypeScript invariance issues with generic class type parameters.
 */
export interface AnyMessage {
  readonly $typeName: string;
  serialize(): string;
  hashCode(): number;
  equals(other: unknown): boolean;
}

export abstract class Message<T extends object> {
  private [MESSAGE_TAG] = true;
  static readonly $compact?: boolean;
  static readonly $compactTag?: string;
  readonly #typeTag: symbol;
  readonly #typeName: string;
  static readonly MAX_CACHED_SERIALIZE = 64 * 1024; // 64KB
  #serialized?: string;
  #hash?: number;
  #detachedCache?: Message<T>;

  // Path tracking for equality comparisons
  readonly #fromRoot = new WeakMap<Message<DataObject>, string>();

  // Parent chains for update propagation (keyed by listener symbol)
  readonly #parentChains = new Map<symbol, ParentChainEntry>();

  // Callbacks for update propagation (keyed by listener symbol)
  readonly #callbacks = new Map<symbol, UpdateListenerCallback>();

  // Tracks the most recent listener registration token for each key.
  readonly #listenerTokens = new Map<symbol, symbol>();

  protected abstract $getPropDescriptors(): MessagePropDescriptor<T>[];
  protected abstract $fromEntries(entries: Record<string, unknown>, options?: { skipValidation?: boolean }): T;

  /**
   * Create a new message with a child replaced at the given key.
   * Generated by Babel plugin for each message type.
   */
  public [WITH_CHILD](
    unused_key: string | number,
    unused_child: ParentType
  ): this {
    const msg = `${this.#typeName}[WITH_CHILD] not implemented.`;
    throw new Error(`${msg} Regenerate with updated Babel plugin.`);
  }

  /**
   * Get all message children for propagating listeners.
   * Generated by Babel plugin for each message type.
   */
  public *[GET_MESSAGE_CHILDREN](): Iterable<[string | number, ParentType]> {
    // Default: no children. Override in generated classes.
  }

  protected constructor(
    typeTag: symbol,
    typeName: string
  ) {
    this.#typeTag = typeTag;
    this.#typeName = typeName;
    const ctor = this.constructor as typeof Message & {
      $instanceTag?: symbol;
      $typeId?: string;
      $typeHash?: string;
      $typeName?: string;
      name?: string;
    };
    if (!ENFORCED_TYPE_TAGS.has(ctor as unknown as Function)) {
      const displayName = ctor.$typeName ?? ctor.name ?? typeName;
      if (typeof ctor.$typeId !== 'string' || ctor.$typeId.length === 0) {
        throw new Error(
          `${displayName} is missing static $typeId.`
            + ' Message subclasses must be generated by the Propane compiler.'
        );
      }
      if (typeof ctor.$typeHash !== 'string' || ctor.$typeHash.length === 0) {
        throw new Error(
          `${displayName} is missing static $typeHash.`
            + ' Message subclasses must be generated by the Propane compiler.'
        );
      }
      ENFORCED_TYPE_TAGS.add(ctor as unknown as Function);
    }
    const instanceTag = ctor.$instanceTag;
    if (instanceTag && Object.isExtensible(this)) {
      Object.defineProperty(this, instanceTag, {
        value: true,
        enumerable: false,
        writable: false,
        configurable: false,
      });
    }
  }

  static isInstance<T extends { prototype: Message<any> }>(
    this: T,
    value: unknown
  ): value is MessageInstance<T> {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
      return false;
    }
    const ctor = this as { $instanceTag?: symbol };
    const instanceTag = ctor.$instanceTag;
    if (instanceTag && (value as { [key: symbol]: unknown })[instanceTag] === true) {
      return true;
    }
    return value instanceof (this as unknown as abstract new (...args: any[]) => Message<any>);
  }

  static isMessage(value: unknown): value is Message<any> {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
      return false;
    }
    if ((value as { [key: symbol]: unknown })[MESSAGE_TAG] === true) {
      return true;
    }
    return value instanceof Message;
  }

  static fromCompact(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...args: unknown[]
  ): AnyMessage {
    const ctor = this as { $typeName?: string; name?: string };
    const typeName = ctor.$typeName ?? ctor.name ?? 'Message';
    throw new Error(`${typeName}.fromCompact() is not implemented.`);
  }

  protected $update(value: this): this {
    // Propagate update to parent chains
    this.$propagateUpdates(value);
    return value;
  }

  // ============================================
  // HYBRID APPROACH: Path Registration
  // ============================================

  /**
   * Register the path from a root message to this message.
   * Called during parent construction to set up path tracking.
   */
  public [REGISTER_PATH](root: Message<DataObject>, path: string): void {
    this.#fromRoot.set(root, path);
    // Recursively register children
    for (const [key, child] of this[GET_MESSAGE_CHILDREN]()) {
      if (Message.isMessage(child)) {
        child[REGISTER_PATH](root, `${path}.${key}`);
      } else if (child && typeof child === 'object' && REGISTER_PATH in child) {
        (child as { [REGISTER_PATH]: (root: Message<DataObject>, path: string) => void })[REGISTER_PATH](root, `${path}.${key}`);
      }
    }
  }

  /**
   * Get the path from a root to this message.
   */
  public [FROM_ROOT](root: Message<DataObject>): string | undefined {
    return this.#fromRoot.get(root);
  }

  // ============================================
  // HYBRID APPROACH: Path-Aware Equality
  // ============================================

  /**
   * Check equality considering position in the state tree.
   * Two messages are equal from a root if they have the same content
   * AND are at the same path from that root.
   */
  public [EQUALS_FROM_ROOT](
    root: Message<DataObject> | null,
    other: Message<DataObject>
  ): boolean {
    // Content must be equal first
    if (!this.equals(other)) return false;

    // No root context, fall back to content equality
    if (!root) return true;

    const myPath = this.#fromRoot.get(root);
    const otherPath = other[FROM_ROOT](root);

    // If either doesn't have a path from this root, fall back to content equality
    if (myPath === undefined || otherPath === undefined) return true;

    // Same content AND same path = truly equal
    return myPath === otherPath;
  }

  // ============================================
  // HYBRID APPROACH: Update Listener Management
  // ============================================

  /**
   * Set up the parent chain for a given listener key.
   * Called by parent to establish the update propagation path.
   */
  public $setParentChain(
    key: symbol,
    parent: ParentType,
    parentKey: unknown
  ): void {
    this.#parentChains.set(key, {
      parent: new WeakRef(parent),
      key: parentKey,
    });
  }

  /**
   * Set an update listener for a given symbol key.
   * Replaces any existing listener for that key.
   * Propagates the listener setup to all children.
   */
  public [SET_UPDATE_LISTENER](
    key: symbol,
    callback: UpdateListenerCallback
  ): Unsubscribe {
    const registrationToken = Symbol('listenerRegistration');
    this.#listenerTokens.set(key, registrationToken);

    // Store the callback at this level
    this.#callbacks.set(key, callback);

    const childUnsubscribes: Unsubscribe[] = [];

    // Propagate to children, setting up their parent chains
    for (const [childKey, child] of this[GET_MESSAGE_CHILDREN]()) {
      if (Message.isMessage(child)) {
        // Set up parent chain for this child
        const self = this as unknown as Message<DataObject>;
        child.$setParentChain(key, self, childKey);
        // Recursively set up listener on child
        childUnsubscribes.push(child[SET_UPDATE_LISTENER](key, callback));
      } else if (
        child && typeof child === 'object' && SET_UPDATE_LISTENER in child
      ) {
        // Handle ImmutableArray/Map/Set
        type CollectionListener = {
          [SET_UPDATE_LISTENER]: (
            key: symbol,
            callback: UpdateListenerCallback,
            parent: Message<DataObject>,
            parentKey: string | number
          ) => Unsubscribe;
        };
        const collection = child as CollectionListener;
        const self = this as unknown as Message<DataObject>;
        childUnsubscribes.push(
          collection[SET_UPDATE_LISTENER](key, callback, self, childKey)
        );
      }
    }

    return () => {
      if (this.#listenerTokens.get(key) !== registrationToken) {
        return;
      }

      this.#listenerTokens.delete(key);
      this.#callbacks.delete(key);
      this.#parentChains.delete(key);

      for (const unsubscribe of childUnsubscribes) {
        unsubscribe();
      }
    };
  }

  /**
   * Retire listener ownership for a key from this subtree.
   * Cleanup is key-scoped and idempotent.
   */
  public [RETIRE_UPDATE_LISTENER](key: symbol): void {
    this.#listenerTokens.delete(key);
    this.#callbacks.delete(key);
    this.#parentChains.delete(key);

    for (const [, child] of this[GET_MESSAGE_CHILDREN]()) {
      if (Message.isMessage(child)) {
        child[RETIRE_UPDATE_LISTENER](key);
      } else if (
        child
        && typeof child === 'object'
        && RETIRE_UPDATE_LISTENER in child
        && typeof (child as { [RETIRE_UPDATE_LISTENER]?: unknown })[RETIRE_UPDATE_LISTENER] === 'function'
      ) {
        (
          child as {
            [RETIRE_UPDATE_LISTENER]: (listenerKey: symbol) => void;
          }
        )[RETIRE_UPDATE_LISTENER](key);
      }
    }
  }

  // ============================================
  // HYBRID APPROACH: Update Propagation
  // ============================================

  /**
   * Dispatch an update for a root-owned listener key.
   *
   * Ordering is intentional:
   * 1) Bind callback to replacement root.
   * 2) Retire callback ownership on current root.
   * 3) Invoke callback with replacement.
   */
  private $dispatchRootUpdate(
    key: symbol,
    replacement: Message<DataObject>
  ): void {
    const self = this as unknown as Message<DataObject>;
    if (replacement === self) {
      return;
    }

    const callback = this.#callbacks.get(key);
    if (!callback) {
      return;
    }

    // Transactional handoff: do not retire current root if bind fails.
    replacement[SET_UPDATE_LISTENER](key, callback);

    this.#callbacks.delete(key);
    this.#listenerTokens.delete(key);
    this.#parentChains.delete(key);

    callback(replacement);
  }

  /**
   * Propagate an update from a child to the root.
   * Walks up the parent chain, creating new messages at each level.
   */
  public [PROPAGATE_UPDATE](
    key: symbol,
    replacement: Message<DataObject>
  ): void {
    const chain = this.#parentChains.get(key);

    type ParentUpdater = {
      [WITH_CHILD]: (childKey: unknown, child: unknown) => unknown;
      [PROPAGATE_UPDATE]: (listenerKey: symbol, next: unknown) => void;
    };

    if (chain) {
      const parent = chain.parent.deref();
      if (!parent) {
        // A dead parent-chain entry should drop updates for this key.
        return;
      }
      if (
        typeof parent === 'object'
        && WITH_CHILD in parent
        && PROPAGATE_UPDATE in parent
      ) {
        // Works for both Message and immutable collections in the parent chain.
        const parentUpdater = parent as ParentUpdater;
        const newParent = parentUpdater[WITH_CHILD](chain.key, replacement);
        parentUpdater[PROPAGATE_UPDATE](key, newParent);
      }
      return;
    }

    // Reached root for this key.
    this.$dispatchRootUpdate(key, replacement);
  }

  /**
   * Called by setters to propagate updates for all registered listeners.
   */
  protected $propagateUpdates(replacement: this): void {
    // Propagate for all listener keys
    for (const key of this.#parentChains.keys()) {
      const r = replacement as unknown as Message<DataObject>;
      this[PROPAGATE_UPDATE](key, r);
    }
    // Dispatch root-owned listener keys (keys without parent chains).
    const rootKeys: symbol[] = [];
    for (const key of this.#callbacks.keys()) {
      if (!this.#parentChains.has(key)) {
        rootKeys.push(key);
      }
    }
    for (const key of rootKeys) {
      this.$dispatchRootUpdate(
        key,
        replacement as unknown as Message<DataObject>
      );
    }
  }

  get $typeName(): string {
    return this.#typeName;
  }

  /**
   * Check if this message has any active listeners (parent chains or callbacks).
   */
  private hasActiveListeners(): boolean {
    return this.#parentChains.size > 0 || this.#callbacks.size > 0;
  }

  /**
   * Create a copy of this message detached from the state tree.
   * Recursively detaches all child properties.
   *
   * The returned message has no listeners - calling setters on it will return
   * new instances but won't trigger React state updates. Use this to pass
   * data to components or functions that shouldn't be able to update state.
   *
   * Results are cached and reused as long as the cached message has no
   * listeners added to it.
   *
   * @example
   * // Pass detached data to a child component
   * <ChildComponent data={message.detach()} />
   *
   * @example
   * // Prevent accidental state updates in a callback
   * processData(message.detach());
   */
  detach(): this {
    // Return this if no listeners on this message or any children
    if (!this.hasActiveListeners()) {
      const descriptors = this.$getPropDescriptors();
      let childNeedsDetach = false;
      for (const descriptor of descriptors) {
        if (needsDetach(descriptor.getValue())) {
          childNeedsDetach = true;
          break;
        }
      }
      if (!childNeedsDetach) {
        return this;
      }
    }

    // Reuse cached detached message (detached messages never have listeners)
    if (this.#detachedCache) {
      return this.#detachedCache as this;
    }

    const descriptors = this.$getPropDescriptors();
    const entries: Record<string, unknown> = {};
    for (const descriptor of descriptors) {
      entries[String(descriptor.name)] = detachValue(descriptor.getValue());
    }

    const Constructor = this.constructor as new (props: T) => this;

    const detached = new Constructor(this.$fromEntries(entries));
    this.#detachedCache = detached;
    return detached;
  }

  // Immutable.js compatibility: provide a stable hash based on canonical
  // serialization.
  hashCode(): number {
    if (this.#hash !== undefined) {
      return this.#hash;
    }

    const serialized = this.serialize();
    const hash = hashString(serialized);

    // Messages are immutable; cache the hash even if the serialized string was too
    // large to retain.
    this.#hash = hash;

    return hash;
  }

  equals(other: unknown): boolean {
    if (this === other) {
      return true;
    }

    if (!other || typeof other !== 'object') {
      return false;
    }

    if (!Message.isMessage(other)) {
      return false;
    }

    // Check to make sure the two instances consider themselves the same type.
    // Only having the same data isn't enough.
    // Two messages with data `{value: 1}` may still be very different types of
    // messages with different uses.
    const ctorA = this.constructor as MessageConstructor<any>;
    const ctorB = (
      other as unknown as { constructor?: MessageConstructor<any> }
    ).constructor;
    if (!ctorA.$typeId || !ctorB?.$typeId || ctorA.$typeId !== ctorB.$typeId) {
      return false;
    }

    // Check to make sure the types have the same shape.
    // This can make two instances of the same message type unequal if they are
    // from different versions and the schema has changed.
    // TODO(nathan): Consider if we want to keep this.
    if (ctorA.$typeHash !== ctorB.$typeHash) {
      return false;
    }

    // Fast path: if hash codes differ, objects are definitely not equal
    if (
      typeof other.hashCode === 'function'
      && this.hashCode() !== other.hashCode()
    ) {
      return false;
    }

    // Hash codes match - need full comparison to confirm equality
    return typeof other.serialize === 'function'
      && this.serialize() === other.serialize();
  }

  /**
   * Returns the message data as a plain object.
   * Used internally by generated set() methods.
   */
  protected toData(): T {
    return this.$getPropDescriptors().reduce((acc, descriptor) => {
      acc[descriptor.name] = descriptor.getValue();
      return acc;
    }, {} as T);
  }

  toCompact(): string {
    const ctor = this.constructor as { $typeName?: string; name?: string };
    const typeName = ctor.$typeName ?? ctor.name ?? 'Message';
    throw new Error(`${typeName}.toCompact() is not implemented.`);
  }

  serialize(options?: SerializeOptions): string {
    const includeTag = options?.includeTag ?? false;

    const ctor = this.constructor as { $compact?: boolean; $compactTag?: string };
    if (ctor.$compact === true) {
      if (typeof (this as { toCompact?: () => string }).toCompact !== 'function') {
        throw new Error(`${this.#typeName}.toCompact() is not implemented.`);
      }
      const compactValue = (this as { toCompact: () => string }).toCompact();
      if (typeof compactValue !== 'string') {
        throw new Error(`${this.#typeName}.toCompact() must return a string.`);
      }
      const compactTag = ctor.$compactTag;
      if (compactTag) {
        return `:${serializeCompactTaggedValue(compactTag, compactValue)}`;
      }
      if (includeTag) {
        return `:${serializeTaggedMessage(this as Message<any>)}`;
      }
      return `:${JSON.stringify(compactValue)}`;
    }

    // Only use cache for non-tagged serialization (the common case)
    if (!includeTag && this.#serialized !== undefined) {
      return this.#serialized;
    }

    const descriptors = this.$getPropDescriptors();
    const entries: ObjectEntry[] = [];
    let expectedIndex = 1;

    for (const descriptor of descriptors) {
      const value = descriptor.getValue();
      const tagMessages = (descriptor.unionMessageTypes?.length ?? 0) > 0;
      const tagArrayElements = (descriptor.arrayElementUnionMessageTypes?.length ?? 0) > 0;
      const tagSetElements = (descriptor.setElementUnionMessageTypes?.length ?? 0) > 0;
      const tagMapKeys = (descriptor.mapKeyUnionMessageTypes?.length ?? 0) > 0;
      const tagMapValues = (descriptor.mapValueUnionMessageTypes?.length ?? 0) > 0;
      const forceQuotedStrings = descriptor.unionHasString === true;
      const forceQuotedArrayElements = descriptor.arrayElementUnionHasString === true;
      const forceQuotedSetElements = descriptor.setElementUnionHasString === true;
      const forceQuotedMapKeys = descriptor.mapKeyUnionHasString === true;
      const forceQuotedMapValues = descriptor.mapValueUnionHasString === true;

      if (descriptor.fieldNumber == null) {
        entries.push({
          key: String(descriptor.name),
          value,
          tagMessages,
          tagArrayElements,
          tagSetElements,
          tagMapKeys,
          tagMapValues,
          forceQuotedStrings,
          forceQuotedArrayElements,
          forceQuotedSetElements,
          forceQuotedMapKeys,
          forceQuotedMapValues,
        });
        continue;
      }

      if (value === undefined) {
        continue;
      }

      const fieldNumber = descriptor.fieldNumber;
      const shouldOmitKey = fieldNumber === expectedIndex;

      entries.push({
        key: shouldOmitKey ? null : String(fieldNumber),
        value,
        tagMessages,
        tagArrayElements,
        tagSetElements,
        tagMapKeys,
        tagMapValues,
        forceQuotedStrings,
        forceQuotedArrayElements,
        forceQuotedSetElements,
        forceQuotedMapKeys,
        forceQuotedMapValues,
      });

      expectedIndex = fieldNumber + 1;
    }

    const objectLiteral = serializeObjectLiteral(entries);
    const serialized = includeTag
      ? `:$${this.#typeName}${objectLiteral}`
      : `:${objectLiteral}`;

    // Only cache non-tagged serialization and avoid retaining excessively large payloads
    if (!includeTag && serialized.length <= Message.MAX_CACHED_SERIALIZE) {
      this.#serialized = serialized;
    }

    return serialized;
  }

  /**
   * Provide a JSON-friendly view; JSON.stringify(Message) will emit the plain
   * object form rather than the Propane cereal string.
   * This is primarily provided for debugging purposes.
   * Note that serialization via this method or JSON.stringify is lossy, and
   * all data cannot be reassemled to a Message.
   * Use `serialize()` for serialization.
   */
  toJSON(): unknown {
    return normalizeForJson(this.toData());
  }

  /**
   * Returns a canonical instance for this message.
   * If an equivalent message has been interned before, returns that instance.
   * Otherwise, interns this message and returns it.
   */
  protected intern(): this {
    // Messages with listeners should be detached before interning
    const interned = this.hasActiveListeners() ? this.detach() : this;

    const key = interned.serialize();
    const existing = internPool.get(key)?.deref();

    if (existing && existing.#typeTag === interned.#typeTag) {
      return existing as unknown as this;
    }

    const ref = new WeakRef<Message<any>>(interned);
    internPool.set(key, ref);
    registry.register(interned, key);
    return interned;
  }
}

export function parseCerealString(value: string) {
  if (!value.startsWith(':')) {
    throw new Error('Invalid Propane message. Expected ":" prefix.');
  }
  return new CerealParser(value, 1).parse();
}

class CerealParser {
  private cursor: number;
  private readonly source: string;
  private readonly length: number;

  constructor(source: string, start = 0) {
    this.source = source;
    this.cursor = start;
    this.length = source.length;
  }

  parse() {
    this.skipWhitespace();
    if (this.cursor >= this.length) {
      throw new Error('Unexpected end of input.');
    }
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.cursor < this.length) {
      throw new Error('Unexpected characters after end of message.');
    }
    return value;
  }

  private parseValue() {
    this.skipWhitespace();
    if (this.cursor >= this.length) {
      throw new Error('Unexpected end of input.');
    }

    const char = this.source[this.cursor] ?? '';

    if (isTinyTagChar(char) && this.peek(1) === '"') {
      return this.parseTaggedCompactString();
    }

    switch (char) {
      case '{':
        return this.parseObject();
      case '[':
        return this.parseArray();
      case '"':
        return this.parseString();
      case 'M':
        if (this.peek(1) === '[') {
          return this.parseMap();
        }
        return this.parseBareString();
      case 'S':
        if (this.peek(1) === '[') {
          return this.parseSet();
        }
        return this.parseBareString();
      case '$':
        return this.parseTaggedMessage();
      default:
        // Number, Boolean, Null, Undefined, or Bare String
        return this.parsePrimitiveOrBareString();
    }
  }

  private parseObject(): DataObject {
    this.expect('{');
    const result: DataObject = {};
    let expectedIndex = 1;

    while (this.cursor < this.length) {
      this.skipWhitespace();
      if (this.match('}')) {
        break;
      }

      // Parse potential key or value
      const token = this.parseValue();

      this.skipWhitespace();
      if (this.match(':')) {
        // It was a key. Verify it's a valid key type (String or Number).
        if (typeof token !== 'string' && typeof token !== 'number') {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          throw new TypeError(`Invalid object key: ${String(token)}`);
        }
        const key = String(token);
        const value = this.parseValue();
        result[key] = value as DataValue;

        // Update expectedIndex if numeric
        const numKey = Number(key);
        if (Number.isInteger(numKey) && numKey >= 1) {
          expectedIndex = numKey + 1;
        }
      } else {
        // Implicit key
        const key = String(expectedIndex);
        result[key] = token as DataValue;
        expectedIndex++;
      }

      this.skipWhitespace();
      if (this.match('}')) {
        break;
      }
      this.expect(',');
    }

    return result;
  }

  private parseArray(): DataArray {
    this.expect('[');
    const result: DataArray = [];

    while (this.cursor < this.length) {
      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }

      result.push(this.parseValue() as DataValue);

      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }
      this.expect(',');
    }

    return result;
  }

  private parseMap(): ImmutableMap<unknown, unknown> {
    this.expect('M');
    this.expect('[');
    // Map entries are arrays [key, value]
    const entries: [unknown, unknown][] = [];

    while (this.cursor < this.length) {
      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }

      const entry = this.parseValue();
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error('Invalid map entry. Expected [key, value].');
      }
      entries.push(entry as [unknown, unknown]);

      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }
      this.expect(',');
    }

    return new ImmutableMap(entries);
  }

  private parseSet(): ImmutableSet<unknown> {
    this.expect('S');
    this.expect('[');
    const values: unknown[] = [];

    while (this.cursor < this.length) {
      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }

      values.push(this.parseValue());

      this.skipWhitespace();
      if (this.match(']')) {
        break;
      }
      this.expect(',');
    }

    return new ImmutableSet(values);
  }

  private parseTaggedMessage(): TaggedMessageData {
    this.expect('$');
    // Tag name is a bare string until '{' or '"'
    const start = this.cursor;
    while (
      this.cursor < this.length
      && this.source[this.cursor] !== '{'
      && this.source[this.cursor] !== '"'
    ) {
      this.cursor++;
    }
    const typeName = this.source.slice(start, this.cursor).trim();
    if (!typeName) {
      throw new Error('Invalid tagged message: missing type name.');
    }
    const next = this.source[this.cursor];
    if (next === '{') {
      const data = this.parseObject();
      return { $tag: typeName, $data: data };
    }
    if (next === '"') {
      const data = this.parseString();
      return { $tag: typeName, $data: data };
    }
    throw new Error('Invalid tagged message: expected "{" or string literal.');
  }

  private parseTaggedCompactString(): string {
    const tag = this.source[this.cursor] ?? '';
    this.cursor += 1;
    const value = this.parseString();
    return `${tag}${value}`;
  }

  private parseString(): string {
    const start = this.cursor;
    this.expect('"');
    while (this.cursor < this.length) {
      const char = this.source[this.cursor];
      if (char === '\\') {
        this.cursor += 2; // Skip escaped char
        continue;
      }
      if (char === '"') {
        this.cursor++; // Consume closing quote
        const jsonString = this.source.slice(start, this.cursor);
        return JSON.parse(jsonString) as string;
      }
      this.cursor++;
    }
    throw new Error('Unterminated string literal.');
  }

  private parseBareString(): string {
    const start = this.cursor;
    while (this.cursor < this.length) {
      const char = this.source[this.cursor];
      // Stop at delimiters
      if (
        char === ':'
        || char === ','
        || char === '}'
        || char === ']'
      ) {
        break;
      }
      this.cursor++;
    }
    return this.source.slice(start, this.cursor).trim();
  }

  private parsePrimitiveOrBareString() {
    const start = this.cursor;
    // Read until delimiter
    while (this.cursor < this.length) {
      const char = this.source[this.cursor];
      if (
        char === ':'
        || char === ','
        || char === '}'
        || char === ']'
      ) {
        break;
      }
      this.cursor++;
    }
    const token = this.source.slice(start, this.cursor).trim();

    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'null') return null;
    if (token === 'undefined') return undefined;

    // Check for BigInt
    if (token.endsWith('n') && /^-?\d+n$/.test(token)) {
      return BigInt(token.slice(0, -1));
    }

    // Check for Number
    const num = Number(token);
    if (!Number.isNaN(num) && NUMERIC_STRING_RE.test(token)) {
      return num;
    }

    if (isTaggedCompactToken(token)) {
      return token;
    }

    // Bare string
    if (!canUseBareString(token)) {
      throw new Error(`Invalid literal token: ${token}`);
    }

    return token;
  }

  private skipWhitespace() {
    while (this.cursor < this.length && (this.source[this.cursor] ?? '') <= ' ') {
      this.cursor++;
    }
  }

  private peek(offset = 0): string {
    return this.source[this.cursor + offset] ?? '';
  }

  private match(char: string): boolean {
    if (this.source[this.cursor] === char) {
      this.cursor++;
      return true;
    }
    return false;
  }

  private expect(char: string) {
    // eslint-disable-next-line unicorn/prefer-regexp-test -- this.match is a method, not String#match
    if (!this.match(char)) {
      throw new Error(`Expected '${char}' at position ${this.cursor}`);
    }
  }
}

function canUseBareString(value: string) {
  return (
    SAFE_TOKEN_RE.test(value)
    && !RESERVED_STRINGS.has(value)
    && !NUMERIC_STRING_RE.test(value)
  );
}

function isTinyTagChar(value: string): boolean {
  return TINY_TAG_RE.test(value);
}

function canUseCompactToken(value: string): boolean {
  return value.length > 0 && SAFE_TOKEN_RE.test(value);
}

function isTaggedCompactToken(token: string): boolean {
  if (token.length < 2) return false;
  const tag = token[0] ?? '';
  if (!isTinyTagChar(tag)) return false;
  return canUseCompactToken(token.slice(1));
}

function serializeCompactTaggedValue(tag: string, value: string): string {
  return canUseCompactToken(value)
    ? `${tag}${value}`
    : `${tag}${JSON.stringify(value)}`;
}

// Simple deterministic string hash (Java-style)
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = hash * 31 + value.charCodeAt(i) | 0;
  }
  return hash;
}

function serializePrimitive(
  value: unknown,
  ancestors = new Set<object>(),
  tags: SerializeTagOptions = {}
): string {
  if (value === undefined) {
    return 'undefined';
  }

  const {
    tagMessage = false,
    tagArrayElements = false,
    tagSetElements = false,
    tagMapKeys = false,
    tagMapValues = false,
    forceQuotedStrings = false,
    forceQuotedArrayElements = false,
    forceQuotedSetElements = false,
    forceQuotedMapKeys = false,
    forceQuotedMapValues = false,
  } = tags;

  if (tagMessage && Message.isMessage(value)) {
    return serializeTaggedMessage(value as Message<DataObject>, ancestors);
  }

  if ((tagArrayElements || forceQuotedArrayElements)
    && (Array.isArray(value) || ImmutableArray.isInstance(value))) {
    return serializeArrayLiteral(
      Array.isArray(value) ? value : [...value],
      ancestors,
      {
        tagMessageElements: tagArrayElements,
        forceQuotedStrings: forceQuotedArrayElements,
      }
    );
  }

  if ((tagSetElements || forceQuotedSetElements) && isSetValue(value)) {
    return serializeSetLiteral(
      value,
      ancestors,
      {
        tagMessageElements: tagSetElements,
        forceQuotedStrings: forceQuotedSetElements,
      }
    );
  }

  if ((tagMapKeys || tagMapValues || forceQuotedMapKeys || forceQuotedMapValues)
    && isMapValue(value)) {
    return serializeMapLiteral(value, ancestors, {
      tagMessageKeys: tagMapKeys,
      tagMessageValues: tagMapValues,
      forceQuotedKeys: forceQuotedMapKeys,
      forceQuotedValues: forceQuotedMapValues,
    });
  }

  if (Array.isArray(value) || ImmutableArray.isInstance(value)) {
    return serializeArrayLiteral(
      Array.isArray(value) ? value : [...value],
      ancestors
    );
  }

  if (isMapValue(value)) {
    return serializeMapLiteral(value, ancestors, {
      forceQuotedKeys: forceQuotedMapKeys,
      forceQuotedValues: forceQuotedMapValues,
    });
  }

  if (isSetValue(value)) {
    return serializeSetLiteral(value, ancestors);
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (Message.isMessage(value)) {
    const ctor = value.constructor as { $compact?: boolean; $compactTag?: string };
    if (ctor.$compact === true) {
      if (typeof (value as { toCompact?: () => string }).toCompact !== 'function') {
        throw new Error('Compact message is missing toCompact().');
      }
      const compactValue = (value as { toCompact: () => string }).toCompact();
      if (typeof compactValue !== 'string') {
        throw new Error('Compact message toCompact() must return a string.');
      }
      const compactTag = ctor.$compactTag;
      if (compactTag) {
        return serializeCompactTaggedValue(compactTag, compactValue);
      }
      return JSON.stringify(compactValue);
    }
    interface DescriptorGetter {
      $getPropDescriptors(): MessagePropDescriptor<DataObject>[];
    }
    const descriptors = (value as unknown as DescriptorGetter)
      .$getPropDescriptors();
    const entries = descriptors.map((d) => ({
      key: String(d.name),
      value: d.getValue(),
      tagMessages: (d.unionMessageTypes?.length ?? 0) > 0,
      tagArrayElements: (d.arrayElementUnionMessageTypes?.length ?? 0) > 0,
      tagSetElements: (d.setElementUnionMessageTypes?.length ?? 0) > 0,
      tagMapKeys: (d.mapKeyUnionMessageTypes?.length ?? 0) > 0,
      tagMapValues: (d.mapValueUnionMessageTypes?.length ?? 0) > 0,
      forceQuotedStrings: d.unionHasString === true,
      forceQuotedArrayElements: d.arrayElementUnionHasString === true,
      forceQuotedSetElements: d.setElementUnionHasString === true,
      forceQuotedMapKeys: d.mapKeyUnionHasString === true,
      forceQuotedMapValues: d.mapValueUnionHasString === true,
    }));
    return serializeObjectLiteral(entries, ancestors);
  }

  if (value && typeof value === 'object') {
    return serializeObjectLiteral(value as DataObject, ancestors);
  }

  if (typeof value === 'string') {
    if (!forceQuotedStrings && canUseBareString(value)) {
      return value;
    }
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function serializeArrayLiteral(
  values: unknown[],
  ancestors = new Set<object>(),
  {
    tagMessageElements = false,
    forceQuotedStrings = false,
  }: { tagMessageElements?: boolean; forceQuotedStrings?: boolean } = {}
): string {
  // Track the array itself as an ancestor during serialization
  if (ancestors.has(values)) {
    throw new Error('Circular reference detected during serialization');
  }
  ancestors.add(values);
  const result = `[${values
    .map((value) => serializePrimitive(value, ancestors, {
      tagMessage: tagMessageElements,
      forceQuotedStrings,
    }))
    .join(',')}]`;
  ancestors.delete(values);
  return result;
}

function serializeMapLiteral(
  entries: ReadonlyMap<unknown, unknown>,
  ancestors = new Set<object>(),
  {
    tagMessageKeys = false,
    tagMessageValues = false,
    forceQuotedKeys = false,
    forceQuotedValues = false,
  }: {
    tagMessageKeys?: boolean;
    tagMessageValues?: boolean;
    forceQuotedKeys?: boolean;
    forceQuotedValues?: boolean;
  } = {}
): string {
  const serialized = [...entries.entries()].map(([key, value]) => {
    const serializedKey = serializePrimitive(key, ancestors, {
      tagMessage: tagMessageKeys,
      forceQuotedStrings: forceQuotedKeys,
    });
    const serializedValue = serializePrimitive(value, ancestors, {
      tagMessage: tagMessageValues,
      forceQuotedStrings: forceQuotedValues,
    });
    return `[${serializedKey},${serializedValue}]`;
  });
  return `M[${serialized.join(',')}]`;
}

function serializeSetLiteral(
  values: ReadonlySet<unknown>,
  ancestors = new Set<object>(),
  {
    tagMessageElements = false,
    forceQuotedStrings = false,
  }: { tagMessageElements?: boolean; forceQuotedStrings?: boolean } = {}
): string {
  return `S${serializeArrayLiteral([...values.values()], ancestors, {
    tagMessageElements,
    forceQuotedStrings,
  })}`;
}

function serializeTaggedMessage(
  message: Message<any>,
  ancestors = new Set<object>()
): string {
  const typeName = message.$typeName;
  const ctor = message.constructor as { $compact?: boolean; $compactTag?: string };
  if (ctor.$compact === true) {
    if (typeof (message as { toCompact?: () => string }).toCompact !== 'function') {
      throw new Error(`Compact message ${typeName} is missing toCompact().`);
    }
    const compactValue = (message as { toCompact: () => string }).toCompact();
    if (typeof compactValue !== 'string') {
      throw new Error(`Compact message ${typeName} toCompact() must return a string.`);
    }
    const compactTag = ctor.$compactTag;
    if (compactTag) {
      return serializeCompactTaggedValue(compactTag, compactValue);
    }
    return `$${typeName}${JSON.stringify(compactValue)}`;
  }
  interface DescriptorGetter {
    $getPropDescriptors(): MessagePropDescriptor<any>[];
  }
  const descriptors = (message as unknown as DescriptorGetter)
    .$getPropDescriptors();

  const entries: ObjectEntry[] = [];
  let expectedIndex = 1;

  for (const descriptor of descriptors) {
    const value = descriptor.getValue();
    const tagMessages = (descriptor.unionMessageTypes?.length ?? 0) > 0;
    const tagArrayElements = (descriptor.arrayElementUnionMessageTypes?.length ?? 0) > 0;
    const tagSetElements = (descriptor.setElementUnionMessageTypes?.length ?? 0) > 0;
    const tagMapKeys = (descriptor.mapKeyUnionMessageTypes?.length ?? 0) > 0;
    const tagMapValues = (descriptor.mapValueUnionMessageTypes?.length ?? 0) > 0;
    const forceQuotedStrings = descriptor.unionHasString === true;
    const forceQuotedArrayElements = descriptor.arrayElementUnionHasString === true;
    const forceQuotedSetElements = descriptor.setElementUnionHasString === true;
    const forceQuotedMapKeys = descriptor.mapKeyUnionHasString === true;
    const forceQuotedMapValues = descriptor.mapValueUnionHasString === true;

    if (descriptor.fieldNumber == null) {
      entries.push({
        key: String(descriptor.name),
        value,
        tagMessages,
        tagArrayElements,
        tagSetElements,
        tagMapKeys,
        tagMapValues,
        forceQuotedStrings,
        forceQuotedArrayElements,
        forceQuotedSetElements,
        forceQuotedMapKeys,
        forceQuotedMapValues,
      });
      continue;
    }

    if (value === undefined) {
      continue;
    }

    const fieldNumber = descriptor.fieldNumber;
    const shouldOmitKey = fieldNumber === expectedIndex;

    entries.push({
      key: shouldOmitKey ? null : String(fieldNumber),
      value,
      tagMessages,
      tagArrayElements,
      tagSetElements,
      tagMapKeys,
      tagMapValues,
      forceQuotedStrings,
      forceQuotedArrayElements,
      forceQuotedSetElements,
      forceQuotedMapKeys,
      forceQuotedMapValues,
    });

    expectedIndex = fieldNumber + 1;
  }

  return `$${typeName}${serializeObjectLiteral(entries, ancestors)}`;
}

function isMapValue(value: unknown): value is ReadonlyMap<unknown, unknown> {
  return value instanceof Map || ImmutableMap.isInstance(value);
}

function isSetValue(value: unknown): value is ReadonlySet<unknown> {
  return value instanceof Set || ImmutableSet.isInstance(value);
}



interface ObjectEntry {
  key: string | null;
  value: unknown;
  /** When true, Message values should be serialized with type tags */
  tagMessages?: boolean;
  /** When true, array elements that are Messages should be tagged */
  tagArrayElements?: boolean;
  /** When true, set elements that are Messages should be tagged */
  tagSetElements?: boolean;
  /** When true, map keys that are Messages should be tagged */
  tagMapKeys?: boolean;
  /** When true, map values that are Messages should be tagged */
  tagMapValues?: boolean;
  /** When true, string values should be quoted */
  forceQuotedStrings?: boolean;
  /** When true, array elements that are strings should be quoted */
  forceQuotedArrayElements?: boolean;
  /** When true, set elements that are strings should be quoted */
  forceQuotedSetElements?: boolean;
  /** When true, map keys that are strings should be quoted */
  forceQuotedMapKeys?: boolean;
  /** When true, map values that are strings should be quoted */
  forceQuotedMapValues?: boolean;
}

interface SerializeTagOptions {
  tagMessage?: boolean;
  tagArrayElements?: boolean;
  tagSetElements?: boolean;
  tagMapKeys?: boolean;
  tagMapValues?: boolean;
  forceQuotedStrings?: boolean;
  forceQuotedArrayElements?: boolean;
  forceQuotedSetElements?: boolean;
  forceQuotedMapKeys?: boolean;
  forceQuotedMapValues?: boolean;
}

function serializeObjectLiteral(
  recordOrEntries: DataObject | ObjectEntry[],
  ancestors = new Set<object>()
): string {
  // Check for circular reference on the source object (not entry arrays)
  if (!Array.isArray(recordOrEntries)) {
    if (ancestors.has(recordOrEntries)) {
      throw new Error('Circular reference detected during serialization');
    }
    ancestors.add(recordOrEntries);
  }

  const entries: ObjectEntry[] = Array.isArray(recordOrEntries)
    ? recordOrEntries
    : Object.entries(recordOrEntries).map(([key, value]) => ({
      key,
      value,
      tagMessages: undefined,
      tagArrayElements: undefined,
      tagSetElements: undefined,
      tagMapKeys: undefined,
      tagMapValues: undefined,
    }));

  const serialized = entries.map(({
    key,
    value,
    tagMessages,
    tagArrayElements,
    tagSetElements,
    tagMapKeys,
    tagMapValues,
    forceQuotedStrings,
    forceQuotedArrayElements,
    forceQuotedSetElements,
    forceQuotedMapKeys,
    forceQuotedMapValues,
  }) => {
    const serializedValue = serializePrimitive(value, ancestors, {
      tagMessage: tagMessages,
      tagArrayElements,
      tagSetElements,
      tagMapKeys,
      tagMapValues,
      forceQuotedStrings,
      forceQuotedArrayElements,
      forceQuotedSetElements,
      forceQuotedMapKeys,
      forceQuotedMapValues,
    });
    return key == null
      ? serializedValue
      : `${serializeObjectKey(key)}:${serializedValue}`;
  });

  // Remove from ancestors after processing (allows shared references)
  if (!Array.isArray(recordOrEntries)) {
    ancestors.delete(recordOrEntries);
  }

  return `{${serialized.join(',')}}`;
}

function serializeObjectKey(key: string): string {
  if (canUseBareString(key) || NUMERIC_STRING_RE.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}

export {REACT_LISTENER_KEY, SET_UPDATE_LISTENER, RETIRE_UPDATE_LISTENER, FROM_ROOT, REGISTER_PATH, PROPAGATE_UPDATE, WITH_CHILD, GET_MESSAGE_CHILDREN, EQUALS_FROM_ROOT} from './symbols.js';
