/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/endpoint-types.pmsg
import { Endpoint } from '@/pms-core/src/index.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
export class TestResponse extends Message<TestResponse.Data> {
  static TYPE_TAG = Symbol("TestResponse");
  static readonly $typeName = "TestResponse";
  static EMPTY: TestResponse;
  #value: string;
  constructor(props?: TestResponse.Value) {
    if (!props && TestResponse.EMPTY) return TestResponse.EMPTY;
    super(TestResponse.TYPE_TAG, "TestResponse");
    this.#value = props ? props.value : "";
    if (!props) TestResponse.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<TestResponse.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): TestResponse.Data {
    const props = {} as Partial<TestResponse.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as TestResponse.Data;
  }
  get value(): string {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<TestResponse.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof TestResponse)(data));
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof TestResponse)({
      value: value
    }));
  }
}
export namespace TestResponse {
  export type Data = {
    value: string;
  };
  export type Value = TestResponse | TestResponse.Data;
}
export class TestRequest extends Message<TestRequest.Data> {
  static TYPE_TAG = Symbol("TestRequest");
  static readonly $typeName = "TestRequest";
  static EMPTY: TestRequest;
  #id: number;
  constructor(props?: TestRequest.Value) {
    if (!props && TestRequest.EMPTY) return TestRequest.EMPTY;
    super(TestRequest.TYPE_TAG, "TestRequest");
    this.#id = props ? props.id : 0;
    if (!props) TestRequest.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<TestRequest.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): TestRequest.Data {
    const props = {} as Partial<TestRequest.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    return props as TestRequest.Data;
  }
  declare readonly __responseType: TestResponse | undefined;
  get id(): number {
    return this.#id;
  }
  set(updates: Partial<SetUpdates<TestRequest.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof TestRequest)(data));
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof TestRequest)({
      id: value
    }));
  }
}
export namespace TestRequest {
  export type Data = {
    id: number;
  };
  export type Value = TestRequest | TestRequest.Data;
}
