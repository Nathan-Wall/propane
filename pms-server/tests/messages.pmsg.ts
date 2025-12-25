/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from pms-server/tests/messages.pmsg
import { Endpoint } from '@/pms-core/src/index.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../../runtime/index.js";
export class EchoRequest extends Message<EchoRequest.Data> {
  static TYPE_TAG = Symbol("EchoRequest");
  static readonly $typeName = "EchoRequest";
  static EMPTY: EchoRequest;
  #message!: string;
  constructor(props?: EchoRequest.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && EchoRequest.EMPTY) return EchoRequest.EMPTY;
    super(EchoRequest.TYPE_TAG, "EchoRequest");
    this.#message = (props ? props.message : "") as string;
    if (!props) EchoRequest.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<EchoRequest.Data>[] {
    return [{
      name: "message",
      fieldNumber: null,
      getValue: () => this.#message
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): EchoRequest.Data {
    const props = {} as Partial<EchoRequest.Data>;
    const messageValue = entries["message"];
    if (messageValue === undefined) throw new Error("Missing required property \"message\".");
    if (!(typeof messageValue === "string")) throw new Error("Invalid value for property \"message\".");
    props.message = messageValue as string;
    return props as EchoRequest.Data;
  }
  static from(value: EchoRequest.Value): EchoRequest {
    return value instanceof EchoRequest ? value : new EchoRequest(value);
  }
  static deserialize<T extends typeof EchoRequest>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  declare readonly __responseType: EchoResponse | undefined;
  get message(): string {
    return this.#message;
  }
  set(updates: Partial<SetUpdates<EchoRequest.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof EchoRequest)(data) as this);
  }
  setMessage(value: string) {
    return this.$update(new (this.constructor as typeof EchoRequest)({
      message: value
    }) as this);
  }
}
export namespace EchoRequest {
  export type Data = {
    message: string;
  };
  export type Value = EchoRequest | EchoRequest.Data;
}
export class EchoResponse extends Message<EchoResponse.Data> {
  static TYPE_TAG = Symbol("EchoResponse");
  static readonly $typeName = "EchoResponse";
  static EMPTY: EchoResponse;
  #echo!: string;
  #timestamp!: number;
  constructor(props?: EchoResponse.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && EchoResponse.EMPTY) return EchoResponse.EMPTY;
    super(EchoResponse.TYPE_TAG, "EchoResponse");
    this.#echo = (props ? props.echo : "") as string;
    this.#timestamp = (props ? props.timestamp : 0) as number;
    if (!props) EchoResponse.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<EchoResponse.Data>[] {
    return [{
      name: "echo",
      fieldNumber: null,
      getValue: () => this.#echo
    }, {
      name: "timestamp",
      fieldNumber: null,
      getValue: () => this.#timestamp
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): EchoResponse.Data {
    const props = {} as Partial<EchoResponse.Data>;
    const echoValue = entries["echo"];
    if (echoValue === undefined) throw new Error("Missing required property \"echo\".");
    if (!(typeof echoValue === "string")) throw new Error("Invalid value for property \"echo\".");
    props.echo = echoValue as string;
    const timestampValue = entries["timestamp"];
    if (timestampValue === undefined) throw new Error("Missing required property \"timestamp\".");
    if (!(typeof timestampValue === "number")) throw new Error("Invalid value for property \"timestamp\".");
    props.timestamp = timestampValue as number;
    return props as EchoResponse.Data;
  }
  static from(value: EchoResponse.Value): EchoResponse {
    return value instanceof EchoResponse ? value : new EchoResponse(value);
  }
  static deserialize<T extends typeof EchoResponse>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get echo(): string {
    return this.#echo;
  }
  get timestamp(): number {
    return this.#timestamp;
  }
  set(updates: Partial<SetUpdates<EchoResponse.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof EchoResponse)(data) as this);
  }
  setEcho(value: string) {
    return this.$update(new (this.constructor as typeof EchoResponse)({
      echo: value,
      timestamp: this.#timestamp
    }) as this);
  }
  setTimestamp(value: number) {
    return this.$update(new (this.constructor as typeof EchoResponse)({
      echo: this.#echo,
      timestamp: value
    }) as this);
  }
}
export namespace EchoResponse {
  export type Data = {
    echo: string;
    timestamp: number;
  };
  export type Value = EchoResponse | EchoResponse.Data;
}
export class AddRequest extends Message<AddRequest.Data> {
  static TYPE_TAG = Symbol("AddRequest");
  static readonly $typeName = "AddRequest";
  static EMPTY: AddRequest;
  #a!: number;
  #b!: number;
  constructor(props?: AddRequest.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && AddRequest.EMPTY) return AddRequest.EMPTY;
    super(AddRequest.TYPE_TAG, "AddRequest");
    this.#a = (props ? props.a : 0) as number;
    this.#b = (props ? props.b : 0) as number;
    if (!props) AddRequest.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<AddRequest.Data>[] {
    return [{
      name: "a",
      fieldNumber: null,
      getValue: () => this.#a
    }, {
      name: "b",
      fieldNumber: null,
      getValue: () => this.#b
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): AddRequest.Data {
    const props = {} as Partial<AddRequest.Data>;
    const aValue = entries["a"];
    if (aValue === undefined) throw new Error("Missing required property \"a\".");
    if (!(typeof aValue === "number")) throw new Error("Invalid value for property \"a\".");
    props.a = aValue as number;
    const bValue = entries["b"];
    if (bValue === undefined) throw new Error("Missing required property \"b\".");
    if (!(typeof bValue === "number")) throw new Error("Invalid value for property \"b\".");
    props.b = bValue as number;
    return props as AddRequest.Data;
  }
  static from(value: AddRequest.Value): AddRequest {
    return value instanceof AddRequest ? value : new AddRequest(value);
  }
  static deserialize<T extends typeof AddRequest>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  declare readonly __responseType: AddResponse | undefined;
  get a(): number {
    return this.#a;
  }
  get b(): number {
    return this.#b;
  }
  set(updates: Partial<SetUpdates<AddRequest.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof AddRequest)(data) as this);
  }
  setA(value: number) {
    return this.$update(new (this.constructor as typeof AddRequest)({
      a: value,
      b: this.#b
    }) as this);
  }
  setB(value: number) {
    return this.$update(new (this.constructor as typeof AddRequest)({
      a: this.#a,
      b: value
    }) as this);
  }
}
export namespace AddRequest {
  export type Data = {
    a: number;
    b: number;
  };
  export type Value = AddRequest | AddRequest.Data;
}
export class AddResponse extends Message<AddResponse.Data> {
  static TYPE_TAG = Symbol("AddResponse");
  static readonly $typeName = "AddResponse";
  static EMPTY: AddResponse;
  #sum!: number;
  constructor(props?: AddResponse.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && AddResponse.EMPTY) return AddResponse.EMPTY;
    super(AddResponse.TYPE_TAG, "AddResponse");
    this.#sum = (props ? props.sum : 0) as number;
    if (!props) AddResponse.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<AddResponse.Data>[] {
    return [{
      name: "sum",
      fieldNumber: null,
      getValue: () => this.#sum
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): AddResponse.Data {
    const props = {} as Partial<AddResponse.Data>;
    const sumValue = entries["sum"];
    if (sumValue === undefined) throw new Error("Missing required property \"sum\".");
    if (!(typeof sumValue === "number")) throw new Error("Invalid value for property \"sum\".");
    props.sum = sumValue as number;
    return props as AddResponse.Data;
  }
  static from(value: AddResponse.Value): AddResponse {
    return value instanceof AddResponse ? value : new AddResponse(value);
  }
  static deserialize<T extends typeof AddResponse>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get sum(): number {
    return this.#sum;
  }
  set(updates: Partial<SetUpdates<AddResponse.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof AddResponse)(data) as this);
  }
  setSum(value: number) {
    return this.$update(new (this.constructor as typeof AddResponse)({
      sum: value
    }) as this);
  }
}
export namespace AddResponse {
  export type Data = {
    sum: number;
  };
  export type Value = AddResponse | AddResponse.Data;
}
