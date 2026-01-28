/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray, ImmutableArrayBuffer, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_ArrayBufferMessage = Symbol("ArrayBufferMessage");
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static $typeId = "tests/array-buffer.pmsg#ArrayBufferMessage";
  static $typeHash = "sha256:c722f9ec54cdd2ab8cd197b01e5de0f50750d370f456f7272470b32108d71102";
  static $instanceTag = Symbol.for("propane:message:" + ArrayBufferMessage.$typeId);
  static readonly $typeName = "ArrayBufferMessage";
  static EMPTY: ArrayBufferMessage;
  #id!: number;
  #data!: ImmutableArrayBuffer;
  #extra!: ImmutableArrayBuffer | undefined;
  #chunks!: ImmutableArray<ImmutableArrayBuffer>;
  constructor(props?: ArrayBufferMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ArrayBufferMessage.EMPTY) return ArrayBufferMessage.EMPTY;
    super(TYPE_TAG_ArrayBufferMessage, "ArrayBufferMessage");
    this.#id = (props ? props.id : 0) as number;
    this.#data = props ? props.data instanceof ImmutableArrayBuffer ? props.data : new ImmutableArrayBuffer(props.data, options) : new ImmutableArrayBuffer();
    this.#extra = props ? props.extra === undefined ? props.extra : props.extra instanceof ImmutableArrayBuffer ? props.extra : new ImmutableArrayBuffer(props.extra, options) : undefined;
    this.#chunks = props ? (props.chunks === undefined || props.chunks === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.chunks as Iterable<unknown>).map(v => v instanceof ImmutableArrayBuffer ? v : new ImmutableArrayBuffer(v as ImmutableArrayBuffer.Value)))) as ImmutableArray<ImmutableArrayBuffer> : new ImmutableArray();
    if (!props) ArrayBufferMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayBufferMessage.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "data",
      fieldNumber: 2,
      getValue: () => this.#data as ImmutableArrayBuffer.Value
    }, {
      name: "extra",
      fieldNumber: 3,
      getValue: () => this.#extra as ImmutableArrayBuffer.Value
    }, {
      name: "chunks",
      fieldNumber: 4,
      getValue: () => this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ArrayBufferMessage.Data {
    const props = {} as Partial<ArrayBufferMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const dataValue = entries["2"] === undefined ? entries["data"] : entries["2"];
    if (dataValue === undefined) throw new Error("Missing required property \"data\".");
    const dataMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableArrayBuffer.$compact === true) {
        result = ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && value.startsWith(ImmutableArrayBuffer.$compactTag) ? value.slice(ImmutableArrayBuffer.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableArrayBuffer") {
            if (typeof value.$data === "string") {
              if (ImmutableArrayBuffer.$compact === true) {
                result = ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && value.$data.startsWith(ImmutableArrayBuffer.$compactTag) ? value.$data.slice(ImmutableArrayBuffer.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableArrayBuffer.");
              }
            } else {
              result = new ImmutableArrayBuffer(ImmutableArrayBuffer.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableArrayBuffer.");
          }
        } else {
          if (value instanceof ImmutableArrayBuffer) {
            result = value;
          } else {
            result = new ImmutableArrayBuffer(value as ImmutableArrayBuffer.Value, options);
          }
        }
      }
      return result;
    })(dataValue);
    props.data = dataMessageValue;
    const extraValue = entries["3"] === undefined ? entries["extra"] : entries["3"];
    const extraNormalized = extraValue === null ? undefined : extraValue;
    const extraMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableArrayBuffer.$compact === true) {
        result = ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && value.startsWith(ImmutableArrayBuffer.$compactTag) ? value.slice(ImmutableArrayBuffer.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableArrayBuffer") {
            if (typeof value.$data === "string") {
              if (ImmutableArrayBuffer.$compact === true) {
                result = ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && value.$data.startsWith(ImmutableArrayBuffer.$compactTag) ? value.$data.slice(ImmutableArrayBuffer.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableArrayBuffer.");
              }
            } else {
              result = new ImmutableArrayBuffer(ImmutableArrayBuffer.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableArrayBuffer.");
          }
        } else {
          if (value instanceof ImmutableArrayBuffer) {
            result = value;
          } else {
            result = new ImmutableArrayBuffer(value as ImmutableArrayBuffer.Value, options);
          }
        }
      }
      if (value === undefined) {
        result = value;
      }
      return result;
    })(extraNormalized);
    props.extra = extraMessageValue;
    const chunksValue = entries["4"] === undefined ? entries["chunks"] : entries["4"];
    if (chunksValue === undefined) throw new Error("Missing required property \"chunks\".");
    const chunksArrayValue = chunksValue === undefined || chunksValue === null ? new ImmutableArray() : chunksValue as object instanceof ImmutableArray ? chunksValue : new ImmutableArray(chunksValue as Iterable<unknown>);
    const chunksArrayValueConverted = chunksArrayValue === undefined || chunksArrayValue === null ? chunksArrayValue : (chunksArrayValue as ImmutableArray<unknown> | unknown[]).map(element => typeof element === "string" && ImmutableArrayBuffer.$compact === true ? ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && element.startsWith(ImmutableArrayBuffer.$compactTag) ? element.slice(ImmutableArrayBuffer.$compactTag.length) : element, options) as any : element);
    if (!(chunksArrayValueConverted as object instanceof ImmutableArray || Array.isArray(chunksArrayValueConverted))) throw new Error("Invalid value for property \"chunks\".");
    props.chunks = chunksArrayValueConverted as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>;
    return props as ArrayBufferMessage.Data;
  }
  static from(value: ArrayBufferMessage.Value): ArrayBufferMessage {
    return value instanceof ArrayBufferMessage ? value : new ArrayBufferMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "data":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: child as ImmutableArrayBuffer.Value,
          extra: this.#extra as ImmutableArrayBuffer.Value,
          chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
        }) as this;
      case "extra":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: this.#data as ImmutableArrayBuffer.Value,
          extra: child as ImmutableArrayBuffer.Value,
          chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
        }) as this;
      case "chunks":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: this.#data as ImmutableArrayBuffer.Value,
          extra: this.#extra as ImmutableArrayBuffer.Value,
          chunks: child as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["data", this.#data] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["extra", this.#extra] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["chunks", this.#chunks] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ArrayBufferMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for ArrayBufferMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ArrayBufferMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): number {
    return this.#id;
  }
  get data(): ImmutableArrayBuffer {
    return this.#data;
  }
  get extra(): ImmutableArrayBuffer | undefined {
    return this.#extra;
  }
  get chunks(): ImmutableArray<ImmutableArrayBuffer> {
    return this.#chunks;
  }
  copyWithinChunks(target: number, start: number, end?: number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  fillChunk(value: ArrayBuffer, start?: number, end?: number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ArrayBuffer[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  popChunk() {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.pop();
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  pushChunk(...values: ArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  reverseChunks() {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  set(updates: Partial<SetUpdates<ArrayBufferMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)(data) as this);
  }
  setChunks(value: (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: value as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setData(value: ImmutableArrayBuffer.Value) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: (value instanceof ImmutableArrayBuffer ? value : new ImmutableArrayBuffer(value)) as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setExtra(value: ImmutableArrayBuffer.Value | undefined) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: (value === undefined ? value : value instanceof ImmutableArrayBuffer ? value : new ImmutableArrayBuffer(value)) as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: value,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  shiftChunk() {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.shift();
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  sortChunks(compareFn?: (a: ArrayBuffer, b: ArrayBuffer) => number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ArrayBuffer[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  spliceChunk(start: number, deleteCount?: number, ...items: ArrayBuffer[]) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  unsetExtra() {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  unshiftChunk(...values: ArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...values, ...chunksArray];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
}
export namespace ArrayBufferMessage {
  export type Data = {
    id: number;
    data: ImmutableArrayBuffer.Value;
    extra?: ImmutableArrayBuffer.Value | undefined;
    chunks: (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>;
  };
  export type Value = ArrayBufferMessage | ArrayBufferMessage.Data;
}
