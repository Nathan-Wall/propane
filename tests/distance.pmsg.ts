/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/distance.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
import type { MessagePropDescriptor } from "../runtime/index.js";
export type DistanceUnit = 'm' | 'ft';
export class Distance extends Message<Distance.Data> {
  static TYPE_TAG = Symbol("Distance");
  static readonly $typeName = "Distance";
  static EMPTY: Distance;
  #unit: DistanceUnit;
  #value: number;
  constructor(props?: Distance.Value) {
    if (!props && Distance.EMPTY) return Distance.EMPTY;
    super(Distance.TYPE_TAG, "Distance");
    this.#unit = props ? props.unit : new DistanceUnit();
    this.#value = props ? props.value : 0;
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
  protected $fromEntries(entries: Record<string, unknown>): Distance.Data {
    const props = {} as Partial<Distance.Data>;
    const unitValue = entries["unit"];
    if (unitValue === undefined) throw new Error("Missing required property \"unit\".");
    props.unit = unitValue;
    const valueValue = entries["value"];
    if (valueValue === undefined) throw new Error("Missing required property \"value\".");
    if (!(typeof valueValue === "number")) throw new Error("Invalid value for property \"value\".");
    props.value = valueValue;
    return props as Distance.Data;
  }
  get unit(): DistanceUnit {
    return this.#unit;
  }
  get value(): number {
    return this.#value;
  }
  setUnit(value: DistanceUnit) {
    return this.$update(new (this.constructor as typeof Distance)({
      unit: value,
      value: this.#value
    }));
  }
  setValue(value: number) {
    return this.$update(new (this.constructor as typeof Distance)({
      unit: this.#unit,
      value: value
    }));
  }
}
export namespace Distance {
  export type Data = {
    unit: DistanceUnit;
    value: number;
  };
  export type Value = Distance | Distance.Data;
}
