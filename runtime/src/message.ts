export type MessagePropDescriptor<T extends object> = {
  name: keyof T & string;
  fieldNumber: number | null;
  getValue: () => T[keyof T];
};

export type Cereal<T extends object> = Partial<T> & Record<string, unknown>;

type MessageConstructor<T extends object> = {
  new (props: T): Message<T>;
  decerealize(cereal: Cereal<T>): Message<T>;
  prototype: Message<T>;
};

export abstract class Message<T extends object> {
  protected abstract $getPropDescriptors(): MessagePropDescriptor<T>[];
  protected abstract $fromEntries(entries: Record<string, unknown>): T;

  cerealize(): Cereal<T> {
    const result: Cereal<T> = {} as Cereal<T>;
    const writable = result as Record<string, unknown>;

    for (const descriptor of this.$getPropDescriptors()) {
      const value = descriptor.getValue();
      if (descriptor.fieldNumber != null) {
        writable[String(descriptor.fieldNumber)] = value;
      } else {
        writable[descriptor.name] = value as T[keyof T];
      }
    }

    return result;
  }

  serialize(): string {
    return `:${JSON.stringify(this.cerealize())}`;
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
    const proto = this.prototype as Message<T>;
    const props = proto.$fromEntries(cereal as Record<string, unknown>);
    return new this(props);
  }
}

export function parseCerealString<T extends object>(value: string): Cereal<T> {
  if (!value.startsWith(':')) {
    throw new Error('Invalid Propane message. Expected ":" prefix.');
  }

  const json = value.slice(1);
  const parsed = JSON.parse(json);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid Propane message payload.');
  }

  return parsed as Cereal<T>;
}
