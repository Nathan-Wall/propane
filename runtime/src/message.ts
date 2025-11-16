export type MessagePropDescriptor<T extends object> = {
  name: keyof T;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
};

export type Cereal<T extends object> = T | unknown[];

type MessageConstructor<T extends object> = {
  new (props: T): Message<T>;
  prototype: Message<T>;
};

export abstract class Message<T extends object> {
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

  private preserialize(): Cereal<T> {
    const descriptors = this.$getPropDescriptors();
    const useOrderedArray = shouldUseOrderedSerialization(descriptors);

    if (useOrderedArray) {
      return descriptors.reduce<unknown[]>((ordered, descriptor) => {
        const idx = (descriptor.fieldNumber as number) - 1;
        ordered[idx] = descriptor.getValue();
        return ordered;
      }, []);
    }

    return this.cerealizeWithDescriptors(descriptors);
  }

  serialize(): string {
    const payload = this.preserialize();
  const serialized = Array.isArray(payload)
    ? serializeArrayLiteral(payload)
    : serializeObjectLiteral(payload);
    return `:${serialized}`;
  }

  static deserialize<T extends object>(
    this: MessageConstructor<T>,
    message: string
  ): Message<T> {
    const payload = parseCerealString<T>(message);
    const normalizedEntries = normalizeCereal(payload);
    const proto = this.prototype as Message<T>;
    const props = proto.$fromEntries(normalizedEntries);
    return new this(props);
  }
}

export function parseCerealString<T extends object>(value: string): Cereal<T> {
  if (!value.startsWith(':')) {
    throw new Error('Invalid Propane message. Expected ":" prefix.');
  }

  const payload = value.slice(1);

  if (payload.trim().startsWith('[')) {
    return parseArrayLiteral(payload);
  }

  const parsed = JSON.parse(payload);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid Propane message payload.');
  }

  return parsed as Cereal<T>;
}

function normalizeCereal<T extends object>(cereal: Cereal<T>) {
  if (Array.isArray(cereal)) {
    return cereal.reduce<Record<string, unknown>>((entries, value, index) => {
      entries[String(index + 1)] = value;
      return entries;
    }, {});
  }

  return cereal as Record<string, unknown>;
}

function shouldUseOrderedSerialization<T extends object>(
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
    if (
      SIMPLE_STRING_RE.test(value) &&
      !RESERVED_STRINGS.has(value) &&
      !NUMERIC_STRING_RE.test(value)
    ) {
      return value;
    }
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function serializeArrayLiteral(values: unknown[]): string {
  return `[${values.map((value) => serializePrimitive(value)).join(',')}]`;
}

function serializeMapLiteral(entries: Map<unknown, unknown>): string {
  const serialized = [...entries.entries()].map(([key, value]) =>
    serializeArrayLiteral([key, value])
  );
  return `[${serialized.join(',')}]`;
}

function isMapValue(value: unknown): value is Map<unknown, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    value instanceof Map ||
    Object.prototype.toString.call(value) === MAP_OBJECT_TAG
  );
}

function serializeObjectLiteral(record: Record<string, unknown>): string {
  const entries = Object.entries(record).map(
    ([key, value]) => `${JSON.stringify(key)}:${serializePrimitive(value)}`
  );
  return `{${entries.join(',')}}`;
}

function parseArrayLiteral(literal: string): unknown[] {
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

function parseLiteralToken(token: string): unknown {
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
    return JSON.parse(trimmed);
  }

  if (trimmed.startsWith('"')) {
    return JSON.parse(trimmed);
  }

  if (SIMPLE_STRING_RE.test(trimmed)) {
    return trimmed;
  }

  throw new Error(`Invalid literal token: ${trimmed}`);
}
