// Generated from tests/distance.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export type DistanceUnit = 'm' | 'ft';
export type DistanceUnitType = DistanceUnit;
export namespace Distance {
  export type Data = {
    unit: DistanceUnit;
    value: number;
  };
  export type Value = Distance | Distance.Data;
}
export class Distance extends Message<Distance.Data> {
  static #typeTag = Symbol("Distance");
  #unit: DistanceUnit;
  #value: number;
  constructor(props: Distance.Value) {
    super(Distance.#typeTag);
    this.#unit = props.unit;
    this.#value = props.value;
  }
  get unit(): DistanceUnit {
    return this.#unit;
  }
  get value(): number {
    return this.#value;
  }
  setUnit(value: DistanceUnit): Distance {
    return new Distance({
      unit: value,
      value: this.#value
    });
  }
  setValue(value: number): Distance {
    return new Distance({
      unit: this.#unit,
      value: value
    });
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
}