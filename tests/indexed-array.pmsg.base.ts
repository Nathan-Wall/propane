/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/indexed-array.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_ArrayMessage_Labels_Item = Symbol("ArrayMessage_Labels_Item");
export class ArrayMessage_Labels_Item extends Message<ArrayMessage_Labels_Item.Data> {
  static $typeId = "tests/indexed-array.pmsg#ArrayMessage_Labels_Item";
  static $typeHash = "sha256:4abd212c96c686960d2b04021f66a0f41858333dd386ebda1a4ece0f44c947c6";
  static $instanceTag = Symbol.for("propane:message:" + ArrayMessage_Labels_Item.$typeId);
  static readonly $typeName = "ArrayMessage_Labels_Item";
  static EMPTY: ArrayMessage_Labels_Item;
  #name!: string;
  constructor(props?: ArrayMessage_Labels_Item.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ArrayMessage_Labels_Item.EMPTY) return ArrayMessage_Labels_Item.EMPTY;
    super(TYPE_TAG_ArrayMessage_Labels_Item, "ArrayMessage_Labels_Item");
    this.#name = (props ? props.name : "") as string;
    if (!props) ArrayMessage_Labels_Item.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayMessage_Labels_Item.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ArrayMessage_Labels_Item.Data {
    const props = {} as Partial<ArrayMessage_Labels_Item.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as ArrayMessage_Labels_Item.Data;
  }
  static from(value: ArrayMessage_Labels_Item.Value): ArrayMessage_Labels_Item {
    return value instanceof ArrayMessage_Labels_Item ? value : new ArrayMessage_Labels_Item(value);
  }
  static deserialize<T extends typeof ArrayMessage_Labels_Item>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ArrayMessage_Labels_Item.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ArrayMessage_Labels_Item.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<ArrayMessage_Labels_Item.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ArrayMessage_Labels_Item)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof ArrayMessage_Labels_Item)({
      name: value
    }) as this);
  }
}
export namespace ArrayMessage_Labels_Item {
  export type Data = {
    name: string;
  };
  export type Value = ArrayMessage_Labels_Item | ArrayMessage_Labels_Item.Data;
}
const TYPE_TAG_ArrayMessage = Symbol("ArrayMessage");
export class ArrayMessage extends Message<ArrayMessage.Data> {
  static $typeId = "tests/indexed-array.pmsg#ArrayMessage";
  static $typeHash = "sha256:7c168ef310c92c2497af863a90ca64f10f49b8c21312335c506afa887f2f21ff";
  static $instanceTag = Symbol.for("propane:message:" + ArrayMessage.$typeId);
  static readonly $typeName = "ArrayMessage";
  static EMPTY: ArrayMessage;
  #names!: ImmutableArray<string>;
  #scores!: ImmutableArray<number>;
  #flags!: ImmutableArray<boolean> | undefined;
  #labels!: ImmutableArray<ArrayMessage_Labels_Item>;
  constructor(props?: ArrayMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ArrayMessage.EMPTY) return ArrayMessage.EMPTY;
    super(TYPE_TAG_ArrayMessage, "ArrayMessage");
    this.#names = props ? (props.names === undefined || props.names === null ? new ImmutableArray() : props.names as object instanceof ImmutableArray ? props.names : new ImmutableArray(props.names as Iterable<unknown>)) as ImmutableArray<string> : new ImmutableArray();
    this.#scores = props ? (props.scores === undefined || props.scores === null ? new ImmutableArray() : props.scores as object instanceof ImmutableArray ? props.scores : new ImmutableArray(props.scores as Iterable<unknown>)) as ImmutableArray<number> : new ImmutableArray();
    this.#flags = props ? (props.flags === undefined || props.flags === null ? props.flags : props.flags as object instanceof ImmutableArray ? props.flags : new ImmutableArray(props.flags as Iterable<unknown>)) as ImmutableArray<boolean> : undefined;
    this.#labels = props ? (props.labels === undefined || props.labels === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.labels as Iterable<unknown>).map(v => v instanceof ArrayMessage_Labels_Item ? v : new ArrayMessage_Labels_Item(v as ArrayMessage_Labels_Item.Value)))) as ImmutableArray<ArrayMessage_Labels_Item> : new ImmutableArray();
    if (!props) ArrayMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayMessage.Data>[] {
    return [{
      name: "names",
      fieldNumber: 1,
      getValue: () => this.#names as string[] | Iterable<string>
    }, {
      name: "scores",
      fieldNumber: 2,
      getValue: () => this.#scores as number[] | Iterable<number>
    }, {
      name: "flags",
      fieldNumber: 3,
      getValue: () => this.#flags as boolean[] | Iterable<boolean>
    }, {
      name: "labels",
      fieldNumber: 4,
      getValue: () => this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ArrayMessage.Data {
    const props = {} as Partial<ArrayMessage.Data>;
    const namesValue = entries["1"] === undefined ? entries["names"] : entries["1"];
    if (namesValue === undefined) throw new Error("Missing required property \"names\".");
    const namesArrayValue = namesValue === undefined || namesValue === null ? new ImmutableArray() : namesValue as object instanceof ImmutableArray ? namesValue : new ImmutableArray(namesValue as Iterable<unknown>);
    if (!((namesArrayValue as object instanceof ImmutableArray || Array.isArray(namesArrayValue)) && [...(namesArrayValue as Iterable<unknown>)].every(element => typeof element === "string"))) throw new Error("Invalid value for property \"names\".");
    props.names = namesArrayValue as string[] | Iterable<string>;
    const scoresValue = entries["2"] === undefined ? entries["scores"] : entries["2"];
    if (scoresValue === undefined) throw new Error("Missing required property \"scores\".");
    const scoresArrayValue = scoresValue === undefined || scoresValue === null ? new ImmutableArray() : scoresValue as object instanceof ImmutableArray ? scoresValue : new ImmutableArray(scoresValue as Iterable<unknown>);
    if (!((scoresArrayValue as object instanceof ImmutableArray || Array.isArray(scoresArrayValue)) && [...(scoresArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"scores\".");
    props.scores = scoresArrayValue as number[] | Iterable<number>;
    const flagsValue = entries["3"] === undefined ? entries["flags"] : entries["3"];
    const flagsNormalized = flagsValue === null ? undefined : flagsValue;
    const flagsArrayValue = flagsNormalized === undefined || flagsNormalized === null ? flagsNormalized : flagsNormalized as object instanceof ImmutableArray ? flagsNormalized : new ImmutableArray(flagsNormalized as Iterable<unknown>);
    if (flagsArrayValue !== undefined && !((flagsArrayValue as object instanceof ImmutableArray || Array.isArray(flagsArrayValue)) && [...(flagsArrayValue as Iterable<unknown>)].every(element => typeof element === "boolean"))) throw new Error("Invalid value for property \"flags\".");
    props.flags = flagsArrayValue as boolean[] | Iterable<boolean>;
    const labelsValue = entries["4"] === undefined ? entries["labels"] : entries["4"];
    if (labelsValue === undefined) throw new Error("Missing required property \"labels\".");
    const labelsArrayValue = labelsValue === undefined || labelsValue === null ? new ImmutableArray() : labelsValue as object instanceof ImmutableArray ? labelsValue : new ImmutableArray(labelsValue as Iterable<unknown>);
    const labelsArrayValueConverted = labelsArrayValue === undefined || labelsArrayValue === null ? labelsArrayValue : (labelsArrayValue as ImmutableArray<unknown> | unknown[]).map(element => typeof element === "string" && ArrayMessage_Labels_Item.$compact === true ? ArrayMessage_Labels_Item.fromCompact(ArrayMessage_Labels_Item.$compactTag && element.startsWith(ArrayMessage_Labels_Item.$compactTag) ? element.slice(ArrayMessage_Labels_Item.$compactTag.length) : element, options) as any : element);
    if (!(labelsArrayValueConverted as object instanceof ImmutableArray || Array.isArray(labelsArrayValueConverted))) throw new Error("Invalid value for property \"labels\".");
    props.labels = labelsArrayValueConverted as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>;
    return props as ArrayMessage.Data;
  }
  static from(value: ArrayMessage.Value): ArrayMessage {
    return value instanceof ArrayMessage ? value : new ArrayMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "names":
        return new (this.constructor as typeof ArrayMessage)({
          names: child as string[] | Iterable<string>,
          scores: this.#scores as number[] | Iterable<number>,
          flags: this.#flags as boolean[] | Iterable<boolean>,
          labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
        }) as this;
      case "scores":
        return new (this.constructor as typeof ArrayMessage)({
          names: this.#names as string[] | Iterable<string>,
          scores: child as number[] | Iterable<number>,
          flags: this.#flags as boolean[] | Iterable<boolean>,
          labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
        }) as this;
      case "flags":
        return new (this.constructor as typeof ArrayMessage)({
          names: this.#names as string[] | Iterable<string>,
          scores: this.#scores as number[] | Iterable<number>,
          flags: child as boolean[] | Iterable<boolean>,
          labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
        }) as this;
      case "labels":
        return new (this.constructor as typeof ArrayMessage)({
          names: this.#names as string[] | Iterable<string>,
          scores: this.#scores as number[] | Iterable<number>,
          flags: this.#flags as boolean[] | Iterable<boolean>,
          labels: child as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["names", this.#names] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["scores", this.#scores] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["flags", this.#flags] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["labels", this.#labels] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ArrayMessage>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ArrayMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ArrayMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get names(): ImmutableArray<string> {
    return this.#names;
  }
  get scores(): ImmutableArray<number> {
    return this.#scores;
  }
  get flags(): ImmutableArray<boolean> | undefined {
    return this.#flags;
  }
  get labels(): ImmutableArray<ArrayMessage_Labels_Item> {
    return this.#labels;
  }
  copyWithinFlags(target: number, start: number, end?: number) {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  copyWithinLabels(target: number, start: number, end?: number) {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  copyWithinNames(target: number, start: number, end?: number) {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  copyWithinScores(target: number, start: number, end?: number) {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  fillFlag(value: boolean, start?: number, end?: number) {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    (flagsNext as unknown as boolean[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  fillLabel(value: ArrayMessage_Labels_Item, start?: number, end?: number) {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    (labelsNext as unknown as ArrayMessage_Labels_Item[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  fillName(value: string, start?: number, end?: number) {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    (namesNext as unknown as string[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  fillScore(value: number, start?: number, end?: number) {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    (scoresNext as unknown as number[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  popFlag() {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.pop();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  popLabel() {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.pop();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  popName() {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.pop();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  popScore() {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.pop();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  pushFlag(...values: boolean[]) {
    if (values.length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  pushLabel(...values: ArrayMessage_Labels_Item[]) {
    if (values.length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  pushName(...values: string[]) {
    if (values.length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  pushScore(...values: number[]) {
    if (values.length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray, ...values];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  reverseFlags() {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  reverseLabels() {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  reverseNames() {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  reverseScores() {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.reverse();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  set(updates: Partial<SetUpdates<ArrayMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ArrayMessage)(data) as this);
  }
  setFlags(value: boolean[] | Iterable<boolean> | undefined) {
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: value as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  setLabels(value: ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>) {
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: value as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  setNames(value: string[] | Iterable<string>) {
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: value as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  setScores(value: number[] | Iterable<number>) {
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: value as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  shiftFlag() {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.shift();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  shiftLabel() {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.shift();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  shiftName() {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.shift();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  shiftScore() {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.shift();
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  sortFlags(compareFn?: (a: boolean, b: boolean) => number) {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    (flagsNext as unknown as boolean[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  sortLabels(compareFn?: (a: ArrayMessage_Labels_Item, b: ArrayMessage_Labels_Item) => number) {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    (labelsNext as unknown as ArrayMessage_Labels_Item[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  sortNames(compareFn?: (a: string, b: string) => number) {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    (namesNext as unknown as string[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  sortScores(compareFn?: (a: number, b: number) => number) {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    (scoresNext as unknown as number[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  spliceFlag(start: number, deleteCount?: number, ...items: boolean[]) {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  spliceLabel(start: number, deleteCount?: number, ...items: ArrayMessage_Labels_Item[]) {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  spliceName(start: number, deleteCount?: number, ...items: string[]) {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  spliceScore(start: number, deleteCount?: number, ...items: number[]) {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  unsetFlags() {
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  unshiftFlag(...values: boolean[]) {
    if (values.length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...values, ...flagsArray];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: flagsNext as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  unshiftLabel(...values: ArrayMessage_Labels_Item[]) {
    if (values.length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...values, ...labelsArray];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: labelsNext as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  unshiftName(...values: string[]) {
    if (values.length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...values, ...namesArray];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: namesNext as string[] | Iterable<string>,
      scores: this.#scores as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
  unshiftScore(...values: number[]) {
    if (values.length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...values, ...scoresArray];
    return this.$update(new (this.constructor as typeof ArrayMessage)({
      names: this.#names as string[] | Iterable<string>,
      scores: scoresNext as number[] | Iterable<number>,
      flags: this.#flags as boolean[] | Iterable<boolean>,
      labels: this.#labels as ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>
    }) as this);
  }
}
export namespace ArrayMessage {
  export type Data = {
    names: string[] | Iterable<string>;
    scores: number[] | Iterable<number>;
    flags?: boolean[] | Iterable<boolean> | undefined;
    labels: ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>;
  };
  export type Value = ArrayMessage | ArrayMessage.Data;
  export import Labels_Item = ArrayMessage_Labels_Item;
}
