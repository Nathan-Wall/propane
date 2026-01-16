/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray, ImmutableArrayBuffer, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_ArrayBufferMessage = Symbol("ArrayBufferMessage");
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static $typeId = "tests/array-buffer.pmsg#ArrayBufferMessage";
  static $typeHash = "sha256:e35459963c3a4b82622e7d715c7323e2dde5a8311a9a3b0b4cfda1b036e455bd";
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
    this.#data = props ? (props.data instanceof ImmutableArrayBuffer ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data as ArrayBufferView) : new ImmutableArrayBuffer(props.data as ArrayBuffer)) as ImmutableArrayBuffer : new ImmutableArrayBuffer();
    this.#extra = props ? (props.extra === undefined ? undefined : props.extra instanceof ImmutableArrayBuffer ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra as ArrayBufferView) : new ImmutableArrayBuffer(props.extra as ArrayBuffer)) as ImmutableArrayBuffer : undefined;
    this.#chunks = props ? (props.chunks === undefined || props.chunks === null ? new ImmutableArray() : props.chunks as object instanceof ImmutableArray ? props.chunks : new ImmutableArray(props.chunks as Iterable<unknown>)) as ImmutableArray<ImmutableArrayBuffer> : new ImmutableArray();
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
      getValue: () => this.#data as ImmutableArrayBuffer | ArrayBuffer
    }, {
      name: "extra",
      fieldNumber: 3,
      getValue: () => this.#extra as ImmutableArrayBuffer | ArrayBuffer
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
    const dataArrayBufferValue = dataValue instanceof ImmutableArrayBuffer ? dataValue : ArrayBuffer.isView(dataValue) ? new ImmutableArrayBuffer(dataValue as ArrayBufferView) : new ImmutableArrayBuffer(dataValue as ArrayBuffer);
    if (!(dataArrayBufferValue as object instanceof ArrayBuffer || dataArrayBufferValue as object instanceof ImmutableArrayBuffer)) throw new Error("Invalid value for property \"data\".");
    props.data = dataArrayBufferValue as ImmutableArrayBuffer | ArrayBuffer;
    const extraValue = entries["3"] === undefined ? entries["extra"] : entries["3"];
    const extraNormalized = extraValue === null ? undefined : extraValue;
    const extraArrayBufferValue = extraNormalized === undefined ? undefined : extraNormalized instanceof ImmutableArrayBuffer ? extraNormalized : ArrayBuffer.isView(extraNormalized) ? new ImmutableArrayBuffer(extraNormalized as ArrayBufferView) : new ImmutableArrayBuffer(extraNormalized as ArrayBuffer);
    if (extraArrayBufferValue !== undefined && !(extraArrayBufferValue as object instanceof ArrayBuffer || extraArrayBufferValue as object instanceof ImmutableArrayBuffer)) throw new Error("Invalid value for property \"extra\".");
    props.extra = extraArrayBufferValue as ImmutableArrayBuffer | ArrayBuffer;
    const chunksValue = entries["4"] === undefined ? entries["chunks"] : entries["4"];
    if (chunksValue === undefined) throw new Error("Missing required property \"chunks\".");
    const chunksArrayValue = chunksValue === undefined || chunksValue === null ? new ImmutableArray() : chunksValue as object instanceof ImmutableArray ? chunksValue : new ImmutableArray(chunksValue as Iterable<unknown>);
    if (!((chunksArrayValue as object instanceof ImmutableArray || Array.isArray(chunksArrayValue)) && [...(chunksArrayValue as Iterable<unknown>)].every(element => element as object instanceof ArrayBuffer || element as object instanceof ImmutableArrayBuffer))) throw new Error("Invalid value for property \"chunks\".");
    props.chunks = chunksArrayValue as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>;
    return props as ArrayBufferMessage.Data;
  }
  static from(value: ArrayBufferMessage.Value): ArrayBufferMessage {
    return value instanceof ArrayBufferMessage ? value : new ArrayBufferMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "chunks":
        return new (this.constructor as typeof ArrayBufferMessage)({
          id: this.#id,
          data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
          extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
          chunks: child as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["chunks", this.#chunks] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ArrayBufferMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  fillChunk(value: ArrayBuffer, start?: number, end?: number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ArrayBuffer[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
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
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  pushChunk(...values: ArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  reverseChunks() {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
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
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: value as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setData(value: ImmutableArrayBuffer | ArrayBuffer) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: value as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setExtra(value: ImmutableArrayBuffer | ArrayBuffer | undefined) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: value as ImmutableArrayBuffer | ArrayBuffer,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: value,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
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
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  sortChunks(compareFn?: (a: ArrayBuffer, b: ArrayBuffer) => number) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    (chunksNext as unknown as ArrayBuffer[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  spliceChunk(start: number, deleteCount?: number, ...items: ArrayBuffer[]) {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  unsetExtra() {
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      chunks: this.#chunks as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
  unshiftChunk(...values: ArrayBuffer[]) {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...values, ...chunksArray];
    return this.$update(new (this.constructor as typeof ArrayBufferMessage)({
      id: this.#id,
      data: this.#data as ImmutableArrayBuffer | ArrayBuffer,
      extra: this.#extra as ImmutableArrayBuffer | ArrayBuffer,
      chunks: chunksNext as (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>
    }) as this);
  }
}
export namespace ArrayBufferMessage {
  export type Data = {
    id: number;
    data: ImmutableArrayBuffer | ArrayBuffer;
    extra?: ImmutableArrayBuffer | ArrayBuffer | undefined;
    chunks: (ArrayBuffer | ImmutableArrayBuffer)[] | Iterable<ArrayBuffer | ImmutableArrayBuffer>;
  };
  export type Value = ArrayBufferMessage | ArrayBufferMessage.Data;
}
