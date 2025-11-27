/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/distance.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export type DistanceUnit = 'm' | 'ft';
export type DistanceUnitType = DistanceUnit;
export class Distance extends Message<Distance.Data> {
  static TYPE_TAG = Symbol("Distance");
  static EMPTY: Distance;
  #unit: DistanceUnit;
  #value: number;
  constructor(props?: Distance.Value, onUpdate?: (val: this) => void) {
    if (!props && !onUpdate && Distance.EMPTY) return Distance.EMPTY;
    super(Distance.TYPE_TAG, "Distance", onUpdate);
    this.#unit = props ? props.unit : new DistanceUnit();
    this.#value = props ? props.value : 0;
    if (!props && !onUpdate) Distance.EMPTY = this;
    return this.intern();
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
  setUnit(value: DistanceUnit): Distance {
    return this.$update(new Distance({
      unit: value,
      value: this.#value
    }, this.$onUpdate));
  }
  setValue(value: number): Distance {
    return this.$update(new Distance({
      unit: this.#unit,
      value: value
    }, this.$onUpdate));
  }
}
export namespace Distance {
  export interface Data {
    unit: DistanceUnit;
    value: number;
  }
  export type Value = Distance | Distance.Data;
}