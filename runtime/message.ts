import { parseJson } from '../common/json/parse';
import { ImmutableMap } from './immutable-map';

export type DataPrimitive = string | number | boolean | null | undefined;
export type DataValue = DataPrimitive | DataObject | DataArray;
export type DataArray = DataValue[];
export interface DataObject {
  [key: string]: DataValue;
}

export interface MessagePropDescriptor<T extends object> {
  name: keyof T;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
}

export type Cereal<T extends object> = T | DataArray;

interface MessageConstructor<T extends DataObject> {
  new (props: T): Message<T>;
  prototype: Message<T>;
}

export abstract class Message<T extends DataObject> {
  protected abstract $getPropDescriptors(): MessagePropDescriptor<T>[];
  protected abstract $fromEntries(entries: Record<string, unknown>): T;

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
    const descriptors = this.$getPropDescriptors();
    const useOrderedArray = shouldUseOrderedSerialization(descriptors);

    if (useOrderedArray) {
      const ordered = descriptors.reduce((acc, descriptor) => {
        const idx = descriptor.fieldNumber! - 1;
        acc[idx] = descriptor.getValue();
        return acc;
      }, [] as DataArray);
      return `:${serializeArrayLiteral(ordered)}`;
    }

    const entries: ObjectEntry[] = [];
    let expectedIndex = 1;

    for (const descriptor of descriptors) {
      const value = descriptor.getValue();
      if (descriptor.fieldNumber == null) {
        entries.push({ key: String(descriptor.name), value });
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
      });

      expectedIndex = fieldNumber + 1;
    }

    return `:${serializeObjectLiteral(entries)}`;
  }

  static deserialize<T extends DataObject>(
    this: MessageConstructor<T>,
    message: string
  ): Message<T> {
    const payload = parseCerealString(message);
    const normalizedEntries = normalizeCereal(payload);
    const proto = this.prototype;
    const props = proto.$fromEntries(normalizedEntries);
    return new this(props);
  }
}

export function parseCerealString(value: string) {
  if (!value.startsWith(':')) {
    throw new Error('Invalid Propane message. Expected ":" prefix.');
  }

  const payload = value.slice(1);

  const trimmed = payload.trim();

  if (trimmed.startsWith('[')) {
    return parseArrayLiteral(payload);
  }

  if (trimmed.startsWith('{')) {
    return parseObjectLiteral(payload);
  }

  const parsed = parseJson(payload);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid Propane message payload.');
  }

  return parsed;
}

function normalizeCereal<T extends DataObject>(cereal: Cereal<T>) {
  if (Array.isArray(cereal)) {
    return cereal.reduce<Record<string, unknown>>((entries, value, index) => {
      entries[String(index + 1)] = value;
      return entries;
    }, {});
  }

  return cereal as Record<string, unknown>;
}

function shouldUseOrderedSerialization<T extends DataObject>(
  descriptors: MessagePropDescriptor<T>[]
) {
  if (!descriptors.length) {
    return false;
  }

  const numbers = new Set<number>();
  let max = 0;

  for (const descriptor of descriptors) {
    if (descriptor.fieldNumber == null) {
      return false;
    }

    const num = descriptor.fieldNumber;
    numbers.add(num);
    if (num > max) {
      max = num;
    }
  }

  if (numbers.size !== descriptors.length) {
    return false;
  }

  for (let i = 1; i <= max; i += 1) {
    if (!numbers.has(i)) {
      return false;
    }
  }

  return true;
}

const SIMPLE_STRING_RE = /^[A-Za-z0-9 _-]+$/;
const RESERVED_STRINGS = new Set(['true', 'false', 'null', 'undefined']);
const NUMERIC_STRING_RE = /^-?\d+(?:\.\d+)?$/;
const MAP_OBJECT_TAG = '[object Map]';
const IMMUTABLE_MAP_OBJECT_TAG = '[object ImmutableMap]';

function canUseBareString(value: string) {
  return (
    SIMPLE_STRING_RE.test(value) &&
    !RESERVED_STRINGS.has(value) &&
    !NUMERIC_STRING_RE.test(value)
  );
}

function serializePrimitive(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }

  if (Array.isArray(value)) {
    return serializeArrayLiteral(value);
  }

  if (isMapValue(value)) {
    return serializeMapLiteral(value);
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
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
  return `[${serialized.join(',')}]`;
}

function isMapValue(value: unknown): value is ReadonlyMap<unknown, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof Map ||
    value instanceof ImmutableMap ||
    Object.prototype.toString.call(value) === MAP_OBJECT_TAG ||
    Object.prototype.toString.call(value) === IMMUTABLE_MAP_OBJECT_TAG
  );
}

interface ObjectEntry {
  key: string | null;
  value: unknown;
}

function serializeObjectLiteral(
  recordOrEntries: Record<string, unknown> | ObjectEntry[]
): string {
  const entries = Array.isArray(recordOrEntries)
    ? recordOrEntries
    : Object.entries(recordOrEntries).map(([key, value]) => ({ key, value }));
  const serialized = entries.map(({ key, value }) =>
    key == null
      ? serializePrimitive(value)
      : `${serializeObjectKey(key)}:${serializePrimitive(value)}`
  );
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

function parseLiteralToken(token: string): DataValue {
  const trimmed = token.trim();

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

  const num = Number(trimmed);
  if (!Number.isNaN(num)) {
    return num;
  }

  if (trimmed.startsWith('[')) {
    return parseArrayLiteral(trimmed);
  }

  if (trimmed.startsWith('{')) {
    return parseObjectLiteral(trimmed);
  }

  if (trimmed.startsWith('"')) {
    const parsedString = parseJson(trimmed);
    if (typeof parsedString !== 'string') {
      throw new Error(`Invalid string literal token: ${trimmed}`);
    }
    return parsedString;
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
      throw new Error(`Invalid object key literal: ${token}`);
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
