/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/array-buffer.propane
import { Message, MessagePropDescriptor, ImmutableArray, ImmutableArrayBuffer, ADD_UPDATE_LISTENER } from "@propanejs/runtime";
export class ArrayBufferMessage extends Message<ArrayBufferMessage.Data> {
  static TYPE_TAG = Symbol("ArrayBufferMessage");
  static EMPTY: ArrayBufferMessage;
  #id: number;
  #data: ImmutableArrayBuffer;
  #extra: ImmutableArrayBuffer | undefined;
  #chunks: ImmutableArray<ImmutableArrayBuffer>;
  constructor(props?: ArrayBufferMessage.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ArrayBufferMessage.EMPTY) return ArrayBufferMessage.EMPTY;
    super(ArrayBufferMessage.TYPE_TAG, "ArrayBufferMessage", listeners);
    this.#id = props ? props.id : 0;
    this.#data = props ? props.data instanceof ImmutableArrayBuffer ? props.data : ArrayBuffer.isView(props.data) ? new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer(props.data) : new ImmutableArrayBuffer();
    this.#extra = props ? props.extra === undefined ? undefined : props.extra instanceof ImmutableArrayBuffer ? props.extra : ArrayBuffer.isView(props.extra) ? new ImmutableArrayBuffer(props.extra) : new ImmutableArrayBuffer(props.extra) : undefined;
    this.#chunks = props ? props.chunks === undefined || props.chunks === null ? props.chunks : props.chunks instanceof ImmutableArray ? props.chunks : new ImmutableArray(props.chunks) : new ImmutableArray();
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) ArrayBufferMessage.EMPTY = this;
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
  protected $enableChildListeners(): void {
    this.#chunks = this.#chunks[ADD_UPDATE_LISTENER](newValue => {
      this.setChunks(newValue);
    });
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
    }, this.$listeners));
  }
  deleteExtra(): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      chunks: this.#chunks
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
  }
  setChunks(value: ArrayBuffer[] | Iterable<ArrayBuffer>): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: this.#extra,
      chunks: value
    }, this.$listeners));
  }
  setData(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: value,
      extra: this.#extra,
      chunks: this.#chunks
    }, this.$listeners));
  }
  setExtra(value: ImmutableArrayBuffer | ArrayBuffer): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: this.#id,
      data: this.#data,
      extra: value,
      chunks: this.#chunks
    }, this.$listeners));
  }
  setId(value: number): ArrayBufferMessage {
    return this.$update(new ArrayBufferMessage({
      id: value,
      data: this.#data,
      extra: this.#extra,
      chunks: this.#chunks
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
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
    }, this.$listeners));
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
