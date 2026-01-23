/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/endpoint-types.pmsg
import { Endpoint } from '@/pms-core/src/index.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_TestResponse = Symbol("TestResponse");
export class TestResponse extends Message<TestResponse.Data> {
  static $typeId = "tests/endpoint-types.pmsg#TestResponse";
  static $typeHash = "sha256:04ebbc6be4d0b2b7cf6a20f106eacd8b23798fe077f75dedf8ef3ec2ceb83ead";
  static $instanceTag = Symbol.for("propane:message:" + TestResponse.$typeId);
  static readonly $typeName = "TestResponse";
  static EMPTY: TestResponse;
  #value!: string;
  constructor(props?: TestResponse.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && TestResponse.EMPTY) return TestResponse.EMPTY;
    super(TYPE_TAG_TestResponse, "TestResponse");
    this.#value = (props ? props.value : "") as string;
    if (!props) TestResponse.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<TestResponse.Data>[] {
    return [{
      name: "value",
      fieldNumber: 1,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): TestResponse.Data {
    const props = {} as Partial<TestResponse.Data>;
    const valueValue = entries["1"] === undefined ? entries["value"] : entries["1"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "string")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as string;
    return props as TestResponse.Data;
  }
  static from(value: TestResponse.Value): TestResponse {
    return value instanceof TestResponse ? value : new TestResponse(value);
  }
  static deserialize<T extends typeof TestResponse>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for TestResponse.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected TestResponse.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof TestResponse)(data) as this);
  }
  setValue(value: string) {
    return this.$update(new (this.constructor as typeof TestResponse)({
      value: value
    }) as this);
  }
}
export namespace TestResponse {
  export type Data = {
    value: string;
  };
  export type Value = TestResponse | TestResponse.Data;
}
const TYPE_TAG_TestRequest = Symbol("TestRequest");
export class TestRequest extends Message<TestRequest.Data> {
  static $typeId = "tests/endpoint-types.pmsg#TestRequest";
  static $typeHash = "sha256:810c5b199e2cc194faccfbb54be12e5fa77ccd0e9d54161c4f4a5720ac0a3ae9";
  static $instanceTag = Symbol.for("propane:message:" + TestRequest.$typeId);
  static readonly $typeName = "TestRequest";
  static EMPTY: TestRequest;
  #id!: number;
  constructor(props?: TestRequest.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && TestRequest.EMPTY) return TestRequest.EMPTY;
    super(TYPE_TAG_TestRequest, "TestRequest");
    this.#id = (props ? props.id : 0) as number;
    if (!props) TestRequest.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<TestRequest.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): TestRequest.Data {
    const props = {} as Partial<TestRequest.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    return props as TestRequest.Data;
  }
  static from(value: TestRequest.Value): TestRequest {
    return value instanceof TestRequest ? value : new TestRequest(value);
  }
  static deserialize<T extends typeof TestRequest>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for TestRequest.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected TestRequest.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof TestRequest)(data) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof TestRequest)({
      id: value
    }) as this);
  }
}
export namespace TestRequest {
  export type Data = {
    id: number;
  };
  export type Value = TestRequest | TestRequest.Data;
}
