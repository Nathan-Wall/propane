/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ImmutableArrayBuffer, ImmutableArray } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_ArrayBufferMessage = Symbol("ArrayBufferMessage");
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static $typeId = "tests/array-buffer.pmsg#ArrayBufferMessage";
  static $typeHash = "sha256:f0b28f05c5a160bf31fd4fdb4ed61d37cac5b0ae4003adf89c8870c95c23665d";
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
    this.#data = props ? (ImmutableArrayBuffer.isInstance(ImmutableArrayBuffer.isInstance(props.data) ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data as ArrayBufferView) : new ImmutableArrayBuffer(props.data as ArrayBuffer)) ? ImmutableArrayBuffer.isInstance(props.data) ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data as ArrayBufferView) : new ImmutableArrayBuffer(props.data as ArrayBuffer) : new ImmutableArrayBuffer(ImmutableArrayBuffer.isInstance(props.data) ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data as ArrayBufferView) : new ImmutableArrayBuffer(props.data as ArrayBuffer), options)) as ImmutableArrayBuffer : new ImmutableArrayBuffer();
    this.#extra = props ? ((props.extra === undefined ? undefined : ImmutableArrayBuffer.isInstance(props.extra) ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer)) === undefined ? props.extra === undefined ? undefined : ImmutableArrayBuffer.isInstance(props.extra) ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer) : ImmutableArrayBuffer.isInstance(props.extra === undefined ? undefined : ImmutableArrayBuffer.isInstance(props.extra) ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer)) ? props.extra === undefined ? undefined : ImmutableArrayBuffer.isInstance(props.extra) ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer) : new ImmutableArrayBuffer(props.extra === undefined ? undefined : ImmutableArrayBuffer.isInstance(props.extra) ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer), options)) as ImmutableArrayBuffer : undefined;
    this.#chunks = props ? (props.chunks === undefined || props.chunks === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.chunks as Iterable<unknown>).map(v => ImmutableArrayBuffer.isInstance(v) ? v : new ImmutableArrayBuffer(v as ImmutableArrayBuffer.Value)))) as ImmutableArray<ImmutableArrayBuffer> : new ImmutableArray();
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
      getValue: () => this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
    const dataArrayBufferValue = typeof dataValue === "string" && ImmutableArrayBuffer.$compact === true ? ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && dataValue.startsWith(ImmutableArrayBuffer.$compactTag) ? dataValue.slice(ImmutableArrayBuffer.$compactTag.length) : dataValue, options) as any : ImmutableArrayBuffer.isInstance(dataValue) ? dataValue : ArrayBuffer.isView(dataValue) ? new ImmutableArrayBuffer(dataValue as ArrayBufferView) : new ImmutableArrayBuffer(dataValue as ArrayBuffer);
    props.data = dataArrayBufferValue as ImmutableArrayBuffer.Value;
    const extraValue = entries["3"] === undefined ? entries["extra"] : entries["3"];
    const extraNormalized = extraValue === null ? undefined : extraValue;
    const extraArrayBufferValue = extraNormalized === undefined ? undefined : typeof extraNormalized === "string" && ImmutableArrayBuffer.$compact === true ? ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && extraNormalized.startsWith(ImmutableArrayBuffer.$compactTag) ? extraNormalized.slice(ImmutableArrayBuffer.$compactTag.length) : extraNormalized, options) as any : ImmutableArrayBuffer.isInstance(extraNormalized) ? extraNormalized : ArrayBuffer.isView(extraNormalized) ? new ImmutableArrayBuffer(extraNormalized as ArrayBufferView) : new ImmutableArrayBuffer(extraNormalized as ArrayBuffer);
    props.extra = extraArrayBufferValue as ImmutableArrayBuffer.Value;
    const chunksValue = entries["4"] === undefined ? entries["chunks"] : entries["4"];
    if (chunksValue === undefined) throw new Error("Missing required property \"chunks\".");
    const chunksArrayValue = chunksValue === undefined || chunksValue === null ? new ImmutableArray() : chunksValue as object instanceof ImmutableArray ? chunksValue : new ImmutableArray(chunksValue as Iterable<unknown>);
    const chunksArrayValueConverted = chunksArrayValue === undefined || chunksArrayValue === null ? chunksArrayValue : (chunksArrayValue as ImmutableArray<unknown> | unknown[]).map(element => typeof element === "string" && ImmutableArrayBuffer.$compact === true ? ImmutableArrayBuffer.fromCompact(ImmutableArrayBuffer.$compactTag && element.startsWith(ImmutableArrayBuffer.$compactTag) ? element.slice(ImmutableArrayBuffer.$compactTag.length) : element, options) as any : element);
    if (!(chunksArrayValueConverted as object instanceof ImmutableArray || Array.isArray(chunksArrayValueConverted))) throw new Error("Invalid value for property \"chunks\".");
    props.chunks = chunksArrayValueConverted as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>;
    return props as ArrayBufferMessage.Data;
  }
  static from(value: ArrayBufferMessage.Value): ArrayBufferMessage {
    return ArrayBufferMessage.isInstance(value) ? value : new ArrayBufferMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "data":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: child as ImmutableArrayBuffer.Value,
          extra: this.#extra as ImmutableArrayBuffer.Value,
          chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
        }) as this;
      case "extra":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: this.#data as ImmutableArrayBuffer.Value,
          extra: child as ImmutableArrayBuffer.Value,
          chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
        }) as this;
      case "chunks":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: this.#data as ImmutableArrayBuffer.Value,
          extra: this.#extra as ImmutableArrayBuffer.Value,
          chunks: child as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  fillChunk(value: ImmutableArrayBuffer, start?: number, end?: number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ImmutableArrayBuffer[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  pushChunk(...values: ImmutableArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
  setChunks(value: (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: value as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  setData(value: ImmutableArrayBuffer.Value) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: (ImmutableArrayBuffer.isInstance(value) ? value : new ImmutableArrayBuffer(value)) as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  setExtra(value: ImmutableArrayBuffer.Value | undefined) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: (value === undefined ? value : ImmutableArrayBuffer.isInstance(value) ? value : new ImmutableArrayBuffer(value)) as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: value,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
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
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  sortChunks(compareFn?: (a: ImmutableArrayBuffer, b: ImmutableArrayBuffer) => number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ImmutableArrayBuffer[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  spliceChunk(start: number, deleteCount?: number, ...items: ImmutableArrayBuffer[]) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  unsetExtra() {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      chunks: this.#chunks as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
  unshiftChunk(...values: ImmutableArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...values, ...chunksArray];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer.Value,
      extra: this.#extra as ImmutableArrayBuffer.Value,
      chunks: chunksNext as (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>
    }) as this);
  }
}
export namespace ArrayBufferMessage {
  export type Data = {
    id: number;
    data: ImmutableArrayBuffer.Value;
    extra?: ImmutableArrayBuffer.Value | undefined;
    chunks: (ImmutableArrayBuffer | ArrayBuffer)[] | Iterable<ImmutableArrayBuffer | ArrayBuffer>;
  };
  export type Value = ArrayBufferMessage | ArrayBufferMessage.Data;
}
