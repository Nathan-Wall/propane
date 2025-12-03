/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.propane
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray, ImmutableArrayBuffer } from "../runtime/index.js";
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static TYPE_TAG = Symbol("ArrayBufferMessage");
  static readonly $typeName = "ArrayBufferMessage";
  static EMPTY: ArrayBufferMessage;
  #id: number;
  #data: ImmutableArrayBuffer;
  #extra: ImmutableArrayBuffer | undefined;
  #chunks: ImmutableArray<ImmutableArrayBuffer>;
  constructor(props?: ArrayBufferMessage.Value) {
    if (!props && ArrayBufferMessage.EMPTY) return ArrayBufferMessage.EMPTY;
    super(ArrayBufferMessage.TYPE_TAG, "ArrayBufferMessage");
    this.#id = props ? props.id : 0;
    this.#data = props ? props.data instanceof ImmutableArrayBuffer ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer();
    this.#extra = props ? props.extra === undefined ? undefined : props.extra instanceof ImmutableArrayBuffer ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra) : new ImmutableArrayBuffer(props.extra) : undefined;
    this.#chunks = props ? props.chunks === undefined || props.chunks === null ? new ImmutableArray() : props.chunks instanceof ImmutableArray ? props.chunks : new ImmutableArray(props.chunks) : new ImmutableArray();
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
      getValue: () => this.#data
    }, {
      name: "extra",
      fieldNumber: 3,
      getValue: () => this.#extra
    }, {
      name: "chunks",
      fieldNumber: 4,
      getValue: () => this.#chunks
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ArrayBufferMessage.Data {
    const props = {} as Partial<ArrayBufferMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const dataValue = entries["2"] === undefined ? entries["data"] : entries["2"];
    if (dataValue === undefined) throw new Error("Missing required property \"data\".");
    const dataArrayBufferValue = dataValue instanceof ImmutableArrayBuffer ? dataValue : ArrayBuffer.isView(dataValue) ? new ImmutableArrayBuffer(dataValue) : new ImmutableArrayBuffer(dataValue);
    if (!(dataArrayBufferValue instanceof ArrayBuffer || dataArrayBufferValue instanceof ImmutableArrayBuffer)) throw new Error("Invalid value for property \"data\".");
    props.data = dataArrayBufferValue;
    const extraValue = entries["3"] === undefined ? entries["extra"] : entries["3"];
    const extraNormalized = extraValue === null ? undefined : extraValue;
    const extraArrayBufferValue = extraNormalized === undefined ? undefined : extraNormalized instanceof ImmutableArrayBuffer ? extraNormalized : ArrayBuffer.isView(extraNormalized) ? new ImmutableArrayBuffer(extraNormalized) : new ImmutableArrayBuffer(extraNormalized);
    if (extraArrayBufferValue !== undefined && !(extraArrayBufferValue instanceof ArrayBuffer || extraArrayBufferValue instanceof ImmutableArrayBuffer)) throw new Error("Invalid value for property \"extra\".");
    props.extra = extraArrayBufferValue;
    const chunksValue = entries["4"] === undefined ? entries["chunks"] : entries["4"];
    if (chunksValue === undefined) throw new Error("Missing required property \"chunks\".");
    const chunksArrayValue = chunksValue === undefined || chunksValue === null ? new ImmutableArray() : chunksValue as object instanceof ImmutableArray ? chunksValue : new ImmutableArray(chunksValue);
    if (!((chunksArrayValue instanceof ImmutableArray || Array.isArray(chunksArrayValue)) && [...(chunksArrayValue as Iterable<unknown>)].every(element => element instanceof ArrayBuffer || element instanceof ImmutableArrayBuffer))) throw new Error("Invalid value for property \"chunks\".");
    props.chunks = chunksArrayValue as ImmutableArray<ImmutableArrayBuffer>;
    return props as ArrayBufferMessage.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): ArrayBufferMessage {
    switch (key) {
      case "chunks":
        return new ArrayBufferMessage({
          id: this.#id,
          data: this.#data,
          extra: this.#extra,
          chunks: child as ImmutableArray<ImmutableArrayBuffer>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["chunks", this.#chunks] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
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
  copyWithinChunks(target: number, start: number, end?: number): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.copyWithin(target, start, end);
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  deleteExtra(): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      chunks: this.#chunks
    }));
  }
  fillChunks(value: ArrayBuffer, start?: number, end?: number): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.fill(value, start, end);
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  popChunks(): ArrayBufferMessage {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.pop();
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  pushChunks(...values): ArrayBufferMessage {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray, ...values];
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  reverseChunks(): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.reverse();
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  setChunks(value: ArrayBuffer[] | Iterable<ArrayBuffer>): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: value
    }));
  }
  setData(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: value,
      extra: this.#extra,
      chunks: this.#chunks
    }));
  }
  setExtra(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: value,
      chunks: this.#chunks
    }));
  }
  setId(value: number): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: value,
      data: this.#data,
      extra: this.#extra,
      chunks: this.#chunks
    }));
  }
  shiftChunks(): ArrayBufferMessage {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.shift();
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  sortChunks(compareFn?: (a: ArrayBuffer, b: ArrayBuffer) => number): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.sort(compareFn);
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  spliceChunks(start: number, deleteCount?: number, ...items): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
  unshiftChunks(...values): ArrayBufferMessage {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...values, ...chunksArray];
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    }));
  }
}
export namespace ArrayBufferMessage {
  export type Data = {
    id: number;
    data: ImmutableArrayBuffer | ArrayBuffer;
    extra?: ImmutableArrayBuffer | ArrayBuffer | undefined;
    chunks: ArrayBuffer[] | Iterable<ArrayBuffer>;
  };
  export type Value = ArrayBufferMessage | ArrayBufferMessage.Data;
}
