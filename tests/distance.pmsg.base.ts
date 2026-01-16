/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/distance.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
export type DistanceUnit = 'm' | 'ft';
const TYPE_TAG_Distance = Symbol("Distance");
export class Distance extends Message<Distance.Data> {
  static $typeId = "tests/distance.pmsg#Distance";
  static $typeHash = "sha256:d0a784525994729d16dab5957d420b8a270aeaddeacd0521a28fcaba1c43e12b";
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
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
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
