/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/index-optional-hole.propane
import { Message, MessagePropDescriptor, ImmutableDate } from "@propanejs/runtime";
export class OptionalHole extends Message<OptionalHole.Data> {
  static TYPE_TAG = Symbol("OptionalHole");
  static EMPTY: OptionalHole;
  #id: number;
  #created: ImmutableDate;
  #note: string;
  #name: string;
  constructor(props?: OptionalHole.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && OptionalHole.EMPTY) return OptionalHole.EMPTY;
    super(OptionalHole.TYPE_TAG, "OptionalHole", listeners);
    this.#id = props ? props.id : 0;
    this.#created = props ? props.created instanceof ImmutableDate ? props.created : new ImmutableDate(props.created) : new ImmutableDate(0);
    this.#note = props ? props.note : undefined;
    this.#name = props ? props.name : "";
    if (!props && !listeners) OptionalHole.EMPTY = this;
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
    if (!(createdValue instanceof Date || createdValue instanceof ImmutableDate || Object.prototype.toString.call(createdValue) === "[object Date]" || Object.prototype.toString.call(createdValue) === "[object ImmutableDate]")) throw new Error("Invalid value for property \"created\".");
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
  get id(): number {
    return this.#id;
  }
  get created(): ImmutableDate {
    return this.#created;
  }
  get note(): string {
    return this.#note;
  }
  get name(): string {
    return this.#name;
  }
  deleteNote(): OptionalHole {
    return this.$update(new OptionalHole({
      id: this.#id,
      created: this.#created,
      name: this.#name
    }, this.$listeners));
  }
  setCreated(value: ImmutableDate | Date): OptionalHole {
    return this.$update(new OptionalHole({
      id: this.#id,
      created: value,
      note: this.#note,
      name: this.#name
    }, this.$listeners));
  }
  setId(value: number): OptionalHole {
    return this.$update(new OptionalHole({
      id: value,
      created: this.#created,
      note: this.#note,
      name: this.#name
    }, this.$listeners));
  }
  setName(value: string): OptionalHole {
    return this.$update(new OptionalHole({
      id: this.#id,
      created: this.#created,
      note: this.#note,
      name: value
    }, this.$listeners));
  }
  setNote(value: string): OptionalHole {
    return this.$update(new OptionalHole({
      id: this.#id,
      created: this.#created,
      note: value,
      name: this.#name
    }, this.$listeners));
  }
}
export namespace OptionalHole {
  export interface Data {
    id: number;
    created: ImmutableDate | Date;
    note?: string | undefined;
    name: string;
  }
  export type Value = OptionalHole | OptionalHole.Data;
}