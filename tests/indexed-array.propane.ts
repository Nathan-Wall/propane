/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/indexed-array.propane
import { Message, MessagePropDescriptor, ImmutableArray } from "@propanejs/runtime";
export class ArrayMessage_Labels_Item extends Message<ArrayMessage_Labels_Item.Data> {
  static TYPE_TAG = Symbol("ArrayMessage_Labels_Item");
  static EMPTY: ArrayMessage_Labels_Item;
  #name: string;
  constructor(props?: ArrayMessage_Labels_Item.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ArrayMessage_Labels_Item.EMPTY) return ArrayMessage_Labels_Item.EMPTY;
    super(ArrayMessage_Labels_Item.TYPE_TAG, "ArrayMessage_Labels_Item", listeners);
    this.#name = props ? props.name : "";
    if (!props && !listeners) ArrayMessage_Labels_Item.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayMessage_Labels_Item.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ArrayMessage_Labels_Item.Data {
    const props = {} as Partial<ArrayMessage_Labels_Item.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    return props as ArrayMessage_Labels_Item.Data;
  }
  get name(): string {
    return this.#name;
  }
  setName(value: string): ArrayMessage_Labels_Item {
    return this.$update(new ArrayMessage_Labels_Item({
      name: value
    }, this.$listeners));
  }
}
export namespace ArrayMessage_Labels_Item {
  export interface Data {
    name: string;
  }
  export type Value = ArrayMessage_Labels_Item | ArrayMessage_Labels_Item.Data;
}
export class ArrayMessage extends Message<ArrayMessage.Data> {
  static TYPE_TAG = Symbol("ArrayMessage");
  static EMPTY: ArrayMessage;
  #names: ImmutableArray<string>;
  #scores: ImmutableArray<number>;
  #flags: ImmutableArray<boolean> | undefined;
  #labels: ImmutableArray<ArrayMessage_Labels_Item>;
  constructor(props?: ArrayMessage.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ArrayMessage.EMPTY) return ArrayMessage.EMPTY;
    super(ArrayMessage.TYPE_TAG, "ArrayMessage", listeners);
    this.#names = props ? props.names === undefined || props.names === null ? props.names : props.names instanceof ImmutableArray ? props.names : new ImmutableArray(props.names) : Object.freeze([]);
    this.#scores = props ? props.scores === undefined || props.scores === null ? props.scores : props.scores instanceof ImmutableArray ? props.scores : new ImmutableArray(props.scores) : Object.freeze([]);
    this.#flags = props ? props.flags === undefined || props.flags === null ? props.flags : props.flags instanceof ImmutableArray ? props.flags : new ImmutableArray(props.flags) : undefined;
    this.#labels = props ? props.labels === undefined || props.labels === null ? props.labels : new ImmutableArray(Array.from(props.labels).map(v => v instanceof ArrayMessage_Labels_Item ? v : new ArrayMessage_Labels_Item(v))) : Object.freeze([]);
    if (!props && !listeners) ArrayMessage.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayMessage.Data>[] {
    return [{
      name: "names",
      fieldNumber: 1,
      getValue: () => this.#names
    }, {
      name: "scores",
      fieldNumber: 2,
      getValue: () => this.#scores
    }, {
      name: "flags",
      fieldNumber: 3,
      getValue: () => this.#flags
    }, {
      name: "labels",
      fieldNumber: 4,
      getValue: () => this.#labels
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ArrayMessage.Data {
    const props = {} as Partial<ArrayMessage.Data>;
    const namesValue = entries["1"] === undefined ? entries["names"] : entries["1"];
    if (namesValue === undefined) throw new Error("Missing required property \"names\".");
    const namesArrayValue = namesValue === undefined || namesValue === null ? namesValue : namesValue instanceof ImmutableArray ? namesValue : new ImmutableArray(namesValue);
    if (!((namesArrayValue instanceof ImmutableArray || Object.prototype.toString.call(namesArrayValue) === "[object ImmutableArray]" || Array.isArray(namesArrayValue)) && [...namesArrayValue].every(element => typeof element === "string"))) throw new Error("Invalid value for property \"names\".");
    props.names = namesArrayValue;
    const scoresValue = entries["2"] === undefined ? entries["scores"] : entries["2"];
    if (scoresValue === undefined) throw new Error("Missing required property \"scores\".");
    const scoresArrayValue = scoresValue === undefined || scoresValue === null ? scoresValue : scoresValue instanceof ImmutableArray ? scoresValue : new ImmutableArray(scoresValue);
    if (!((scoresArrayValue instanceof ImmutableArray || Object.prototype.toString.call(scoresArrayValue) === "[object ImmutableArray]" || Array.isArray(scoresArrayValue)) && [...scoresArrayValue].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"scores\".");
    props.scores = scoresArrayValue;
    const flagsValue = entries["3"] === undefined ? entries["flags"] : entries["3"];
    const flagsNormalized = flagsValue === null ? undefined : flagsValue;
    const flagsArrayValue = flagsNormalized === undefined || flagsNormalized === null ? flagsNormalized : flagsNormalized instanceof ImmutableArray ? flagsNormalized : new ImmutableArray(flagsNormalized);
    if (flagsArrayValue !== undefined && !((flagsArrayValue instanceof ImmutableArray || Object.prototype.toString.call(flagsArrayValue) === "[object ImmutableArray]" || Array.isArray(flagsArrayValue)) && [...flagsArrayValue].every(element => typeof element === "boolean"))) throw new Error("Invalid value for property \"flags\".");
    props.flags = flagsArrayValue;
    const labelsValue = entries["4"] === undefined ? entries["labels"] : entries["4"];
    if (labelsValue === undefined) throw new Error("Missing required property \"labels\".");
    const labelsArrayValue = labelsValue === undefined || labelsValue === null ? labelsValue : labelsValue instanceof ImmutableArray ? labelsValue : new ImmutableArray(labelsValue);
    if (!(labelsArrayValue instanceof ImmutableArray || Object.prototype.toString.call(labelsArrayValue) === "[object ImmutableArray]" || Array.isArray(labelsArrayValue))) throw new Error("Invalid value for property \"labels\".");
    props.labels = labelsArrayValue;
    return props as ArrayMessage.Data;
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
  copyWithinFlags(target: number, start: number, end?: number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.copyWithin(target, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  copyWithinLabels(target: number, start: number, end?: number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.copyWithin(target, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  copyWithinNames(target: number, start: number, end?: number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.copyWithin(target, start, end);
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  copyWithinScores(target: number, start: number, end?: number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.copyWithin(target, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  deleteFlags(): ArrayMessage {
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      labels: this.#labels
    }, this.$listeners));
  }
  fillFlags(value: boolean, start?: number, end?: number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.fill(value, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  fillLabels(value: ArrayMessage_Labels_Item, start?: number, end?: number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.fill(value, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  fillNames(value: string, start?: number, end?: number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.fill(value, start, end);
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  fillScores(value: number, start?: number, end?: number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.fill(value, start, end);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  popFlags(): ArrayMessage {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.pop();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  popLabels(): ArrayMessage {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.pop();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  popNames(): ArrayMessage {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.pop();
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  popScores(): ArrayMessage {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.pop();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  pushFlags(...values): ArrayMessage {
    if (values.length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray, ...values];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  pushLabels(...values): ArrayMessage {
    if (values.length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray, ...values];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  pushNames(...values): ArrayMessage {
    if (values.length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray, ...values];
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  pushScores(...values): ArrayMessage {
    if (values.length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray, ...values];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  reverseFlags(): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.reverse();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  reverseLabels(): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.reverse();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  reverseNames(): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.reverse();
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  reverseScores(): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.reverse();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  setFlags(value: boolean[] | Iterable<boolean>): ArrayMessage {
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: value,
      labels: this.#labels
    }, this.$listeners));
  }
  setLabels(value: ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>): ArrayMessage {
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: value
    }, this.$listeners));
  }
  setNames(value: string[] | Iterable<string>): ArrayMessage {
    return this.$update(new ArrayMessage({
      names: value,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  setScores(value: number[] | Iterable<number>): ArrayMessage {
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: value,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  shiftFlags(): ArrayMessage {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.shift();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  shiftLabels(): ArrayMessage {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.shift();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  shiftNames(): ArrayMessage {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.shift();
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  shiftScores(): ArrayMessage {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.shift();
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  sortFlags(compareFn?: (a: boolean, b: boolean) => number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.sort(compareFn);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  sortLabels(compareFn?: (a: ArrayMessage_Labels_Item, b: ArrayMessage_Labels_Item) => number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.sort(compareFn);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  sortNames(compareFn?: (a: string, b: string) => number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.sort(compareFn);
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  sortScores(compareFn?: (a: number, b: number) => number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.sort(compareFn);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  spliceFlags(start: number, deleteCount?: number, ...items): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  spliceLabels(start: number, deleteCount?: number, ...items): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  spliceNames(start: number, deleteCount?: number, ...items): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  spliceScores(start: number, deleteCount?: number, ...items): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  unshiftFlags(...values): ArrayMessage {
    if (values.length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...values, ...flagsArray];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    }, this.$listeners));
  }
  unshiftLabels(...values): ArrayMessage {
    if (values.length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...values, ...labelsArray];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    }, this.$listeners));
  }
  unshiftNames(...values): ArrayMessage {
    if (values.length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...values, ...namesArray];
    return this.$update(new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
  unshiftScores(...values): ArrayMessage {
    if (values.length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...values, ...scoresArray];
    return this.$update(new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    }, this.$listeners));
  }
}
export namespace ArrayMessage {
  export interface Data {
    names: string[] | Iterable<string>;
    scores: number[] | Iterable<number>;
    flags?: boolean[] | Iterable<boolean> | undefined;
    labels: ArrayMessage_Labels_Item[] | Iterable<ArrayMessage_Labels_Item>;
  }
  export type Value = ArrayMessage | ArrayMessage.Data;
  export import Labels_Item = ArrayMessage_Labels_Item;
}