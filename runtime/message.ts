// @ts-nocheck
import { parseJson } from './common/json/parse.js';
import { normalizeForJson } from './common/json/stringify.js';
import { ImmutableMap } from './common/map/immutable.js';
import { ImmutableSet } from './common/set/immutable.js';
import { ImmutableArray } from './common/array/immutable.js';
import { ImmutableArrayBuffer } from './common/data/immutable-array-buffer.js';
import { ImmutableDate } from './common/time/date.js';
import { ImmutableUrl } from './common/web/url.js';
import { ADD_UPDATE_LISTENER } from './symbols.js';

const SIMPLE_STRING_RE = /^[A-Za-z0-9 _-]+$/;
const RESERVED_STRINGS = new Set(['true', 'false', 'null', 'undefined']);
const NUMERIC_STRING_RE = /^-?\d+(?:\.\d+)?$/;
const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';
const DATE_OBJECT_TAG = '[object Date]';
const IMMUTABLE_DATE_OBJECT_TAG = '[object ImmutableDate]';
const URL_OBJECT_TAG = '[object URL]';
const IMMUTABLE_URL_OBJECT_TAG = '[object ImmutableUrl]';
const ARRAY_BUFFER_OBJECT_TAG = '[object ArrayBuffer]';
const IMMUTABLE_ARRAY_BUFFER_OBJECT_TAG = '[object ImmutableArrayBuffer]';
const DATE_PREFIX = 'D';
const URL_PREFIX = 'U';
const ARRAY_BUFFER_PREFIX = 'B';

export type DataPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;
export type DataValue =
  | DataPrimitive
  | Date
  | ImmutableDate
  | URL
  | ImmutableUrl
  | ArrayBuffer
  | ImmutableArrayBuffer
  | DataObject
  | DataArray;
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
  $data: Record<string, unknown>;
}

export function isTaggedMessageData(
  value: unknown
): value is TaggedMessageData {
  return (
    value !== null
    && typeof value === 'object'
    && '$tag' in value
    && '$data' in value
    && typeof (value as TaggedMessageData).$tag === 'string'
  );
}

export { ADD_UPDATE_LISTENER };

type Listener<T extends DataObject> = (val: Message<T>) => void;

export interface MessagePropDescriptor<T extends object> {
  name: keyof T;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
  /** When present, indicates the value should be tagged for union discrimination */
  unionMessageTypes?: string[];
}

type MessageFromEntries<T extends DataObject> = Message<T> & {
  $fromEntries(entries: Record<string, unknown>): T;
};

interface MessageConstructor<T extends DataObject> {
  new(props: T, listeners?: Set<Listener<T>>): Message<T>;
  prototype: MessageFromEntries<T>;
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

export abstract class Message<T extends DataObject> {
  readonly #typeTag: symbol;
  readonly #typeName: string;
  protected readonly $listeners: Set<Listener<T>>;
  #childUnsubscribes: (() => void)[] = [];
  static readonly MAX_CACHED_SERIALIZE = 64 * 1024; // 64KB
  #serialized?: string;
  #hash?: number;

  protected abstract $getPropDescriptors(): MessagePropDescriptor<T>[];
  protected abstract $fromEntries(entries: Record<string, unknown>): T;
  protected abstract $enableChildListeners(): void;

  protected constructor(
    typeTag: symbol,
    typeName: string,
    listeners?: Set<Listener<T>>
  ) {
    this.#typeTag = typeTag;
    this.#typeName = typeName;
    this.$listeners = listeners ?? new Set();
  }

  [ADD_UPDATE_LISTENER](listener: (val: this) => void): { unsubscribe: () => void } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const l = listener as unknown as Listener<T>;
    if (this.$listeners.size === 0) {
      this.$enableChildListeners();
    }
    this.$listeners.add(l);
    return {
      unsubscribe: () => {
        this.$listeners.delete(l);
        if (this.$listeners.size === 0) {
          this.$disableChildListeners();
        }
      },
    };
  }

  protected $addChildUnsubscribe(fn: () => void): void {
    this.#childUnsubscribes.push(fn);
  }

  protected $disableChildListeners(): void {
    for (const unsubscribe of this.#childUnsubscribes) {
      unsubscribe();
    }
    this.#childUnsubscribes = [];
  }

  protected $update(value: this): this {
    for (const listener of [...this.$listeners]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener(value as unknown as Message<T>);
    }
    return value;
  }

  get $typeName(): string {
    return this.#typeName;
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

    if (!(other instanceof Message)) {
      return false;
    }

    if (other.#typeTag !== this.#typeTag) {
      return false;
    }

    // Fast path: if hash codes differ, objects are definitely not equal
    if (this.hashCode() !== other.hashCode()) {
      return false;
    }

    // Hash codes match - need full comparison to confirm equality
    return this.serialize() === other.serialize();
  }

  private cerealize(): T {
    return this.cerealizeWithDescriptors(this.$getPropDescriptors());
  }

  private cerealizeWithDescriptors(descriptors: MessagePropDescriptor<T>[]): T {
    return descriptors.reduce((acc, descriptor) => {
      acc[descriptor.name] = descriptor.getValue();
      return acc;
    }, {} as T);
  }

  serialize(): string {
    if (this.#serialized !== undefined) {
      return this.#serialized;
    }

    const descriptors = this.$getPropDescriptors();
    const entries: ObjectEntry[] = [];
    let expectedIndex = 1;

    for (const descriptor of descriptors) {
      const value = descriptor.getValue();
      const tagMessages = (descriptor.unionMessageTypes?.length ?? 0) > 0;

      if (descriptor.fieldNumber == null) {
        entries.push({ key: String(descriptor.name), value, tagMessages });
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
      });

      expectedIndex = fieldNumber + 1;
    }

    const serialized = `:${serializeObjectLiteral(entries)}`;

    // Avoid retaining excessively large payloads to protect memory usage.
    if (serialized.length <= Message.MAX_CACHED_SERIALIZE) {
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
    return normalizeForJson(this.cerealize());
  }

  static deserialize<T extends DataObject>(
    this: MessageConstructor<T>,
    message: string
  ): Message<T> {
    const payload = parseCerealString(message);
    const proto = this.prototype;
    const props = proto.$fromEntries(payload);
    return new this(props);
  }

  /**
   * Returns a canonical instance for this message.
   * If an equivalent message has been interned before, returns that instance.
   * Otherwise, interns this message and returns it.
   */
  private intern(): this {
    const key = this.serialize();
    const existing = internPool.get(key)?.deref();

    if (existing && existing.#typeTag === this.#typeTag) {
      return existing as this;
    }

    internPool.set(key, new WeakRef(this));
    registry.register(this, key);
    return this;
  }
}

export function parseCerealString(value: string) {
  if (!value.startsWith(':')) {
    throw new Error('Invalid Propane message. Expected ":" prefix.');
  }

  const payload = value.slice(1);

  const trimmed = payload.trim();

  if (trimmed.startsWith('{')) {
    return parseObjectLiteral(payload);
  }

  const parsed = parseJson(payload);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid Propane message payload.');
  }

  return parsed;
}

function canUseBareString(value: string) {
  return (
    SIMPLE_STRING_RE.test(value)
    && !RESERVED_STRINGS.has(value)
    && !NUMERIC_STRING_RE.test(value)
  );
}


function jsonStringifyDate(value: Date | ImmutableDate): string {
  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }
  return JSON.stringify(value.toString());
}

function jsonStringifyUrl(value: URL): string {
  return JSON.stringify(value.toString());
}

function serializePrimitive(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }

  if (Array.isArray(value) || value instanceof ImmutableArray) {
    return serializeArrayLiteral(Array.isArray(value) ? value : [...value]);
  }

  if (isArrayBufferValue(value)) {
    return serializeArrayBufferLiteral(unwrapArrayBuffer(value));
  }

  if (isUrlValue(value)) {
    return serializeUrlLiteral(value);
  }

  if (isMapValue(value)) {
    return serializeMapLiteral(value);
  }

  if (isSetValue(value)) {
    return serializeSetLiteral(value);
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (value instanceof Message) {
    const descriptors = (
      value as { $getPropDescriptors(): MessagePropDescriptor<DataObject>[] }
    ).$getPropDescriptors();
    const entries = descriptors.map((d) => ({
      key: String(d.name),
      value: d.getValue(),
    }));
    return serializeObjectLiteral(entries);
  }

  if (value && typeof value === 'object') {
    if (isDateValue(value)) {
      return `${DATE_PREFIX}${jsonStringifyDate(value)}`;
    }
    return serializeObjectLiteral(value as Record<string, unknown>);
  }

  if (typeof value === 'string') {
    if (canUseBareString(value)) {
      return value;
    }
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function serializeArrayLiteral(values: unknown[]): string {
  return `[${values.map((value) => serializePrimitive(value)).join(',')}]`;
}

function serializeMapLiteral(entries: ReadonlyMap<unknown, unknown>): string {
  const serialized = [...entries.entries()].map(([key, value]) =>
    serializeArrayLiteral([key, value])
  );
  return `M[${serialized.join(',')}]`;
}

function serializeSetLiteral(values: ReadonlySet<unknown>): string {
  return `S${serializeArrayLiteral([...values.values()])}`;
}

function serializeTaggedMessage(message: Message<DataObject>): string {
  const typeName = message.$typeName;
  const descriptors = (
    message as { $getPropDescriptors(): MessagePropDescriptor<DataObject>[] }
  ).$getPropDescriptors();

  const entries: ObjectEntry[] = [];
  let expectedIndex = 1;

  for (const descriptor of descriptors) {
    const value = descriptor.getValue();
    const tagMessages = (descriptor.unionMessageTypes?.length ?? 0) > 0;

    if (descriptor.fieldNumber == null) {
      entries.push({ key: String(descriptor.name), value, tagMessages });
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
    });

    expectedIndex = fieldNumber + 1;
  }

  return `$${typeName}${serializeObjectLiteral(entries)}`;
}

function isMapValue(value: unknown): value is ReadonlyMap<unknown, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof Map
    || value instanceof ImmutableMap
    || Object.prototype.toString.call(value) === MAP_OBJECT_TAG
    || Object.prototype.toString.call(value) === IMMUTABLE_MAP_OBJECT_TAG
  );
}

function isSetValue(value: unknown): value is ReadonlySet<unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof Set
    || value instanceof ImmutableSet
    || Object.prototype.toString.call(value) === '[object Set]'
    || Object.prototype.toString.call(value) === '[object ImmutableSet]'
  );
}

function isDateValue(value: unknown): value is Date {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tag = Object.prototype.toString.call(value);
  return (
    value instanceof Date
    || value instanceof ImmutableDate
    || tag === DATE_OBJECT_TAG
    || tag === IMMUTABLE_DATE_OBJECT_TAG
  );
}

function isUrlValue(value: unknown): value is URL {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tag = Object.prototype.toString.call(value);
  return (
    value instanceof URL
    || value instanceof ImmutableUrl
    || tag === URL_OBJECT_TAG
    || tag === IMMUTABLE_URL_OBJECT_TAG
  );
}

function isArrayBufferValue(
  value: unknown
): value is ArrayBuffer | ImmutableArrayBuffer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof ArrayBuffer
    || value instanceof ImmutableArrayBuffer
    || Object.prototype.toString.call(value) === ARRAY_BUFFER_OBJECT_TAG
    || Object.prototype.toString.call(value)
      === IMMUTABLE_ARRAY_BUFFER_OBJECT_TAG
  );
}

function serializeArrayBufferLiteral(buffer: ArrayBuffer): string {
  return `${ARRAY_BUFFER_PREFIX}${JSON.stringify(arrayBufferToBase64(buffer))}`;
}

function parseArrayBufferLiteral(token: string): ArrayBuffer {
  const jsonPortion = token.slice(ARRAY_BUFFER_PREFIX.length);
  const parsed = parseJson(jsonPortion);

  if (typeof parsed !== 'string') {
    throw new TypeError(`Invalid ArrayBuffer literal token: ${token}`);
  }

  return base64ToArrayBuffer(parsed);
}

function unwrapArrayBuffer(
  value: ArrayBuffer | ImmutableArrayBuffer
): ArrayBuffer {
  return value instanceof ImmutableArrayBuffer
    ? value.toArrayBuffer()
    : value;
}

function parseTaggedMessage(token: string): TaggedMessageData {
  // Format: $TypeName{...}
  // Find the opening brace to separate type name from data
  const braceIndex = token.indexOf('{');
  if (braceIndex === -1) {
    throw new TypeError(`Invalid tagged message token: ${token}`);
  }

  const typeName = token.slice(1, braceIndex); // Skip the '$' prefix
  const dataStr = token.slice(braceIndex);
  const data = parseObjectLiteral(dataStr);

  return { $tag: typeName, $data: data };
}

function serializeUrlLiteral(url: URL): string {
  return `${URL_PREFIX}${jsonStringifyUrl(url)}`;
}

function parseUrlLiteral(token: string): URL {
  const jsonPortion = token.slice(URL_PREFIX.length);
  const parsed = parseJson(jsonPortion);

  if (typeof parsed !== 'string') {
    throw new TypeError(`Invalid URL literal token: ${token}`);
  }

  try {
    return new URL(parsed);
  } catch {
    throw new TypeError(`Invalid URL value: ${parsed}`);
  }
}

interface ObjectEntry {
  key: string | null;
  value: unknown;
  /** When true, Message values should be serialized with type tags */
  tagMessages?: boolean;
}

function serializeObjectLiteral(
  recordOrEntries: Record<string, unknown> | ObjectEntry[]
): string {
  const entries = Array.isArray(recordOrEntries)
    ? recordOrEntries
    : Object.entries(recordOrEntries).map(([key, value]) => ({ key, value }));

  const serialized = entries.map(({ key, value, tagMessages }) => {
    const serializedValue = tagMessages && value instanceof Message
      ? serializeTaggedMessage(value as Message<DataObject>)
      : serializePrimitive(value);
    return key == null
      ? serializedValue
      : `${serializeObjectKey(key)}:${serializedValue}`;
  });
  return `{${serialized.join(',')}}`;
}

function serializeObjectKey(key: string): string {
  if (canUseBareString(key) || NUMERIC_STRING_RE.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}

function parseArrayLiteral(literal: string): DataArray {
  const trimmed = literal.trim();

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error('Invalid array literal.');
  }

  if (trimmed === '[]') {
    return [];
  }

  const content = trimmed.slice(1, -1);
  const tokens = splitTopLevel(content);
  return tokens.map((token) => parseLiteralToken(token));
}

function splitTopLevel(content: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let inString = false;
  let escaping = false;
  let start = 0;

  const push = (end: number) => {
    tokens.push(content.slice(start, end).trim());
    start = end + 1;
  };

  // We care about exact code-unit positions here, not Unicode code points.
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[' || char === '{') {
      depth += 1;
      continue;
    }

    if (char === ']' || char === '}') {
      depth -= 1;
      continue;
    }

    if (char === ',' && depth === 0) {
      push(i);
    }
  }

  tokens.push(content.slice(start).trim());
  return tokens.filter((token) => token.length > 0 || token === '');
}

function parseLiteralToken(token: string) {
  const trimmed = token.trim();

  if (trimmed.startsWith('M[')) {
    const parsedArray = parseArrayLiteral(trimmed.slice(1));
    // TODO: Add asserts where there's a cast here.
    const entries = parsedArray.map((entry) => entry as [MapKey, DataValue]);
    return new ImmutableMap(entries);
  }

  if (trimmed.startsWith('S[')) {
    const parsedArray = parseArrayLiteral(trimmed.slice(1));
    return new ImmutableSet(parsedArray);
  }

  if (!trimmed || trimmed === 'undefined') {
    return undefined;
  }

  if (trimmed === 'null') {
    return null;
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (trimmed.startsWith(`${URL_PREFIX}"`)) {
    return parseUrlLiteral(trimmed);
  }

  if (trimmed.startsWith(`${ARRAY_BUFFER_PREFIX}"`)) {
    return parseArrayBufferLiteral(trimmed);
  }

  const num = Number(trimmed);
  if (!Number.isNaN(num)) {
    return num;
  }

  if (trimmed.startsWith('[')) {
    return parseArrayLiteral(trimmed);
  }

  if (trimmed.startsWith('$')) {
    return parseTaggedMessage(trimmed);
  }

  if (trimmed.startsWith('{')) {
    return parseObjectLiteral(trimmed);
  }

  if (trimmed.startsWith('"') || trimmed.startsWith(`${DATE_PREFIX}"`)) {
    return parseStringOrDate(trimmed);
  }

  if (SIMPLE_STRING_RE.test(trimmed)) {
    return trimmed;
  }

  throw new Error(`Invalid literal token: ${trimmed}`);
}

function parseObjectLiteral(literal: string): Record<string, unknown> {
  const trimmed = literal.trim();

  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    throw new Error('Invalid object literal.');
  }

  if (trimmed === '{}') {
    return {};
  }

  const content = trimmed.slice(1, -1);
  const tokens = splitTopLevel(content);

  let expectedIndex = 1;

  return tokens.reduce<Record<string, unknown>>((entries, token) => {
    if (!token) {
      return entries;
    }

    const split = splitKeyValue(token);

    if (!split) {
      const key = String(expectedIndex);
      const value = parseLiteralToken(token);
      entries[key] = value;
      expectedIndex += 1;
      return entries;
    }

    const [keyToken, valueToken] = split;
    const key = parseObjectKey(keyToken);
    const value = parseLiteralToken(valueToken);
    entries[key] = value;

    const numericKey = parseNumericIndex(key);
    if (numericKey != null) {
      expectedIndex = numericKey + 1;
    }
    return entries;
  }, {});
}

function splitKeyValue(entry: string): [string, string] | null {
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = 0; i < entry.length; i += 1) {
    const char = entry[i];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      depth += 1;
      continue;
    }

    if (char === '}' || char === ']') {
      depth -= 1;
      continue;
    }

    if (char === ':' && depth === 0) {
      const key = entry.slice(0, i).trim();
      const value = entry.slice(i + 1).trim();

      if (!key || !value) {
        throw new Error(`Invalid object entry: ${entry}`);
      }

      return [key, value];
    }
  }

  return null;
}

function parseObjectKey(token: string): string {
  const trimmed = token.trim();

  if (!trimmed) {
    throw new Error('Invalid object key.');
  }

  if (trimmed.startsWith('"')) {
    const parsed = parseJson(trimmed);

    if (typeof parsed !== 'string') {
      throw new TypeError(`Invalid object key literal: ${token}`);
    }

    return parsed;
  }

  if (canUseBareString(trimmed) || NUMERIC_STRING_RE.test(trimmed)) {
    return trimmed;
  }

  throw new Error(`Invalid object key literal: ${token}`);
}

function parseNumericIndex(key: string): number | null {
  const num = Number(key);

  if (!Number.isInteger(num) || num < 1) {
    return null;
  }

  return num;
}

// Simple deterministic string hash (Java-style)
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line unicorn/prefer-code-point
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function parseStringOrDate(token: string): string | Date {
  if (token.startsWith(`${DATE_PREFIX}"`)) {
    const jsonPortion = token.slice(DATE_PREFIX.length);
    const parsed = parseJson(jsonPortion);

    if (typeof parsed !== 'string') {
      throw new TypeError(`Invalid date literal token: ${token}`);
    }

    const date = new Date(parsed);

    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Invalid date value: ${parsed}`);
    }

    return date;
  }

  const parsedString = parseJson(token);

  if (typeof parsedString !== 'string') {
    throw new TypeError(`Invalid string literal token: ${token}`);
  }

  return parsedString;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }

  if (typeof btoa === 'function') {
    let binary = '';
    const view = new Uint8Array(buffer);
    for (const byte of view) {
      // eslint-disable-next-line unicorn/prefer-code-point
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  throw new Error('Base64 encoding is not supported in this environment.');
}

function base64ToArrayBuffer(encoded: string): ArrayBuffer {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(encoded, 'base64');
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  if (typeof atob === 'function') {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      // eslint-disable-next-line unicorn/prefer-code-point
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  throw new Error('Base64 decoding is not supported in this environment.');
}
