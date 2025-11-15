export type MessagePropDescriptor<T extends object> = {
  name: keyof T & string;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
};

export type Cereal<T extends object> =
  | (Partial<T> & Record<string, unknown>)
  | unknown[];

type MessageConstructor<T extends object> = {
  new (props: T): Message<T>;
  decerealize(cereal: Cereal<T>): Message<T>;
  prototype: Message<T>;
};

export abstract class Message<T extends object> {
  protected abstract $getPropDescriptors(): MessagePropDescriptor<T>[];
  protected abstract $fromEntries(entries: Record<string, unknown>): T;

  cerealize(): Cereal<T> {
    const descriptors = this.$getPropDescriptors();
    const useOrderedArray = shouldUseOrderedSerialization(descriptors);

    if (useOrderedArray) {
      return descriptors.reduce<unknown[]>((ordered, descriptor) => {
        const idx = (descriptor.fieldNumber as number) - 1;
        ordered[idx] = descriptor.getValue();
        return ordered;
      }, []);
    }

    return descriptors.reduce<Partial<T> & Record<string, unknown>>(
      (acc, descriptor) => {
        acc[descriptor.name] = descriptor.getValue() as T[keyof T];
        return acc;
      },
      {} as Partial<T> & Record<string, unknown>
    );
  }

  serialize(): string {
    const payload = this.cerealize();
    const serialized = Array.isArray(payload)
      ? serializeArrayLiteral(payload)
      : JSON.stringify(payload);
    return `:${serialized}`;
  }

  static deserialize<T extends object>(
    this: MessageConstructor<T>,
    message: string
  ): Message<T> {
    const payload = parseCerealString<T>(message);
    return this.decerealize(payload);
  }

  static decerealize<T extends object>(
    this: MessageConstructor<T>,
    cereal: Cereal<T>
  ): Message<T> {
    const normalizedEntries = normalizeCereal(cereal);
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

function serializeArrayLiteral(values: unknown[]): string {
  return `[${values
    .map((value) =>
      value === undefined ? 'undefined' : JSON.stringify(value)
    )
    .join(',')}]`;
}

function parseArrayLiteral(literal: string): unknown[] {
  const trimmed = literal.trim();

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error('Invalid array literal.');
  }

  if (trimmed === '[]') {
    return [];
  }

  const values: unknown[] = [];
  let token = '';
  let depth = 0;
  let inString = false;
  let escape = false;

  const pushToken = () => {
    const content = token.trim();
    if (!content) {
      values.push(undefined);
    } else if (content === 'undefined') {
      values.push(undefined);
    } else {
      values.push(JSON.parse(content));
    }
    token = '';
  };

  for (let i = 1; i < trimmed.length - 1; i += 1) {
    const char = trimmed[i];

    if (inString) {
      token += char;
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      token += char;
      continue;
    }

    if (char === '[' || char === '{') {
      depth += 1;
      token += char;
      continue;
    }

    if (char === ']' || char === '}') {
      depth -= 1;
      token += char;
      continue;
    }

    if (char === ',' && depth === 0) {
      pushToken();
      continue;
    }

    token += char;
  }

  pushToken();

  return values;
}
