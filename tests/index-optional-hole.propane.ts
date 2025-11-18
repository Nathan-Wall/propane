// Generated from tests/index-optional-hole.propane
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace OptionalHole {
  export type Data = {
    id: number;
    created: Date;
    note?: string;
    name: string;
  };
  export type Value = OptionalHole | OptionalHole.Data;
}
export class OptionalHole extends Message<OptionalHole.Data> {
  static #typeTag = Symbol("OptionalHole");
  #id: number;
  #created: Date;
  #note: string;
  #name: string;
  constructor(props: OptionalHole.Value) {
    super(OptionalHole.#typeTag);
    this.#id = props.id;
    this.#created = props.created;
    this.#note = props.note;
    this.#name = props.name;
  }
  get id(): number {
    return this.#id;
  }
  get created(): Date {
    return this.#created;
  }
  get note(): string {
    return this.#note;
  }
  get name(): string {
    return this.#name;
  }
  setId(value: number): OptionalHole {
    return new OptionalHole({
      id: value,
      created: this.#created,
      note: this.#note,
      name: this.#name
    });
  }
  setCreated(value: Date): OptionalHole {
    return new OptionalHole({
      id: this.#id,
      created: value,
      note: this.#note,
      name: this.#name
    });
  }
  setNote(value: string): OptionalHole {
    return new OptionalHole({
      id: this.#id,
      created: this.#created,
      note: value,
      name: this.#name
    });
  }
  setName(value: string): OptionalHole {
    return new OptionalHole({
      id: this.#id,
      created: this.#created,
      note: this.#note,
      name: value
    });
  }
  deleteNote(): OptionalHole {
    return new OptionalHole({
      id: this.#id,
      created: this.#created,
      name: this.#name
    });
  }
  protected $getPropDescriptors(): MessagePropDescriptor<OptionalHole.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "created",
      fieldNumber: 2,
      getValue: () => this.#created
    }, {
      name: "note",
      fieldNumber: 3,
      getValue: () => this.#note
    }, {
      name: "name",
      fieldNumber: 4,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): OptionalHole.Data {
    const props = {} as Partial<OptionalHole.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const createdValue = entries["2"] === undefined ? entries["created"] : entries["2"];
    if (createdValue === undefined) throw new Error("Missing required property \"created\".");
    if (!(createdValue instanceof Date || Object.prototype.toString.call(createdValue) === "[object Date]")) throw new Error("Invalid value for property \"created\".");
    props.created = createdValue;
    const noteValue = entries["3"] === undefined ? entries["note"] : entries["3"];
    const noteNormalized = noteValue === null ? undefined : noteValue;
    if (noteNormalized !== undefined && !(typeof noteNormalized === "string")) throw new Error("Invalid value for property \"note\".");
    props.note = noteNormalized;
    const nameValue = entries["4"] === undefined ? entries["name"] : entries["4"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as OptionalHole.Data;
  }
}