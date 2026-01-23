/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/distance.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
export type DistanceUnit = 'm' | 'ft';
const TYPE_TAG_Distance = Symbol("Distance");
export class Distance extends Message<Distance.Data> {
  static $typeId = "tests/distance.pmsg#Distance";
  static $typeHash = "sha256:0e1d6c5f183dc88018a39105358d133a7c04a8d7271ffb6a8c55b2b54efc2915";
  static $instanceTag = Symbol.for("propane:message:" + Distance.$typeId);
  static readonly $typeName = "Distance";
  static EMPTY: Distance;
  #unit!: DistanceUnit;
  #value!: number;
  constructor(props?: Distance.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Distance.EMPTY) return Distance.EMPTY;
    super(TYPE_TAG_Distance, "Distance");
    this.#unit = (props ? props.unit : "m") as DistanceUnit;
    this.#value = (props ? props.value : 0) as number;
    if (!props) Distance.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Distance.Data>[] {
    return [{
      name: "unit",
      fieldNumber: null,
      getValue: () => this.#unit
    }, {
      name: "value",
      fieldNumber: null,
      getValue: () => this.#value
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Distance.Data {
    const props = {} as Partial<Distance.Data>;
    const unitValue = entries["unit"];
    if (unitValue === undefined) throw new Error("Missing required property \"unit\".");
    props.unit = unitValue as DistanceUnit;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue as number;
    return props as Distance.Data;
  }
  static from(value: Distance.Value): Distance {
    return value instanceof Distance ? value : new Distance(value);
  }
  static deserialize<T extends typeof Distance>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Distance.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Distance.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get unit(): DistanceUnit {
    return this.#unit;
  }
  get value(): number {
    return this.#value;
  }
  set(updates: Partial<SetUpdates<Distance.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Distance)(data) as this);
  }
  setUnit(value: DistanceUnit) {
    return this.$update(new (this.constructor as typeof Distance)({
      unit: value,
      value: this.#value
    }) as this);
  }
  setValue(value: number) {
    return this.$update(new (this.constructor as typeof Distance)({
      unit: this.#unit,
      value: value
    }) as this);
  }
}
export namespace Distance {
  export type Data = {
    unit: DistanceUnit;
    value: number;
  };
  export type Value = Distance | Distance.Data;
}
