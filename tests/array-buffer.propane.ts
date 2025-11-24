/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.propane
import { Message, MessagePropDescriptor, ImmutableArray, ImmutableArrayBuffer } from "@propanejs/runtime";
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static TYPE_TAG = Symbol("ArrayBufferMessage");
  static EMPTY: ArrayBufferMessage;
  #id: number;
  #data: ImmutableArrayBuffer;
  #extra: ImmutableArrayBuffer | undefined;
  #chunks: ImmutableArray<ImmutableArrayBuffer>;
  constructor(props?: ArrayBufferMessage.Value) {
    if (!props && ArrayBufferMessage.EMPTY) return ArrayBufferMessage.EMPTY;
    super(ArrayBufferMessage.TYPE_TAG);
    this.#id = props ? props.id : 0;
    this.#data = props ? props.data instanceof ImmutableArrayBuffer ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer();
    this.#extra = props ? props.extra === undefined ? undefined : props.extra instanceof ImmutableArrayBuffer ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra) : new ImmutableArrayBuffer(props.extra) : undefined;
    this.#chunks = props ? props.chunks === undefined || props.chunks === null ? props.chunks : props.chunks instanceof ImmutableArray ? props.chunks : new ImmutableArray(props.chunks) : Object.freeze([]);
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
    if (!(dataArrayBufferValue instanceof ArrayBuffer || dataArrayBufferValue instanceof ImmutableArrayBuffer || Object.prototype.toString.call(dataArrayBufferValue) === "[object ArrayBuffer]" || Object.prototype.toString.call(dataArrayBufferValue) === "[object ImmutableArrayBuffer]")) throw new Error("Invalid value for property \"data\".");
    props.data = dataArrayBufferValue;
    const extraValue = entries["3"] === undefined ? entries["extra"] : entries["3"];
    const extraNormalized = extraValue === null ? undefined : extraValue;
    const extraArrayBufferValue = extraNormalized === undefined ? undefined : extraNormalized instanceof ImmutableArrayBuffer ? extraNormalized : ArrayBuffer.isView(extraNormalized) ? new ImmutableArrayBuffer(extraNormalized) : new ImmutableArrayBuffer(extraNormalized);
    if (extraArrayBufferValue !== undefined && !(extraArrayBufferValue instanceof ArrayBuffer || extraArrayBufferValue instanceof ImmutableArrayBuffer || Object.prototype.toString.call(extraArrayBufferValue) === "[object ArrayBuffer]" || Object.prototype.toString.call(extraArrayBufferValue) === "[object ImmutableArrayBuffer]")) throw new Error("Invalid value for property \"extra\".");
    props.extra = extraArrayBufferValue;
    const chunksValue = entries["4"] === undefined ? entries["chunks"] : entries["4"];
    if (chunksValue === undefined) throw new Error("Missing required property \"chunks\".");
    const chunksArrayValue = chunksValue === undefined || chunksValue === null ? chunksValue : chunksValue instanceof ImmutableArray ? chunksValue : new ImmutableArray(chunksValue);
    if (!((chunksArrayValue instanceof ImmutableArray || Object.prototype.toString.call(chunksArrayValue) === "[object ImmutableArray]" || Array.isArray(chunksArrayValue)) && [...chunksArrayValue].every(element => element instanceof ArrayBuffer || element instanceof ImmutableArrayBuffer || Object.prototype.toString.call(element) === "[object ArrayBuffer]" || Object.prototype.toString.call(element) === "[object ImmutableArrayBuffer]"))) throw new Error("Invalid value for property \"chunks\".");
    props.chunks = chunksArrayValue;
    return props as ArrayBufferMessage.Data;
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
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  deleteExtra(): ArrayBufferMessage {
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      chunks: this.#chunks
    });
  }
  fillChunks(value: ArrayBuffer, start?: number, end?: number): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.fill(value, start, end);
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  popChunks(): ArrayBufferMessage {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.pop();
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  pushChunks(...values): ArrayBufferMessage {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray, ...values];
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  reverseChunks(): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.reverse();
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  setChunks(value: ArrayBuffer[] | Iterable<ArrayBuffer>): ArrayBufferMessage {
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: value
    });
  }
  setData(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return new ArrayBufferMessage({
      id: this.#id,
      data: value,
      extra: this.#extra,
      chunks: this.#chunks
    });
  }
  setExtra(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: value,
      chunks: this.#chunks
    });
  }
  setId(value: number): ArrayBufferMessage {
    return new ArrayBufferMessage({
      id: value,
      data: this.#data,
      extra: this.#extra,
      chunks: this.#chunks
    });
  }
  shiftChunks(): ArrayBufferMessage {
    if ((this.chunks ?? []).length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.shift();
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  sortChunks(compareFn?: (a: ArrayBuffer, b: ArrayBuffer) => number): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    chunksNext.sort(compareFn);
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  spliceChunks(start: number, deleteCount?: number, ...items): ArrayBufferMessage {
    const chunksArray = this.#chunks;
    const chunksNext = [...chunksArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    chunksNext.splice(...args);
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
  unshiftChunks(...values): ArrayBufferMessage {
    if (values.length === 0) return this;
    const chunksArray = this.#chunks;
    const chunksNext = [...values, ...chunksArray];
    return new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: chunksNext
    });
  }
}
export namespace ArrayBufferMessage {
  export interface Data {
    id: number;
    data: ImmutableArrayBuffer | ArrayBuffer;
    extra?: ImmutableArrayBuffer | ArrayBuffer | undefined;
    chunks: ArrayBuffer[] | Iterable<ArrayBuffer>;
  }
  export type Value = ArrayBufferMessage | ArrayBufferMessage.Data;
}