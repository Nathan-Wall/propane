/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/extend-basic.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";

// @extend('./extend-basic.pmsg.ext.ts')
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Person$Base = Symbol("Person");
export class Person$Base extends Message<Person.Data> {
  static $typeId = "tests/extend-basic.pmsg#Person";
  static $typeHash = "sha256:8c2541fc00cea481e882dd9d20afb0942dc6c171d46f87e5cec0879e6fa693be";
  static $instanceTag = Symbol.for("propane:message:" + Person$Base.$typeId);
  static readonly $typeName = "Person";
  static EMPTY: Person$Base;
  #firstName!: string;
  #lastName!: string;
  #age!: number;
  constructor(props?: Person.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Person$Base.EMPTY) return Person$Base.EMPTY;
    super(TYPE_TAG_Person$Base, "Person");
    this.#firstName = (props ? props.firstName : "") as string;
    this.#lastName = (props ? props.lastName : "") as string;
    this.#age = (props ? props.age : 0) as number;
    if (!props) Person$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Person.Data>[] {
    return [{
      name: "firstName",
      fieldNumber: 1,
      getValue: () => this.#firstName
    }, {
      name: "lastName",
      fieldNumber: 2,
      getValue: () => this.#lastName
    }, {
      name: "age",
      fieldNumber: 3,
      getValue: () => this.#age
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Person.Data {
    const props = {} as Partial<Person.Data>;
    const firstNameValue = entries["1"] === undefined ? entries["firstName"] : entries["1"];
    if (firstNameValue === undefined) throw new Error("Missing required property \"firstName\".");
    if (!(typeof firstNameValue === "string")) throw new Error("Invalid value for property \"firstName\".");
    props.firstName = firstNameValue as string;
    const lastNameValue = entries["2"] === undefined ? entries["lastName"] : entries["2"];
    if (lastNameValue === undefined) throw new Error("Missing required property \"lastName\".");
    if (!(typeof lastNameValue === "string")) throw new Error("Invalid value for property \"lastName\".");
    props.lastName = lastNameValue as string;
    const ageValue = entries["3"] === undefined ? entries["age"] : entries["3"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue as number;
    return props as Person.Data;
  }
  static from(value: Person.Value): Person$Base {
    return Person$Base.isInstance(value) ? value : new Person$Base(value);
  }
  static deserialize<T extends typeof Person$Base>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Person.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Person.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get firstName(): string {
    return this.#firstName;
  }
  get lastName(): string {
    return this.#lastName;
  }
  get age(): number {
    return this.#age;
  }
  set(updates: Partial<SetUpdates<Person.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Person$Base)(data) as this);
  }
  setAge(value: number) {
    return this.$update(new (this.constructor as typeof Person$Base)({
      firstName: this.#firstName,
      lastName: this.#lastName,
      age: value
    }) as this);
  }
  setFirstName(value: string) {
    return this.$update(new (this.constructor as typeof Person$Base)({
      firstName: value,
      lastName: this.#lastName,
      age: this.#age
    }) as this);
  }
  setLastName(value: string) {
    return this.$update(new (this.constructor as typeof Person$Base)({
      firstName: this.#firstName,
      lastName: value,
      age: this.#age
    }) as this);
  }
}
export namespace Person {
  export type Data = {
    firstName: string;
    lastName: string;
    age: number;
  };
  export type Value = Person$Base | Person.Data;
}
