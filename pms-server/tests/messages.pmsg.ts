/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from pms-server/tests/messages.pmsg
import { Endpoint } from '@/pms-core/src/index.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../../runtime/index.js";
export class EchoRequest extends Message<EchoRequest.Data> {
  static TYPE_TAG = Symbol("EchoRequest");
  static readonly $typeName = "EchoRequest";
  static EMPTY: EchoRequest;
  #message!: string;
  constructor(props?: EchoRequest.Value) {
    if (!props && EchoRequest.EMPTY) return EchoRequest.EMPTY;
    super(EchoRequest.TYPE_TAG, "EchoRequest");
    this.#message = props ? props.message : "";
    if (!props) EchoRequest.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<EchoRequest.Data>[] {
    return [{
      name: "message",
      fieldNumber: null,
      getValue: () => this.#message
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): EchoRequest.Data {
    const props = {} as Partial<EchoRequest.Data>;
    const messageValue = entries["message"];
    if (messageValue === undefined) throw new Error("Missing required property \"message\".");
    if (!(typeof messageValue === "string")) throw new Error("Invalid value for property \"message\".");
    props.message = messageValue;
    return props as EchoRequest.Data;
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
    return this.$update(new (this.constructor as typeof EchoRequest)(data));
  }
  setMessage(value: string) {
    return this.$update(new (this.constructor as typeof EchoRequest)({
      message: value
    }));
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
  constructor(props?: EchoResponse.Value) {
    if (!props && EchoResponse.EMPTY) return EchoResponse.EMPTY;
    super(EchoResponse.TYPE_TAG, "EchoResponse");
    this.#echo = props ? props.echo : "";
    this.#timestamp = props ? props.timestamp : 0;
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
  protected $fromEntries(entries: Record<string, unknown>): EchoResponse.Data {
    const props = {} as Partial<EchoResponse.Data>;
    const echoValue = entries["echo"];
    if (echoValue === undefined) throw new Error("Missing required property \"echo\".");
    if (!(typeof echoValue === "string")) throw new Error("Invalid value for property \"echo\".");
    props.echo = echoValue;
    const timestampValue = entries["timestamp"];
    if (timestampValue === undefined) throw new Error("Missing required property \"timestamp\".");
    if (!(typeof timestampValue === "number")) throw new Error("Invalid value for property \"timestamp\".");
    props.timestamp = timestampValue;
    return props as EchoResponse.Data;
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
    return this.$update(new (this.constructor as typeof EchoResponse)(data));
  }
  setEcho(value: string) {
    return this.$update(new (this.constructor as typeof EchoResponse)({
      echo: value,
      timestamp: this.#timestamp
    }));
  }
  setTimestamp(value: number) {
    return this.$update(new (this.constructor as typeof EchoResponse)({
      echo: this.#echo,
      timestamp: value
    }));
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
  constructor(props?: AddRequest.Value) {
    if (!props && AddRequest.EMPTY) return AddRequest.EMPTY;
    super(AddRequest.TYPE_TAG, "AddRequest");
    this.#a = props ? props.a : 0;
    this.#b = props ? props.b : 0;
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
  protected $fromEntries(entries: Record<string, unknown>): AddRequest.Data {
    const props = {} as Partial<AddRequest.Data>;
    const aValue = entries["a"];
    if (aValue === undefined) throw new Error("Missing required property \"a\".");
    if (!(typeof aValue === "number")) throw new Error("Invalid value for property \"a\".");
    props.a = aValue;
    const bValue = entries["b"];
    if (bValue === undefined) throw new Error("Missing required property \"b\".");
    if (!(typeof bValue === "number")) throw new Error("Invalid value for property \"b\".");
    props.b = bValue;
    return props as AddRequest.Data;
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
    return this.$update(new (this.constructor as typeof AddRequest)(data));
  }
  setA(value: number) {
    return this.$update(new (this.constructor as typeof AddRequest)({
      a: value,
      b: this.#b
    }));
  }
  setB(value: number) {
    return this.$update(new (this.constructor as typeof AddRequest)({
      a: this.#a,
      b: value
    }));
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
  constructor(props?: AddResponse.Value) {
    if (!props && AddResponse.EMPTY) return AddResponse.EMPTY;
    super(AddResponse.TYPE_TAG, "AddResponse");
    this.#sum = props ? props.sum : 0;
    if (!props) AddResponse.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<AddResponse.Data>[] {
    return [{
      name: "sum",
      fieldNumber: null,
      getValue: () => this.#sum
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): AddResponse.Data {
    const props = {} as Partial<AddResponse.Data>;
    const sumValue = entries["sum"];
    if (sumValue === undefined) throw new Error("Missing required property \"sum\".");
    if (!(typeof sumValue === "number")) throw new Error("Invalid value for property \"sum\".");
    props.sum = sumValue;
    return props as AddResponse.Data;
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
    return this.$update(new (this.constructor as typeof AddResponse)(data));
  }
  setSum(value: number) {
    return this.$update(new (this.constructor as typeof AddResponse)({
      sum: value
    }));
  }
}
export namespace AddResponse {
  export type Data = {
    sum: number;
  };
  export type Value = AddResponse | AddResponse.Data;
}
