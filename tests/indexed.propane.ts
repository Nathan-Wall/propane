/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/indexed.propane
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN } from "@propanejs/runtime";
export class Indexed extends Message<Indexed.Data> {
  static TYPE_TAG = Symbol("Indexed");
  static EMPTY: Indexed;
  #id: number;
  #name: string;
  #age: number;
  #active: boolean;
  #nickname: string;
  #score: number | null;
  #alias: string | null;
  #status: string;
  constructor(props?: Indexed.Value) {
    if (!props && Indexed.EMPTY) return Indexed.EMPTY;
    super(Indexed.TYPE_TAG, "Indexed");
    this.#id = props ? props.id : 0;
    this.#name = props ? props.name : "";
    this.#age = props ? props.age : 0;
    this.#active = props ? props.active : false;
    this.#nickname = props ? props.nickname : undefined;
    this.#score = props ? props.score : 0;
    this.#alias = props ? props.alias : undefined;
    this.#status = props ? props.status : "";
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
      getValue: () => this.#score
    }, {
      name: "alias",
      fieldNumber: 7,
      getValue: () => this.#alias
    }, {
      name: "status",
      fieldNumber: 8,
      getValue: () => this.#status
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Indexed.Data {
    const props = {} as Partial<Indexed.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const nameValue = entries["2"] === undefined ? entries["name"] : entries["2"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const ageValue = entries["3"] === undefined ? entries["age"] : entries["3"];
    if (ageValue === undefined) throw new Error("Missing required property \"age\".");
    if (!(typeof ageValue === "number")) throw new Error("Invalid value for property \"age\".");
    props.age = ageValue;
    const activeValue = entries["4"] === undefined ? entries["active"] : entries["4"];
    if (activeValue === undefined) throw new Error("Missing required property \"active\".");
    if (!(typeof activeValue === "boolean")) throw new Error("Invalid value for property \"active\".");
    props.active = activeValue;
    const nicknameValue = entries["5"] === undefined ? entries["nickname"] : entries["5"];
    const nicknameNormalized = nicknameValue === null ? undefined : nicknameValue;
    if (nicknameNormalized !== undefined && !(typeof nicknameNormalized === "string")) throw new Error("Invalid value for property \"nickname\".");
    props.nickname = nicknameNormalized;
    const scoreValue = entries["6"] === undefined ? entries["score"] : entries["6"];
    if (scoreValue === undefined) throw new Error("Missing required property \"score\".");
    if (!(typeof scoreValue === "number" || scoreValue === null)) throw new Error("Invalid value for property \"score\".");
    props.score = scoreValue;
    const aliasValue = entries["7"] === undefined ? entries["alias"] : entries["7"];
    if (aliasValue !== undefined && !(typeof aliasValue === "string" || aliasValue === null)) throw new Error("Invalid value for property \"alias\".");
    props.alias = aliasValue;
    const statusValue = entries["8"] === undefined ? entries["status"] : entries["8"];
    if (statusValue === undefined) throw new Error("Missing required property \"status\".");
    if (!(typeof statusValue === "string")) throw new Error("Invalid value for property \"status\".");
    props.status = statusValue;
    return props as Indexed.Data;
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
  get nickname(): string {
    return this.#nickname;
  }
  get score(): number | null {
    return this.#score;
  }
  get alias(): string | null {
    return this.#alias;
  }
  get status(): string {
    return this.#status;
  }
  deleteAlias(): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      status: this.#status
    }, this.$listeners));
  }
  deleteNickname(): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setActive(value: boolean): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: value,
      nickname: this.#nickname,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setAge(value: number): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: value,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setAlias(value: string | null): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      alias: value,
      status: this.#status
    }, this.$listeners));
  }
  setId(value: number): Indexed {
    return this.$update(new Indexed({
      id: value,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setName(value: string): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: value,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setNickname(value: string): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: value,
      score: this.#score,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setScore(value: number | null): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: value,
      alias: this.#alias,
      status: this.#status
    }, this.$listeners));
  }
  setStatus(value: string): Indexed {
    return this.$update(new Indexed({
      id: this.#id,
      name: this.#name,
      age: this.#age,
      active: this.#active,
      nickname: this.#nickname,
      score: this.#score,
      alias: this.#alias,
      status: value
    }, this.$listeners));
  }
}
export namespace Indexed {
  export interface Data {
    id: number;
    name: string;
    age: number;
    active: boolean;
    nickname?: string | undefined;
    score: number | null;
    alias?: string | null | undefined;
    status: string;
  }
  export type Value = Indexed | Indexed.Data;
}
