/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/indexed.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Indexed = Symbol("Indexed");
export class Indexed extends Message<Indexed.Data> {
  static $typeId = "tests/indexed.pmsg#Indexed";
  static $typeHash = "sha256:9a67fc70069c9e4e68fd4b94149fd1786dad337888c4d7e7d8fa15427400c35e";
  static $instanceTag = Symbol.for("propane:message:" + Indexed.$typeId);
  static readonly $typeName = "Indexed";
  static EMPTY: Indexed;
  #id!: number;
  #name!: string;
  #age!: number;
  #active!: boolean;
  #nickname!: string | undefined;
  #score!: number | null;
  #alias!: string | null | undefined;
  #status!: string;
  constructor(props?: Indexed.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Indexed.EMPTY) return Indexed.EMPTY;
    super(TYPE_TAG_Indexed, "Indexed");
    this.#id = (props ? props.id : 0) as number;
    this.#name = (props ? props.name : "") as string;
    this.#age = (props ? props.age : 0) as number;
    this.#active = (props ? props.active : false) as boolean;
    this.#nickname = (props ? props.nickname : undefined) as string;
    this.#score = (props ? props.score : 0) as number | null;
    this.#alias = (props ? props.alias : undefined) as string | null;
    this.#status = (props ? props.status : "") as string;
    if (!props) Indexed.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Indexed.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "name",
      fieldNumber: 2,
      getValue: () => this.#name
    }, {
      name: "age",
      fieldNumber: 3,
      getValue: () => this.#age
    }, {
      name: "active",
      fieldNumber: 4,
      getValue: () => this.#active
    }, {
      name: "nickname",
      fieldNumber: 5,
      getValue: () => this.#nickname
    }, {
      name: "score",
      fieldNumber: 6,
      getValue: () => this.#score as number | null
    }, {
      name: "alias",
      fieldNumber: 7,
      getValue: () => this.#alias as string | null
    }, {
      name: "status",
      fieldNumber: 8,
      getValue: () => this.#status
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Indexed.Data {
    const props = {} as Partial<Indexed.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const ageValue = entries["3"] === undefined ? entries["age"] : entries["3"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue as number;
    const activeValue = entries["4"] === undefined ? entries["active"] : entries["4"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue as boolean;
    const nicknameValue = entries["5"] === undefined ? entries["nickname"] : entries["5"];
    const nicknameNormalized = nicknameValue === null ? undefined : nicknameValue;
    if (nicknameNormalized !== undefined && !(typeof nicknameNormalized === "string")) throw new Error("Invalid value for property \"nickname\".");
    props.nickname = nicknameNormalized as string;
    const scoreValue = entries["6"] === undefined ? entries["score"] : entries["6"];
    if (scoreValue === undefined) throw new Error("Missing required property \"score\".");
    if (!(typeof scoreValue === "number" || scoreValue === null)) throw new Error("Invalid value for property \"score\".");
    props.score = scoreValue as number | null;
    const aliasValue = entries["7"] === undefined ? entries["alias"] : entries["7"];
    if (aliasValue !== undefined && !(typeof aliasValue === "string" || aliasValue === null)) throw new Error("Invalid value for property \"alias\".");
    props.alias = aliasValue as string | null;
    const statusValue = entries["8"] === undefined ? entries["status"] : entries["8"];
    if (statusValue === undefined) throw new Error("Missing required property \"status\".");
    if (!(typeof statusValue === "string")) throw new Error("Invalid value for property \"status\".");
    props.status = statusValue as string;
    return props as Indexed.Data;
  }
  static from(value: Indexed.Value): Indexed {
    return value instanceof Indexed ? value : new Indexed(value);
  }
  static deserialize<T extends typeof Indexed>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  get age(): number {
    return this.#age;
  }
  get active(): boolean {
    return this.#active;
  }
  get nickname(): string | undefined {
    return this.#nickname;
  }
  get score(): number | null {
    return this.#score;
  }
  get alias(): string | null | undefined {
    return this.#alias;
  }
  get status(): string {
    return this.#status;
  }
  set(updates: Partial<SetUpdates<Indexed.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Indexed)(data) as this);
  }
  setActive(value: boolean) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: value,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setAge(value: number) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: value,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setAlias(value: string | null | undefined) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: value as string | null,
      status: this.#status
    }) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: value,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: value,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setNickname(value: string | undefined) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: value,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setScore(value: number | null) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: value as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
  setStatus(value: string) {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: value
    }) as this);
  }
  unsetAlias() {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score as number | null,
      status: this.#status
    }) as this);
  }
  unsetNickname() {
    return this.$update(new (this.constructor as typeof Indexed)({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      score: this.#score as number | null,
      alias: this.#alias as string | null,
      status: this.#status
    }) as this);
  }
}
export namespace Indexed {
  export type Data = {
    id: number;
    name: string;
    age: number;
    active: boolean;
    nickname?: string | undefined;
    score: number | null;
    alias?: string | null | undefined;
    status: string;
  };
  export type Value = Indexed | Indexed.Data;
}
